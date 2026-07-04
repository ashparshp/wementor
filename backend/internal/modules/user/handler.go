package user

import (
	"net/http"

	"go.uber.org/zap"

	"wementor-backend/internal/server/middleware"
	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes user HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates a user handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// GetProfile GET /api/v1/users/me
func (h *Handler) GetProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	profile, err := h.service.GetProfile(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.OK(w, profile)
}

// UpdateProfile PUT /api/v1/users/me
func (h *Handler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	var req UpdateProfileRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	profile, err := h.service.UpdateProfile(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(w, profile)
}
