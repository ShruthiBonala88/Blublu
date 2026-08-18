package kyc

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// POST /api/v1/kyc/submit
func (h *Handler) SubmitKYC(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req SubmitKYCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	driverID, err := uuid.Parse(req.DriverID)
	if err != nil {
		http.Error(w, `{"error":"invalid driver_id"}`, http.StatusBadRequest)
		return
	}

	sub, err := h.service.SubmitKYC(r.Context(), driverID, req.DocumentType, req.DocumentNumber, req.DocumentURL)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(sub)
}

// GET /api/v1/kyc/status?driver_id={uuid}
func (h *Handler) GetKYCStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	driverIDStr := r.URL.Query().Get("driver_id")
	driverID, err := uuid.Parse(driverIDStr)
	if err != nil {
		http.Error(w, `{"error":"driver_id query parameter is required"}`, http.StatusBadRequest)
		return
	}

	submissions, err := h.service.GetDriverKYCStatus(r.Context(), driverID)
	if err != nil {
		http.Error(w, `{"error":"failed to fetch kyc status"}`, http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(submissions)
}

// GET /api/v1/admin/kyc
func (h *Handler) AdminListKYC(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	submissions, err := h.service.ListAll(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch kyc submissions"}`, http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(submissions)
}

// POST /api/v1/admin/kyc/{id}/review
func (h *Handler) AdminReviewKYC(w http.ResponseWriter, r *http.Request, submissionID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req ReviewKYCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	sub, err := h.service.ReviewKYC(r.Context(), submissionID, strings.TrimSpace(req.Status), req.RejectionReason)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(sub)
}
