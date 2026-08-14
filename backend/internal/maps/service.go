package maps

import (
	"context"
	"time"
)

type Service struct {
	provider RouteProvider
	cache    *MemoryCache
}

func NewService(provider RouteProvider) *Service {
	if provider == nil {
		p, err := NewRouteProvider()
		if err != nil {
			p = NewHaversineProvider()
		}
		provider = p
	}
	return &Service{
		provider: provider,
		cache:    NewMemoryCache(1 * time.Hour),
	}
}

func (s *Service) CalculateRoute(ctx context.Context, originLat, originLon, destLat, destLon float64) (*RouteResult, error) {
	if originLat < -90 || originLat > 90 || destLat < -90 || destLat > 90 ||
		originLon < -180 || originLon > 180 || destLon < -180 || destLon > 180 {
		return nil, ErrInvalidCoordinates
	}

	if cached, ok := s.cache.Get(originLat, originLon, destLat, destLon); ok {
		return cached, nil
	}

	result, err := s.provider.GetRoute(ctx, originLat, originLon, destLat, destLon)
	if err != nil {
		haversine := NewHaversineProvider()
		res, hErr := haversine.GetRoute(ctx, originLat, originLon, destLat, destLon)
		if hErr != nil {
			return nil, ErrMapsProviderUnavailable
		}
		s.cache.Set(originLat, originLon, destLat, destLon, res)
		return res, nil
	}

	s.cache.Set(originLat, originLon, destLat, destLon, result)
	return result, nil
}
