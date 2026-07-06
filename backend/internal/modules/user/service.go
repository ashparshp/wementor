package user

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	db "wementor-backend/internal/database/db"
)

// Service contains user profile business logic.
type Service struct {
	queries db.Querier
	logger  *zap.Logger
}

// NewService creates a user service.
func NewService(queries db.Querier, logger *zap.Logger) *Service {
	return &Service{queries: queries, logger: logger}
}

// GetProfile returns a user's profile.
func (s *Service) GetProfile(ctx context.Context, userID uuid.UUID) (*ProfileResponse, error) {
	user, err := s.queries.GetUserByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	return &ProfileResponse{
		ID:            user.ID,
		Email:         user.Email,
		Name:          user.Name,
		Role:          user.Role,
		EmailVerified: user.EmailVerified,
		AvatarURL:     user.AvatarUrl,
	}, nil
}

// UpdateProfile updates the current user's name and avatar.
func (s *Service) UpdateProfile(ctx context.Context, userID uuid.UUID, req UpdateProfileRequest) (*ProfileResponse, error) {
	user, err := s.queries.UpdateUserProfile(ctx, db.UpdateUserProfileParams{
		ID:        userID,
		Name:      req.Name,
		AvatarUrl: req.AvatarURL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	return &ProfileResponse{
		ID:            user.ID,
		Email:         user.Email,
		Name:          user.Name,
		Role:          user.Role,
		EmailVerified: user.EmailVerified,
		AvatarURL:     user.AvatarUrl,
	}, nil
}

// ChangePassword updates the user's password after validating their current password.
func (s *Service) ChangePassword(ctx context.Context, userID uuid.UUID, req ChangePasswordRequest) error {
	user, err := s.queries.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.CurrentPassword)); err != nil {
		return fmt.Errorf("invalid current password")
	}

	// Hash new password
	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password in DB
	err = s.queries.UpdatePassword(ctx, db.UpdatePasswordParams{
		ID:           userID,
		PasswordHash: string(hash),
	})
	if err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	return nil
}
