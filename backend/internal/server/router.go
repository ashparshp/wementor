package server

import (
	"net/http"
	"time"

	"github.com/ashparshp/wementor/backend/internal/modules/user"
	internalMiddleware "github.com/ashparshp/wementor/backend/internal/server/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// SetupRouter configures global middleware and mounts all module routes.
func SetupRouter(userHandler *user.Handler) *chi.Mux {
	r := chi.NewRouter()

	// --- GLOBAL MIDDLEWARE ---
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// Plug in the StructuredLogger from the Canvas
	r.Use(internalMiddleware.StructuredLogger)

	// CORS Configuration for Frontend connectivity
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// --- SYSTEM ROUTES ---
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status": "ok", "message": "server is healthy"}`))
	})

	// --- MODULE ROUTES ---
	r.Route("/api/v1", func(r chi.Router) {
		r.Mount("/users", userHandler.Routes())
		// Future modules will be mounted here
	})

	return r
}
