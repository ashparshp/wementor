package middleware

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"go.uber.org/zap"
)

// Logger returns middleware that logs each HTTP request with method, path, status, and duration.
func Logger(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// Wrap ResponseWriter to capture status code
			ww := &statusWriter{ResponseWriter: w, status: http.StatusOK}

			next.ServeHTTP(ww, r)

			duration := time.Since(start)

			env := os.Getenv("ENV")
			if env != "production" {
				// Colored development log
				statusColor := "\033[32m" // Green
				if ww.status >= 500 {
					statusColor = "\033[31m" // Red
				} else if ww.status >= 400 {
					statusColor = "\033[33m" // Yellow
				} else if ww.status >= 300 {
					statusColor = "\033[36m" // Cyan
				}

				methodColor := "\033[34m" // Blue
				resetColor := "\033[0m"
				pathColor := "\033[37m"   // White

				msg := fmt.Sprintf("%s%-7s%s %s%3d%s %s%s%s %v",
					methodColor, r.Method, resetColor,
					statusColor, ww.status, resetColor,
					pathColor, r.URL.Path, resetColor,
					duration,
				)

				log.Info(msg)
			} else {
				// Structured production log
				log.Info("request",
					zap.String("method", r.Method),
					zap.String("path", r.URL.Path),
					zap.Int("status", ww.status),
					zap.Duration("duration", duration),
					zap.String("remote", r.RemoteAddr),
				)
			}
		})
	}
}

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (w *statusWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}
