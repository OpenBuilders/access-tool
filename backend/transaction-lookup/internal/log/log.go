package log

import (
	"fmt"
	"log/slog"
	"os"
)

func Setup(logLevelStr string) {
	// Parse the log level
	logLevel, err := parseLogLevel(logLevelStr)
	if err != nil {
		fmt.Printf("Invalid log level: %v\n", err)
		return
	}

	lvl := new(slog.LevelVar)
	lvl.Set(logLevel)

	// Create a new text handler with a log level filter for errors and above
	handler := slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: lvl,
	})

	// Create a new logger using the handler
	logger := slog.New(handler)

	// Set the global logger to the newly created logger
	slog.SetDefault(logger)
}

// parseLogLevel converts a string log level to slog.Level
func parseLogLevel(level string) (slog.Level, error) {
	switch level {
	case "DEBUG":
		return slog.LevelDebug, nil
	case "INFO":
		return slog.LevelInfo, nil
	case "WARN":
		return slog.LevelWarn, nil
	case "ERROR":
		return slog.LevelError, nil
	default:
		return slog.LevelInfo, fmt.Errorf("unknown log level: %s", level)
	}
}
