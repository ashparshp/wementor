package plan

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"wementor-backend/internal/server/middleware"
	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes plan HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates a plan handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// Create POST /api/v1/plans (mentor)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	mentorID := middleware.UserIDFromContext(r.Context())

	var req CreatePlanRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	plan, err := h.service.Create(r.Context(), mentorID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Created(w, plan)
}

// List GET /api/v1/plans (public — approved only)
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)
	category := r.URL.Query().Get("category")

	plans, total, err := h.service.ListApproved(r.Context(), category, int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, plans, pg.Page, pg.PerPage, int(total))
}

// Get GET /api/v1/plans/:id (public)
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	plan, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.OK(w, plan)
}

// Update PUT /api/v1/plans/:id (mentor owner)
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	mentorID := middleware.UserIDFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	var req UpdatePlanRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	plan, err := h.service.Update(r.Context(), id, mentorID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.OK(w, plan)
}

// Delete DELETE /api/v1/plans/:id (mentor owner)
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	mentorID := middleware.UserIDFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	if err := h.service.Archive(r.Context(), id, mentorID); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.NoContent(w)
}

// ListMyPlans GET /api/v1/plans/me (mentor — all statuses)
func (h *Handler) ListMyPlans(w http.ResponseWriter, r *http.Request) {
	mentorID := middleware.UserIDFromContext(r.Context())

	plans, err := h.service.ListMentorPlans(r.Context(), mentorID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(w, plans)
}

// SetAvailability PUT /api/v1/plans/:id/availability (mentor owner)
func (h *Handler) SetAvailability(w http.ResponseWriter, r *http.Request) {
	mentorID := middleware.UserIDFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	var req SetAvailabilityRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	slots, err := h.service.SetAvailability(r.Context(), id, mentorID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.OK(w, slots)
}

// GetAvailability GET /api/v1/plans/:id/availability (public)
func (h *Handler) GetAvailability(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	plan, err := h.service.GetByID(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.OK(w, plan.Availability)
}

// ── Admin endpoints ──

// ListPending GET /api/v1/admin/plans/pending (admin)
func (h *Handler) ListPending(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	plans, total, err := h.service.ListPending(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, plans, pg.Page, pg.PerPage, int(total))
}

// Approve POST /api/v1/admin/plans/:id/approve (admin)
func (h *Handler) Approve(w http.ResponseWriter, r *http.Request) {
	adminID := middleware.UserIDFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	if err := h.service.Approve(r.Context(), id, adminID); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "plan approved")
}

// Reject POST /api/v1/admin/plans/:id/reject (admin)
func (h *Handler) Reject(w http.ResponseWriter, r *http.Request) {
	adminID := middleware.UserIDFromContext(r.Context())

	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid plan ID")
		return
	}

	var req RejectPlanRequest
	if err := request.Decode(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, "reason is required")
		return
	}

	if err := h.service.Reject(r.Context(), id, adminID, req.Reason); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "plan rejected")
}
