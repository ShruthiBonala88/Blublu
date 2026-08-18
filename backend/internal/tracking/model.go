package tracking

import (
	"time"

	"github.com/google/uuid"
)

type LocationUpdate struct {
	ID        uuid.UUID `json:"id"`
	TripID    uuid.UUID `json:"trip_id"`
	DriverID  uuid.UUID `json:"driver_id"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Heading   float64   `json:"heading,omitempty"`
	Speed     float64   `json:"speed,omitempty"`
	UpdatedAt time.Time `json:"updated_at"`
}

type UpdateLocationRequest struct {
	DriverID  string  `json:"driver_id"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Heading   float64 `json:"heading,omitempty"`
	Speed     float64 `json:"speed,omitempty"`
}
