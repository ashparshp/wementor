package user

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"

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
