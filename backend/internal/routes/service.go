package routes

import (
	"context"

	"github.com/vikas/blublu/internal/maps"
)

type Service struct {
	mapService *maps.Service
}

func NewService(mapService *maps.Service) *Service {
	return &Service{mapService: mapService}
}

func (s *Service) GetCorridorRoute(ctx context.Context, originLat, originLng, destLat, destLng float64) (*maps.RouteResult, error) {
	if s.mapService == nil {
		provider, _ := maps.NewRouteProvider()
		s.mapService = maps.NewService(provider)
	}
	return s.mapService.CalculateRoute(ctx, originLat, originLng, destLat, destLng)
}
