package booking

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"wementor-backend/internal/server/middleware"
	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes booking HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates a booking handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// Create POST /api/v1/bookings (student)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	studentID := middleware.UserIDFromContext(r.Context())

	var req CreateBookingRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	resp, err := h.service.Create(r.Context(), studentID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(w, resp)
}

// GetByID GET /api/v1/bookings/:id
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	role := middleware.UserRoleFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid booking ID")
		return
	}

	booking, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	// Non-admins can only view their own bookings
	if role != "admin" && booking.StudentID != userID && booking.MentorID != userID {
		response.Error(w, http.StatusForbidden, "you do not have access to this booking")
		return
	}

	response.OK(w, booking)
}

// ListMyBookings GET /api/v1/bookings/me
func (h *Handler) ListMyBookings(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	role := middleware.UserRoleFromContext(r.Context())
	pg := request.ParsePagination(r)

	if role == "mentor" {
		bookings, total, err := h.service.ListMentorBookings(r.Context(), userID, int32(pg.PerPage), int32(pg.Offset))
		if err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		response.Paginated(w, bookings, pg.Page, pg.PerPage, int(total))
	} else {
		bookings, total, err := h.service.ListStudentBookings(r.Context(), userID, int32(pg.PerPage), int32(pg.Offset))
		if err != nil {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		response.Paginated(w, bookings, pg.Page, pg.PerPage, int(total))
	}
}

// Cancel POST /api/v1/bookings/:id/cancel
func (h *Handler) Cancel(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	role := middleware.UserRoleFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid booking ID")
		return
	}

	if err := h.service.Cancel(r.Context(), id, userID, role); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "booking cancelled")
}

// Complete POST /api/v1/bookings/:id/complete (mentor)
func (h *Handler) Complete(w http.ResponseWriter, r *http.Request) {
	mentorID := middleware.UserIDFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid booking ID")
		return
	}

	if err := h.service.Complete(r.Context(), id, mentorID); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "session marked as completed")
}
