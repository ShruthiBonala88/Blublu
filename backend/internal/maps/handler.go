package maps

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type LocationPoint struct {
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type TripRouteResponse struct {
	TripID               uuid.UUID     `json:"trip_id"`
	Origin               LocationPoint `json:"origin"`
	Destination          LocationPoint `json:"destination"`
	DistanceMeters       int64         `json:"distance_meters"`
	DurationSeconds      int64         `json:"duration_seconds"`
	DepartureTime        time.Time     `json:"departure_time"`
	EstimatedArrivalTime *time.Time    `json:"estimated_arrival_time,omitempty"`
}

type calculateRouteReq struct {
	OriginLatitude       float64 `json:"origin_latitude"`
	OriginLongitude      float64 `json:"origin_longitude"`
	DestinationLatitude  float64 `json:"destination_latitude"`
	DestinationLongitude float64 `json:"destination_longitude"`
}

type Handler struct {
	service *Service
	db      *pgxpool.Pool
}

func NewHandler(service *Service, db *pgxpool.Pool) *Handler {
	return &Handler{
		service: service,
		db:      db,
	}
}

// POST /api/v1/route/calculate
func (h *Handler) CalculateRoute(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req calculateRouteReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.service.CalculateRoute(r.Context(), req.OriginLatitude, req.OriginLongitude, req.DestinationLatitude, req.DestinationLongitude)
	if err != nil {
		if errors.Is(err, ErrInvalidCoordinates) {
			http.Error(w, `{"error":"invalid coordinates"}`, http.StatusBadRequest)
			return
		}
		http.Error(w, `{"error":"maps provider unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/trips/{trip_id}/route
func (h *Handler) GetTripRoute(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	query := `
		SELECT 
			id, origin_name, ST_Y(origin_location::geometry) as origin_lat, ST_X(origin_location::geometry) as origin_lon,
			destination_name, ST_Y(destination_location::geometry) as dest_lat, ST_X(destination_location::geometry) as dest_lon,
			distance_meters, duration_seconds, departure_time, estimated_arrival_time
		FROM trips
		WHERE id = $1
	`

	var (
		id             uuid.UUID
		originName     string
		originLat      float64
		originLon      float64
		destName       string
		destLat        float64
		destLon        float64
		distanceMeters int64
		durationSecs   int64
		departureTime  time.Time
		estArrival     *time.Time
	)

	err := h.db.QueryRow(r.Context(), query, tripID).Scan(
		&id,
		&originName,
		&originLat,
		&originLon,
		&destName,
		&destLat,
		&destLon,
		&distanceMeters,
		&durationSecs,
		&departureTime,
		&estArrival,
	)

	if err != nil {
		http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		return
	}

	if distanceMeters <= 0 || durationSecs <= 0 {
		res, err := h.service.CalculateRoute(r.Context(), originLat, originLon, destLat, destLon)
		if err == nil {
			distanceMeters = res.DistanceMeters
			durationSecs = res.DurationSeconds
			if estArrival == nil {
				t := departureTime.Add(time.Duration(durationSecs) * time.Second)
				estArrival = &t
			}
		}
	}

	resp := TripRouteResponse{
		TripID: id,
		Origin: LocationPoint{
			Name:      originName,
			Latitude:  originLat,
			Longitude: originLon,
		},
		Destination: LocationPoint{
			Name:      destName,
			Latitude:  destLat,
			Longitude: destLon,
		},
		DistanceMeters:       distanceMeters,
		DurationSeconds:      durationSecs,
		DepartureTime:        departureTime,
		EstimatedArrivalTime: estArrival,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
