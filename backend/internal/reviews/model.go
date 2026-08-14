package reviews

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidRating        = errors.New("invalid rating: score must be between 1 and 5")
	ErrReviewTooLong        = errors.New("review text exceeds maximum length of 1000 characters")
	ErrSelfReviewNotAllowed = errors.New("self-review is not allowed")
	ErrTripNotCompleted     = errors.New("rating is only allowed after trip completion")
	ErrBookingNotFound      = errors.New("booking not found")
	ErrDriverNotFound       = errors.New("driver not found")
	ErrUserNotFound         = errors.New("user not found")
	ErrRatingNotFound       = errors.New("rating not found")
	ErrUnauthorizedRating   = errors.New("unauthorized access to booking rating")
	ErrDuplicateReview      = errors.New("review has already been submitted for this booking")
	ErrUnauthorizedUpdate   = errors.New("unauthorized: only original reviewer can update this review")
)

type RatingReview struct {
	ID             uuid.UUID `json:"id"`
	BookingID      uuid.UUID `json:"booking_id"`
	TripID         uuid.UUID `json:"trip_id"`
	ReviewerUserID uuid.UUID `json:"reviewer_user_id"`
	RevieweeUserID uuid.UUID `json:"reviewee_user_id"`
	Rating         int       `json:"rating"`
	Review         string    `json:"review,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type PublicReviewerInfo struct {
	ID       uuid.UUID `json:"id"`
	FullName string    `json:"full_name"`
}

type ReviewResponse struct {
	ID        uuid.UUID          `json:"id"`
	BookingID uuid.UUID          `json:"booking_id"`
	TripID    uuid.UUID          `json:"trip_id"`
	Rating    int                `json:"rating"`
	Review    string             `json:"review,omitempty"`
	Reviewer  PublicReviewerInfo `json:"reviewer"`
	CreatedAt time.Time          `json:"created_at"`
}

type DriverRatingSummary struct {
	DriverID      uuid.UUID `json:"driver_id"`
	AverageRating float64   `json:"average_rating"`
	TotalRatings  int       `json:"total_ratings"`
}

type PaginatedReviews struct {
	Data       []*ReviewResponse `json:"data"`
	Page       int               `json:"page"`
	Limit      int               `json:"limit"`
	Total      int               `json:"total"`
	TotalPages int               `json:"total_pages"`
}
