package maps

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"time"
)

type OSRMProvider struct {
	baseURL    string
	httpClient *http.Client
}

func NewOSRMProvider(baseURL string) *OSRMProvider {
	if baseURL == "" {
		baseURL = "http://router.project-osrm.org"
	}
	return &OSRMProvider{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

type osrmResponse struct {
	Code   string `json:"code"`
	Routes []struct {
		Distance float64 `json:"distance"`
		Duration float64 `json:"duration"`
		Geometry string  `json:"geometry,omitempty"`
	} `json:"routes"`
}

func (p *OSRMProvider) GetRoute(ctx context.Context, originLat, originLon, destLat, destLon float64) (*RouteResult, error) {
	url := fmt.Sprintf("%s/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false", p.baseURL, originLon, originLat, destLon, destLat)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create OSRM request: %w", err)
	}

	resp, err := p.httpClient.Do(req)
	if err != nil {
		haversine := NewHaversineProvider()
		return haversine.GetRoute(ctx, originLat, originLon, destLat, destLon)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		haversine := NewHaversineProvider()
		return haversine.GetRoute(ctx, originLat, originLon, destLat, destLon)
	}

	var osrmResp osrmResponse
	if err := json.NewDecoder(resp.Body).Decode(&osrmResp); err != nil || len(osrmResp.Routes) == 0 {
		haversine := NewHaversineProvider()
		return haversine.GetRoute(ctx, originLat, originLon, destLat, destLon)
	}

	route := osrmResp.Routes[0]
	return &RouteResult{
		DistanceMeters:  int64(math.Round(route.Distance)),
		DurationSeconds: int64(math.Round(route.Duration)),
		Polyline:        route.Geometry,
		Provider:        "osrm",
	}, nil
}
