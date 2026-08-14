package bookings

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound              = errors.New("user not found")
	ErrTripNotFound              = errors.New("trip not found")
	ErrTripNotScheduled          = errors.New("trip is not scheduled")
	ErrTripPassed                = errors.New("trip departure time has passed")
	ErrSeatNotFound              = errors.New("seat not found")
	ErrSeatBelongsToAnotherTrip  = errors.New("seat belongs to another trip")
	ErrSeatAlreadyBooked         = errors.New("seat is already booked")
	ErrSeatNotLocked             = errors.New("seat must be locked before booking")
	ErrSeatLockExpired           = errors.New("seat lock has expired")
	ErrSeatLockedByAnotherUser   = errors.New("seat is locked by another user")
	ErrInsufficientSeats         = errors.New("insufficient available seats on trip")
	ErrBookingNotFound           = errors.New("booking not found")
	ErrBookingAlreadyCancelled   = errors.New("booking is already cancelled")
	ErrBookingAlreadyCompleted   = errors.New("booking is already completed")
	ErrUnauthorizedCancellation  = errors.New("unauthorized to cancel this booking")
	ErrUnauthorizedBookingAccess = errors.New("unauthorized: booking does not belong to user")
)

type Booking struct {
	ID                 uuid.UUID     `json:"id"`
	UserID             uuid.UUID     `json:"user_id"`
	TripID             uuid.UUID     `json:"trip_id"`
	BookingStatus      string        `json:"booking_status"`
	PaymentStatus      string        `json:"payment_status,omitempty"`
	TotalAmount        float64       `json:"total_amount"`
	Seats              []BookingSeat `json:"seats"`
	CancelledAt        *time.Time    `json:"cancelled_at,omitempty"`
	CancellationReason string        `json:"cancellation_reason,omitempty"`
	CreatedAt          time.Time     `json:"created_at"`
	UpdatedAt          time.Time     `json:"updated_at,omitempty"`

	OriginName      string       `json:"origin_name,omitempty"`
	DestinationName string       `json:"destination_name,omitempty"`
	DepartureTime   *time.Time   `json:"departure_time,omitempty"`
	Trip            *TripDetails `json:"trip,omitempty"`
}

type TripDetails struct {
	OriginName      string    `json:"origin_name"`
	DestinationName string    `json:"destination_name"`
	DepartureTime   time.Time `json:"departure_time"`
	TripStatus      string    `json:"trip_status"`
}

type BookingSeat struct {
	ID           uuid.UUID `json:"id,omitempty"`
	BookingID    uuid.UUID `json:"booking_id,omitempty"`
	TripSeatID   uuid.UUID `json:"trip_seat_id"`
	SeatNumber   int       `json:"seat_number,omitempty"`
	SeatPosition string    `json:"seat_position,omitempty"`
	IsWindowSeat bool      `json:"is_window_seat"`
	Price        float64   `json:"price"`
	CreatedAt    time.Time `json:"created_at,omitempty"`
}

type PassengerRide struct {
	BookingID       uuid.UUID     `json:"booking_id"`
	TripID          uuid.UUID     `json:"trip_id"`
	UserID          uuid.UUID     `json:"user_id"`
	SeatNumber      int           `json:"seat_number,omitempty"`
	SeatPosition    string        `json:"seat_position,omitempty"`
	IsWindowSeat    bool          `json:"is_window_seat"`
	Seats           []BookingSeat `json:"seats,omitempty"`
	OriginName      string        `json:"origin_name"`
	DestinationName string        `json:"destination_name"`
	DepartureTime   time.Time     `json:"departure_time"`
	PricePerSeat    float64       `json:"price_per_seat,omitempty"`
	TotalAmount     float64       `json:"total_amount"`
	BookingStatus   string        `json:"booking_status"`
	TripStatus      string        `json:"trip_status"`
	PaymentStatus   string        `json:"payment_status"`
	RideCategory    string        `json:"ride_category"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type PaginatedResponse[T any] struct {
	Data       []T `json:"data"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}
