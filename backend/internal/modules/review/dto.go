package review

import (
	"time"

	"github.com/google/uuid"
)

// ───── Requests ─────

type CreateReviewRequest struct {
	BookingID uuid.UUID `json:"booking_id" validate:"required"`
	Rating    int32     `json:"rating" validate:"required,gte=1,lte=5"`
	Comment   string    `json:"comment"`
}

// ───── Responses ─────

type ReviewResponse struct {
	ID          uuid.UUID `json:"id"`
	BookingID   uuid.UUID `json:"booking_id"`
	StudentID   uuid.UUID `json:"student_id"`
	MentorID    uuid.UUID `json:"mentor_id"`
	Rating      int32     `json:"rating"`
	Comment     *string   `json:"comment"`
	StudentName string    `json:"student_name,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}
