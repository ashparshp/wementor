package main

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/ashparshp/wementor/backend/internal/config"
	"github.com/ashparshp/wementor/backend/internal/database/db"
	"github.com/ashparshp/wementor/backend/internal/infrastructure/database"
	"github.com/ashparshp/wementor/backend/internal/modules/user"
	"github.com/ashparshp/wementor/backend/internal/server"
	"github.com/ashparshp/wementor/backend/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	// 1. Load configuration from .env
	cfg := config.Load()

	// 2. Initialize the structured logger (Zap)
	// This uses the 'Env' from config to decide between dev (colored) or prod (JSON) logs
	logger.InitLogger(cfg.Env)
	defer logger.Sync()

	logger.Log.Info("Starting WeMentor API Server", zap.String("env", cfg.Env))

	// 3. Establish Database Connection Pool (Supabase)
	// We use a context with timeout to ensure we don't hang forever if the DB is down
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ConnectSupabase is defined in internal/infrastructure/database/supabase.go
	dbPool := database.ConnectSupabase(ctx, cfg.SupabaseDBURL, logger.Log)
	defer dbPool.Close()

	// 4. Initialize Dependency Injection
	// 'db.New' is the generated entry point from sqlc
	queries := db.New(dbPool)

	// Initialize the User Module (Service -> Handler)
	userService := user.NewService(queries)
	userHandler := user.NewHandler(userService)

	// 5. Setup Router (internal/server/router.go)
	// We pass the handlers to the router so it can mount the specific routes
	r := server.SetupRouter(userHandler)

	// 6. Configure and Start HTTP Server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)

	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	logger.Log.Info("Server is live", zap.String("addr", serverAddr))

	// ListenAndServe blocks until an error occurs
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Log.Fatal("Server startup failed", zap.Error(err))
	}
}
