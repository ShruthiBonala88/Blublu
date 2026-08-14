package maps

import (
	"context"
	"errors"
	"testing"
)

func TestCoordinateValidation(t *testing.T) {
	svc := NewService(NewHaversineProvider())
	ctx := context.Background()

	// 1. Valid coordinates
	res, err := svc.CalculateRoute(ctx, 17.385, 78.4867, 17.9689, 79.5941)
	if err != nil {
		t.Fatalf("expected valid route, got error: %v", err)
	}
	if res.DistanceMeters <= 0 || res.DurationSeconds <= 0 {
		t.Fatalf("expected positive distance and duration, got dist=%d dur=%d", res.DistanceMeters, res.DurationSeconds)
	}

	// 2. Invalid latitude (> 90)
	_, err = svc.CalculateRoute(ctx, 100.0, 78.4867, 17.9689, 79.5941)
	if !errors.Is(err, ErrInvalidCoordinates) {
		t.Fatalf("expected ErrInvalidCoordinates for lat=100, got: %v", err)
	}

	// 3. Invalid longitude (> 180)
	_, err = svc.CalculateRoute(ctx, 17.385, 200.0, 17.9689, 79.5941)
	if !errors.Is(err, ErrInvalidCoordinates) {
		t.Fatalf("expected ErrInvalidCoordinates for lon=200, got: %v", err)
	}
}

func TestHaversineCalculation(t *testing.T) {
	// Hyderabad (17.385, 78.4867) to Warangal (17.9689, 79.5941)
	dist := CalculateHaversineMeters(17.385, 78.4867, 17.9689, 79.5941)
	if dist < 100000 || dist > 180000 {
		t.Fatalf("expected straight distance between 100km and 180km, got %d meters", dist)
	}
}

func TestRouteCaching(t *testing.T) {
	svc := NewService(NewHaversineProvider())
	ctx := context.Background()

	res1, err := svc.CalculateRoute(ctx, 17.385, 78.4867, 17.9689, 79.5941)
	if err != nil {
		t.Fatalf("failed first route calculation: %v", err)
	}

	// Second calculation should hit in-memory cache
	res2, err := svc.CalculateRoute(ctx, 17.385, 78.4867, 17.9689, 79.5941)
	if err != nil {
		t.Fatalf("failed cached route calculation: %v", err)
	}

	if res1.DistanceMeters != res2.DistanceMeters {
		t.Fatalf("expected cached result match, got %d vs %d", res1.DistanceMeters, res2.DistanceMeters)
	}
}

func TestMissingAPIKeyError(t *testing.T) {
	p := NewGoogleMapsProvider("")
	_, err := p.GetRoute(context.Background(), 17.385, 78.4867, 17.9689, 79.5941)
	if !errors.Is(err, ErrMissingAPIKey) {
		t.Fatalf("expected ErrMissingAPIKey for empty key, got %v", err)
	}
}
