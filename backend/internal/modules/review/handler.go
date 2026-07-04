package review

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.uber.org/zap"

	"wementor-backend/internal/server/middleware"
	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes review HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates a review handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// Create POST /api/v1/reviews (student)
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	studentID := middleware.UserIDFromContext(r.Context())

	var req CreateReviewRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	rev, err := h.service.Create(r.Context(), studentID, req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(w, rev)
}

// ListMentorReviews GET /api/v1/reviews/mentor/:mentor_id (public)
func (h *Handler) ListMentorReviews(w http.ResponseWriter, r *http.Request) {
	mentorID, err := uuid.Parse(chi.URLParam(r, "mentor_id"))
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid mentor ID")
		return
	}

	pg := request.ParsePagination(r)

	reviews, total, err := h.service.ListMentorReviews(r.Context(), mentorID, int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, reviews, pg.Page, pg.PerPage, int(total))
}
