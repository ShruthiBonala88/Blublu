package maps

import (
	"context"
	"math"
)

type HaversineProvider struct{}

func NewHaversineProvider() *HaversineProvider {
	return &HaversineProvider{}
}

func (h *HaversineProvider) GetRoute(ctx context.Context, originLat, originLon, destLat, destLon float64) (*RouteResult, error) {
	distanceStraightMeters := CalculateHaversineMeters(originLat, originLon, destLat, destLon)

	// Apply 1.3 road curvature factor for realistic road distance estimation
	roadDistanceMeters := int64(math.Round(float64(distanceStraightMeters) * 1.3))

	// Estimate duration based on average road speed of 50 km/h (13.8889 m/s)
	durationSeconds := int64(math.Round(float64(roadDistanceMeters) / 13.8889))

	if durationSeconds < 60 && roadDistanceMeters > 0 {
		durationSeconds = 60
	}

	return &RouteResult{
		DistanceMeters:  roadDistanceMeters,
		DurationSeconds: durationSeconds,
		Provider:        "haversine",
	}, nil
}

func CalculateHaversineMeters(lat1, lon1, lat2, lon2 float64) int64 {
	const earthRadiusMeters = 6371000.0

	radLat1 := lat1 * math.Pi / 180.0
	radLat2 := lat2 * math.Pi / 180.0
	dLat := (lat2 - lat1) * math.Pi / 180.0
	dLon := (lon2 - lon1) * math.Pi / 180.0

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(radLat1)*math.Cos(radLat2)*
			math.Sin(dLon/2)*math.Sin(dLon/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return int64(math.Round(earthRadiusMeters * c))
}
