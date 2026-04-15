package logger

import (
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Log is the global structured logger instance used throughout the app.
var Log *zap.Logger

// InitLogger initializes the Zap logger based on the environment.
func InitLogger(env string) {
	var config zap.Config

	if env == "production" {
		// Production: Optimized for performance, outputs JSON
		config = zap.NewProductionConfig()
		config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	} else {
		// Development: Optimized for humans, outputs colored text
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	config.OutputPaths = []string{"stdout"}

	var err error
	Log, err = config.Build()
	if err != nil {
		// If the logger cannot start, we crash the app immediately
		os.Exit(1)
	}

	// Replaces global zap logger so other packages can use zap.L()
	zap.ReplaceGlobals(Log)
}

// Sync flushes any buffered log entries.
// Should be called via 'defer logger.Sync()' in main.go to ensure all logs are written before exit.
func Sync() {
	if Log != nil {
		_ = Log.Sync()
	}
}
