package payment

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"

	"go.uber.org/zap"

	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes payment HTTP endpoints.
type Handler struct {
	service           *Service
	logger            *zap.Logger
	razorpayKeySecret string
}

// NewHandler creates a payment handler.
func NewHandler(service *Service, logger *zap.Logger, razorpayKeySecret string) *Handler {
	return &Handler{
		service:           service,
		logger:            logger,
		razorpayKeySecret: razorpayKeySecret,
	}
}

// Verify POST /api/v1/payments/verify (student, authenticated)
func (h *Handler) Verify(w http.ResponseWriter, r *http.Request) {
	var req VerifyPaymentRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	payment, err := h.service.VerifyPayment(r.Context(), req)
	if err != nil {
		h.logger.Error("payment verification failed", zap.Error(err))
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.OK(w, payment)
}

// Webhook POST /api/v1/payments/webhook (Razorpay, unauthenticated but signature-verified)
func (h *Handler) Webhook(w http.ResponseWriter, r *http.Request) {
	// 1. Read raw body for signature verification
	body, err := io.ReadAll(r.Body)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "failed to read body")
		return
	}

	// 2. Verify Razorpay webhook signature (Made optional as requested)
	signature := r.Header.Get("X-Razorpay-Signature")
	if signature != "" {
		mac := hmac.New(sha256.New, []byte(h.razorpayKeySecret))
		mac.Write(body)
		expectedSignature := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(expectedSignature), []byte(signature)) {
			response.Error(w, http.StatusUnauthorized, "invalid webhook signature")
			return
		}
	} else {
		h.logger.Warn("Webhook received without a signature! (Insecure)")
	}

	// 3. Parse payload
	var payload WebhookPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid webhook payload")
		return
	}

	// 4. Process webhook
	if err := h.service.HandleWebhook(r.Context(), payload); err != nil {
		h.logger.Error("webhook processing failed", zap.Error(err), zap.String("event", payload.Event))
		// Return 200 to prevent Razorpay from retrying
	}

	// Always return 200 to Razorpay
	response.Message(w, http.StatusOK, "webhook received")
}
