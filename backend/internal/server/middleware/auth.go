package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"wementor-backend/pkg/response"
)

type contextKey string

const (
	userIDKey    contextKey = "user_id"
	userRoleKey  contextKey = "user_role"
	userEmailKey contextKey = "user_email"
)

// UserIDFromContext extracts the authenticated user's ID from the request context.
func UserIDFromContext(ctx context.Context) uuid.UUID {
	id, _ := ctx.Value(userIDKey).(uuid.UUID)
	return id
}

// UserRoleFromContext extracts the authenticated user's role from the request context.
func UserRoleFromContext(ctx context.Context) string {
	role, _ := ctx.Value(userRoleKey).(string)
	return role
}

// UserEmailFromContext extracts the authenticated user's email from the request context.
func UserEmailFromContext(ctx context.Context) string {
	email, _ := ctx.Value(userEmailKey).(string)
	return email
}

// JWTClaims are the custom claims embedded in access tokens.
type JWTClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

// Auth is middleware that validates the JWT access token from the Authorization header
// and injects user claims into the request context.
func Auth(jwtSecret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Error(w, http.StatusUnauthorized, "missing authorization header")
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				response.Error(w, http.StatusUnauthorized, "invalid authorization format")
				return
			}

			tokenString := parts[1]

			token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(jwtSecret), nil
			})
			if err != nil {
				response.Error(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}

			claims, ok := token.Claims.(*JWTClaims)
			if !ok || !token.Valid {
				response.Error(w, http.StatusUnauthorized, "invalid token claims")
				return
			}

			// Inject user info into context
			ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)
			ctx = context.WithValue(ctx, userRoleKey, claims.Role)
			ctx = context.WithValue(ctx, userEmailKey, claims.Email)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
