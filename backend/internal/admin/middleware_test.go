package admin

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
)

func TestAdminMiddleware_JWTValidation(t *testing.T) {
	secret := "admin-test-secret"
	os.Setenv("JWT_SECRET", secret)

	jwtService, err := auth.NewJWTServiceWithSecret(secret)
	if err != nil {
		t.Fatalf("failed to init jwt service: %v", err)
	}

	adminMw := NewMiddleware(nil, jwtService)

	adminID := uuid.New()
	adminToken, err := jwtService.GenerateToken(adminID, "admin")
	if err != nil {
		t.Fatalf("failed to generate admin token: %v", err)
	}

	passengerID := uuid.New()
	passengerToken, err := jwtService.GenerateToken(passengerID, "passenger")
	if err != nil {
		t.Fatalf("failed to generate passenger token: %v", err)
	}

	handler := adminMw.AuthenticateAdmin(func(w http.ResponseWriter, r *http.Request) {
		gotAdminID, ok := GetAdminUserIDFromContext(r.Context())
		if !ok || gotAdminID != adminID {
			t.Errorf("expected admin ID %s in context, got %s", adminID, gotAdminID)
		}
		w.WriteHeader(http.StatusOK)
	})

	// Case 1: Missing token -> 401
	req1 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	rec1 := httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1)
	if rec1.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 for missing token, got %d", rec1.Code)
	}

	// Case 2: Legacy X-Admin-User-ID header without Bearer JWT -> 401
	req2 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req2.Header.Set("X-Admin-User-ID", adminID.String())
	rec2 := httptest.NewRecorder()
	handler.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 when using legacy X-Admin-User-ID, got %d", rec2.Code)
	}

	// Case 3: Passenger token -> 403 Forbidden
	req3 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req3.Header.Set("Authorization", "Bearer "+passengerToken)
	rec3 := httptest.NewRecorder()
	handler.ServeHTTP(rec3, req3)
	if rec3.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for passenger role, got %d", rec3.Code)
	}

	// Case 4: Valid Admin Bearer JWT -> 200 OK
	req4 := httptest.NewRequest(http.MethodGet, "/api/v1/admin/dashboard", nil)
	req4.Header.Set("Authorization", "Bearer "+adminToken)
	rec4 := httptest.NewRecorder()
	handler.ServeHTTP(rec4, req4)
	if rec4.Code != http.StatusOK {
		t.Fatalf("expected 200 for valid admin JWT, got %d", rec4.Code)
	}
}
