package admin

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrAdminUnauthorized = errors.New("unauthorized: missing admin authentication credentials")
	ErrAdminForbidden    = errors.New("forbidden: user does not have admin privileges")
	ErrUserNotFound      = errors.New("user not found")
	ErrDriverNotFound    = errors.New("driver not found")
	ErrVehicleNotFound   = errors.New("vehicle not found")
	ErrTripNotFound      = errors.New("trip not found")
	ErrBookingNotFound   = errors.New("booking not found")
	ErrPaymentNotFound   = errors.New("payment not found")
	ErrEarningNotFound   = errors.New("earning not found")
	ErrPayoutNotFound    = errors.New("payout not found")
)

type DashboardSummary struct {
	Users           int     `json:"users"`
	Drivers         int     `json:"drivers"`
	Vehicles        int     `json:"vehicles"`
	Trips           int     `json:"trips"`
	Bookings        int     `json:"bookings"`
	CompletedTrips  int     `json:"completed_trips"`
	CancelledTrips  int     `json:"cancelled_trips"`
	GrossRevenue    float64 `json:"gross_revenue"`
	PlatformRevenue float64 `json:"platform_revenue"`
	DriverEarnings  float64 `json:"driver_earnings"`
	PendingPayouts  float64 `json:"pending_payouts"`
}

type AdminAuditLog struct {
	ID          uuid.UUID       `json:"id"`
	AdminUserID uuid.UUID       `json:"admin_user_id"`
	Action      string          `json:"action"`
	EntityType  string          `json:"entity_type"`
	EntityID    *uuid.UUID      `json:"entity_id,omitempty"`
	Metadata    json.RawMessage `json:"metadata,omitempty"`
	CreatedAt   time.Time       `json:"created_at"`
}

type AdminUserDetail struct {
	ID              uuid.UUID `json:"id"`
	FullName        string    `json:"full_name"`
	Phone           string    `json:"phone"`
	Email           *string   `json:"email,omitempty"`
	Role            string    `json:"role"`
	IsPhoneVerified bool      `json:"is_phone_verified"`
	IsActive        bool      `json:"is_active"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type AdminDriverDetail struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"user_id"`
	FullName           string    `json:"full_name"`
	Phone              string    `json:"phone"`
	Email              *string   `json:"email,omitempty"`
	LicenseNumber      string    `json:"license_number"`
	LicenseExpiryDate  string    `json:"license_expiry_date"`
	VerificationStatus string    `json:"verification_status"`
	IsVerified         bool      `json:"is_verified"`
	RejectionReason    *string   `json:"rejection_reason,omitempty"`
	TotalRides         int       `json:"total_rides"`
	AverageRating      float64   `json:"average_rating"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type AdminVehicleDetail struct {
	ID                 uuid.UUID `json:"id"`
	DriverID           uuid.UUID `json:"driver_id"`
	DriverName         string    `json:"driver_name"`
	Make               string    `json:"make"`
	Model              string    `json:"model"`
	ManufactureYear    *int      `json:"manufacture_year,omitempty"`
	Color              *string   `json:"color,omitempty"`
	RegistrationNumber string    `json:"registration_number"`
	VehicleType        string    `json:"vehicle_type"`
	TotalSeats         int       `json:"total_seats"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type AdminTripDetail struct {
	ID                   uuid.UUID  `json:"id"`
	DriverID             uuid.UUID  `json:"driver_id"`
	DriverName           string     `json:"driver_name"`
	VehicleID            uuid.UUID  `json:"vehicle_id"`
	OriginName           string     `json:"origin_name"`
	DestinationName      string     `json:"destination_name"`
	DepartureTime        time.Time  `json:"departure_time"`
	EstimatedArrivalTime *time.Time `json:"estimated_arrival_time,omitempty"`
	TripStatus           string     `json:"trip_status"`
	TotalSeats           int        `json:"total_seats"`
	AvailableSeats       int        `json:"available_seats"`
	PricePerSeat         float64    `json:"price_per_seat"`
	DistanceMeters       *int       `json:"distance_meters,omitempty"`
	DurationSeconds      *int       `json:"duration_seconds,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

type AdminBookingDetail struct {
	ID            uuid.UUID `json:"id"`
	TripID        uuid.UUID `json:"trip_id"`
	UserID        uuid.UUID `json:"user_id"`
	UserName      string    `json:"user_name"`
	UserPhone     string    `json:"user_phone"`
	SeatCount     int       `json:"seat_count"`
	Amount        float64   `json:"amount"`
	BookingStatus string    `json:"booking_status"`
	PaymentStatus string    `json:"payment_status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type AdminPaymentDetail struct {
	ID                uuid.UUID `json:"id"`
	BookingID         uuid.UUID `json:"booking_id"`
	UserID            uuid.UUID `json:"user_id"`
	UserName          string    `json:"user_name"`
	Amount            float64   `json:"amount"`
	Currency          string    `json:"currency"`
	PaymentStatus     string    `json:"payment_status"`
	RazorpayOrderID   *string   `json:"razorpay_order_id,omitempty"`
	RazorpayPaymentID *string   `json:"razorpay_payment_id,omitempty"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type AdminEarningDetail struct {
	ID          uuid.UUID `json:"id"`
	DriverID    uuid.UUID `json:"driver_id"`
	DriverName  string    `json:"driver_name"`
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

type AdminPayoutDetail struct {
	ID               uuid.UUID  `json:"id"`
	DriverID         uuid.UUID  `json:"driver_id"`
	DriverName       string     `json:"driver_name"`
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

type PaginatedResult[T any] struct {
	Data       []T `json:"data"`
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}
