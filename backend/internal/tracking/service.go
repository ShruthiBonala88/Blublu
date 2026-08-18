package tracking

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
	latest    map[string]LocationUpdate
	histories map[string][]LocationUpdate
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db:        db,
		latest:    make(map[string]LocationUpdate),
		histories: make(map[string][]LocationUpdate),
	}
}

func (s *Service) UpdateLocation(ctx context.Context, tripID, driverID uuid.UUID, lat, lng, heading, speed float64) (*LocationUpdate, error) {
	if lat < -90 || lat > 90 {
		return nil, fmt.Errorf("invalid latitude: %f", lat)
	}
	if lng < -180 || lng > 180 {
		return nil, fmt.Errorf("invalid longitude: %f", lng)
	}

	loc := LocationUpdate{
		ID:        uuid.New(),
		TripID:    tripID,
		DriverID:  driverID,
		Latitude:  lat,
		Longitude: lng,
		Heading:   heading,
		Speed:     speed,
		UpdatedAt: time.Now(),
	}

	s.mu.Lock()
	key := tripID.String()
	s.latest[key] = loc
	s.histories[key] = append(s.histories[key], loc)
	s.mu.Unlock()

	return &loc, nil
}

func (s *Service) GetLatestLocation(ctx context.Context, tripID uuid.UUID) (*LocationUpdate, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	loc, exists := s.latest[tripID.String()]
	if !exists {
		return nil, fmt.Errorf("no location updates found for trip %s", tripID)
	}
	return &loc, nil
}
