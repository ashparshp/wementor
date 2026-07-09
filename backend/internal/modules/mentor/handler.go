package mentor

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"wementor-backend/internal/server/middleware"
	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes mentor HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates a mentor handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// Apply POST /api/v1/mentor-applications (public)
func (h *Handler) Apply(w http.ResponseWriter, r *http.Request) {
	var req ApplyRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	app, err := h.service.Apply(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Created(w, app)
}

// ListApplications GET /api/v1/mentor-applications (admin)
func (h *Handler) ListApplications(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)
	status := r.URL.Query().Get("status")

	apps, total, err := h.service.ListApplications(r.Context(), status, int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, apps, pg.Page, pg.PerPage, int(total))
}

// GetApplication GET /api/v1/mentor-applications/:id (admin)
func (h *Handler) GetApplication(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid application ID")
		return
	}

	app, err := h.service.GetApplication(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.OK(w, app)
}

// ApproveApplication POST /api/v1/mentor-applications/:id/approve (admin)
func (h *Handler) ApproveApplication(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid application ID")
		return
	}

	adminID := middleware.UserIDFromContext(r.Context())

	if err := h.service.ApproveApplication(r.Context(), id, adminID); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "application approved, invite sent")
}

// RejectApplication POST /api/v1/mentor-applications/:id/reject (admin)
func (h *Handler) RejectApplication(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid application ID")
		return
	}

	var body struct {
		Reason string `json:"reason" validate:"required"`
	}
	if err := request.Decode(r, &body); err != nil {
		response.Error(w, http.StatusBadRequest, "reason is required")
		return
	}

	adminID := middleware.UserIDFromContext(r.Context())

	if err := h.service.RejectApplication(r.Context(), id, adminID, body.Reason); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Message(w, http.StatusOK, "application rejected")
}

// ListMentors GET /api/v1/mentors (public)
func (h *Handler) ListMentors(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	mentors, total, err := h.service.ListPublicProfiles(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, mentors, pg.Page, pg.PerPage, int(total))
}

// GetMentor GET /api/v1/mentors/:id (public)
func (h *Handler) GetMentor(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid mentor ID")
		return
	}

	mentor, err := h.service.GetPublicProfile(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.OK(w, mentor)
}

// GetMyProfile GET /api/v1/mentors/me/profile (mentor)
func (h *Handler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	profile, err := h.service.GetProfile(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.OK(w, profile)
}

// UpdateMyProfile PUT /api/v1/mentors/me/profile (mentor)
func (h *Handler) UpdateMyProfile(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())

	var req UpdateProfileRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	profile, err := h.service.UpdateProfile(r.Context(), userID, req)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(w, profile)
}
