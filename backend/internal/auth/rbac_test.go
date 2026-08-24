package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestHasPermission(t *testing.T) {
	tests := []struct {
		role     string
		perm     Permission
		expected bool
	}{
		{RolePassenger, PermBookTrip, true},
		{RolePassenger, PermCreateTrip, false},
		{RolePassenger, PermManageUsers, false},
		{RoleDriver, PermCreateTrip, true},
		{RoleDriver, PermBookTrip, false},
		{RoleDriver, PermManageUsers, false},
		{RoleAdmin, PermManageUsers, true},
		{RoleAdmin, PermCreateTrip, true},
		{RoleAdmin, PermBookTrip, true},
		{"unknown", PermBookTrip, false},
	}

	for _, tt := range tests {
		result := HasPermission(tt.role, tt.perm)
		if result != tt.expected {
			t.Errorf("HasPermission(%s, %s) = %v, expected %v", tt.role, tt.perm, result, tt.expected)
		}
	}
}

func TestRequirePermissionMiddleware(t *testing.T) {
	jwtService, _ := NewJWTServiceWithSecret("test-secret-at-least-32-chars-long!")
	mw := NewMiddleware(jwtService)

	passengerID := uuid.New()
	passengerToken, _ := jwtService.GenerateToken(passengerID, RolePassenger)

	driverID := uuid.New()
	driverToken, _ := jwtService.GenerateToken(driverID, RoleDriver)

	handlerCalled := false
	dummyHandler := func(w http.ResponseWriter, r *http.Request) {
		handlerCalled = true
		w.WriteHeader(http.StatusOK)
	}

	protectedHandler := mw.RequirePermission(PermCreateTrip, dummyHandler)

	// Case 1: Passenger tries to create trip (Forbidden)
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/trips", nil)
	req1.Header.Set("Authorization", "Bearer "+passengerToken)
	rec1 := httptest.NewRecorder()
	handlerCalled = false
	protectedHandler(rec1, req1)

	if rec1.Code != http.StatusForbidden {
		t.Errorf("expected 403 Forbidden for passenger, got %d", rec1.Code)
	}
	if handlerCalled {
		t.Errorf("expected handler not to be called for unauthorized passenger")
	}

	// Case 2: Driver tries to create trip (Allowed)
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/trips", nil)
	req2.Header.Set("Authorization", "Bearer "+driverToken)
	rec2 := httptest.NewRecorder()
	handlerCalled = false
	protectedHandler(rec2, req2)

	if rec2.Code != http.StatusOK {
		t.Errorf("expected 200 OK for driver, got %d", rec2.Code)
	}
	if !handlerCalled {
		t.Errorf("expected handler to be called for driver")
	}
}
