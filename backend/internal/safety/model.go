package safety

import (
	"time"

	"github.com/google/uuid"
)

type SOSTrigger struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	TripID    *uuid.UUID `json:"trip_id,omitempty"`
	Latitude  float64    `json:"latitude"`
	Longitude float64    `json:"longitude"`
	Status    string     `json:"status"` // active, resolved, false_alarm
	CreatedAt time.Time  `json:"created_at"`
}

type IncidentReport struct {
	ID          uuid.UUID  `json:"id"`
	ReporterID  uuid.UUID  `json:"reporter_id"`
	ReportedID  *uuid.UUID `json:"reported_id,omitempty"`
	TripID      *uuid.UUID `json:"trip_id,omitempty"`
	Category    string     `json:"category"` // harassment, dangerous_driving, fake_profile, other
	Description string     `json:"description"`
	Status      string     `json:"status"` // pending, investigating, resolved
	CreatedAt   time.Time  `json:"created_at"`
}

type TriggerSOSRequest struct {
	UserID    string  `json:"user_id"`
	TripID    *string `json:"trip_id,omitempty"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type SubmitReportRequest struct {
	ReporterID  string  `json:"reporter_id"`
	ReportedID  *string `json:"reported_id,omitempty"`
	TripID      *string `json:"trip_id,omitempty"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
}
