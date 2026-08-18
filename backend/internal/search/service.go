package search

import (
	"context"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type SearchQuery struct {
	Origin         string    `json:"origin"`
	Destination    string    `json:"destination"`
	Date           time.Time `json:"date"`
	OriginLat      float64   `json:"origin_lat,omitempty"`
	OriginLng      float64   `json:"origin_lng,omitempty"`
	DestinationLat float64   `json:"destination_lat,omitempty"`
	DestinationLng float64   `json:"destination_lng,omitempty"`
	MinSeats       int       `json:"min_seats,omitempty"`
	VehicleType    string    `json:"vehicle_type,omitempty"`
}

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) NormalizeQuery(query *SearchQuery) {
	query.Origin = strings.TrimSpace(query.Origin)
	query.Destination = strings.TrimSpace(query.Destination)
	if query.MinSeats <= 0 {
		query.MinSeats = 1
	}
}

func (s *Service) BuildSearchCondition(ctx context.Context, query SearchQuery) string {
	s.NormalizeQuery(&query)
	return "status = 'published' AND available_seats >= "
}
