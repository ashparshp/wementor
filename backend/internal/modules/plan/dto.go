package plan

import (
	"time"

	"github.com/google/uuid"
)

// ───── Requests ─────

type CreatePlanRequest struct {
	Title                 string `json:"title" validate:"required,min=3,max=255"`
	Description           string `json:"description" validate:"required,min=10"`
	Category              string `json:"category" validate:"required,oneof=jee neet gsoc placements upsc gate cat other"`
	PricePaise            int32  `json:"price_paise" validate:"required,gte=100"`
	DurationMinutes       int32  `json:"duration_minutes" validate:"required,gte=15,lte=180"`
}

type UpdatePlanRequest struct {
	Title                 string `json:"title" validate:"required,min=3,max=255"`
	Description           string `json:"description" validate:"required,min=10"`
	Category              string `json:"category" validate:"required,oneof=jee neet gsoc placements upsc gate cat other"`
	PricePaise            int32  `json:"price_paise" validate:"required,gte=100"`
	DurationMinutes       int32  `json:"duration_minutes" validate:"required,gte=15,lte=180"`
}

type SetAvailabilityRequest struct {
	MinBookingNoticeHours int32                     `json:"min_booking_notice_hours" validate:"required,gte=1"`
	MaxBookingAdvanceDays int32                     `json:"max_booking_advance_days" validate:"required,gte=1"`
	Slots                 []AvailabilitySlotRequest `json:"slots" validate:"required,dive"`
}

type AvailabilitySlotRequest struct {
	SlotType     string `json:"slot_type" validate:"required,oneof=recurring fixed"`
	DayOfWeek    *int32 `json:"day_of_week" validate:"omitempty,gte=0,lte=6"`
	SpecificDate string `json:"specific_date" validate:"omitempty"` // YYYY-MM-DD
	StartTime    string `json:"start_time" validate:"required"`    // HH:MM
	EndTime      string `json:"end_time" validate:"required"`      // HH:MM
}

type RejectPlanRequest struct {
	Reason string `json:"reason" validate:"required"`
}

// ───── Responses ─────

type PlanResponse struct {
	ID                    uuid.UUID          `json:"id"`
	MentorID              uuid.UUID          `json:"mentor_id"`
	Title                 string             `json:"title"`
	Description           *string            `json:"description"`
	Category              string             `json:"category"`
	PricePaise            int32              `json:"price_paise"`
	DurationMinutes       int32              `json:"duration_minutes"`
	MinBookingNoticeHours int32              `json:"min_booking_notice_hours"`
	MaxBookingAdvanceDays int32              `json:"max_booking_advance_days"`
	Status                string             `json:"status"`
	RejectionReason       *string            `json:"rejection_reason,omitempty"`
	Availability          []AvailabilitySlot `json:"availability,omitempty"`
	CreatedAt             time.Time          `json:"created_at"`
	UpdatedAt             time.Time          `json:"updated_at"`
}

type AvailabilitySlot struct {
	ID           uuid.UUID   `json:"id"`
	SlotType     string      `json:"slot_type"`
	DayOfWeek    *int32      `json:"day_of_week,omitempty"`
	SpecificDate *string     `json:"specific_date,omitempty"`
	StartTime    string      `json:"start_time"`
	EndTime      string      `json:"end_time"`
}

type MentorAvailabilityResponse struct {
	MinBookingNoticeHours int32              `json:"min_booking_notice_hours"`
	MaxBookingAdvanceDays int32              `json:"max_booking_advance_days"`
	Slots                 []AvailabilitySlot `json:"availability"`
}

type PendingPlanResponse struct {
	PlanResponse
	MentorName  string `json:"mentor_name"`
	MentorEmail string `json:"mentor_email"`
}
