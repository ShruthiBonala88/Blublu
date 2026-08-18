package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port                 string
	JWTSecret            string
	AppEnv               string
	PaymentEnv           string
	DatabaseURL          string
	RedisURL             string
	CORSAllowedOrigins   []string
	RateLimitEnabled     bool
	RateLimitDefault     int
	RateLimitWindow      int
	OTPRateLimit         int
	OTPRateLimitWindow   int
	LoginRateLimit       int
	LoginRateLimitWindow int
	MaxRequestBodyBytes  int64
}

func Load() Config {
	return Config{
		Port:       getEnv("PORT", "8080"),
		JWTSecret:  getEnv("JWT_SECRET", "blublu-super-secret-jwt-key-2026"),
		AppEnv:     getEnv("APP_ENV", "development"),
		PaymentEnv: getEnv("PAYMENT_ENV", "test"),
		DatabaseURL: getEnv(
			"DATABASE_URL",
			"postgres://blublu:blublu_dev_password@localhost:5433/blublu?sslmode=disable",
		),
		RedisURL: getEnv("REDIS_URL", "redis://127.0.0.1:6379"),

		CORSAllowedOrigins: splitCSV(
			getEnv(
				"CORS_ALLOWED_ORIGINS",
				"http://localhost:3000,http://localhost:5173,http://localhost:8081,http://127.0.0.1:8081",
			),
		),

		RateLimitEnabled: getBoolEnv("RATE_LIMIT_ENABLED", true),
		RateLimitDefault: getIntEnv("RATE_LIMIT_DEFAULT", 100),
		RateLimitWindow:  getIntEnv("RATE_LIMIT_WINDOW_SECONDS", 60),

		OTPRateLimit:       getIntEnv("OTP_RATE_LIMIT", 5),
		OTPRateLimitWindow: getIntEnv("OTP_RATE_LIMIT_WINDOW_SECONDS", 300),

		LoginRateLimit:       getIntEnv("LOGIN_RATE_LIMIT", 10),
		LoginRateLimitWindow: getIntEnv("LOGIN_RATE_LIMIT_WINDOW_SECONDS", 300),

		MaxRequestBodyBytes: getInt64Env("MAX_REQUEST_BODY_BYTES", 1048576),
	}
}

func getEnv(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func getBoolEnv(key string, fallback bool) bool {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}

	return parsed
}

func getIntEnv(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseInt(value, 10, 32)
	if err != nil || parsed <= 0 {
		return fallback
	}

	return int(parsed)
}

func getInt64Env(key string, fallback int64) int64 {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}

	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil || parsed <= 0 {
		return fallback
	}

	return parsed
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			result = append(result, part)
		}
	}

	return result
}
