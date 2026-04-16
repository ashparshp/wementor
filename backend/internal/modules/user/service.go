package user

import (
	"context"
	"errors"

	"github.com/ashparshp/wementor/backend/internal/database/db"
	"github.com/ashparshp/wementor/backend/pkg/logger"
	"github.com/jackc/pgx/v5"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	queries db.Querier
}

func NewService(queries db.Querier) *Service {
	return &Service{queries: queries}
}

// Register handles user creation logic
func (s *Service) Register(ctx context.Context, req RegisterRequest) (db.User, error) {
	// Check if user already exists
	_, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err == nil {
		return db.User{}, errors.New("a user with this email already exists")
	}

	// 
	if !errors.Is(err, pgx.ErrNoRows) {
		logger.Log.Error("Failed to check existing user", zap.Error(err))
		return db.User{}, errors.New("internal server error")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Log.Error("Failed to hash password", zap.Error(err))
		return db.User{}, errors.New("internal server error")
	}

	// Create user
	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FullName:     req.FullName,
		Role:         "customer",
	})

	if err != nil {
		logger.Log.Error("Database insertion failed", zap.Error(err))
		return db.User{}, errors.New("could not create user")
	}

	return user, nil
}
