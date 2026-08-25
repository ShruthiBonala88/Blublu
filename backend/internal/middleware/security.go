package middleware

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"runtime/debug"
	"strings"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/config"
)

type contextKey string

const RequestIDContextKey contextKey = "request_id"

type SecurityMiddleware struct {
	cfg config.Config
}

func NewSecurityMiddleware(cfg config.Config) *SecurityMiddleware {
	return &SecurityMiddleware{cfg: cfg}
}

// RequestID generates or validates X-Request-ID and injects it into context and response headers.
func (s *SecurityMiddleware) RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqID := strings.TrimSpace(r.Header.Get("X-Request-ID"))

		// Generate secure UUID if missing or invalid length/chars
		if reqID == "" || len(reqID) > 128 {
			reqID = uuid.New().String()
		}

		ctx := context.WithValue(r.Context(), RequestIDContextKey, reqID)
		w.Header().Set("X-Request-ID", reqID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func GetRequestIDFromContext(ctx context.Context) string {
	if val := ctx.Value(RequestIDContextKey); val != nil {
		if id, ok := val.(string); ok {
			return id
		}
	}
	return ""
}

// Recovery catches panics, logs safely, and returns HTTP 500 JSON without exposing stack traces.
func (s *SecurityMiddleware) Recovery(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				reqID := GetRequestIDFromContext(r.Context())
				// Log panic details safely on server console with Request ID
				fmt.Printf("[PANIC RECOVERY] Request ID: %s | Panic: %v\nStack: %s\n", reqID, err, debug.Stack())

				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"error": "internal server error",
				})
			}
		}()

		next.ServeHTTP(w, r)
	})
}

// SecurityHeaders applies OWASP security headers.
func (s *SecurityMiddleware) SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; sandbox")

		// Enable HSTS ONLY for HTTPS/Production
		isHTTPS := r.TLS != nil || strings.EqualFold(r.Header.Get("X-Forwarded-Proto"), "https")
		if isHTTPS || strings.EqualFold(s.cfg.AppEnv, "production") {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}

		next.ServeHTTP(w, r)
	})
}

// CORS enforces origin validation, credential safety, and preflight OPTIONS handling.
func (s *SecurityMiddleware) CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSpace(r.Header.Get("Origin"))

		if origin != "" {
			if s.isOriginAllowed(origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Vary", "Origin")
			}
		}

		// Handle OPTIONS preflight
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-ID, X-Admin-User-ID")
			w.Header().Set("Access-Control-Max-Age", "86400")
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *SecurityMiddleware) isOriginAllowed(origin string) bool {
	if strings.EqualFold(s.cfg.AppEnv, "development") || s.cfg.AppEnv == "" {
		if strings.HasPrefix(origin, "http://localhost") || strings.HasPrefix(origin, "http://127.0.0.1") || strings.HasPrefix(origin, "http://172.") || strings.HasPrefix(origin, "http://192.168.") || strings.HasPrefix(origin, "http://10.") {
			return true
		}
	}
	for _, allowed := range s.cfg.CORSAllowedOrigins {
		if allowed == "*" || strings.EqualFold(allowed, origin) {
			return true
		}
	}
	return false
}

// RequestBodyLimit enforces MAX_REQUEST_BODY_BYTES payload limits using http.MaxBytesReader.
func (s *SecurityMiddleware) RequestBodyLimit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.ContentLength > 0 && s.cfg.MaxRequestBodyBytes > 0 {
			if r.ContentLength > s.cfg.MaxRequestBodyBytes {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusRequestEntityTooLarge)
				_ = json.NewEncoder(w).Encode(map[string]string{
					"error": "request body too large",
				})
				return
			}
		}

		if r.Body != nil && s.cfg.MaxRequestBodyBytes > 0 {
			r.Body = http.MaxBytesReader(w, r.Body, s.cfg.MaxRequestBodyBytes)
		}

		next.ServeHTTP(w, r)
	})
}

// RequireMethods rejects unsupported HTTP methods for an endpoint.
func RequireMethods(allowedMethods []string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Allow", strings.Join(allowedMethods, ", "))

		matched := false
		for _, method := range allowedMethods {
			if strings.EqualFold(method, r.Method) {
				matched = true
				break
			}
		}

		if !matched {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusMethodNotAllowed)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "method not allowed",
			})
			return
		}

		next(w, r)
	}
}

// Chain builds a composite http.Handler applying middlewares in top-down order.
func Chain(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for i := len(middlewares) - 1; i >= 0; i-- {
		h = middlewares[i](h)
	}
	return h
}
