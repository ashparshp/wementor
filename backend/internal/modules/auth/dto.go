package auth

import "github.com/google/uuid"

// ───── Requests ─────

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8"`
	Name     string `json:"name" validate:"required,min=2,max=100"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type VerifyEmailRequest struct {
	Email string `json:"email" validate:"required,email"`
	OTP   string `json:"otp" validate:"required,len=6"`
}

type ResendOTPRequest struct {
	Email   string `json:"email" validate:"required,email"`
	Purpose string `json:"purpose" validate:"required,oneof=email_verification password_reset"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ResetPasswordRequest struct {
	Email       string `json:"email" validate:"required,email"`
	OTP         string `json:"otp" validate:"required,len=6"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type MentorRegisterRequest struct {
	Email      string `json:"email" validate:"required,email"`
	Password   string `json:"password" validate:"required,min=8"`
	Name       string `json:"name" validate:"required,min=2,max=100"`
	InviteCode string `json:"invite_code" validate:"required,len=6"`
}

// ───── Responses ─────

type AuthResponse struct {
	AccessToken  string   `json:"access_token"`
	RefreshToken string   `json:"refresh_token"`
	User         UserInfo `json:"user"`
}

type UserInfo struct {
	ID            uuid.UUID `json:"id"`
	Email         string    `json:"email"`
	Name          string    `json:"name"`
	Role          string    `json:"role"`
	EmailVerified bool      `json:"email_verified"`
	AvatarURL     *string   `json:"avatar_url"`
}
