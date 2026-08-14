package auth

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func setupTestMiddleware(t *testing.T) (*Middleware, *JWTService, string) {
	t.Helper()
	secret := "test-secret-key-12345"
	os.Setenv("JWT_SECRET", secret)

	jwtService, err := NewJWTServiceWithSecret(secret)
	if err != nil {
		t.Fatalf("failed to create jwt service: %v", err)
	}

	middleware := NewMiddleware(jwtService)
	return middleware, jwtService, secret
}

func TestMiddlewareAuthenticate_MissingHeader(t *testing.T) {
	middleware, _, _ := setupTestMiddleware(t)

	handler := middleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected status 401, got %d", rec.Code)
	}
}

func TestMiddlewareAuthenticate_MalformedHeader(t *testing.T) {
	middleware, _, _ := setupTestMiddleware(t)

	handler := middleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	testCases := []string{
		"InvalidPrefix token123",
		"Bearer",
		"Bearer token1 token2",
		"JustATokenWithoutBearer",
	}

	for _, tc := range testCases {
		req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
		req.Header.Set("Authorization", tc)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusUnauthorized {
			t.Fatalf("for header '%s', expected 401, got %d", tc, rec.Code)
		}
	}
}

func TestMiddlewareAuthenticate_ValidToken(t *testing.T) {
	middleware, jwtService, _ := setupTestMiddleware(t)

	userID := uuid.New()
	token, err := jwtService.GenerateToken(userID, "passenger")
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	var ctxUserID uuid.UUID
	var ctxRole string
	var ctxClaims *Claims

	handler := middleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		var ok bool
		ctxUserID, ok = UserIDFromContext(r.Context())
		if !ok {
			t.Error("failed to get user_id from context via UserIDFromContext")
		}

		ctxRole, ok = RoleFromContext(r.Context())
		if !ok {
			t.Error("failed to get role from context via RoleFromContext")
		}

		ctxClaims, ok = ClaimsFromContext(r.Context())
		if !ok {
			t.Error("failed to get claims from context via ClaimsFromContext")
		}

		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	if ctxUserID != userID {
		t.Fatalf("expected context user ID %s, got %s", userID, ctxUserID)
	}

	if ctxRole != "passenger" {
		t.Fatalf("expected context role passenger, got %s", ctxRole)
	}

	if ctxClaims == nil || ctxClaims.UserID != userID.String() {
		t.Fatalf("claims not properly stored in context")
	}
}

func TestMiddlewareRequireRole(t *testing.T) {
	middleware, jwtService, _ := setupTestMiddleware(t)

	passengerID := uuid.New()
	passengerToken, _ := jwtService.GenerateToken(passengerID, "passenger")

	adminID := uuid.New()
	adminToken, _ := jwtService.GenerateToken(adminID, "admin")

	adminOnlyHandler := middleware.RequireRole("admin", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Case 1: Passenger accessing admin endpoint -> 403 Forbidden
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req1.Header.Set("Authorization", "Bearer "+passengerToken)
	rec1 := httptest.NewRecorder()

	adminOnlyHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusForbidden {
		t.Fatalf("expected 403 Forbidden for passenger, got %d", rec1.Code)
	}

	// Case 2: Admin accessing admin endpoint -> 200 OK
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req2.Header.Set("Authorization", "Bearer "+adminToken)
	rec2 := httptest.NewRecorder()

	adminOnlyHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Fatalf("expected 200 OK for admin, got %d", rec2.Code)
	}
}

func TestMiddlewareRequireAnyRole(t *testing.T) {
	middleware, jwtService, _ := setupTestMiddleware(t)

	driverToken, _ := jwtService.GenerateToken(uuid.New(), "driver")
	adminToken, _ := jwtService.GenerateToken(uuid.New(), "admin")
	passengerToken, _ := jwtService.GenerateToken(uuid.New(), "passenger")

	driverOrAdminHandler := middleware.RequireAnyRole([]string{"driver", "admin"}, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Driver -> allowed (200)
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/driver/route", nil)
	req1.Header.Set("Authorization", "Bearer "+driverToken)
	rec1 := httptest.NewRecorder()
	driverOrAdminHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 for driver, got %d", rec1.Code)
	}

	// Admin -> allowed (200)
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/driver/route", nil)
	req2.Header.Set("Authorization", "Bearer "+adminToken)
	rec2 := httptest.NewRecorder()
	driverOrAdminHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Fatalf("expected 200 for admin, got %d", rec2.Code)
	}

	// Passenger -> forbidden (403)
	req3 := httptest.NewRequest(http.MethodGet, "/api/v1/driver/route", nil)
	req3.Header.Set("Authorization", "Bearer "+passengerToken)
	rec3 := httptest.NewRecorder()
	driverOrAdminHandler.ServeHTTP(rec3, req3)
	if rec3.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for passenger, got %d", rec3.Code)
	}
}

func TestJWTValidation_ExpiredAndWrongSecretAndWrongMethod(t *testing.T) {
	secret := "correct-secret"
	jwtService, _ := NewJWTServiceWithSecret(secret)

	// Test Expired Token
	now := time.Now().Add(-2 * time.Hour)
	expiredClaims := Claims{
		UserID: uuid.New().String(),
		Role:   "passenger",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now),
		},
	}
	expiredTokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredTokenStr, _ := expiredTokenObj.SignedString([]byte(secret))

	_, err := jwtService.ValidateToken(expiredTokenStr)
	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}

	// Test Wrong Secret
	wrongSecretService, _ := NewJWTServiceWithSecret("wrong-secret")
	validToken, _ := jwtService.GenerateToken(uuid.New(), "passenger")

	_, err = wrongSecretService.ValidateToken(validToken)
	if err == nil {
		t.Fatal("expected error validating token with wrong secret, got nil")
	}

	// Test Wrong Signing Method (e.g. None or RSA)
	unsupportedTokenObj := jwt.NewWithClaims(jwt.SigningMethodNone, expiredClaims)
	unsupportedTokenStr, _ := unsupportedTokenObj.SignedString(jwt.UnsafeAllowNoneSignatureType)

	_, err = jwtService.ValidateToken(unsupportedTokenStr)
	if err == nil {
		t.Fatal("expected error for unsupported signing method, got nil")
	}
}
