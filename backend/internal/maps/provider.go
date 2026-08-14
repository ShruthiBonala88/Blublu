package maps

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"
)

var (
	ErrInvalidCoordinates      = errors.New("invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180")
	ErrMapsProviderUnavailable = errors.New("maps provider unavailable")
	ErrMissingAPIKey           = errors.New("missing API key for maps provider")
	ErrUnsupportedProvider     = errors.New("unsupported maps provider")
)

type RouteResult struct {
	DistanceMeters  int64  `json:"distance_meters"`
	DurationSeconds int64  `json:"duration_seconds"`
	Polyline        string `json:"polyline,omitempty"`
	Provider        string `json:"provider"`
}

type RouteProvider interface {
	GetRoute(ctx context.Context, originLat, originLon, destLat, destLon float64) (*RouteResult, error)
}

func NewRouteProvider() (RouteProvider, error) {
	providerName := strings.ToLower(strings.TrimSpace(os.Getenv("MAP_PROVIDER")))
	apiKey := strings.TrimSpace(os.Getenv("MAPS_API_KEY"))

	if providerName == "" {
		providerName = "osrm"
	}

	switch providerName {
	case "osrm":
		return NewOSRMProvider("http://router.project-osrm.org"), nil
	case "google":
		if apiKey == "" {
			return nil, fmt.Errorf("%w: MAPS_API_KEY required for Google Maps provider", ErrMissingAPIKey)
		}
		return NewGoogleMapsProvider(apiKey), nil
	case "mapbox":
		if apiKey == "" {
			return nil, fmt.Errorf("%w: MAPS_API_KEY required for Mapbox provider", ErrMissingAPIKey)
		}
		return NewMapboxProvider(apiKey), nil
	case "haversine":
		return NewHaversineProvider(), nil
	default:
		return nil, fmt.Errorf("%w: %s", ErrUnsupportedProvider, providerName)
	}
}
