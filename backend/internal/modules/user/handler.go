package user

import (
	"net/http"

	"github.com/ashparshp/wementor/backend/pkg/request"
	"github.com/ashparshp/wementor/backend/pkg/response"
	"github.com/go-chi/chi/v5"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Routes() chi.Router {
	r := chi.NewRouter()
	r.Post("/register", h.HandleRegister)
	return r
}

func (h *Handler) HandleRegister(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest

	if err := request.Decode(w, r, &req); err != nil {
		return
	}

	newUser, err := h.service.Register(r.Context(), req)
	if err != nil {
		response.Error(w, http.StatusConflict, err.Error())
		return
	}

	res := UserResponse{
		ID:         newUser.ID.String(),
		Email:      newUser.Email,
		FullName:   newUser.FullName,
		Role:       newUser.Role,
		IsVerified: newUser.IsVerified,
		CreatedAt:  newUser.CreatedAt,
	}

	response.Created(w, "User registered successfully", res)
}
