package payments

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrBookingNotFound         = errors.New("booking not found")
	ErrUnauthorizedBooking     = errors.New("booking does not belong to user")
	ErrBookingCancelled        = errors.New("cannot create payment for cancelled booking")
	ErrBookingAlreadyPaid      = errors.New("booking is already paid")
	ErrPaymentNotFound         = errors.New("payment record not found")
	ErrInvalidSignature        = errors.New("invalid payment signature")
	ErrInvalidWebhookSignature = errors.New("invalid webhook signature")
)

type Payment struct {
	ID                uuid.UUID `json:"payment_id"`
	BookingID         uuid.UUID `json:"booking_id"`
	UserID            uuid.UUID `json:"user_id,omitempty"`
	Amount            float64   `json:"amount"`
	Currency          string    `json:"currency"`
	PaymentStatus     string    `json:"payment_status"`
	RazorpayOrderID   string    `json:"razorpay_order_id,omitempty"`
	RazorpayPaymentID string    `json:"razorpay_payment_id,omitempty"`
	RazorpaySignature string    `json:"-"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at,omitempty"`
}

type CreateOrderRequest struct {
	UserID string `json:"user_id"`
}

type CreateOrderResponse struct {
	PaymentID       uuid.UUID `json:"payment_id"`
	BookingID       uuid.UUID `json:"booking_id"`
	RazorpayOrderID string    `json:"razorpay_order_id"`
	Amount          int64     `json:"amount"`
	Currency        string    `json:"currency"`
	RazorpayKeyID   string    `json:"razorpay_key_id"`
}

type VerifyPaymentRequest struct {
	RazorpayOrderID   string `json:"razorpay_order_id"`
	RazorpayPaymentID string `json:"razorpay_payment_id"`
	RazorpaySignature string `json:"razorpay_signature"`
}
