package trips

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/maps"
	"github.com/vikas/blublu/internal/notifications"
)

type EarningsGenerator interface {
	GenerateEarningsForTrip(ctx context.Context, tripID, driverID uuid.UUID) error
}

type Handler struct {
	repo         *Repository
	notifService *notifications.Service
	routeService *maps.Service
	earningsRepo EarningsGenerator
}

func NewHandler(repo *Repository, notifService *notifications.Service, routeService *maps.Service, earningsRepo EarningsGenerator) *Handler {
	return &Handler{
		repo:         repo,
		notifService: notifService,
		routeService: routeService,
		earningsRepo: earningsRepo,
	}
}

type createTripRequest struct {
	DriverID             string     `json:"driver_id"`
	VehicleID            string     `json:"vehicle_id"`
	OriginName           string     `json:"origin_name"`
	DestinationName      string     `json:"destination_name"`
	OriginLatitude       float64    `json:"origin_latitude"`
	OriginLongitude      float64    `json:"origin_longitude"`
	DestinationLatitude  float64    `json:"destination_latitude"`
	DestinationLongitude float64    `json:"destination_longitude"`
	DepartureTime        time.Time  `json:"departure_time"`
	EstimatedArrivalTime *time.Time `json:"estimated_arrival_time"`
	PricePerSeat         float64    `json:"price_per_seat"`
	Notes                string     `json:"notes"`
}

// POST /api/v1/trips
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

	var req createTripRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(
			w,
			`{"error":"invalid request body"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate driver UUID
	driverID, err := uuid.Parse(req.DriverID)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid driver_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate vehicle UUID
	vehicleID, err := uuid.Parse(req.VehicleID)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid vehicle_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate origin name
	if strings.TrimSpace(req.OriginName) == "" {
		http.Error(
			w,
			`{"error":"origin_name is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate destination name
	if strings.TrimSpace(req.DestinationName) == "" {
		http.Error(
			w,
			`{"error":"destination_name is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate latitude
	if req.OriginLatitude < -90 || req.OriginLatitude > 90 {
		http.Error(
			w,
			`{"error":"invalid origin_latitude"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.DestinationLatitude < -90 || req.DestinationLatitude > 90 {
		http.Error(
			w,
			`{"error":"invalid destination_latitude"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate longitude
	if req.OriginLongitude < -180 || req.OriginLongitude > 180 {
		http.Error(
			w,
			`{"error":"invalid origin_longitude"}`,
			http.StatusBadRequest,
		)
		return
	}

	if req.DestinationLongitude < -180 || req.DestinationLongitude > 180 {
		http.Error(
			w,
			`{"error":"invalid destination_longitude"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Validate departure time
	if req.DepartureTime.IsZero() {
		http.Error(
			w,
			`{"error":"departure_time is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	// Create trip.
	// TotalSeats is intentionally NOT supplied here.
	// The repository gets total_seats from the selected vehicle.
	trip := &Trip{
		DriverID:             driverID,
		VehicleID:            vehicleID,
		OriginName:           strings.TrimSpace(req.OriginName),
		DestinationName:      strings.TrimSpace(req.DestinationName),
		OriginLatitude:       req.OriginLatitude,
		OriginLongitude:      req.OriginLongitude,
		DestinationLatitude:  req.DestinationLatitude,
		DestinationLongitude: req.DestinationLongitude,
		DepartureTime:        req.DepartureTime,
		EstimatedArrivalTime: req.EstimatedArrivalTime,
		PricePerSeat:         req.PricePerSeat,
		Notes:                strings.TrimSpace(req.Notes),
	}

	// Calculate route & ETA if routeService is provided
	if h.routeService != nil {
		routeRes, err := h.routeService.CalculateRoute(r.Context(), req.OriginLatitude, req.OriginLongitude, req.DestinationLatitude, req.DestinationLongitude)
		if err == nil && routeRes != nil {
			trip.DistanceMeters = routeRes.DistanceMeters
			trip.DurationSeconds = routeRes.DurationSeconds
			if trip.EstimatedArrivalTime == nil {
				estArr := req.DepartureTime.Add(time.Duration(routeRes.DurationSeconds) * time.Second)
				trip.EstimatedArrivalTime = &estArr
			}
		}
	}

	// Save trip to database
	if err := h.repo.Create(r.Context(), trip); err != nil {
		http.Error(
			w,
			fmt.Sprintf(`{"error":"%s"}`, err.Error()),
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(trip); err != nil {
		fmt.Println("failed to encode trip response:", err)
	}
}

// GET /api/v1/trips/search
func (h *Handler) Search(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(
			w,
			`{"error":"method not allowed"}`,
			http.StatusMethodNotAllowed,
		)
		return
	}

	origin := strings.TrimSpace(r.URL.Query().Get("origin"))
	destination := strings.TrimSpace(r.URL.Query().Get("destination"))
	dateStr := strings.TrimSpace(r.URL.Query().Get("date"))

	if origin == "" {
		http.Error(
			w,
			`{"error":"origin is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	if destination == "" {
		http.Error(
			w,
			`{"error":"destination is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	if dateStr == "" {
		http.Error(
			w,
			`{"error":"date is required"}`,
			http.StatusBadRequest,
		)
		return
	}

	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		http.Error(
			w,
			`{"error":"date must use YYYY-MM-DD format"}`,
			http.StatusBadRequest,
		)
		return
	}

	trips, err := h.repo.Search(r.Context(), origin, destination, parsedDate, dateStr)
	if err != nil {
		http.Error(
			w,
			fmt.Sprintf(`{"error":"%s"}`, err.Error()),
			http.StatusInternalServerError,
		)
		return
	}

	if trips == nil {
		trips = []*Trip{}
	}

	json.NewEncoder(w).Encode(trips)
}

// POST /api/v1/trips/{trip_id}/seats/{seat_id}/lock
func (h *Handler) LockSeat(w http.ResponseWriter, r *http.Request, tripIDStr, seatIDStr string) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(
			w,
			`{"error":"method not allowed"}`,
			http.StatusMethodNotAllowed,
		)
		return
	}

	tripID, err := uuid.Parse(tripIDStr)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid trip_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	seatID, err := uuid.Parse(seatIDStr)
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid seat_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	var req struct {
		UserID string `json:"user_id"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	var userID uuid.UUID
	if req.UserID != "" {
		userID, err = uuid.Parse(req.UserID)
		if err != nil {
			http.Error(
				w,
				`{"error":"invalid user_id"}`,
				http.StatusBadRequest,
			)
			return
		}
	}

	resp, err := h.repo.LockSeat(r.Context(), tripID, seatID, userID, 5*time.Minute)

	if err != nil {
		switch {
		case errors.Is(err, ErrTripNotFound):
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrSeatNotFound):
			http.Error(w, `{"error":"seat not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrSeatBelongsToAnotherTrip):
			http.Error(w, `{"error":"seat belongs to another trip"}`, http.StatusBadRequest)
		case errors.Is(err, ErrSeatBooked):
			http.Error(w, `{"error":"seat is already booked"}`, http.StatusConflict)
		case errors.Is(err, ErrSeatLocked):
			http.Error(w, `{"error":"seat currently locked by another user"}`, http.StatusConflict)
		case errors.Is(err, ErrNoSeatsAvailable):
			http.Error(w, `{"error":"no available seats on this trip"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// GET /api/v1/trips/{id} and GET /api/v1/trips/{id}/seats
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

	if len(parts) >= 4 && parts[3] == "search" {
		h.Search(w, r)
		return
	}

	// Handle /api/v1/trips/{trip_id}/seats/{seat_id}/lock
	if len(parts) == 7 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "trips" && parts[4] == "seats" && parts[6] == "lock" {
		h.LockSeat(w, r, parts[3], parts[5])
		return
	}

	if r.Method != http.MethodGet {
		http.Error(
			w,
			`{"error":"method not allowed"}`,
			http.StatusMethodNotAllowed,
		)
		return
	}

	// Handle /api/v1/trips/{id}/seats
	if len(parts) == 5 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "trips" && parts[4] == "seats" {
		tripID, err := uuid.Parse(parts[3])
		if err != nil {
			http.Error(
				w,
				`{"error":"invalid trip_id"}`,
				http.StatusBadRequest,
			)
			return
		}

		seats, err := h.repo.GetSeatsByTripID(r.Context(), tripID)
		if err != nil {
			http.Error(
				w,
				fmt.Sprintf(`{"error":"%s"}`, err.Error()),
				http.StatusInternalServerError,
			)
			return
		}

		if seats == nil {
			seats = []*TripSeat{}
		}

		json.NewEncoder(w).Encode(seats)
		return
	}

	if len(parts) != 4 ||
		parts[0] != "api" ||
		parts[1] != "v1" ||
		parts[2] != "trips" {
		http.Error(
			w,
			`{"error":"invalid trip path"}`,
			http.StatusBadRequest,
		)
		return
	}

	tripID, err := uuid.Parse(parts[3])
	if err != nil {
		http.Error(
			w,
			`{"error":"invalid trip_id"}`,
			http.StatusBadRequest,
		)
		return
	}

	trip, err := h.repo.GetByID(r.Context(), tripID)
	if err != nil {
		http.Error(
			w,
			fmt.Sprintf(`{"error":"%s"}`, err.Error()),
			http.StatusNotFound,
		)
		return
	}

	json.NewEncoder(w).Encode(trip)
}

type driverActionRequest struct {
	DriverID string `json:"driver_id"`
	Reason   string `json:"reason,omitempty"`
}

// GET /api/v1/drivers/{driver_id}/trips
func (h *Handler) ListByDriver(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))

	trips, err := h.repo.GetDriverTrips(r.Context(), driverID, statusFilter)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	if trips == nil {
		trips = []*Trip{}
	}

	json.NewEncoder(w).Encode(trips)
}

// GET /api/v1/drivers/{driver_id}/trips/{trip_id}
func (h *Handler) GetDriverTripByID(w http.ResponseWriter, r *http.Request, driverID, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	trip, err := h.repo.GetDriverTripByID(r.Context(), driverID, tripID)
	if err != nil {
		switch {
		case errors.Is(err, ErrDriverNotFound):
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotFound):
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedDriver):
			http.Error(w, `{"error":"unauthorized: trip does not belong to driver"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(trip)
}

// POST /api/v1/trips/{trip_id}/start
func (h *Handler) StartTrip(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req driverActionRequest
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

	err = h.repo.UpdateTripStatus(r.Context(), tripID, driverID, "started", "")
	if err != nil {
		switch {
		case errors.Is(err, ErrDriverNotFound):
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotFound):
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedDriver):
			http.Error(w, `{"error":"unauthorized: trip does not belong to driver"}`, http.StatusForbidden)
		case errors.Is(err, ErrDriverNotVerified):
			http.Error(w, `{"error":"driver is not verified"}`, http.StatusForbidden)
		case errors.Is(err, ErrInvalidStateTransition):
			http.Error(w, `{"error":"invalid trip state transition"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	if h.notifService != nil {
		_, _ = h.notifService.NotifyTripPassengers(r.Context(), tripID, "trip_started", "Your Trip Has Started", "Your driver has started the trip.")
	}
	json.NewEncoder(w).Encode(map[string]any{
		"id":          tripID,
		"trip_status": "started",
		"message":     "trip started successfully",
	})
}

// POST /api/v1/trips/{trip_id}/complete
func (h *Handler) CompleteTrip(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req driverActionRequest
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

	err = h.repo.UpdateTripStatus(r.Context(), tripID, driverID, "completed", "")
	if err != nil {
		switch {
		case errors.Is(err, ErrDriverNotFound):
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotFound):
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedDriver):
			http.Error(w, `{"error":"unauthorized: trip does not belong to driver"}`, http.StatusForbidden)
		case errors.Is(err, ErrDriverNotVerified):
			http.Error(w, `{"error":"driver is not verified"}`, http.StatusForbidden)
		case errors.Is(err, ErrInvalidStateTransition):
			http.Error(w, `{"error":"invalid trip state transition"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	if h.earningsRepo != nil {
		_ = h.earningsRepo.GenerateEarningsForTrip(r.Context(), tripID, driverID)
	}
	if h.notifService != nil {
		_, _ = h.notifService.NotifyTripPassengers(r.Context(), tripID, "trip_completed", "Trip Completed", "Your trip has been completed successfully.")
	}
	json.NewEncoder(w).Encode(map[string]any{
		"id":          tripID,
		"trip_status": "completed",
		"message":     "trip completed successfully",
	})
}

// POST /api/v1/trips/{trip_id}/cancel
func (h *Handler) CancelTrip(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req driverActionRequest
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

	err = h.repo.UpdateTripStatus(r.Context(), tripID, driverID, "cancelled", req.Reason)
	if err != nil {
		switch {
		case errors.Is(err, ErrDriverNotFound):
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotFound):
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedDriver):
			http.Error(w, `{"error":"unauthorized: trip does not belong to driver"}`, http.StatusForbidden)
		case errors.Is(err, ErrDriverNotVerified):
			http.Error(w, `{"error":"driver is not verified"}`, http.StatusForbidden)
		case errors.Is(err, ErrInvalidStateTransition):
			http.Error(w, `{"error":"invalid trip state transition"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	if h.notifService != nil {
		_, _ = h.notifService.NotifyTripPassengers(r.Context(), tripID, "trip_cancelled", "Trip Cancelled", "Your driver has cancelled the trip.")
	}
	json.NewEncoder(w).Encode(map[string]any{
		"id":          tripID,
		"trip_status": "cancelled",
		"message":     "trip cancelled successfully",
	})
}
