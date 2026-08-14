package middleware

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/vikas/blublu/internal/config"
)

func setupTestConfig() config.Config {
	return config.Config{
		AppEnv:              "development",
		CORSAllowedOrigins:  []string{"http://localhost:3000", "http://localhost:5173"},
		MaxRequestBodyBytes: 1024, // 1 KB for testing
		RateLimitEnabled:    false,
	}
}

func TestCORS_AllowedOrigin(t *testing.T) {
	secMw := NewSecurityMiddleware(setupTestConfig())
	handler := secMw.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Fatalf("expected allowed origin header http://localhost:3000, got %s", rec.Header().Get("Access-Control-Allow-Origin"))
	}
	if rec.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Fatalf("expected credentials header true, got %s", rec.Header().Get("Access-Control-Allow-Credentials"))
	}
}

func TestCORS_UnknownOrigin(t *testing.T) {
	secMw := NewSecurityMiddleware(setupTestConfig())
	handler := secMw.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req.Header.Set("Origin", "http://malicious-site.com")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("expected no CORS header for unknown origin, got %s", rec.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORS_PreflightOptions(t *testing.T) {
	secMw := NewSecurityMiddleware(setupTestConfig())
	handler := secMw.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/test", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 No Content for OPTIONS preflight, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Methods") == "" {
		t.Fatal("expected Access-Control-Allow-Methods header in preflight")
	}
}

func TestSecurityHeaders_DevVsProd(t *testing.T) {
	// Dev test
	secMwDev := NewSecurityMiddleware(setupTestConfig())
	handlerDev := secMwDev.SecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	reqDev := httptest.NewRequest(http.MethodGet, "/test", nil)
	recDev := httptest.NewRecorder()
	handlerDev.ServeHTTP(recDev, reqDev)

	if recDev.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatal("missing X-Content-Type-Options header")
	}
	if recDev.Header().Get("X-Frame-Options") != "DENY" {
		t.Fatal("missing X-Frame-Options header")
	}
	if recDev.Header().Get("Referrer-Policy") == "" {
		t.Fatal("missing Referrer-Policy header")
	}
	if recDev.Header().Get("Strict-Transport-Security") != "" {
		t.Fatal("HSTS should NOT be present on dev HTTP")
	}

	// Prod test
	prodCfg := setupTestConfig()
	prodCfg.AppEnv = "production"
	secMwProd := NewSecurityMiddleware(prodCfg)
	handlerProd := secMwProd.SecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	reqProd := httptest.NewRequest(http.MethodGet, "/test", nil)
	recProd := httptest.NewRecorder()
	handlerProd.ServeHTTP(recProd, reqProd)

	if recProd.Header().Get("Strict-Transport-Security") == "" {
		t.Fatal("HSTS should be present in production mode")
	}
}

func TestRequestBodyLimit(t *testing.T) {
	secMw := NewSecurityMiddleware(setupTestConfig()) // limit 1024 bytes
	handler := secMw.RequestBodyLimit(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Under limit -> 200
	smallBody := bytes.Repeat([]byte("a"), 500)
	req1 := httptest.NewRequest(http.MethodPost, "/test", bytes.NewReader(smallBody))
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 for small body, got %d", rec1.Code)
	}

	// Over limit -> 413 Payload Too Large
	largeBody := bytes.Repeat([]byte("a"), 2000)
	req2 := httptest.NewRequest(http.MethodPost, "/test", bytes.NewReader(largeBody))
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413 for large body, got %d", rec2.Code)
	}
}

func TestRequireMethods(t *testing.T) {
	handler := RequireMethods([]string{http.MethodPost}, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Supported method -> 200
	req1 := httptest.NewRequest(http.MethodPost, "/test", nil)
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 for POST, got %d", rec1.Code)
	}

	// Unsupported method -> 405 Method Not Allowed
	req2 := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405 for GET, got %d", rec2.Code)
	}
	if rec2.Header().Get("Allow") != "POST" {
		t.Fatalf("expected Allow header POST, got %s", rec2.Header().Get("Allow"))
	}
}

func TestRequestID(t *testing.T) {
	secMw := NewSecurityMiddleware(setupTestConfig())

	var capturedReqID string
	handler := secMw.RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedReqID = GetRequestIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}

	headerReqID := rec.Header().Get("X-Request-ID")
	if headerReqID == "" {
		t.Fatal("missing X-Request-ID response header")
	}

	if capturedReqID != headerReqID {
		t.Fatalf("context Request ID (%s) mismatch with header (%s)", capturedReqID, headerReqID)
	}
}

func TestRecovery_CatchesPanic(t *testing.T) {
	secMw := NewSecurityMiddleware(setupTestConfig())
	handler := secMw.Recovery(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("simulated database failure panic")
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500 Internal Server Error, got %d", rec.Code)
	}

	body := rec.Body.String()
	if strings.Contains(body, "simulated database failure") || strings.Contains(body, "stack") {
		t.Fatalf("CRITICAL ERROR: internal panic/stack trace leaked in response body: %s", body)
	}

	if !strings.Contains(body, "internal server error") {
		t.Fatalf("expected safe error JSON message, got %s", body)
	}
}
