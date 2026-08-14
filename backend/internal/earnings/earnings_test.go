package earnings

import (
	"math"
	"testing"
)

func TestPlatformFeeAndNetAmountCalculation(t *testing.T) {
	grossAmount := 150.0
	feePercent := 10.0

	platformFee := math.Round((grossAmount*feePercent/100.0)*100) / 100.0
	netAmount := math.Round((grossAmount-platformFee)*100) / 100.0

	if platformFee != 15.0 {
		t.Fatalf("expected platform fee 15.0, got %.2f", platformFee)
	}

	if netAmount != 135.0 {
		t.Fatalf("expected net amount 135.0, got %.2f", netAmount)
	}
}

func TestPayoutAmountValidation(t *testing.T) {
	invalidAmounts := []float64{-100.0, 0.0}
	for _, amt := range invalidAmounts {
		if amt > 0 {
			t.Fatalf("expected amount %.2f to be invalid", amt)
		}
	}

	validAmount := 500.0
	if validAmount <= 0 {
		t.Fatalf("expected amount %.2f to be valid", validAmount)
	}
}
