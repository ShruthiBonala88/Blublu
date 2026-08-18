package tracking

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

// GET /api/v1/tracking/trips/{trip_id}/location
// POST /api/v1/tracking/trips/{trip_id}/location
func (h *Handler) HandleTripLocation(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		loc, err := h.service.GetLatestLocation(r.Context(), tripID)
		if err != nil {
			http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusNotFound)
			return
		}
		_ = json.NewEncoder(w).Encode(loc)

	case http.MethodPost:
		var req UpdateLocationRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(req.DriverID) == "" {
			http.Error(w, `{"error":"driver_id is required"}`, http.StatusBadRequest)
			return
		}

		driverID, err := uuid.Parse(req.DriverID)
		if err != nil {
			http.Error(w, `{"error":"invalid driver_id"}`, http.StatusBadRequest)
			return
		}

		loc, err := h.service.UpdateLocation(r.Context(), tripID, driverID, req.Latitude, req.Longitude, req.Heading, req.Speed)
		if err != nil {
			http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(loc)

	default:
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	}
}
