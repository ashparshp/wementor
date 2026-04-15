package database

import (
	"context"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"go.uber.org/zap"
)

// ConnectSupabase establishes a connection pool to the Supabase PostgreSQL instance.
func ConnectSupabase(ctx context.Context, connString string, log *zap.Logger) *pgxpool.Pool {
	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		log.Error("Unable to parse database connection string", zap.Error(err))
		os.Exit(1)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		log.Error("Unable to create database connection pool", zap.Error(err))
		os.Exit(1)
	}

	// Ping to verify connection
	if err := pool.Ping(ctx); err != nil {
		log.Error("Unable to ping database", zap.Error(err))
		os.Exit(1)
	}

	log.Info("Successfully connected to Supabase PostgreSQL")
	return pool
}
