package admin

import (
	"net/http"

	"go.uber.org/zap"

	"wementor-backend/pkg/request"
	"wementor-backend/pkg/response"
)

// Handler exposes admin HTTP endpoints.
type Handler struct {
	service *Service
	logger  *zap.Logger
}

// NewHandler creates an admin handler.
func NewHandler(service *Service, logger *zap.Logger) *Handler {
	return &Handler{service: service, logger: logger}
}

// GetStats GET /api/v1/admin/stats
func (h *Handler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.service.GetStats(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(w, stats)
}

// ListUsers GET /api/v1/admin/users
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	users, total, err := h.service.ListUsers(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, users, pg.Page, pg.PerPage, int(total))
}

// ListBookings GET /api/v1/admin/bookings
func (h *Handler) ListBookings(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	bookings, total, err := h.service.ListBookings(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, bookings, pg.Page, pg.PerPage, int(total))
}

// ListPayments GET /api/v1/admin/payments
func (h *Handler) ListPayments(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	payments, total, err := h.service.ListPayments(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, payments, pg.Page, pg.PerPage, int(total))
}

// ListMentors GET /api/v1/admin/mentors
func (h *Handler) ListMentors(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	mentors, total, err := h.service.ListMentors(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, mentors, pg.Page, pg.PerPage, int(total))
}

// ListCoupons GET /api/v1/admin/coupons
func (h *Handler) ListCoupons(w http.ResponseWriter, r *http.Request) {
	pg := request.ParsePagination(r)

	coupons, total, err := h.service.ListCoupons(r.Context(), int32(pg.PerPage), int32(pg.Offset))
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Paginated(w, coupons, pg.Page, pg.PerPage, int(total))
}

// GenerateCoupon POST /api/v1/admin/coupons
func (h *Handler) GenerateCoupon(w http.ResponseWriter, r *http.Request) {
	var req CreateCouponRequest
	if err := request.Decode(r, &req); err != nil {
		if request.IsValidationError(err) {
			response.ErrorWithDetails(w, http.StatusBadRequest, "validation failed", request.ValidationErrorDetails(err))
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	coupon, err := h.service.GenerateCoupon(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Created(w, coupon)
}
