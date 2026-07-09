package booking

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"

	db "wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/email"
)

// Service contains booking business logic.
type Service struct {
	queries           db.Querier
	emailClient       *email.Client
	logger            *zap.Logger
	razorpayKeyID     string
	razorpayKeySecret string
	frontendURL       string
}

// NewService creates a booking service.
func NewService(
	queries db.Querier,
	emailClient *email.Client,
	logger *zap.Logger,
	razorpayKeyID, razorpayKeySecret, frontendURL string,
) *Service {
	return &Service{
		queries:           queries,
		emailClient:       emailClient,
		logger:            logger,
		razorpayKeyID:     razorpayKeyID,
		razorpayKeySecret: razorpayKeySecret,
		frontendURL:       frontendURL,
	}
}

// Create validates slot availability, creates a Razorpay order, and persists the booking + payment.
func (s *Service) Create(ctx context.Context, studentID uuid.UUID, req CreateBookingRequest) (*CreateBookingResponse, error) {
	// 1. Fetch plan
	plan, err := s.queries.GetMentorshipPlanByID(ctx, req.PlanID)
	if err != nil {
		return nil, fmt.Errorf("plan not found")
	}

	if plan.Status != "approved" {
		return nil, fmt.Errorf("this plan is not currently available")
	}

	// 2. Parse date and time
	sessionDate, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, fmt.Errorf("invalid date format, use YYYY-MM-DD")
	}

	startTimeParsed, err := time.Parse("15:04", req.StartTime)
	if err != nil {
		return nil, fmt.Errorf("invalid time format, use HH:MM")
	}

	// 3. Check minimum booking notice from Mentor Profile
	profile, err := s.queries.GetMentorProfileByUserID(ctx, plan.MentorID)
	if err != nil {
		return nil, fmt.Errorf("mentor profile not found")
	}

	sessionDateTime := time.Date(
		sessionDate.Year(), sessionDate.Month(), sessionDate.Day(),
		startTimeParsed.Hour(), startTimeParsed.Minute(), 0, 0, time.UTC,
	)
	minNotice := time.Duration(profile.MinBookingNoticeHours) * time.Hour
	if time.Until(sessionDateTime) < minNotice {
		return nil, fmt.Errorf("booking must be made at least %d hours in advance", profile.MinBookingNoticeHours)
	}

	// 4. Build pgtype values
	pgDate := pgtype.Date{Time: sessionDate, Valid: true}
	pgStartTime := pgtype.Time{
		Microseconds: int64(startTimeParsed.Hour()*3600+startTimeParsed.Minute()*60) * 1_000_000,
		Valid:        true,
	}

	endTimeParsed := startTimeParsed.Add(time.Duration(plan.DurationMinutes) * time.Minute)
	pgEndTime := pgtype.Time{
		Microseconds: int64(endTimeParsed.Hour()*3600+endTimeParsed.Minute()*60) * 1_000_000,
		Valid:        true,
	}

	// 5. Check for slot conflicts
	conflict, err := s.queries.CheckSlotConflict(ctx, db.CheckSlotConflictParams{
		MentorID:    plan.MentorID,
		SessionDate: pgDate,
		StartTime:   pgStartTime,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to check slot availability: %w", err)
	}
	if conflict > 0 {
		return nil, fmt.Errorf("this time slot is already booked")
	}

	// 6. Handle Coupon if provided
	finalAmountPaise := plan.PricePaise
	var appliedCoupon *db.Coupon
	var pgCouponID pgtype.UUID

	if req.CouponCode != nil && *req.CouponCode != "" {
		coupon, err := s.queries.GetValidCoupon(ctx, db.GetValidCouponParams{
			Code:      *req.CouponCode,
			StudentID: studentID,
		})
		if err != nil {
			return nil, fmt.Errorf("invalid, expired, or already used coupon code")
		}

		appliedCoupon = &coupon
		pgCouponID = pgtype.UUID{Bytes: coupon.ID, Valid: true}
		
		discountAmount := (plan.PricePaise * coupon.DiscountPercentage) / 100
		finalAmountPaise -= discountAmount
		
		if finalAmountPaise < 0 {
			finalAmountPaise = 0
		}
	}

	// 7. Get mentor's Google Meet link
	mentorProfile, err := s.queries.GetMentorProfileByUserID(ctx, plan.MentorID)
	if err != nil {
		return nil, fmt.Errorf("mentor profile not found")
	}

	// 8. Create Razorpay order (skip if 100% off)
	var razorpayOrderID string
	if finalAmountPaise > 0 {
		razorpayOrderID, err = s.createRazorpayOrder(finalAmountPaise, "INR", req.PlanID.String())
		if err != nil {
			return nil, fmt.Errorf("failed to create payment order: %w", err)
		}
	}

	// 9. Create booking record
	booking, err := s.queries.CreateBooking(ctx, db.CreateBookingParams{
		StudentID:      studentID,
		MentorID:       plan.MentorID,
		PlanID:         plan.ID,
		SessionDate:    pgDate,
		StartTime:      pgStartTime,
		EndTime:        pgEndTime,
		GoogleMeetLink: mentorProfile.GoogleMeetLink,
		CouponID:       pgCouponID,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create booking: %w", err)
	}

	// 10. Mark coupon as used immediately to lock it to this booking
	if appliedCoupon != nil {
		_ = s.queries.MarkCouponUsed(ctx, appliedCoupon.ID)
	}

	// 11. Create payment record
	var rzpOrderIDPtr *string
	if finalAmountPaise > 0 {
		rzpOrderIDPtr = &razorpayOrderID
	}

	payment, err := s.queries.CreatePayment(ctx, db.CreatePaymentParams{
		BookingID:       booking.ID,
		StudentID:       studentID,
		AmountPaise:     finalAmountPaise,
		RazorpayOrderID: rzpOrderIDPtr,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create payment record: %w", err)
	}

	if finalAmountPaise == 0 {
		// Update it properly using the specific captured method if required, 
		// but since we just created it, we can update status:
		_ = s.queries.UpdatePaymentCaptured(ctx, db.UpdatePaymentCapturedParams{
			ID: payment.ID,
		})
		
		// Send confirmation emails for 100% off
		go func() {
			student, _ := s.queries.GetUserByID(context.Background(), studentID)
			mentor, _ := s.queries.GetUserByID(context.Background(), booking.MentorID)
			plan, _ := s.queries.GetMentorshipPlanByID(context.Background(), booking.PlanID)
			
			meetLink := ""
			if booking.GoogleMeetLink != nil {
				meetLink = *booking.GoogleMeetLink
			}
			
			dateStr := FormatPgDate(booking.SessionDate)
			timeStr := FormatPgTime(booking.StartTime) + " - " + FormatPgTime(booking.EndTime)

			_ = s.emailClient.SendBookingConfirmation(student.Email, mentor.Name, plan.Title, dateStr, timeStr, meetLink)
			_ = s.emailClient.SendMentorBookingNotification(mentor.Email, student.Name, plan.Title, dateStr, timeStr)
		}()
	}

	return &CreateBookingResponse{
		Booking:         s.toBookingResponse(booking),
		RazorpayOrderID: razorpayOrderID,
		RazorpayKeyID:   s.razorpayKeyID,
		AmountPaise:     finalAmountPaise,
		Currency:        "INR",
	}, nil
}

// GetByID returns a booking by ID.
func (s *Service) GetByID(ctx context.Context, bookingID uuid.UUID) (*BookingResponse, error) {
	booking, err := s.queries.GetBookingByID(ctx, bookingID)
	if err != nil {
		return nil, fmt.Errorf("booking not found")
	}

	resp := s.toBookingResponse(booking)
	return &resp, nil
}

// ListStudentBookings returns paginated bookings for a student.
func (s *Service) ListStudentBookings(ctx context.Context, studentID uuid.UUID, limit, offset int32) ([]StudentBookingResponse, int64, error) {
	bookings, err := s.queries.ListStudentBookings(ctx, db.ListStudentBookingsParams{
		StudentID: studentID,
		Limit:     limit,
		Offset:    offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list bookings: %w", err)
	}

	total, _ := s.queries.CountStudentBookings(ctx, studentID)

	result := make([]StudentBookingResponse, len(bookings))
	for i, b := range bookings {
		result[i] = StudentBookingResponse{
			BookingResponse: BookingResponse{
				ID:             b.ID,
				StudentID:      b.StudentID,
				MentorID:       b.MentorID,
				PlanID:         b.PlanID,
				SessionDate:    FormatPgDate(b.SessionDate),
				StartTime:      FormatPgTime(b.StartTime),
				EndTime:        FormatPgTime(b.EndTime),
				GoogleMeetLink: b.GoogleMeetLink,
				Status:         b.Status,
				CreatedAt:      b.CreatedAt,
				UpdatedAt:      b.UpdatedAt,
			},
			PlanTitle:  b.PlanTitle,
			MentorName: b.MentorName,
		}
	}

	return result, total, nil
}

// ListMentorBookings returns paginated bookings for a mentor.
func (s *Service) ListMentorBookings(ctx context.Context, mentorID uuid.UUID, limit, offset int32) ([]MentorBookingResponse, int64, error) {
	bookings, err := s.queries.ListMentorBookings(ctx, db.ListMentorBookingsParams{
		MentorID: mentorID,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list bookings: %w", err)
	}

	total, _ := s.queries.CountMentorBookings(ctx, mentorID)

	result := make([]MentorBookingResponse, len(bookings))
	for i, b := range bookings {
		result[i] = MentorBookingResponse{
			BookingResponse: BookingResponse{
				ID:             b.ID,
				StudentID:      b.StudentID,
				MentorID:       b.MentorID,
				PlanID:         b.PlanID,
				SessionDate:    FormatPgDate(b.SessionDate),
				StartTime:      FormatPgTime(b.StartTime),
				EndTime:        FormatPgTime(b.EndTime),
				GoogleMeetLink: b.GoogleMeetLink,
				Status:         b.Status,
				CreatedAt:      b.CreatedAt,
				UpdatedAt:      b.UpdatedAt,
			},
			PlanTitle:   b.PlanTitle,
			StudentName: b.StudentName,
		}
	}

	return result, total, nil
}

// Cancel cancels a booking. Students and mentors can cancel their own bookings.
func (s *Service) Cancel(ctx context.Context, bookingID, userID uuid.UUID, role string) error {
	booking, err := s.queries.GetBookingByID(ctx, bookingID)
	if err != nil {
		return fmt.Errorf("booking not found")
	}

	if booking.Status != "confirmed" {
		return fmt.Errorf("only confirmed bookings can be cancelled")
	}

	var newStatus string
	switch {
	case role == "admin":
		newStatus = "cancelled_by_mentor" // admin acts on behalf
	case booking.StudentID == userID:
		newStatus = "cancelled_by_student"
	case booking.MentorID == userID:
		newStatus = "cancelled_by_mentor"
	default:
		return fmt.Errorf("you are not authorized to cancel this booking")
	}

	if err := s.queries.UpdateBookingStatus(ctx, db.UpdateBookingStatusParams{
		ID:     bookingID,
		Status: newStatus,
	}); err != nil {
		return fmt.Errorf("failed to cancel booking: %w", err)
	}

	// Release the coupon if it was used
	if booking.CouponID.Valid {
		_ = s.queries.MarkCouponUnused(ctx, booking.CouponID.Bytes)
	}

	return nil
}

// Complete marks a booking as completed and sends a rating email.
func (s *Service) Complete(ctx context.Context, bookingID, mentorID uuid.UUID) error {
	booking, err := s.queries.GetBookingByID(ctx, bookingID)
	if err != nil {
		return fmt.Errorf("booking not found")
	}

	if booking.MentorID != mentorID {
		return fmt.Errorf("you are not the mentor for this booking")
	}

	if booking.Status != "confirmed" {
		return fmt.Errorf("only confirmed bookings can be completed")
	}

	if err := s.queries.UpdateBookingStatus(ctx, db.UpdateBookingStatusParams{
		ID:     bookingID,
		Status: "completed",
	}); err != nil {
		return fmt.Errorf("failed to complete booking: %w", err)
	}

	// Increment mentor session count
	_ = s.queries.IncrementMentorSessions(ctx, mentorID)

	// Send rating email to student asynchronously
	go func() {
		student, err := s.queries.GetUserByID(context.Background(), booking.StudentID)
		if err != nil {
			return
		}
		mentor, err := s.queries.GetUserByID(context.Background(), mentorID)
		if err != nil {
			return
		}
		plan, err := s.queries.GetMentorshipPlanByID(context.Background(), booking.PlanID)
		if err != nil {
			return
		}

		if err := s.emailClient.SendRateSession(
			student.Email, mentor.Name, plan.Title,
			s.frontendURL, bookingID.String(),
		); err != nil {
			s.logger.Error("failed to send rating email", zap.Error(err))
		}
	}()

	return nil
}

// ───── Razorpay integration ─────

type razorpayOrderRequest struct {
	Amount   int32             `json:"amount"`
	Currency string            `json:"currency"`
	Receipt  string            `json:"receipt"`
	Notes    map[string]string `json:"notes,omitempty"`
}

type razorpayOrderResponse struct {
	ID string `json:"id"`
}

func (s *Service) createRazorpayOrder(amountPaise int32, currency, receipt string) (string, error) {
	reqBody := razorpayOrderRequest{
		Amount:   amountPaise,
		Currency: currency,
		Receipt:  receipt,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal razorpay request: %w", err)
	}

	req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(payload))
	if err != nil {
		return "", fmt.Errorf("failed to create razorpay request: %w", err)
	}

	req.SetBasicAuth(s.razorpayKeyID, s.razorpayKeySecret)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("razorpay API call failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("razorpay returned status %d: %s", resp.StatusCode, string(body))
	}

	var orderResp razorpayOrderResponse
	if err := json.Unmarshal(body, &orderResp); err != nil {
		return "", fmt.Errorf("failed to parse razorpay response: %w", err)
	}

	return orderResp.ID, nil
}

// ───── Helpers ─────

func (s *Service) toBookingResponse(b db.Booking) BookingResponse {
	return BookingResponse{
		ID:             b.ID,
		StudentID:      b.StudentID,
		MentorID:       b.MentorID,
		PlanID:         b.PlanID,
		SessionDate:    FormatPgDate(b.SessionDate),
		StartTime:      FormatPgTime(b.StartTime),
		EndTime:        FormatPgTime(b.EndTime),
		GoogleMeetLink: b.GoogleMeetLink,
		Status:         b.Status,
		CreatedAt:      b.CreatedAt,
		UpdatedAt:      b.UpdatedAt,
	}
}

func FormatPgDate(d pgtype.Date) string {
	if !d.Valid {
		return ""
	}
	return d.Time.Format("2006-01-02")
}

func FormatPgTime(t pgtype.Time) string {
	if !t.Valid {
		return ""
	}
	totalSeconds := t.Microseconds / 1_000_000
	hours := totalSeconds / 3600
	minutes := (totalSeconds % 3600) / 60
	return fmt.Sprintf("%02d:%02d", hours, minutes)
}
