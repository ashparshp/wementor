package middleware

import (
	"net/http"

	"wementor-backend/pkg/response"
)

// RequireRole returns middleware that restricts access to users with any of the specified roles.
func RequireRole(roles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]bool, len(roles))
	for _, r := range roles {
		allowed[r] = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role := UserRoleFromContext(r.Context())
			if role == "" {
				response.Error(w, http.StatusUnauthorized, "authentication required")
				return
			}

			if !allowed[role] {
				response.Error(w, http.StatusForbidden, "insufficient permissions")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireAdmin is a convenience wrapper for RequireRole("admin").
func RequireAdmin(next http.Handler) http.Handler {
	return RequireRole("admin")(next)
}

// RequireMentor is a convenience wrapper for RequireRole("mentor", "admin").
func RequireMentor(next http.Handler) http.Handler {
	return RequireRole("mentor", "admin")(next)
}
