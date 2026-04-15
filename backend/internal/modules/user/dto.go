package user

import "time"

// RegisterRequest defines the JSON payload for creating a new user
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	FullName string `json:"full_name" validate:"required"`
}

// UserResponse defines the safe public data we return to the client
type UserResponse struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	FullName   string    `json:"full_name"`
	Role       string    `json:"role"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
}
