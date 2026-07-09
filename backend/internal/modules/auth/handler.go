package auth

import (
	"net/http"

	"go.uber.org/zap"

	"wementor-backend/internal/server/middleware"
	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes auth HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates an auth handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// Register POST /api/v1/auth/register
func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.Register(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(w, resp)
}

// Login POST /api/v1/auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.Login(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}

	response.OK(w, resp)
}

// VerifyEmail POST /api/v1/auth/verify-email
func (h *Handler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	var req VerifyEmailRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.VerifyEmail(r.Context(), req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "email verified successfully")
}

// ResendOTP POST /api/v1/auth/resend-otp
func (h *Handler) ResendOTP(w http.ResponseWriter, r *http.Request) {
	var req ResendOTPRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.ResendOTP(r.Context(), req); err != nil {
		response.Error(w, http.StatusTooManyRequests, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "OTP sent successfully")
}

// ForgotPassword POST /api/v1/auth/forgot-password
func (h *Handler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	var req ForgotPasswordRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	// Always return success to prevent email enumeration
	_ = h.service.ForgotPassword(r.Context(), req)

	response.Message(w, http.StatusOK, "if the email exists, a reset code has been sent")
}

// ResetPassword POST /api/v1/auth/reset-password
func (h *Handler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var req ResetPasswordRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.ResetPassword(r.Context(), req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "password reset successfully")
}

// RefreshToken POST /api/v1/auth/refresh
func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest
	if err := request.Decode(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.RefreshToken(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusUnauthorized, err.Error())
		return
	}

	response.OK(w, resp)
}

// Logout POST /api/v1/auth/logout
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	var req RefreshTokenRequest
	if err := request.Decode(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	_ = h.service.Logout(r.Context(), req)
	response.Message(w, http.StatusOK, "logged out successfully")
}

// MentorRegister POST /api/v1/auth/mentor/register
func (h *Handler) MentorRegister(w http.ResponseWriter, r *http.Request) {
	var req MentorRegisterRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.MentorRegister(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(w, resp)
}

// GetMe GET /api/v1/auth/me
func (h *Handler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	user, err := h.service.queries.GetUserByID(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusNotFound, "user not found")
		return
	}

	response.OK(w, UserInfo{
		ID:            user.ID,
		Email:         user.Email,
		Name:          user.Name,
		Role:          user.Role,
		EmailVerified: user.EmailVerified,
		AvatarURL:     user.AvatarUrl,
	})
}
