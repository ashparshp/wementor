package payment

import "github.com/google/uuid"

// ───── Requests ─────

type VerifyPaymentRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id" validate:"required"`
	RazorpayPaymentID string `json:"razorpay_payment_id" validate:"required"`
	RazorpaySignature string `json:"razorpay_signature" validate:"required"`
}

type WebhookPayload struct {
	Event   string `json:"event"`
	Payload struct {
		Payment struct {
			Entity struct {
				ID      string `json:"id"`
				OrderID string `json:"order_id"`
				Status  string `json:"status"`
			} `json:"entity"`
		} `json:"payment"`
	} `json:"payload"`
}

// ───── Responses ─────

type PaymentResponse struct {
	ID                uuid.UUID `json:"id"`
	BookingID         uuid.UUID `json:"booking_id"`
	AmountPaise       int32     `json:"amount_paise"`
	Currency          string    `json:"currency"`
	OrderNumber       *string   `json:"order_number"`
	RazorpayOrderID   *string   `json:"razorpay_order_id"`
	RazorpayPaymentID *string   `json:"razorpay_payment_id"`
	Status            string    `json:"status"`
}
