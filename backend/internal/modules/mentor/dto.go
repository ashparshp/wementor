package mentor

import (
	"time"

	"github.com/google/uuid"
)

// ───── Requests ─────

type ApplyRequest struct {
	Email string `json:"email" validate:"required,email"`
	Phone string `json:"phone" validate:"required,min=10,max=15"`
	About string `json:"about" validate:"required,min=20"`
}

type UpdateProfileRequest struct {
	Bio            *string  `json:"bio"`
	Achievements   []string `json:"achievements"`
	Documents      []string `json:"documents"`
	GoogleMeetLink *string  `json:"google_meet_link"`
	Phone          *string  `json:"phone"`
}

// ───── Responses ─────

type ApplicationResponse struct {
	ID        uuid.UUID  `json:"id"`
	Email     string     `json:"email"`
	Phone     string     `json:"phone"`
	About     string     `json:"about"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type MentorPublicResponse struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"user_id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	AvatarURL      *string   `json:"avatar_url"`
	Bio            *string   `json:"bio"`
	Achievements   []string  `json:"achievements"`
	GoogleMeetLink *string   `json:"google_meet_link,omitempty"`
	AvgRating      float64   `json:"avg_rating"`
	TotalReviews   int32     `json:"total_reviews"`
	TotalSessions  int32     `json:"total_sessions"`
}

type MentorProfileResponse struct {
	ID             uuid.UUID `json:"id"`
	UserID         uuid.UUID `json:"user_id"`
	Bio            *string   `json:"bio"`
	Achievements   []string  `json:"achievements"`
	Documents      []string  `json:"documents"`
	GoogleMeetLink *string   `json:"google_meet_link"`
	Phone          *string   `json:"phone"`
	AvgRating      float64   `json:"avg_rating"`
	TotalReviews   int32     `json:"total_reviews"`
	TotalSessions  int32     `json:"total_sessions"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}
