package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"

	"wementor-backend/internal/config"
	"wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/database"
	"wementor-backend/internal/infrastructure/email"
	"wementor-backend/internal/server"
	"wementor-backend/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("failed to load configuration: %v\n", err)
		os.Exit(1)
	}

	// Initialize structured logger
	log := logger.New(cfg.Env)
	defer log.Sync()

	ctx := context.Background()

	// Initialize Database (Postgres)
	pool, err := database.NewPostgresPool(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal("failed to connect to database", zap.Error(err))
	}
	defer pool.Close()
	log.Info("connected to postgres database")

	queries := db.New(pool)

	// Initialize Email Client (Resend)
	emailClient := email.NewClient(cfg.ResendAPIKey, cfg.FromEmail)

	// Initialize Router
	router := server.SetupRouter(cfg, queries, emailClient, log)

	// Setup HTTP Server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Info("server starting", zap.String("port", cfg.Port))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal("server failed to start", zap.Error(err))
		}
	}()

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")

	ctxShutDown, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctxShutDown); err != nil {
		log.Fatal("server forced to shutdown", zap.Error(err))
	}

	log.Info("server exited properly")
}
