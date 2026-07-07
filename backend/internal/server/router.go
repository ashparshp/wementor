package server

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"

	"wementor-backend/internal/config"
	db "wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/email"
	mw "wementor-backend/internal/server/middleware"

	"wementor-backend/internal/modules/admin"
	"wementor-backend/internal/modules/auth"
	"wementor-backend/internal/modules/booking"
	"wementor-backend/internal/modules/mentor"
	"wementor-backend/internal/modules/payment"
	"wementor-backend/internal/modules/plan"
	"wementor-backend/internal/modules/review"
	"wementor-backend/internal/modules/user"
)

// SetupRouter initializes all routes and middleware.
func SetupRouter(
	cfg *config.Config,
	queries db.Querier,
	emailClient *email.Client,
	logger *zap.Logger,
) http.Handler {
	r := chi.NewRouter()

	// ───── Global Middleware ─────
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(mw.Logger(logger))
	r.Use(middleware.Recoverer)

	// NOTE: In production, configure proper CORS headers here
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	// ───── Init Services & Handlers ─────
	jwtManager := auth.NewJWTManager(cfg.JWTSecret, cfg.AccessTokenTTL, cfg.RefreshTokenTTL)

	authService := auth.NewService(queries, jwtManager, emailClient, logger, cfg.AdminPanelURL, cfg.FrontendURL)
	authHandler := auth.NewHandler(authService, logger)

	userService := user.NewService(queries, logger)
	userHandler := user.NewHandler(userService, logger)

	mentorService := mentor.NewService(queries, emailClient, logger, cfg.AdminPanelURL)
	mentorHandler := mentor.NewHandler(mentorService, logger)

	planService := plan.NewService(queries, emailClient, logger)
	planHandler := plan.NewHandler(planService, logger)

	bookingService := booking.NewService(queries, emailClient, logger, cfg.RazorpayKeyID, cfg.RazorpayKeySecret, cfg.FrontendURL)
	bookingHandler := booking.NewHandler(bookingService, logger)

	paymentService := payment.NewService(queries, emailClient, logger, cfg.RazorpayKeySecret, cfg.FrontendURL)
	paymentHandler := payment.NewHandler(paymentService, logger, cfg.RazorpayKeySecret)

	reviewService := review.NewService(queries, logger)
	reviewHandler := review.NewHandler(reviewService, logger)

	adminService := admin.NewService(queries, logger)
	adminHandler := admin.NewHandler(adminService, logger)

	// Middleware aliases
	requireAuth := mw.Auth(cfg.JWTSecret)
	requireMentor := mw.RequireMentor
	requireAdmin := mw.RequireAdmin

	// ───── Routes ─────
	r.Route("/api/v1", func(r chi.Router) {

		// Health Check
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("OK"))
		})

		// Auth
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
			r.Post("/verify-email", authHandler.VerifyEmail)
			r.Post("/resend-otp", authHandler.ResendOTP)
			r.Post("/forgot-password", authHandler.ForgotPassword)
			r.Post("/reset-password", authHandler.ResetPassword)
			r.Post("/refresh", authHandler.RefreshToken)
			r.Post("/logout", authHandler.Logout)
			r.Post("/mentor/register", authHandler.MentorRegister)

			r.With(requireAuth).Get("/me", authHandler.GetMe)
		})

		// Users
		r.Route("/users", func(r chi.Router) {
			r.Use(requireAuth)
			r.Get("/me", userHandler.GetProfile)
			r.Put("/me", userHandler.UpdateProfile)
			r.Post("/change-password", userHandler.ChangePassword)
		})

		// Mentors
		r.Route("/mentors", func(r chi.Router) {
			r.Get("/", mentorHandler.ListMentors)
			r.Get("/{id}", mentorHandler.GetMentor)

			// Mentor-only
			r.Group(func(r chi.Router) {
				r.Use(requireAuth, requireMentor)
				r.Get("/me/profile", mentorHandler.GetMyProfile)
				r.Put("/me/profile", mentorHandler.UpdateMyProfile)
			})
		})
		r.Post("/mentor-applications", mentorHandler.Apply)

		// Plans
		r.Route("/plans", func(r chi.Router) {
			r.Get("/", planHandler.List)
			r.Get("/{id}", planHandler.Get)
			r.Get("/{id}/availability", planHandler.GetAvailability)

			// Mentor-only
			r.Group(func(r chi.Router) {
				r.Use(requireAuth, requireMentor)
				r.Post("/", planHandler.Create)
				r.Get("/me", planHandler.ListMyPlans)
				r.Put("/{id}", planHandler.Update)
				r.Delete("/{id}", planHandler.Delete)
				r.Put("/{id}/availability", planHandler.SetAvailability)
			})
		})

		// Bookings
		r.Route("/bookings", func(r chi.Router) {
			r.Use(requireAuth)
			r.Post("/", bookingHandler.Create)
			r.Get("/me", bookingHandler.ListMyBookings)
			r.Get("/{id}", bookingHandler.GetByID)
			r.Post("/{id}/cancel", bookingHandler.Cancel)
			
			// Mentor-only
			r.With(requireMentor).Post("/{id}/complete", bookingHandler.Complete)
		})

		// Payments
		r.Route("/payments", func(r chi.Router) {
			r.Post("/webhook", paymentHandler.Webhook) // Public, verified by signature internally
			r.With(requireAuth).Post("/verify", paymentHandler.Verify)
		})

		// Reviews
		r.Route("/reviews", func(r chi.Router) {
			r.Get("/mentor/{mentor_id}", reviewHandler.ListMentorReviews)
			r.With(requireAuth).Post("/", reviewHandler.Create)
		})

		// Admin
		r.Route("/admin", func(r chi.Router) {
			r.Use(requireAuth, requireAdmin)
			
			r.Get("/stats", adminHandler.GetStats)
			r.Get("/users", adminHandler.ListUsers)
			r.Get("/bookings", adminHandler.ListBookings)
			r.Get("/payments", adminHandler.ListPayments)
			r.Get("/mentors", adminHandler.ListMentors)
			r.Get("/coupons", adminHandler.ListCoupons)
			r.Post("/coupons", adminHandler.GenerateCoupon)
			
			r.Get("/mentor-applications", mentorHandler.ListApplications)
			r.Get("/mentor-applications/{id}", mentorHandler.GetApplication)
			r.Post("/mentor-applications/{id}/approve", mentorHandler.ApproveApplication)
			r.Post("/mentor-applications/{id}/reject", mentorHandler.RejectApplication)

			r.Get("/plans/pending", planHandler.ListPending)
			r.Post("/plans/{id}/approve", planHandler.Approve)
			r.Post("/plans/{id}/reject", planHandler.Reject)
		})
	})

	return r
}
