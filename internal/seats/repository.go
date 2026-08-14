package seats

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{
		repo: repo,
	}
}

type createSeatRequest struct {
	SeatNumber   int    `json:"seat_number"`
	SeatPosition string `json:"seat_position"`
	IsWindowSeat bool   `json:"is_window_seat"`
	IsAvailable  *bool  `json:"is_available"`
}

// POST /api/v1/vehicles/{vehicle_id}/seats
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(
			w,
			`{"error":"method not allowed"}`,
			http.StatusMethodNotAllowed,
		)
		return
	}

	vehicleID, err := vehicleIDFromPath(r.URL.Path)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid vehicle_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	var req createSeatRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(
			w,
			`{"error":"invalid request body"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.SeatNumber <= 0 {
		http.Error(
			w,
			`{"error":"seat_number must be greater than 0"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.SeatPosition == "" {
		http.Error(
			w,
			`{"error":"seat_position is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	isAvailable := true

	if req.IsAvailable != nil {
		isAvailable = *req.IsAvailable
	}

	seat := &VehicleSeat{
		VehicleID:    vehicleID,
		SeatNumber:   req.SeatNumber,
		SeatPosition: req.SeatPosition,
		IsWindowSeat: req.IsWindowSeat,
		IsAvailable:  isAvailable,
	}

	if err := h.repo.Create(r.Context(), seat); err != nil {
		http.Error(
			w,
			fmt.Sprintf(`{"error":"%s"}`, err.Error()),
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(seat); err != nil {
		fmt.Println("failed to encode seat response:", err)
	}
}

// GET /api/v1/vehicles/{vehicle_id}/seats
func (h *Handler) ListByVehicle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(
			w,
			`{"error":"method not allowed"}`,
			http.StatusMethodNotAllowed,
		)
		return
	}

	vehicleID, err := vehicleIDFromPath(r.URL.Path)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid vehicle_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	seats, err := h.repo.ListByVehicle(r.Context(), vehicleID)
	if err != nil {
		http.Error(
			w,
			fmt.Sprintf(`{"error":"%s"}`, err.Error()),
			http.StatusInternalServerError,
		)
		return
	}

	if seats == nil {
		seats = []*VehicleSeat{}
	}

	json.NewEncoder(w).Encode(seats)
}

func vehicleIDFromPath(path string) (uuid.UUID, error) {
	parts := strings.Split(strings.Trim(path, "/"), "/")

	if len(parts) != 5 {
		return uuid.Nil, fmt.Errorf("invalid path")
	}

	if parts[0] != "api" ||
		parts[1] != "v1" ||
		parts[2] != "vehicles" ||
		parts[4] != "seats" {
		return uuid.Nil, fmt.Errorf("invalid path")
	}

	return uuid.Parse(parts[3])
}
