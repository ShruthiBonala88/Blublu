package kyc

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestKYCHandlers(t *testing.T) {
	service := NewService(nil)
	handler := NewHandler(service)

	driverID := uuid.New()

	// Submit KYC
	reqBody := SubmitKYCRequest{
		DriverID:       driverID.String(),
		DocumentType:   "driving_license",
		DocumentNumber: "DL-12345678",
	}
	body, _ := json.Marshal(reqBody)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/kyc/submit", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.SubmitKYC(w, req)
	if w.Code != http.StatusCreated {
		t.Fatalf("Expected 201 Created for KYC submission, got %d", w.Code)
	}

	var sub KYCSubmission
	_ = json.NewDecoder(w.Body).Decode(&sub)

	// Admin Review
	revBody := ReviewKYCRequest{
		Status: "approved",
	}
	bRev, _ := json.Marshal(revBody)
	reqRev := httptest.NewRequest(http.MethodPost, "/api/v1/admin/kyc/"+sub.ID.String()+"/review", bytes.NewReader(bRev))
	wRev := httptest.NewRecorder()

	handler.AdminReviewKYC(wRev, reqRev, sub.ID)
	if wRev.Code != http.StatusOK {
		t.Fatalf("Expected 200 OK for KYC review, got %d", wRev.Code)
	}
}
