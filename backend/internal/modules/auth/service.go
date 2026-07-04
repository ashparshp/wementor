package auth

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	db "wementor-backend/internal/database/db"
	"wementor-backend/internal/infrastructure/email"
)

// Service contains authentication and authorization business logic.
type Service struct {
	queries       db.Querier
	jwtManager    *JWTManager
	emailClient   *email.Client
	logger        *zap.Logger
	adminPanelURL string
	frontendURL   string
}

// NewService creates an auth service.
func NewService(
	queries db.Querier,
	jwtManager *JWTManager,
	emailClient *email.Client,
	logger *zap.Logger,
	adminPanelURL, frontendURL string,
) *Service {
	return &Service{
		queries:       queries,
		jwtManager:    jwtManager,
		emailClient:   emailClient,
		logger:        logger,
		adminPanelURL: adminPanelURL,
		frontendURL:   frontendURL,
	}
}

// Register creates a new student account, generates an OTP, and sends verification email.
func (s *Service) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	// Check if user already exists
	if _, err := s.queries.GetUserByEmail(ctx, req.Email); err == nil {
		return nil, fmt.Errorf("email already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Email:        req.Email,
		PasswordHash: string(hash),
		Name:         req.Name,
		Role:         "student",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Generate and send verification OTP
	if err := s.sendOTP(ctx, req.Email, "email_verification"); err != nil {
		s.logger.Error("failed to send verification OTP", zap.Error(err))
	}

	return s.generateAuthResponse(ctx, user)
}

// Login authenticates a user with email and password.
func (s *Service) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	user, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("invalid email or password")
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	return s.generateAuthResponse(ctx, user)
}

// VerifyEmail validates the OTP and marks the user's email as verified.
func (s *Service) VerifyEmail(ctx context.Context, req VerifyEmailRequest) error {
	if err := s.verifyOTP(ctx, req.Email, req.OTP, "email_verification"); err != nil {
		return err
	}

	user, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	return s.queries.UpdateEmailVerified(ctx, user.ID)
}

// ResendOTP generates and sends a new OTP (rate-limited to 3/hour).
func (s *Service) ResendOTP(ctx context.Context, req ResendOTPRequest) error {
	count, err := s.queries.CountRecentOTPs(ctx, db.CountRecentOTPsParams{
		Email:   req.Email,
		Purpose: req.Purpose,
	})
	if err != nil {
		return fmt.Errorf("failed to check OTP rate limit: %w", err)
	}
	if count >= 3 {
		return fmt.Errorf("too many OTP requests, please try again later")
	}

	return s.sendOTP(ctx, req.Email, req.Purpose)
}

// ForgotPassword sends a password reset OTP.
func (s *Service) ForgotPassword(ctx context.Context, req ForgotPasswordRequest) error {
	// Always return success to prevent email enumeration
	if _, err := s.queries.GetUserByEmail(ctx, req.Email); err != nil {
		return nil
	}

	return s.sendOTP(ctx, req.Email, "password_reset")
}

// ResetPassword verifies the OTP and updates the user's password.
func (s *Service) ResetPassword(ctx context.Context, req ResetPasswordRequest) error {
	if err := s.verifyOTP(ctx, req.Email, req.OTP, "password_reset"); err != nil {
		return err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), 12)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	user, err := s.queries.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return fmt.Errorf("user not found")
	}

	if err := s.queries.UpdatePassword(ctx, db.UpdatePasswordParams{
		PasswordHash: string(hash),
		ID:           user.ID,
	}); err != nil {
		return fmt.Errorf("failed to update password: %w", err)
	}

	// Revoke all existing refresh tokens on password change
	_ = s.queries.RevokeAllUserRefreshTokens(ctx, user.ID)

	return nil
}

// RefreshToken validates a refresh token, rotates it, and returns new token pair.
func (s *Service) RefreshToken(ctx context.Context, req RefreshTokenRequest) (*AuthResponse, error) {
	tokenHash := HashToken(req.RefreshToken)

	stored, err := s.queries.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token")
	}

	// Revoke the old token (rotation)
	_ = s.queries.RevokeRefreshToken(ctx, stored.ID)

	user, err := s.queries.GetUserByID(ctx, stored.UserID)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	return s.generateAuthResponse(ctx, user)
}

// Logout revokes the provided refresh token.
func (s *Service) Logout(ctx context.Context, req RefreshTokenRequest) error {
	tokenHash := HashToken(req.RefreshToken)

	stored, err := s.queries.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		return nil // Silently ignore invalid tokens on logout
	}

	return s.queries.RevokeRefreshToken(ctx, stored.ID)
}

// MentorRegister creates a mentor account using an approved invite code.
func (s *Service) MentorRegister(ctx context.Context, req MentorRegisterRequest) (*AuthResponse, error) {
	// Validate invite code
	app, err := s.queries.GetMentorApplicationByInviteCode(ctx, &req.InviteCode)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired invite code")
	}

	// Check if email matches the application
	if app.Email != req.Email {
		return nil, fmt.Errorf("email does not match the application")
	}

	// Check if user already exists
	if _, err := s.queries.GetUserByEmail(ctx, req.Email); err == nil {
		return nil, fmt.Errorf("email already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user, err := s.queries.CreateUser(ctx, db.CreateUserParams{
		Email:        req.Email,
		PasswordHash: string(hash),
		Name:         req.Name,
		Role:         "mentor",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create mentor user: %w", err)
	}

	// Mark email as verified (they verified via invite)
	_ = s.queries.UpdateEmailVerified(ctx, user.ID)
	user.EmailVerified = true

	// Create empty mentor profile
	_, err = s.queries.CreateMentorProfile(ctx, db.CreateMentorProfileParams{
		UserID: user.ID,
		Phone:  &app.Phone,
	})
	if err != nil {
		s.logger.Error("failed to create mentor profile", zap.Error(err))
	}

	// Invalidate the invite code
	_ = s.queries.InvalidateInviteCode(ctx, app.ID)

	return s.generateAuthResponse(ctx, user)
}

// GetMe returns the current user's info.
func (s *Service) GetMe(ctx context.Context, userID interface{ String() string }) (*UserInfo, error) {
	id, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}

	user, err := s.queries.GetUserByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("user not found")
	}

	return &UserInfo{
		ID:            user.ID,
		Email:         user.Email,
		Name:          user.Name,
		Role:          user.Role,
		EmailVerified: user.EmailVerified,
		AvatarURL:     user.AvatarUrl,
	}, nil
}

// ───── Internal helpers ─────

func (s *Service) sendOTP(ctx context.Context, toEmail, purpose string) error {
	otp, err := GenerateOTP()
	if err != nil {
		return fmt.Errorf("failed to generate OTP: %w", err)
	}

	_, err = s.queries.CreateOTP(ctx, db.CreateOTPParams{
		Email:     toEmail,
		CodeHash:  HashToken(otp),
		Purpose:   purpose,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	})
	if err != nil {
		return fmt.Errorf("failed to save OTP: %w", err)
	}

	go func() {
		if err := s.emailClient.SendOTP(toEmail, otp, purpose); err != nil {
			s.logger.Error("failed to send OTP email", zap.String("email", toEmail), zap.Error(err))
		}
	}()

	return nil
}

func (s *Service) verifyOTP(ctx context.Context, email, otp, purpose string) error {
	stored, err := s.queries.GetLatestOTP(ctx, db.GetLatestOTPParams{
		Email:   email,
		Purpose: purpose,
	})
	if err != nil {
		return fmt.Errorf("no valid OTP found")
	}

	if stored.Attempts >= 5 {
		return fmt.Errorf("too many failed attempts, request a new OTP")
	}

	if HashToken(otp) != stored.CodeHash {
		_ = s.queries.IncrementOTPAttempts(ctx, stored.ID)
		return fmt.Errorf("invalid OTP")
	}

	_ = s.queries.MarkOTPUsed(ctx, stored.ID)
	return nil
}

func (s *Service) generateAuthResponse(ctx context.Context, user db.User) (*AuthResponse, error) {
	accessToken, err := s.jwtManager.GenerateAccessToken(user.ID, user.Role, user.Email)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := GenerateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	_, err = s.queries.CreateRefreshToken(ctx, db.CreateRefreshTokenParams{
		UserID:    user.ID,
		TokenHash: HashToken(refreshToken),
		ExpiresAt: time.Now().Add(s.jwtManager.RefreshTokenTTL()),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to store refresh token: %w", err)
	}

	return &AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: UserInfo{
			ID:            user.ID,
			Email:         user.Email,
			Name:          user.Name,
			Role:          user.Role,
			EmailVerified: user.EmailVerified,
			AvatarURL:     user.AvatarUrl,
		},
	}, nil
}

func parseUUID(v interface{ String() string }) (uuid.UUID, error) {
	return uuid.Parse(v.String())
}
