package earnings

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type PayoutResult struct {
	PayoutID         uuid.UUID
	Status           string
	PaymentReference string
	FailureReason    string
}

type PayoutProvider interface {
	ProcessPayout(ctx context.Context, payoutID uuid.UUID, amount float64, currency string) (*PayoutResult, error)
}

type DevPayoutProvider struct{}

func NewDevPayoutProvider() *DevPayoutProvider {
	return &DevPayoutProvider{}
}

func (p *DevPayoutProvider) ProcessPayout(ctx context.Context, payoutID uuid.UUID, amount float64, currency string) (*PayoutResult, error) {
	ref := fmt.Sprintf("DEV-PAYOUT-REF-%d", time.Now().UnixNano())
	return &PayoutResult{
		PayoutID:         payoutID,
		Status:           "completed",
		PaymentReference: ref,
	}, nil
}
