package logger

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// New creates a configured Zap logger.
// In development, it uses a colorized console encoder.
// In production, it uses structured JSON output.
func New(env string) *zap.Logger {
	var cfg zap.Config

	if env == "production" {
		cfg = zap.NewProductionConfig()
	} else {
		cfg = zap.NewDevelopmentConfig()
		cfg.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	logger, err := cfg.Build()
	if err != nil {
		// Fallback to a no-op logger if build fails (should never happen).
		return zap.NewNop()
	}

	return logger
}
