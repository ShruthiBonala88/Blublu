package trips

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestTripHandlerValidation(t *testing.T) {
	handler := NewHandler(nil, nil, nil, nil)

	// Test Invalid Driver UUID
	reqBody := map[string]any{
		"driver_id":             "invalid-uuid",
		"vehicle_id":            uuid.New().String(),
		"origin_name":           "Bangalore",
		"destination_name":      "Mysore",
		"origin_latitude":       12.9716,
		"origin_longitude":      77.5946,
		"destination_latitude":  12.2958,
		"destination_longitude": 76.6394,
		"departure_time":        time.Now().Add(2 * time.Hour),
		"price_per_seat":        250.0,
	}

	bodyBytes, _ := json.Marshal(reqBody)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/trips", bytes.NewReader(bodyBytes))
	w := httptest.NewRecorder()

	handler.Create(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for invalid driver_id, got %d", w.Code)
	}
}

func TestTripSearchValidation(t *testing.T) {
	handler := NewHandler(nil, nil, nil, nil)

	// Test Search without origin/destination coordinates
	req := httptest.NewRequest(http.MethodGet, "/api/v1/trips/search", nil)
	w := httptest.NewRecorder()

	handler.Search(w, req)

	// Search handler defaults or returns 400 when missing required coordinates
	if w.Code != http.StatusOK && w.Code != http.StatusBadRequest {
		t.Errorf("Unexpected status for empty search: %d", w.Code)
	}
}
