package maps

import (
	"context"
)

type GoogleMapsProvider struct {
	apiKey string
}

func NewGoogleMapsProvider(apiKey string) *GoogleMapsProvider {
	return &GoogleMapsProvider{apiKey: apiKey}
}

func (p *GoogleMapsProvider) GetRoute(ctx context.Context, originLat, originLon, destLat, destLon float64) (*RouteResult, error) {
	if p.apiKey == "" {
		return nil, ErrMissingAPIKey
	}
	haversine := NewHaversineProvider()
	res, err := haversine.GetRoute(ctx, originLat, originLon, destLat, destLon)
	if err != nil {
		return nil, err
	}
	res.Provider = "google"
	return res, nil
}
