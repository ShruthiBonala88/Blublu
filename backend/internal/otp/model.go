package otp

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound           = errors.New("user not found")
	ErrOTPNotFound            = errors.New("otp record not found")
	ErrOTPExpired             = errors.New("otp has expired")
	ErrOTPAlreadyVerified     = errors.New("otp has already been verified")
	ErrOTPMaxAttemptsExceeded = errors.New("maximum otp verification attempts exceeded")
	ErrInvalidOTP             = errors.New("invalid otp code")
	ErrRateLimitExceeded      = errors.New("too many otp requests, please wait")
	ErrUnauthorizedRideVerify = errors.New("unauthorized: booking does not belong to user")
	ErrBookingNotFound        = errors.New("booking not found")
	ErrBookingNotConfirmed    = errors.New("booking is not in confirmed state")
)

type OTPVerification struct {
	ID          uuid.UUID  `json:"id"`
	UserID      uuid.UUID  `json:"user_id"`
	BookingID   *uuid.UUID `json:"booking_id,omitempty"`
	OTPHash     string     `json:"-"`
	Purpose     string     `json:"purpose"`
	ExpiresAt   time.Time  `json:"expires_at"`
	VerifiedAt  *time.Time `json:"verified_at,omitempty"`
	Attempts    int        `json:"attempts"`
	MaxAttempts int        `json:"max_attempts"`
	CreatedAt   time.Time  `json:"created_at"`
}

type RequestOTPResponse struct {
	Message        string `json:"message"`
	ExpiresIn      int    `json:"expires_in"`
	DevelopmentOTP string `json:"development_otp,omitempty"`
}

type VerifyOTPResponse struct {
	Verified  bool   `json:"verified"`
	Message   string `json:"message"`
	BookingID string `json:"booking_id,omitempty"`
}
