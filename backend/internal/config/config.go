package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all environment-based variables
type Config struct {
	Port                string
	Env                 string
	SupabaseDBURL       string
	JWTSecret           string
	RAZORPAY_KEY_ID     string
	RAZORPAY_KEY_SECRET string
	RESEND_API_KEY      string
	ZOOM_CLIENT_ID      string
	ZOOM_CLIENT_SECRET  string
}

// Load reads the .env file and maps it to the Config struct
func Load() *Config {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from system environment")
	}

	dbURL := os.Getenv("SUPABASE_DB_URL")
	if dbURL == "" {
		log.Fatal("SUPABASE_DB_URL is required in .env")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "develop_secret_key" // Fallback for local testing
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	razorpayKeyID := os.Getenv("RAZORPAY_KEY_ID")
	if razorpayKeyID == "" {
		log.Fatal("RAZORPAY_KEY_ID is required in .env")
	}

	razorpayKeySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	if razorpayKeySecret == "" {
		log.Fatal("RAZORPAY_KEY_SECRET is required in .env")
	}

	resendAPIKey := os.Getenv("RESEND_API_KEY")
	if resendAPIKey == "" {
		log.Fatal("RESEND_API_KEY is required in .env")
	}

	zoomClientID := os.Getenv("ZOOM_CLIENT_ID")
	if zoomClientID == "" {
		log.Fatal("ZOOM_CLIENT_ID is required in .env")
	}

	zoomClientSecret := os.Getenv("ZOOM_CLIENT_SECRET")
	if zoomClientSecret == "" {
		log.Fatal("ZOOM_CLIENT_SECRET is required in .env")
	}

	return &Config{
		Port:                port,
		Env:                 os.Getenv("ENV"),
		SupabaseDBURL:       dbURL,
		JWTSecret:           jwtSecret,
		RAZORPAY_KEY_ID:     razorpayKeyID,
		RAZORPAY_KEY_SECRET: razorpayKeySecret,
		RESEND_API_KEY:      resendAPIKey,
		ZOOM_CLIENT_ID:      zoomClientID,
		ZOOM_CLIENT_SECRET:  zoomClientSecret,
	}
}
