package payouts

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db *pgxpool.Pool
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{db: db}
}

func (s *Service) CalculatePlatformFee(totalAmount float64, feePercent float64) (float64, float64) {
	if feePercent <= 0 {
		feePercent = 10.0 // Default 10% platform commission fee
	}
	platformFee := (totalAmount * feePercent) / 100.0
	netEarnings := totalAmount - platformFee
	return platformFee, netEarnings
}

func (s *Service) ProcessPayoutTransaction(ctx context.Context, driverID, payoutID uuid.UUID) error {
	if driverID == uuid.Nil || payoutID == uuid.Nil {
		return fmt.Errorf("invalid driver or payout id")
	}
	return nil
}
