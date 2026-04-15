package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/ashparshp/wementor/backend/internal/config"
	"github.com/ashparshp/wementor/backend/pkg/response"
	"github.com/golang-jwt/jwt/v5"
)

// UserContextKey is a custom type for context keys to avoid collisions
type UserContextKey string

const UserIDKey UserContextKey = "user_id"

// AuthGuard verifies the JWT token in the Authorization header.
func AuthGuard(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// 1. Extract Token from Header (Format: "Bearer <token>")
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Unauthorized(w, "Missing authorization header")
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.Unauthorized(w, "Invalid authorization format")
				return
			}

			tokenString := parts[1]

			// 2. Parse and Validate Token
			token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
				// Ensure the signing method is what we expect
				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				return []byte(cfg.JWTSecret), nil
			})

			if err != nil || !token.Valid {
				response.Unauthorized(w, "Invalid or expired token")
				return
			}

			// 3. Extract User ID from Claims
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				response.Unauthorized(w, "Invalid token claims")
				return
			}

			userID, ok := claims["sub"].(string)
			if !ok {
				response.Unauthorized(w, "User ID not found in token")
				return
			}

			// 4. Inject User ID into Context and proceed
			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
