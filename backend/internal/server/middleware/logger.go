package middleware

import (
	"net/http"
	"time"

	"github.com/ashparshp/wementor/backend/pkg/logger"
	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

// StructuredLogger is a custom middleware that uses our pkg/logger (Zap)
// to log every incoming HTTP request.
func StructuredLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap the response writer to capture the status code
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

		// Process the request
		next.ServeHTTP(ww, r)

		// Log structured data after the request completes
		logger.Log.Info("HTTP Request",
			zap.String("method", r.Method),
			zap.String("path", r.URL.Path),
			zap.Int("status", ww.Status()),
			zap.Duration("duration", time.Since(start)),
			zap.String("ip", r.RemoteAddr),
			zap.String("request_id", middleware.GetReqID(r.Context())),
		)
	})
}
