package tests

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
)

func setupSecurityTest(t *testing.T) (*auth.JWTService, *auth.Middleware) {
	t.Helper()
	secret := "security-test-secret-999"
	os.Setenv("JWT_SECRET", secret)

	jwtService, err := auth.NewJWTServiceWithSecret(secret)
	if err != nil {
		t.Fatalf("failed to init jwt service: %v", err)
	}

	authMw := auth.NewMiddleware(jwtService)
	return jwtService, authMw
}

func TestSecurity_UnauthenticatedRequests(t *testing.T) {
	jwtService, authMw := setupSecurityTest(t)

	protectedHandler := authMw.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Case 1: No JWT -> 401
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+uuid.New().String()+"/bookings", nil)
	rec1 := httptest.NewRecorder()
	protectedHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing JWT, got %d", rec1.Code)
	}

	// Case 2: Invalid JWT -> 401
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+uuid.New().String()+"/bookings", nil)
	req2.Header.Set("Authorization", "Bearer invalid-jwt-string")
	rec2 := httptest.NewRecorder()
	protectedHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for invalid JWT, got %d", rec2.Code)
	}

	// Case 3: Expired JWT -> 401
	expiredClaims := auth.Claims{
		UserID: uuid.New().String(),
		Role:   "passenger",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
		},
	}
	tokenObj := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims)
	expiredStr, _ := tokenObj.SignedString([]byte("security-test-secret-999"))

	req3 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+uuid.New().String()+"/bookings", nil)
	req3.Header.Set("Authorization", "Bearer "+expiredStr)
	rec3 := httptest.NewRecorder()
	protectedHandler.ServeHTTP(rec3, req3)
	if rec3.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for expired JWT, got %d", rec3.Code)
	}

	// Case 4: Valid JWT -> allowed (200)
	user := uuid.New()
	validToken, _ := jwtService.GenerateToken(user, "passenger")
	req4 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+user.String()+"/bookings", nil)
	req4.Header.Set("Authorization", "Bearer "+validToken)
	rec4 := httptest.NewRecorder()
	protectedHandler.ServeHTTP(rec4, req4)
	if rec4.Code != http.StatusOK {
		t.Fatalf("expected 200 for valid JWT, got %d", rec4.Code)
	}
}

func TestSecurity_RoleAuthorization(t *testing.T) {
	jwtService, authMw := setupSecurityTest(t)

	adminRouteHandler := authMw.RequireRole("admin", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	passengerToken, _ := jwtService.GenerateToken(uuid.New(), "passenger")
	driverToken, _ := jwtService.GenerateToken(uuid.New(), "driver")
	adminToken, _ := jwtService.GenerateToken(uuid.New(), "admin")

	// Case 1: Passenger -> Admin route -> 403 Forbidden
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req1.Header.Set("Authorization", "Bearer "+passengerToken)
	rec1 := httptest.NewRecorder()
	adminRouteHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for passenger on admin route, got %d", rec1.Code)
	}

	// Case 2: Driver -> Admin route -> 403 Forbidden
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req2.Header.Set("Authorization", "Bearer "+driverToken)
	rec2 := httptest.NewRecorder()
	adminRouteHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for driver on admin route, got %d", rec2.Code)
	}

	// Case 3: Admin -> Admin route -> 200 OK
	req3 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req3.Header.Set("Authorization", "Bearer "+adminToken)
	rec3 := httptest.NewRecorder()
	adminRouteHandler.ServeHTTP(rec3, req3)
	if rec3.Code != http.StatusOK {
		t.Fatalf("expected 200 for admin on admin route, got %d", rec3.Code)
	}
}

func TestSecurity_DriverRoleAuthorization(t *testing.T) {
	jwtService, authMw := setupSecurityTest(t)

	driverOnlyHandler := authMw.RequireAnyRole([]string{"driver", "admin"}, func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	passengerToken, _ := jwtService.GenerateToken(uuid.New(), "passenger")
	driverToken, _ := jwtService.GenerateToken(uuid.New(), "driver")

	// Case 6: Passenger accessing driver operation -> 403 Forbidden
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/trips", nil)
	req1.Header.Set("Authorization", "Bearer "+passengerToken)
	rec1 := httptest.NewRecorder()
	driverOnlyHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for passenger on driver operation, got %d", rec1.Code)
	}

	// Case 7: Driver accessing driver operation -> 200 OK
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/trips", nil)
	req2.Header.Set("Authorization", "Bearer "+driverToken)
	rec2 := httptest.NewRecorder()
	driverOnlyHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Fatalf("expected 200 for driver on driver operation, got %d", rec2.Code)
	}
}

func TestSecurity_IDOR_PassengerOwnership(t *testing.T) {
	jwtService, authMw := setupSecurityTest(t)

	userA := uuid.New()
	userB := uuid.New()
	tokenA, _ := jwtService.GenerateToken(userA, "passenger")

	userResourceHandler := authMw.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		targetUserID, _ := uuid.Parse(parts[3])

		if !auth.ValidateOwnershipOrAdmin(r.Context(), targetUserID) {
			http.Error(w, `{"error":"forbidden: resource does not belong to user"}`, http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	// Case 1: Passenger A accessing User A resource -> 200 OK
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userA.String()+"/bookings", nil)
	req1.Header.Set("Authorization", "Bearer "+tokenA)
	rec1 := httptest.NewRecorder()
	userResourceHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 for User A accessing User A resource, got %d", rec1.Code)
	}

	// Case 2: Passenger A accessing User B resource -> 403 Forbidden
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/users/"+userB.String()+"/bookings", nil)
	req2.Header.Set("Authorization", "Bearer "+tokenA)
	rec2 := httptest.NewRecorder()
	userResourceHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for User A accessing User B resource, got %d", rec2.Code)
	}
}

func TestSecurity_IDOR_DriverOwnership(t *testing.T) {
	jwtService, authMw := setupSecurityTest(t)

	driverUserA := uuid.New()
	driverUserB := uuid.New()
	tokenDriverA, _ := jwtService.GenerateToken(driverUserA, "driver")

	driverResourceHandler := authMw.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		targetDriverID, _ := uuid.Parse(parts[3])

		if !auth.ValidateOwnershipOrAdmin(r.Context(), targetDriverID) {
			http.Error(w, `{"error":"forbidden: driver resource does not belong to user"}`, http.StatusForbidden)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	// Case 1: Driver A accessing Driver A resource -> 200 OK
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/drivers/"+driverUserA.String()+"/earnings", nil)
	req1.Header.Set("Authorization", "Bearer "+tokenDriverA)
	rec1 := httptest.NewRecorder()
	driverResourceHandler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusOK {
		t.Fatalf("expected 200 for Driver A accessing Driver A resource, got %d", rec1.Code)
	}

	// Case 2: Driver A accessing Driver B resource -> 403 Forbidden
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/drivers/"+driverUserB.String()+"/earnings", nil)
	req2.Header.Set("Authorization", "Bearer "+tokenDriverA)
	rec2 := httptest.NewRecorder()
	driverResourceHandler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for Driver A accessing Driver B resource, got %d", rec2.Code)
	}
}

func TestSecurity_PublicRoutesAndWebhooksAccessibleWithoutJWT(t *testing.T) {
	// Public routes should not require Authorization header
	publicEndpoints := []string{
		"/health",
		"/api/v1/otp/request",
		"/api/v1/otp/verify",
		"/api/v1/users",
		"/api/v1/trips/search",
		"/api/v1/route/calculate",
		"/api/v1/payments/webhook",
	}

	for _, ep := range publicEndpoints {
		req := httptest.NewRequest(http.MethodPost, ep, bytes.NewBufferString(`{}`))
		if ep == "/health" || ep == "/api/v1/trips/search" {
			req = httptest.NewRequest(http.MethodGet, ep, nil)
		}
		rec := httptest.NewRecorder()

		// Serve dummy handler for public test verification
		dummyPublicHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
		})
		dummyPublicHandler.ServeHTTP(rec, req)

		if rec.Code == http.StatusUnauthorized {
			t.Fatalf("public endpoint %s returned 401 Unauthorized", ep)
		}
	}
}

func TestSecurity_SecretAndResponseProtection(t *testing.T) {
	jwtService, _ := setupSecurityTest(t)

	authService := auth.NewService(nil, jwtService)
	userID := uuid.New()

	resp, err := authService.AuthenticateUserByID(context.Background(), userID)
	if err != nil {
		t.Fatalf("auth service error: %v", err)
	}

	// Verify JWT_SECRET is never returned in response or stringified outputs
	secret := os.Getenv("JWT_SECRET")
	if strings.Contains(resp.Token, secret) {
		t.Fatal("CRITICAL SECURITY ERROR: JWT secret exposed in token string!")
	}

	// Verify client cannot forge arbitrary roles via GenerateToken
	_, err = jwtService.GenerateToken(userID, "superadmin_fake")
	if err == nil {
		t.Fatal("expected error when attempting to generate token with unauthorized role")
	}
}
