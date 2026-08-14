package reviews

import (
	"math"
	"testing"
)

func TestRatingValidationBounds(t *testing.T) {
	validRatings := []int{1, 2, 3, 4, 5}
	for _, r := range validRatings {
		if r < 1 || r > 5 {
			t.Fatalf("expected rating %d to be valid", r)
		}
	}

	invalidRatings := []int{-1, 0, 6, 10}
	for _, r := range invalidRatings {
		if r >= 1 && r <= 5 {
			t.Fatalf("expected rating %d to be invalid", r)
		}
	}
}

func TestAverageRatingCalculation(t *testing.T) {
	ratings := []float64{5, 5, 4, 5}
	sum := 0.0
	for _, r := range ratings {
		sum += r
	}
	avg := sum / float64(len(ratings))
	roundedAvg := math.Round(avg*100) / 100

	if roundedAvg != 4.75 {
		t.Fatalf("expected average rating 4.75, got %.2f", roundedAvg)
	}
}
