package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// Server
	Port string
	Env  string

	// Database
	DatabaseURL string

	// Redis
	RedisURL string

	// RabbitMQ
	RabbitMQURL string

	// JWT
	JWTSecret       string
	AccessTokenTTL  int // minutes
	RefreshTokenTTL int // days

	// Razorpay
	RazorpayKeyID     string
	RazorpayKeySecret string

	// Resend
	ResendAPIKey string
	FromEmail    string

	// URLs
	FrontendURL   string
	AdminPanelURL string
}

// Load reads configuration from environment variables (with optional .env file).
func Load() (*Config, error) {
	// Load .env file if present; ignore error in production where env vars are set externally.
	_ = godotenv.Load()

	cfg := &Config{
		Port:              getEnv("PORT", "8080"),
		Env:               getEnv("ENV", "development"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		RedisURL:          getEnv("REDIS_URL", "redis://localhost:6379"),
		RabbitMQURL:       getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		AccessTokenTTL:    getEnvAsInt("ACCESS_TOKEN_TTL_MINUTES", 15),
		RefreshTokenTTL:   getEnvAsInt("REFRESH_TOKEN_TTL_DAYS", 7),
		RazorpayKeyID:     os.Getenv("RAZORPAY_KEY_ID"),
		RazorpayKeySecret: os.Getenv("RAZORPAY_KEY_SECRET"),
		ResendAPIKey:      os.Getenv("RESEND_API_KEY"),
		FromEmail:         getEnv("FROM_EMAIL", "WeMentor <noreply@wementor.com>"),
		FrontendURL:       getEnv("FRONTEND_URL", "http://localhost:3000"),
		AdminPanelURL:     getEnv("ADMIN_PANEL_URL", "http://localhost:3001"),
	}

	if cfg.DatabaseURL == "" {
		return nil, fmt.Errorf("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
