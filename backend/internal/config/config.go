package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all environment-based variables
type Config struct {
	Port          string
	Env           string
	SupabaseDBURL string
	JWTSecret     string
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

	return &Config{
		Port:          port,
		Env:           os.Getenv("ENV"),
		SupabaseDBURL: dbURL,
		JWTSecret:     jwtSecret,
	}
}
