package safety

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db        *pgxpool.Pool
	mu        sync.RWMutex
	sosList   []SOSTrigger
	incidents []IncidentReport
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db:        db,
		sosList:   make([]SOSTrigger, 0),
		incidents: make([]IncidentReport, 0),
	}
}

func (s *Service) TriggerSOS(ctx context.Context, userID uuid.UUID, tripID *uuid.UUID, lat, lng float64) (*SOSTrigger, error) {
	if lat < -90 || lat > 90 {
		return nil, fmt.Errorf("invalid latitude: %f", lat)
	}
	if lng < -180 || lng > 180 {
		return nil, fmt.Errorf("invalid longitude: %f", lng)
	}

	sos := SOSTrigger{
		ID:        uuid.New(),
		UserID:    userID,
		TripID:    tripID,
		Latitude:  lat,
		Longitude: lng,
		Status:    "active",
		CreatedAt: time.Now(),
	}

	s.mu.Lock()
	s.sosList = append(s.sosList, sos)
	s.mu.Unlock()

	return &sos, nil
}

func (s *Service) SubmitReport(ctx context.Context, reporterID uuid.UUID, reportedID, tripID *uuid.UUID, category, description string) (*IncidentReport, error) {
	if category == "" {
		category = "other"
	}
	if description == "" {
		return nil, fmt.Errorf("description is required for incident report")
	}

	report := IncidentReport{
		ID:          uuid.New(),
		ReporterID:  reporterID,
		ReportedID:  reportedID,
		TripID:      tripID,
		Category:    category,
		Description: description,
		Status:      "pending",
		CreatedAt:   time.Now(),
	}

	s.mu.Lock()
	s.incidents = append(s.incidents, report)
	s.mu.Unlock()

	return &report, nil
}

func (s *Service) ListIncidents(ctx context.Context) ([]IncidentReport, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.incidents, nil
}
