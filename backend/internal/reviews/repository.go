package reviews

import (
	"context"
	"errors"
	"fmt"
	"math"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreatePassengerRating(ctx context.Context, bookingID, passengerUserID uuid.UUID, rating int, review string) (*RatingReview, uuid.UUID, error) {
	if rating < 1 || rating > 5 {
		return nil, uuid.Nil, ErrInvalidRating
	}

	review = strings.TrimSpace(review)
	if len(review) > 1000 {
		return nil, uuid.Nil, ErrReviewTooLong
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	queryBooking := `
		SELECT 
			b.user_id, b.trip_id, t.trip_status, d.user_id as driver_user_id
		FROM bookings b
		JOIN trips t ON b.trip_id = t.id
		JOIN drivers d ON t.driver_id = d.id
		WHERE b.id = $1
		FOR UPDATE
	`

	var (
		actualPassengerID uuid.UUID
		tripID            uuid.UUID
		tripStatus        string
		driverUserID      uuid.UUID
	)

	err = tx.QueryRow(ctx, queryBooking, bookingID).Scan(&actualPassengerID, &tripID, &tripStatus, &driverUserID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, uuid.Nil, ErrBookingNotFound
		}
		return nil, uuid.Nil, fmt.Errorf("failed to fetch booking for rating: %w", err)
	}

	if actualPassengerID != passengerUserID {
		return nil, uuid.Nil, ErrUnauthorizedRating
	}

	if passengerUserID == driverUserID {
		return nil, uuid.Nil, ErrSelfReviewNotAllowed
	}

	if tripStatus != "completed" {
		return nil, uuid.Nil, ErrTripNotCompleted
	}

	var existingCount int
	err = tx.QueryRow(ctx, `SELECT COUNT(*) FROM ratings_reviews WHERE booking_id = $1 AND reviewer_user_id = $2`, bookingID, passengerUserID).Scan(&existingCount)
	if err == nil && existingCount > 0 {
		return nil, uuid.Nil, ErrDuplicateReview
	}

	rec := &RatingReview{}
	queryInsert := `
		INSERT INTO ratings_reviews (booking_id, trip_id, reviewer_user_id, reviewee_user_id, rating, review)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, booking_id, trip_id, reviewer_user_id, reviewee_user_id, rating, COALESCE(review, ''), created_at, updated_at
	`

	err = tx.QueryRow(ctx, queryInsert, bookingID, tripID, passengerUserID, driverUserID, rating, review).Scan(
		&rec.ID,
		&rec.BookingID,
		&rec.TripID,
		&rec.ReviewerUserID,
		&rec.RevieweeUserID,
		&rec.Rating,
		&rec.Review,
		&rec.CreatedAt,
		&rec.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique_booking_reviewer") {
			return nil, uuid.Nil, ErrDuplicateReview
		}
		return nil, uuid.Nil, fmt.Errorf("failed to insert rating: %w", err)
	}

	updateDriverRatingQuery := `
		UPDATE drivers
		SET average_rating = (
			SELECT COALESCE(ROUND(AVG(rr.rating)::numeric, 2), 0.00)
			FROM ratings_reviews rr
			WHERE rr.reviewee_user_id = drivers.user_id
		),
		updated_at = NOW()
		WHERE user_id = $1
	`
	_, _ = tx.Exec(ctx, updateDriverRatingQuery, driverUserID)

	if err := tx.Commit(ctx); err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to commit rating transaction: %w", err)
	}

	return rec, driverUserID, nil
}

func (r *Repository) CreateDriverRating(ctx context.Context, bookingID, driverID uuid.UUID, rating int, review string) (*RatingReview, uuid.UUID, error) {
	if rating < 1 || rating > 5 {
		return nil, uuid.Nil, ErrInvalidRating
	}

	review = strings.TrimSpace(review)
	if len(review) > 1000 {
		return nil, uuid.Nil, ErrReviewTooLong
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	queryBooking := `
		SELECT 
			b.user_id as passenger_user_id, b.trip_id, t.trip_status, d.user_id as driver_user_id, t.driver_id as actual_driver_id
		FROM bookings b
		JOIN trips t ON b.trip_id = t.id
		JOIN drivers d ON t.driver_id = d.id
		WHERE b.id = $1
		FOR UPDATE
	`

	var (
		passengerUserID uuid.UUID
		tripID          uuid.UUID
		tripStatus      string
		driverUserID    uuid.UUID
		actualDriverID  uuid.UUID
	)

	err = tx.QueryRow(ctx, queryBooking, bookingID).Scan(&passengerUserID, &tripID, &tripStatus, &driverUserID, &actualDriverID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, uuid.Nil, ErrBookingNotFound
		}
		return nil, uuid.Nil, fmt.Errorf("failed to fetch booking for driver rating: %w", err)
	}

	if actualDriverID != driverID {
		return nil, uuid.Nil, ErrUnauthorizedRating
	}

	if driverUserID == passengerUserID {
		return nil, uuid.Nil, ErrSelfReviewNotAllowed
	}

	if tripStatus != "completed" {
		return nil, uuid.Nil, ErrTripNotCompleted
	}

	var existingCount int
	err = tx.QueryRow(ctx, `SELECT COUNT(*) FROM ratings_reviews WHERE booking_id = $1 AND reviewer_user_id = $2`, bookingID, driverUserID).Scan(&existingCount)
	if err == nil && existingCount > 0 {
		return nil, uuid.Nil, ErrDuplicateReview
	}

	rec := &RatingReview{}
	queryInsert := `
		INSERT INTO ratings_reviews (booking_id, trip_id, reviewer_user_id, reviewee_user_id, rating, review)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, booking_id, trip_id, reviewer_user_id, reviewee_user_id, rating, COALESCE(review, ''), created_at, updated_at
	`

	err = tx.QueryRow(ctx, queryInsert, bookingID, tripID, driverUserID, passengerUserID, rating, review).Scan(
		&rec.ID,
		&rec.BookingID,
		&rec.TripID,
		&rec.ReviewerUserID,
		&rec.RevieweeUserID,
		&rec.Rating,
		&rec.Review,
		&rec.CreatedAt,
		&rec.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique_booking_reviewer") {
			return nil, uuid.Nil, ErrDuplicateReview
		}
		return nil, uuid.Nil, fmt.Errorf("failed to insert driver rating: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, uuid.Nil, fmt.Errorf("failed to commit rating transaction: %w", err)
	}

	return rec, passengerUserID, nil
}

func (r *Repository) GetDriverRatingSummary(ctx context.Context, driverID uuid.UUID) (*DriverRatingSummary, error) {
	var driverUserID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT user_id FROM drivers WHERE id = $1`, driverID).Scan(&driverUserID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrDriverNotFound
		}
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}

	query := `
		SELECT 
			COALESCE(AVG(rating), 0.0),
			COUNT(*)
		FROM ratings_reviews
		WHERE reviewee_user_id = $1
	`

	var (
		avgRating float64
		total     int
	)

	err = r.db.QueryRow(ctx, query, driverUserID).Scan(&avgRating, &total)
	if err != nil {
		return nil, fmt.Errorf("failed to calculate driver summary: %w", err)
	}

	roundedAvg := math.Round(avgRating*100) / 100

	return &DriverRatingSummary{
		DriverID:      driverID,
		AverageRating: roundedAvg,
		TotalRatings:  total,
	}, nil
}

func (r *Repository) GetDriverReviews(ctx context.Context, driverID uuid.UUID, page, limit int) (*PaginatedReviews, error) {
	var driverUserID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT user_id FROM drivers WHERE id = $1`, driverID).Scan(&driverUserID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrDriverNotFound
		}
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}

	return r.getReviewsByReviewee(ctx, driverUserID, page, limit)
}

func (r *Repository) GetUserReviews(ctx context.Context, userID uuid.UUID, page, limit int) (*PaginatedReviews, error) {
	var userExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&userExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	return r.getReviewsByReviewer(ctx, userID, page, limit)
}

func (r *Repository) getReviewsByReviewee(ctx context.Context, revieweeUserID uuid.UUID, page, limit int) (*PaginatedReviews, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit

	var total int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM ratings_reviews WHERE reviewee_user_id = $1`, revieweeUserID).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count reviews: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	query := `
		SELECT 
			rr.id, rr.booking_id, rr.trip_id, rr.rating, COALESCE(rr.review, ''), rr.created_at,
			u.id, u.full_name
		FROM ratings_reviews rr
		JOIN users u ON rr.reviewer_user_id = u.id
		WHERE rr.reviewee_user_id = $1
		ORDER BY rr.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, revieweeUserID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query reviews: %w", err)
	}
	defer rows.Close()

	var reviews []*ReviewResponse
	for rows.Next() {
		rev := &ReviewResponse{}
		err := rows.Scan(
			&rev.ID,
			&rev.BookingID,
			&rev.TripID,
			&rev.Rating,
			&rev.Review,
			&rev.CreatedAt,
			&rev.Reviewer.ID,
			&rev.Reviewer.FullName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan review: %w", err)
		}
		reviews = append(reviews, rev)
	}

	if reviews == nil {
		reviews = []*ReviewResponse{}
	}

	return &PaginatedReviews{
		Data:       reviews,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) getReviewsByReviewer(ctx context.Context, reviewerUserID uuid.UUID, page, limit int) (*PaginatedReviews, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	offset := (page - 1) * limit

	var total int
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM ratings_reviews WHERE reviewer_user_id = $1`, reviewerUserID).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count reviewer reviews: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	query := `
		SELECT 
			rr.id, rr.booking_id, rr.trip_id, rr.rating, COALESCE(rr.review, ''), rr.created_at,
			u.id, u.full_name
		FROM ratings_reviews rr
		JOIN users u ON rr.reviewer_user_id = u.id
		WHERE rr.reviewer_user_id = $1
		ORDER BY rr.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, reviewerUserID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query reviewer reviews: %w", err)
	}
	defer rows.Close()

	var reviews []*ReviewResponse
	for rows.Next() {
		rev := &ReviewResponse{}
		err := rows.Scan(
			&rev.ID,
			&rev.BookingID,
			&rev.TripID,
			&rev.Rating,
			&rev.Review,
			&rev.CreatedAt,
			&rev.Reviewer.ID,
			&rev.Reviewer.FullName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reviewer review: %w", err)
		}
		reviews = append(reviews, rev)
	}

	if reviews == nil {
		reviews = []*ReviewResponse{}
	}

	return &PaginatedReviews{
		Data:       reviews,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) UpdateReview(ctx context.Context, ratingID, reviewerUserID uuid.UUID, newRating int, newReview string) (*RatingReview, error) {
	if newRating < 1 || newRating > 5 {
		return nil, ErrInvalidRating
	}

	newReview = strings.TrimSpace(newReview)
	if len(newReview) > 1000 {
		return nil, ErrReviewTooLong
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var actualReviewerID uuid.UUID
	err = tx.QueryRow(ctx, `SELECT reviewer_user_id FROM ratings_reviews WHERE id = $1 FOR UPDATE`, ratingID).Scan(&actualReviewerID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrRatingNotFound
		}
		return nil, fmt.Errorf("failed to fetch rating: %w", err)
	}

	if actualReviewerID != reviewerUserID {
		return nil, ErrUnauthorizedUpdate
	}

	rec := &RatingReview{}
	query := `
		UPDATE ratings_reviews
		SET rating = $1, review = $2, updated_at = NOW()
		WHERE id = $3
		RETURNING id, booking_id, trip_id, reviewer_user_id, reviewee_user_id, rating, COALESCE(review, ''), created_at, updated_at
	`

	err = tx.QueryRow(ctx, query, newRating, newReview, ratingID).Scan(
		&rec.ID,
		&rec.BookingID,
		&rec.TripID,
		&rec.ReviewerUserID,
		&rec.RevieweeUserID,
		&rec.Rating,
		&rec.Review,
		&rec.CreatedAt,
		&rec.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update rating: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit review update: %w", err)
	}

	return rec, nil
}
