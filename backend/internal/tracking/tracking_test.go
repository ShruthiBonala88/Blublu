package tracking

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestTrackingServiceAndHandler(t *testing.T) {
	service := NewService(nil)
	handler := NewHandler(service)

	tripID := uuid.New()
	driverID := uuid.New()

	reqPayload := UpdateLocationRequest{
		DriverID:  driverID.String(),
		Latitude:  12.971598,
		Longitude: 77.594566,
		Heading:   90.0,
		Speed:     45.5,
	}
	body, _ := json.Marshal(reqPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/tracking/trips/"+tripID.String()+"/location", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.HandleTripLocation(w, req, tripID)

	if w.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK, got %d. Body: %s", w.Code, w.Body.String())
	}

	// GET location
	reqGet := httptest.NewRequest(http.MethodGet, "/api/v1/tracking/trips/"+tripID.String()+"/location", nil)
	wGet := httptest.NewRecorder()

	handler.HandleTripLocation(wGet, reqGet, tripID)

	if wGet.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for GET location, got %d", wGet.Code)
	}

	var res LocationUpdate
	if err := json.NewDecoder(wGet.Body).Decode(&res); err != nil {
		t.Fatalf("Failed to decode response: %v", err)
	}

	if res.Latitude != reqPayload.Latitude || res.Longitude != reqPayload.Longitude {
		t.Errorf("Mismatch in coordinates: got %f, %f", res.Latitude, res.Longitude)
	}
}
