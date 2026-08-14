package vehicles

import (
	"encoding/json"
	"fmt"
	"net/http"

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

type createVehicleRequest struct {
	DriverID           string `json:"driver_id"`
	VehicleType        string `json:"vehicle_type"`
	Make               string `json:"make"`
	Model              string `json:"model"`
	ManufactureYear    *int   `json:"manufacture_year"`
	RegistrationNumber string `json:"registration_number"`
	TotalSeats         int    `json:"total_seats"`
}

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

	var req createVehicleRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(
			w,
			`{"error":"invalid request body"}`,
			http.StatusBadRequest,
		)
		return
	}

	driverID, err := uuid.Parse(req.DriverID)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid driver_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.VehicleType == "" {
		http.Error(
			w,
			`{"error":"vehicle_type is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.Make == "" {
		http.Error(
			w,
			`{"error":"make is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.Model == "" {
		http.Error(
			w,
			`{"error":"model is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.RegistrationNumber == "" {
		http.Error(
			w,
			`{"error":"registration_number is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.TotalSeats <= 0 {
		http.Error(
			w,
			`{"error":"total_seats must be greater than 0"}`,
			http.StatusBadRequest,
		)
		return
	}

	vehicle := &Vehicle{
		DriverID:           driverID,
		VehicleType:        req.VehicleType,
		Make:               req.Make,
		Model:              req.Model,
		ManufactureYear:    req.ManufactureYear,
		RegistrationNumber: req.RegistrationNumber,
		TotalSeats:         req.TotalSeats,
	}

	if err := h.repo.Create(r.Context(), vehicle); err != nil {
		http.Error(
			w,
			fmt.Sprintf(`{"error":"%s"}`, err.Error()),
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(vehicle); err != nil {
		fmt.Println("failed to encode vehicle response:", err)
	}
}
