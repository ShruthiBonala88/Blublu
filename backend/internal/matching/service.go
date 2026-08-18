package matching

import (
	"context"
	"math"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type MatchResult struct {
	TripID     uuid.UUID `json:"trip_id"`
	DistanceKm float64   `json:"distance_km"`
	MatchScore float64   `json:"match_score"`
}

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

// CalculateDistanceHaversine computes straight-line distance in km between two lat/lng pairs
func (s *Service) CalculateDistanceHaversine(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371.0 // Earth radius in km
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0

	radLat1 := lat1 * math.Pi / 180.0
	radLat2 := lat2 * math.Pi / 180.0

	a := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Sin(dLon/2)*math.Sin(dLon/2)*math.Cos(radLat1)*math.Cos(radLat2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return R * c
}

func (s *Service) MatchTripCorridor(ctx context.Context, passengerOriginLat, passengerOriginLng, passengerDestLat, passengerDestLng float64) (float64, float64) {
	origDist := s.CalculateDistanceHaversine(passengerOriginLat, passengerOriginLng, passengerOriginLat, passengerOriginLng)
	destDist := s.CalculateDistanceHaversine(passengerDestLat, passengerDestLng, passengerDestLat, passengerDestLng)
	return origDist, destDist
}
