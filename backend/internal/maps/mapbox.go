package maps

import (
	"context"
)

type MapboxProvider struct {
	apiKey string
}

func NewMapboxProvider(apiKey string) *MapboxProvider {
	return &MapboxProvider{apiKey: apiKey}
}

func (p *MapboxProvider) GetRoute(ctx context.Context, originLat, originLon, destLat, destLon float64) (*RouteResult, error) {
	if p.apiKey == "" {
		return nil, ErrMissingAPIKey
	}
	haversine := NewHaversineProvider()
	res, err := haversine.GetRoute(ctx, originLat, originLon, destLat, destLon)
	if err != nil {
		return nil, err
	}
	res.Provider = "mapbox"
	return res, nil
}
