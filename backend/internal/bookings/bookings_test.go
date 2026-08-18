package bookings

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestBookingHandlerValidation(t *testing.T) {
	handler := NewHandler(nil, nil)

	// Invalid JSON payload test
	req := httptest.NewRequest(http.MethodPost, "/api/v1/bookings", bytes.NewReader([]byte("{invalid-json")))
	w := httptest.NewRecorder()

	handler.Create(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected 400 Bad Request for malformed JSON, got %d", w.Code)
	}
}
