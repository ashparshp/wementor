package auth

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"wementor-backend/internal/server/middleware"
)

// JWTManager handles JWT token generation and validation.
type JWTManager struct {
	secret          []byte
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
}

// NewJWTManager creates a JWTManager with the given secret and TTLs.
func NewJWTManager(secret string, accessTTLMinutes, refreshTTLDays int) *JWTManager {
	return &JWTManager{
		secret:          []byte(secret),
		accessTokenTTL:  time.Duration(accessTTLMinutes) * time.Minute,
		refreshTokenTTL: time.Duration(refreshTTLDays) * 24 * time.Hour,
	}
}

// GenerateAccessToken creates a signed JWT access token.
func (m *JWTManager) GenerateAccessToken(userID uuid.UUID, role, email string) (string, error) {
	claims := middleware.JWTClaims{
		UserID: userID,
		Role:   role,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.accessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wementor",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(m.secret)
}

// RefreshTokenTTL returns the configured refresh token time-to-live.
func (m *JWTManager) RefreshTokenTTL() time.Duration {
	return m.refreshTokenTTL
}

// GenerateRefreshToken creates a cryptographically random 32-byte hex string.
func GenerateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("failed to generate refresh token: %w", err)
	}
	return hex.EncodeToString(b), nil
}

// HashToken returns the SHA-256 hex digest of a token string.
func HashToken(token string) string {
	h := sha256.Sum256([]byte(token))
	return hex.EncodeToString(h[:])
}

// GenerateOTP creates a cryptographically random 6-digit string.
func GenerateOTP() (string, error) {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", fmt.Errorf("failed to generate OTP: %w", err)
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// GenerateInviteCode creates a cryptographically random 6-digit invite code.
func GenerateInviteCode() (string, error) {
	return GenerateOTP()
}

// GenerateRandomPassword creates a cryptographically secure random 10-character password.
func GenerateRandomPassword() (string, error) {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
	b := make([]byte, 10)
	for i := range b {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			return "", err
		}
		b[i] = chars[num.Int64()]
	}
	return string(b), nil
}
