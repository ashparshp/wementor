package main

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	dbURL := "postgresql://postgres:your_password@localhost:5433/wementor?sslmode=disable"
	ctx := context.Background()

	conn, err := pgx.Connect(ctx, dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer conn.Close(ctx)

	password := "password123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatalf("Failed to hash password: %v\n", err)
	}

	_, err = conn.Exec(ctx, `
		INSERT INTO users (email, password_hash, name, role, email_verified)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (email) DO NOTHING
	`, "admin@wementor.com", string(hash), "System Admin", "admin", true)

	if err != nil {
		log.Fatalf("Failed to insert admin: %v\n", err)
	}

	fmt.Println("Admin user created successfully!")
	fmt.Println("Email: admin@wementor.com")
	fmt.Println("Password: password123")
}
