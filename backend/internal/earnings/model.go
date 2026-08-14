package earnings

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrDriverNotFound             = errors.New("driver not found")
	ErrInsufficientBalance        = errors.New("insufficient payable balance for payout")
	ErrInvalidPayoutAmount        = errors.New("payout amount must be greater than zero")
	ErrUnauthorizedEarningsAccess = errors.New("unauthorized: driver can only access their own earnings and payouts")
	ErrPayoutNotFound             = errors.New("payout record not found")
	ErrDuplicatePayoutRequest     = errors.New("a payout request is currently processing for this driver")
)

type DriverEarning struct {
	ID          uuid.UUID `json:"id"`
	DriverID    uuid.UUID `json:"driver_id"`
	TripID      uuid.UUID `json:"trip_id"`
	BookingID   uuid.UUID `json:"booking_id"`
	GrossAmount float64   `json:"gross_amount"`
	PlatformFee float64   `json:"platform_fee"`
	NetAmount   float64   `json:"net_amount"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DriverPayout struct {
	ID               uuid.UUID  `json:"id"`
	DriverID         uuid.UUID  `json:"driver_id"`
	Amount           float64    `json:"amount"`
	Currency         string     `json:"currency"`
	Status           string     `json:"status"`
	PaymentReference *string    `json:"payment_reference,omitempty"`
	FailureReason    *string    `json:"failure_reason,omitempty"`
	RequestedAt      time.Time  `json:"requested_at"`
	ProcessedAt      *time.Time `json:"processed_at,omitempty"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
}

type DriverEarningsSummary struct {
	DriverID      uuid.UUID `json:"driver_id"`
	GrossEarnings float64   `json:"gross_earnings"`
	PlatformFees  float64   `json:"platform_fees"`
	NetEarnings   float64   `json:"net_earnings"`
	PendingAmount float64   `json:"pending_amount"`
	PayableAmount float64   `json:"payable_amount"`
	PaidAmount    float64   `json:"paid_amount"`
	Currency      string    `json:"currency"`
}

type PaginatedEarnings struct {
	Data       []*DriverEarning `json:"data"`
	Page       int              `json:"page"`
	Limit      int              `json:"limit"`
	Total      int              `json:"total"`
	TotalPages int              `json:"total_pages"`
}

type PaginatedPayouts struct {
	Data       []*DriverPayout `json:"data"`
	Page       int             `json:"page"`
	Limit      int             `json:"limit"`
	Total      int             `json:"total"`
	TotalPages int             `json:"total_pages"`
}
