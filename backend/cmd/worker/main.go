package main

import (
	"context"
	"time"

	"github.com/ashparshp/wementor/backend/internal/config"
	"github.com/ashparshp/wementor/backend/internal/infrastructure/cache"
	"github.com/ashparshp/wementor/backend/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	cfg := config.Load()

	logger.InitLogger(cfg.Env)
	defer logger.Sync()

	logger.Log.Info("Starting WeMentor Worker", zap.String("env", cfg.Env))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	redisClient, err := cache.ConnectRedis(ctx, cfg.RedisURL)
	if err != nil {
		logger.Log.Warn("Redis not available; continuing without cache", zap.Error(err))
	} else if redisClient != nil {
		defer func() { _ = redisClient.Close() }()
	}

	// TODO: Initialize worker consumers (RabbitMQ) and start processing loop.
	logger.Log.Info("Worker setup complete; add consumer initialization in cmd/worker/main.go")
}
