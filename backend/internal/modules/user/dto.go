package user

import "github.com/google/uuid"

// ───── Requests ─────

type UpdateProfileRequest struct {
	Name      string  `json:"name" validate:"required,min=2,max=100"`
	AvatarURL *string `json:"avatar_url"`
}

// ───── Responses ─────

type ProfileResponse struct {
	ID            uuid.UUID `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Role          string    `json:"role"`
	EmailVerified bool      `json:"email_verified"`
	AvatarURL     *string   `json:"avatar_url"`
}
