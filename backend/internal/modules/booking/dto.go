package booking

import (
	"time"

	"github.com/google/uuid"
)

// ───── Requests ─────

type CreateBookingRequest struct {
	PlanID    uuid.UUID `json:"plan_id" validate:"required"`
	Date      string    `json:"date" validate:"required"`       // YYYY-MM-DD
	StartTime string    `json:"start_time" validate:"required"` // HH:MM
}

type CancelBookingRequest struct {
	Reason string `json:"reason"`
}

// ───── Responses ─────

type BookingResponse struct {
	ID             uuid.UUID `json:"id"`
	StudentID      uuid.UUID `json:"student_id"`
	MentorID       uuid.UUID `json:"mentor_id"`
	PlanID         uuid.UUID `json:"plan_id"`
	SessionDate    string    `json:"session_date"`
	StartTime      string    `json:"start_time"`
	EndTime        string    `json:"end_time"`
	GoogleMeetLink *string   `json:"google_meet_link,omitempty"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type StudentBookingResponse struct {
	BookingResponse
	PlanTitle  string `json:"plan_title"`
	MentorName string `json:"mentor_name"`
}

type MentorBookingResponse struct {
	BookingResponse
	PlanTitle   string `json:"plan_title"`
	StudentName string `json:"student_name"`
}

type CreateBookingResponse struct {
	Booking          BookingResponse `json:"booking"`
	RazorpayOrderID  string         `json:"razorpay_order_id"`
	RazorpayKeyID    string         `json:"razorpay_key_id"`
	AmountPaise      int32          `json:"amount_paise"`
	Currency         string         `json:"currency"`
}
