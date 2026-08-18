package safety

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

// POST /api/v1/safety/sos
func (h *Handler) TriggerSOS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req TriggerSOSRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
		return
	}

	var tripID *uuid.UUID
	if req.TripID != nil && strings.TrimSpace(*req.TripID) != "" {
		tid, err := uuid.Parse(*req.TripID)
		if err == nil {
			tripID = &tid
		}
	}

	sos, err := h.service.TriggerSOS(r.Context(), userID, tripID, req.Latitude, req.Longitude)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(sos)
}

// POST /api/v1/safety/report
func (h *Handler) SubmitReport(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req SubmitReportRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	reporterID, err := uuid.Parse(req.ReporterID)
	if err != nil {
		http.Error(w, `{"error":"invalid reporter_id"}`, http.StatusBadRequest)
		return
	}

	var reportedID *uuid.UUID
	if req.ReportedID != nil && strings.TrimSpace(*req.ReportedID) != "" {
		rid, err := uuid.Parse(*req.ReportedID)
		if err == nil {
			reportedID = &rid
		}
	}

	var tripID *uuid.UUID
	if req.TripID != nil && strings.TrimSpace(*req.TripID) != "" {
		tid, err := uuid.Parse(*req.TripID)
		if err == nil {
			tripID = &tid
		}
	}

	report, err := h.service.SubmitReport(r.Context(), reporterID, reportedID, tripID, req.Category, req.Description)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(report)
}

// GET /api/v1/safety/incidents
func (h *Handler) ListIncidents(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	incidents, err := h.service.ListIncidents(r.Context())
	if err != nil {
		http.Error(w, `{"error":"failed to fetch incidents"}`, http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(incidents)
}
