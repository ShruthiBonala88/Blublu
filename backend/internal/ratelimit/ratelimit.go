package ratelimit

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/vikas/blublu/internal/auth"
	"github.com/vikas/blublu/internal/config"
)

type LimitResult struct {
	Allowed   bool
	Remaining int
	Limit     int
	ResetIn   time.Duration
}

type Limiter interface {
	Allow(ctx context.Context, key string, limit int, window time.Duration) (LimitResult, error)
}

type windowEntry struct {
	timestamps []time.Time
}

type MemoryLimiter struct {
	mu      sync.Mutex
	entries map[string]*windowEntry
}

func NewMemoryLimiter() *MemoryLimiter {
	limiter := &MemoryLimiter{
		entries: make(map[string]*windowEntry),
	}

	// Periodically clean up old entries
	go limiter.cleanupLoop(1 * time.Minute)

	return limiter
}

func (m *MemoryLimiter) cleanupLoop(interval time.Duration) {
	ticker := time.NewTicker(interval)
	for range ticker.C {
		m.cleanup()
	}
}

func (m *MemoryLimiter) cleanup() {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	for key, entry := range m.entries {
		var valid []time.Time
		for _, t := range entry.timestamps {
			if now.Sub(t) < 10*time.Minute {
				valid = append(valid, t)
			}
		}
		if len(valid) == 0 {
			delete(m.entries, key)
		} else {
			entry.timestamps = valid
		}
	}
}

func (m *MemoryLimiter) Allow(ctx context.Context, key string, limit int, window time.Duration) (LimitResult, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	cutoff := now.Add(-window)

	entry, exists := m.entries[key]
	if !exists {
		entry = &windowEntry{}
		m.entries[key] = entry
	}

	// Filter out timestamps outside window
	var valid []time.Time
	for _, t := range entry.timestamps {
		if t.After(cutoff) {
			valid = append(valid, t)
		}
	}

	currentCount := len(valid)
	if currentCount >= limit {
		// Calculate ResetIn based on oldest request in window
		var oldest time.Time
		if len(valid) > 0 {
			oldest = valid[0]
		} else {
			oldest = now
		}
		resetIn := window - now.Sub(oldest)
		if resetIn < 0 {
			resetIn = 0
		}

		entry.timestamps = valid
		return LimitResult{
			Allowed:   false,
			Remaining: 0,
			Limit:     limit,
			ResetIn:   resetIn,
		}, nil
	}

	// Allow request and add timestamp
	valid = append(valid, now)
	entry.timestamps = valid

	remaining := limit - len(valid)
	if remaining < 0 {
		remaining = 0
	}

	return LimitResult{
		Allowed:   true,
		Remaining: remaining,
		Limit:     limit,
		ResetIn:   window,
	}, nil
}

type Middleware struct {
	cfg     config.Config
	limiter Limiter
}

func NewMiddleware(cfg config.Config, limiter Limiter) *Middleware {
	if limiter == nil {
		limiter = NewMemoryLimiter()
	}
	return &Middleware{
		cfg:     cfg,
		limiter: limiter,
	}
}

// GeneralLimit protects normal API endpoints with configured default rate limit.
func (m *Middleware) GeneralLimit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !m.cfg.RateLimitEnabled {
			next(w, r)
			return
		}

		limit := m.cfg.RateLimitDefault
		window := time.Duration(m.cfg.RateLimitWindow) * time.Second
		if limit <= 0 {
			limit = 100
		}
		if window <= 0 {
			window = 60 * time.Second
		}

		key := m.getGeneralKey(r)
		res, err := m.limiter.Allow(r.Context(), key, limit, window)

		if err != nil {
			// Fail OPEN for general API if limiter encounters error
			next(w, r)
			return
		}

		m.setHeaders(w, res)

		if !res.Allowed {
			m.writeLimitError(w, res)
			return
		}

		next(w, r)
	}
}

// OTPLimit enforces strict OTP request/verification rate limits.
func (m *Middleware) OTPLimit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit := m.cfg.OTPRateLimit
		window := time.Duration(m.cfg.OTPRateLimitWindow) * time.Second
		if limit <= 0 {
			limit = 5
		}
		if window <= 0 {
			window = 300 * time.Second
		}

		clientIP := ExtractClientIP(r)
		key := fmt.Sprintf("otp:%s:%s", clientIP, r.URL.Path)

		res, err := m.limiter.Allow(r.Context(), key, limit, window)

		if err != nil {
			// Fail CLOSED for security-sensitive OTP endpoints if limiter encounters error
			m.writeLimitError(w, LimitResult{Allowed: false, Remaining: 0, Limit: limit, ResetIn: window})
			return
		}

		m.setHeaders(w, res)

		if !res.Allowed {
			m.writeLimitError(w, res)
			return
		}

		next(w, r)
	}
}

// LoginLimit enforces login & authentication attempt rate limits.
func (m *Middleware) LoginLimit(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		limit := m.cfg.LoginRateLimit
		window := time.Duration(m.cfg.LoginRateLimitWindow) * time.Second
		if limit <= 0 {
			limit = 10
		}
		if window <= 0 {
			window = 300 * time.Second
		}

		clientIP := ExtractClientIP(r)
		key := fmt.Sprintf("login:%s", clientIP)

		res, err := m.limiter.Allow(r.Context(), key, limit, window)

		if err != nil {
			// Fail CLOSED for login/auth endpoints
			m.writeLimitError(w, LimitResult{Allowed: false, Remaining: 0, Limit: limit, ResetIn: window})
			return
		}

		m.setHeaders(w, res)

		if !res.Allowed {
			m.writeLimitError(w, res)
			return
		}

		next(w, r)
	}
}

func (m *Middleware) getGeneralKey(r *http.Request) string {
	userID, ok := auth.GetUserIDFromContext(r.Context())
	if ok {
		return fmt.Sprintf("gen:user:%s:%s", userID.String(), getRouteCategory(r.URL.Path))
	}
	clientIP := ExtractClientIP(r)
	return fmt.Sprintf("gen:ip:%s:%s", clientIP, getRouteCategory(r.URL.Path))
}

func getRouteCategory(path string) string {
	parts := strings.Split(strings.Trim(path, "/"), "/")
	if len(parts) >= 3 {
		return parts[2]
	}
	return "common"
}

func ExtractClientIP(r *http.Request) string {
	// Inspect RemoteAddr first
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		ip = r.RemoteAddr
	}

	// Check X-Real-IP if provided
	if realIP := strings.TrimSpace(r.Header.Get("X-Real-IP")); realIP != "" {
		if parsed := net.ParseIP(realIP); parsed != nil {
			return realIP
		}
	}

	// Check X-Forwarded-For if provided (take first IP if multi-hop)
	if xff := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); xff != "" {
		parts := strings.Split(xff, ",")
		if len(parts) > 0 {
			firstIP := strings.TrimSpace(parts[0])
			if parsed := net.ParseIP(firstIP); parsed != nil {
				return firstIP
			}
		}
	}

	if ip == "" {
		return "127.0.0.1"
	}
	return ip
}

func (m *Middleware) setHeaders(w http.ResponseWriter, res LimitResult) {
	w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", res.Limit))
	w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", res.Remaining))

	if !res.Allowed && res.ResetIn > 0 {
		seconds := int(math.Ceil(res.ResetIn.Seconds()))
		if seconds < 1 {
			seconds = 1
		}
		w.Header().Set("Retry-After", fmt.Sprintf("%d", seconds))
	}
}

func (m *Middleware) writeLimitError(w http.ResponseWriter, res LimitResult) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusTooManyRequests)

	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": "too many requests",
	})
}
