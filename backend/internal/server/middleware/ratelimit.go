package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"

	"wementor-backend/pkg/response"
)

// RateLimiter returns middleware that rate-limits requests by IP address.
// maxRequests is the maximum number of requests allowed in the given window.
func RateLimiter(redisClient *redis.Client, prefix string, maxRequests int, window time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr

			key := fmt.Sprintf("ratelimit:%s:%s", prefix, ip)
			ctx := r.Context()

			count, err := redisClient.Incr(ctx, key).Result()
			if err != nil {
				// If Redis is down, allow the request to pass through.
				next.ServeHTTP(w, r)
				return
			}

			if count == 1 {
				redisClient.Expire(ctx, key, window)
			}

			if count > int64(maxRequests) {
				response.Error(w, http.StatusTooManyRequests, "too many requests, please try again later")
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
