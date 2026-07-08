package payment

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"

	db "wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/email"
	"wementor-backend/internal/infrastructure/queue"
	"wementor-backend/internal/modules/booking"
)

// Service contains payment business logic.
type Service struct {
	queries           db.Querier
	emailClient       *email.Client
	logger            *zap.Logger
	rmq               *queue.RabbitMQ
	razorpayKeySecret string
	frontendURL       string
}

// NewService creates a payment service.
func NewService(
	queries db.Querier,
	emailClient *email.Client,
	logger *zap.Logger,
	rmq *queue.RabbitMQ,
	razorpayKeySecret, frontendURL string,
) *Service {
	return &Service{
		queries:           queries,
		emailClient:       emailClient,
		logger:            logger,
		rmq:               rmq,
		razorpayKeySecret: razorpayKeySecret,
		frontendURL:       frontendURL,
	}
}

// PaymentEvent represents an event published when a payment status changes.
type PaymentEvent struct {
	BookingID string `json:"booking_id"`
	PaymentID string `json:"payment_id"`
	Status    string `json:"status"`
}

// VerifyPayment validates the Razorpay payment signature (HMAC-SHA256) and marks payment as captured.
func (s *Service) VerifyPayment(ctx context.Context, req VerifyPaymentRequest) (*PaymentResponse, error) {
	// 1. Verify Razorpay signature using HMAC-SHA256
	//    Signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
	message := req.RazorpayOrderID + "|" + req.RazorpayPaymentID
	mac := hmac.New(sha256.New, []byte(s.razorpayKeySecret))
	mac.Write([]byte(message))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(expectedSignature), []byte(req.RazorpaySignature)) {
		return nil, fmt.Errorf("invalid payment signature")
	}

	// 2. Find our payment record by Razorpay order ID
	payment, err := s.queries.GetPaymentByRazorpayOrderID(ctx, &req.RazorpayOrderID)
	if err != nil {
		return nil, fmt.Errorf("payment record not found")
	}

	if payment.Status != "created" {
		return nil, fmt.Errorf("payment already processed")
	}

	// 3. Mark payment as captured
	err = s.queries.UpdatePaymentCaptured(ctx, db.UpdatePaymentCapturedParams{
		ID:                payment.ID,
		RazorpayPaymentID: &req.RazorpayPaymentID,
		RazorpaySignature: &req.RazorpaySignature,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update payment: %w", err)
	}

	// 4. Publish Event asynchronously
	s.publishPaymentEvent(payment.BookingID.String(), payment.ID.String(), "captured")

	return &PaymentResponse{
		ID:                payment.ID,
		BookingID:         payment.BookingID,
		AmountPaise:       payment.AmountPaise,
		Currency:          payment.Currency,
		OrderNumber:       payment.OrderNumber,
		RazorpayOrderID:   &req.RazorpayOrderID,
		RazorpayPaymentID: &req.RazorpayPaymentID,
		Status:            "captured",
	}, nil
}

// HandleWebhook processes Razorpay webhook events.
func (s *Service) HandleWebhook(ctx context.Context, payload WebhookPayload) error {
	switch payload.Event {
	case "payment.captured":
		orderID := payload.Payload.Payment.Entity.OrderID
		paymentID := payload.Payload.Payment.Entity.ID

		payment, err := s.queries.GetPaymentByRazorpayOrderID(ctx, &orderID)
		if err != nil {
			return fmt.Errorf("payment not found for order %s", orderID)
		}

		if payment.Status == "captured" {
			return nil // Already processed (idempotent)
		}

		err = s.queries.UpdatePaymentCaptured(ctx, db.UpdatePaymentCapturedParams{
			ID:                payment.ID,
			RazorpayPaymentID: &paymentID,
		})
		if err != nil {
			return fmt.Errorf("failed to capture payment: %w", err)
		}

		s.publishPaymentEvent(payment.BookingID.String(), payment.ID.String(), "captured")

	case "payment.failed":
		orderID := payload.Payload.Payment.Entity.OrderID
		payment, err := s.queries.GetPaymentByRazorpayOrderID(ctx, &orderID)
		if err != nil {
			return nil
		}

		_ = s.queries.UpdatePaymentFailed(ctx, payment.ID)

		// Cancel the associated booking
		_ = s.queries.UpdateBookingStatus(ctx, db.UpdateBookingStatusParams{
			ID:     payment.BookingID,
			Status: "cancelled_by_student",
		})
		
		// Unmark coupon
		booking, err := s.queries.GetBookingByID(ctx, payment.BookingID)
		if err == nil && booking.CouponID.Valid {
			_ = s.queries.MarkCouponUnused(ctx, booking.CouponID.Bytes)
		}
	}

	return nil
}

func (s *Service) publishPaymentEvent(bookingID, paymentID, status string) {
	if s.rmq == nil {
		s.logger.Warn("RabbitMQ client is nil, falling back to synchronous email sending")
		go s.sendBookingConfirmationEmails(parseUUIDOrPanic(bookingID))
		return
	}

	event := PaymentEvent{
		BookingID: bookingID,
		PaymentID: paymentID,
		Status:    status,
	}

	body, _ := json.Marshal(event)
	err := s.rmq.Publish(context.Background(), "wementor.events", "payment."+status, body)
	if err != nil {
		s.logger.Error("failed to publish payment event", zap.Error(err))
		// Fallback
		go s.sendBookingConfirmationEmails(parseUUIDOrPanic(bookingID))
	}
}

func parseUUIDOrPanic(s string) uuid.UUID {
	id, _ := uuid.Parse(s)
	return id
}

// sendBookingConfirmationEmails sends confirmation emails to both student and mentor.
func (s *Service) sendBookingConfirmationEmails(bookingID interface{ String() string }) {
	ctx := context.Background()

	bID, err := parseUUID(bookingID.String())
	if err != nil {
		return
	}

	b, err := s.queries.GetBookingByID(ctx, bID)
	if err != nil {
		return
	}

	student, err := s.queries.GetUserByID(ctx, b.StudentID)
	if err != nil {
		return
	}

	mentor, err := s.queries.GetUserByID(ctx, b.MentorID)
	if err != nil {
		return
	}

	plan, err := s.queries.GetMentorshipPlanByID(ctx, b.PlanID)
	if err != nil {
		return
	}

	date := booking.FormatPgDate(b.SessionDate)
	timeSlot := booking.FormatPgTime(b.StartTime) + " - " + booking.FormatPgTime(b.EndTime)

	meetLink := ""
	if b.GoogleMeetLink != nil {
		meetLink = *b.GoogleMeetLink
	}

	// Email to student
	if err := s.emailClient.SendBookingConfirmation(
		student.Email, mentor.Name, plan.Title, date, timeSlot, meetLink,
	); err != nil {
		s.logger.Error("failed to send student confirmation email", zap.Error(err))
	}

	// Email to mentor
	if err := s.emailClient.SendMentorBookingNotification(
		mentor.Email, student.Name, plan.Title, date, timeSlot,
	); err != nil {
		s.logger.Error("failed to send mentor notification email", zap.Error(err))
	}
}

func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}
