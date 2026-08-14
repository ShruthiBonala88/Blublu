package ratelimit

import (
	"context"
	"net/http"
	"net/http/httptest"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
	"github.com/vikas/blublu/internal/config"
)

func TestMemoryLimiter_Basic(t *testing.T) {
	limiter := NewMemoryLimiter()
	ctx := context.Background()
	key := "test-key-1"
	limit := 3
	window := 1 * time.Second

	// Request 1: allowed
	r1, err := limiter.Allow(ctx, key, limit, window)
	if err != nil || !r1.Allowed || r1.Remaining != 2 {
		t.Fatalf("request 1 failed: allowed=%v, remaining=%d, err=%v", r1.Allowed, r1.Remaining, err)
	}

	// Request 2: allowed
	r2, err := limiter.Allow(ctx, key, limit, window)
	if err != nil || !r2.Allowed || r2.Remaining != 1 {
		t.Fatalf("request 2 failed: allowed=%v, remaining=%d, err=%v", r2.Allowed, r2.Remaining, err)
	}

	// Request 3: allowed
	r3, err := limiter.Allow(ctx, key, limit, window)
	if err != nil || !r3.Allowed || r3.Remaining != 0 {
		t.Fatalf("request 3 failed: allowed=%v, remaining=%d, err=%v", r3.Allowed, r3.Remaining, err)
	}

	// Request 4: rejected (above limit)
	r4, err := limiter.Allow(ctx, key, limit, window)
	if err != nil || r4.Allowed || r4.Remaining != 0 {
		t.Fatalf("request 4 should be rejected: allowed=%v, remaining=%d", r4.Allowed, r4.Remaining)
	}

	// Wait for window to reset
	time.Sleep(1100 * time.Millisecond)

	// Request 5: allowed after reset
	r5, err := limiter.Allow(ctx, key, limit, window)
	if err != nil || !r5.Allowed || r5.Remaining != 2 {
		t.Fatalf("request 5 should be allowed after reset: allowed=%v, remaining=%d", r5.Allowed, r5.Remaining)
	}
}

func TestMemoryLimiter_IndependentKeys(t *testing.T) {
	limiter := NewMemoryLimiter()
	ctx := context.Background()
	limit := 2
	window := 1 * time.Second

	// User A hits limit
	_, _ = limiter.Allow(ctx, "user-A", limit, window)
	_, _ = limiter.Allow(ctx, "user-A", limit, window)
	rA, _ := limiter.Allow(ctx, "user-A", limit, window)
	if rA.Allowed {
		t.Fatal("user A should be rate-limited")
	}

	// User B is unaffected
	rB, _ := limiter.Allow(ctx, "user-B", limit, window)
	if !rB.Allowed {
		t.Fatal("user B should be allowed independently")
	}
}

func TestMiddleware_GeneralLimit(t *testing.T) {
	cfg := config.Config{
		RateLimitEnabled: true,
		RateLimitDefault: 2,
		RateLimitWindow:  1,
	}

	limiter := NewMemoryLimiter()
	mw := NewMiddleware(cfg, limiter)

	handler := mw.GeneralLimit(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Request 1 & 2 -> 200 OK
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
		req.RemoteAddr = "192.168.1.1:1234"
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("req %d failed with status %d", i+1, rec.Code)
		}
	}

	// Request 3 -> 429 Too Many Requests
	req := httptest.NewRequest(http.MethodGet, "/api/v1/users", nil)
	req.RemoteAddr = "192.168.1.1:1234"
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 Too Many Requests, got %d", rec.Code)
	}

	if rec.Header().Get("Retry-After") == "" {
		t.Fatal("expected Retry-After header on 429 response")
	}

	if rec.Header().Get("X-RateLimit-Limit") != "2" {
		t.Fatalf("expected X-RateLimit-Limit header 2, got %s", rec.Header().Get("X-RateLimit-Limit"))
	}
}

func TestMiddleware_AuthenticatedUserLimit(t *testing.T) {
	cfg := config.Config{
		RateLimitEnabled: true,
		RateLimitDefault: 1,
		RateLimitWindow:  1,
	}

	limiter := NewMemoryLimiter()
	mw := NewMiddleware(cfg, limiter)

	handler := mw.GeneralLimit(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	userID := uuid.New()

	// Req 1: Allowed for user
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userID.String()+"/bookings", nil)
	ctx1 := context.WithValue(req1.Context(), auth.UserIDContextKey, userID)
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1.WithContext(ctx1))

	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 for initial user request, got %d", rec1.Code)
	}

	// Req 2: Rate limited (429) for user
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userID.String()+"/bookings", nil)
	ctx2 := context.WithValue(req2.Context(), auth.UserIDContextKey, userID)
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, req2.WithContext(ctx2))

	if rec2.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 for excess authenticated user request, got %d", rec2.Code)
	}
}

func TestMiddleware_OTPLimit(t *testing.T) {
	cfg := config.Config{
		OTPRateLimit:       2,
		OTPRateLimitWindow: 1,
	}

	limiter := NewMemoryLimiter()
	mw := NewMiddleware(cfg, limiter)

	handler := mw.OTPLimit(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// First 2 OTP requests -> 200 OK
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/otp/request", nil)
		req.RemoteAddr = "10.0.0.1:5555"
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("OTP req %d failed with status %d", i+1, rec.Code)
		}
	}

	// 3rd OTP request -> 429 Too Many Requests
	req := httptest.NewRequest(http.MethodPost, "/api/v1/otp/request", nil)
	req.RemoteAddr = "10.0.0.1:5555"
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 for excess OTP requests, got %d", rec.Code)
	}
}

func TestMiddleware_LoginLimit(t *testing.T) {
	cfg := config.Config{
		LoginRateLimit:       2,
		LoginRateLimitWindow: 1,
	}

	limiter := NewMemoryLimiter()
	mw := NewMiddleware(cfg, limiter)

	handler := mw.LoginLimit(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// First 2 Login requests -> 200 OK
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
		req.RemoteAddr = "172.16.0.1:8888"
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("login req %d failed with status %d", i+1, rec.Code)
		}
	}

	// 3rd Login request -> 429 Too Many Requests
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
	req.RemoteAddr = "172.16.0.1:8888"
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 for excess login attempts, got %d", rec.Code)
	}
}

func TestExtractClientIP_HeaderSafety(t *testing.T) {
	req1 := httptest.NewRequest(http.MethodGet, "/test", nil)
	req1.RemoteAddr = "203.0.113.195:8080"
	if ip := ExtractClientIP(req1); ip != "203.0.113.195" {
		t.Fatalf("expected RemoteAddr IP 203.0.113.195, got %s", ip)
	}

	req2 := httptest.NewRequest(http.MethodGet, "/test", nil)
	req2.RemoteAddr = "127.0.0.1:8080"
	req2.Header.Set("X-Forwarded-For", "198.51.100.1, 10.0.0.1")
	if ip := ExtractClientIP(req2); ip != "198.51.100.1" {
		t.Fatalf("expected X-Forwarded-For IP 198.51.100.1, got %s", ip)
	}
}

func TestConcurrency_MemoryLimiterRace(t *testing.T) {
	limiter := NewMemoryLimiter()
	ctx := context.Background()
	key := "concurrent-key"
	limit := 50
	window := 5 * time.Second

	var wg sync.WaitGroup
	workers := 100

	allowedCount := 0
	rejectedCount := 0
	var mu sync.Mutex

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			res, err := limiter.Allow(ctx, key, limit, window)
			if err != nil {
				t.Errorf("unexpected error in concurrent test: %v", err)
				return
			}
			mu.Lock()
			if res.Allowed {
				allowedCount++
			} else {
				rejectedCount++
			}
			mu.Unlock()
		}()
	}

	wg.Wait()

	if allowedCount != limit {
		t.Fatalf("expected exactly %d allowed requests under concurrency, got %d", limit, allowedCount)
	}
	if rejectedCount != (workers - limit) {
		t.Fatalf("expected exactly %d rejected requests under concurrency, got %d", workers-limit, rejectedCount)
	}
}
