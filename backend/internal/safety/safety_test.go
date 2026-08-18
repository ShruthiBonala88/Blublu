package safety

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestSafetyHandlers(t *testing.T) {
	service := NewService(nil)
	handler := NewHandler(service)

	userID := uuid.New()

	// Test SOS Trigger
	sosReq := TriggerSOSRequest{
		UserID:    userID.String(),
		Latitude:  12.9716,
		Longitude: 77.5946,
	}
	body, _ := json.Marshal(sosReq)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/safety/sos", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.TriggerSOS(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created for SOS trigger, got %d", w.Code)
	}

	// Test Incident Report
	reportReq := SubmitReportRequest{
		ReporterID:  userID.String(),
		Category:    "dangerous_driving",
		Description: "Driver was speeding excessively",
	}
	bodyRep, _ := json.Marshal(reportReq)
	reqRep := httptest.NewRequest(http.MethodPost, "/api/v1/safety/report", bytes.NewReader(bodyRep))
	wRep := httptest.NewRecorder()

	handler.SubmitReport(wRep, reqRep)
	if wRep.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created for Incident Report, got %d", wRep.Code)
	}
}
