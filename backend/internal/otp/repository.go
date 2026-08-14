package otp

import (
	"context"
	"errors"
	"fmt"
	"time"

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

func (r *Repository) CreateOTP(ctx context.Context, userID uuid.UUID, bookingID *uuid.UUID, purpose, otpCode string, expiryDuration time.Duration) (*OTPVerification, error) {
	// Verify user exists
	var userExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&userExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	// Rate limit check: verify if an unexpired unverified OTP was generated within last 30 seconds
	var recentCount int
	err = r.db.QueryRow(
		ctx,
		`SELECT COUNT(*) FROM otp_verifications
		 WHERE user_id = $1 AND purpose = $2 AND created_at > NOW() - INTERVAL '30 seconds'`,
		userID,
		purpose,
	).Scan(&recentCount)
	if err == nil && recentCount > 0 {
		return nil, ErrRateLimitExceeded
	}

	otpHash := HashOTP(otpCode)
	expiresAt := time.Now().UTC().Add(expiryDuration)

	query := `
		INSERT INTO otp_verifications (user_id, booking_id, otp_hash, purpose, expires_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, user_id, booking_id, otp_hash, purpose, expires_at, verified_at, attempts, max_attempts, created_at
	`

	rec := &OTPVerification{}
	err = r.db.QueryRow(ctx, query, userID, bookingID, otpHash, purpose, expiresAt).Scan(
		&rec.ID,
		&rec.UserID,
		&rec.BookingID,
		&rec.OTPHash,
		&rec.Purpose,
		&rec.ExpiresAt,
		&rec.VerifiedAt,
		&rec.Attempts,
		&rec.MaxAttempts,
		&rec.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to store OTP verification: %w", err)
	}

	return rec, nil
}

func (r *Repository) VerifyOTP(ctx context.Context, userID uuid.UUID, otpCode, purpose string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Fetch latest unverified OTP for user and purpose FOR UPDATE
	query := `
		SELECT id, otp_hash, expires_at, verified_at, attempts, max_attempts
		FROM otp_verifications
		WHERE user_id = $1 AND purpose = $2 AND verified_at IS NULL
		ORDER BY created_at DESC
		LIMIT 1
		FOR UPDATE
	`

	var (
		id          uuid.UUID
		otpHash     string
		expiresAt   time.Time
		verifiedAt  *time.Time
		attempts    int
		maxAttempts int
	)

	err = tx.QueryRow(ctx, query, userID, purpose).Scan(&id, &otpHash, &expiresAt, &verifiedAt, &attempts, &maxAttempts)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrOTPNotFound
		}
		return fmt.Errorf("failed to fetch OTP record: %w", err)
	}

	now := time.Now().UTC()

	// 1. Check if already verified
	if verifiedAt != nil {
		return ErrOTPAlreadyVerified
	}

	// 2. Check max attempts
	if attempts >= maxAttempts {
		return ErrOTPMaxAttemptsExceeded
	}

	// 3. Check expiry
	if now.After(expiresAt) {
		return ErrOTPExpired
	}

	// 4. Verify OTP hash match
	if !VerifyHash(otpCode, otpHash) {
		// Increment attempts
		_, _ = tx.Exec(ctx, `UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1`, id)
		_ = tx.Commit(ctx)

		if attempts+1 >= maxAttempts {
			return ErrOTPMaxAttemptsExceeded
		}
		return ErrInvalidOTP
	}

	// 5. Success! Mark verified
	_, err = tx.Exec(ctx, `UPDATE otp_verifications SET verified_at = NOW(), attempts = attempts + 1 WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("failed to update verified status: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *Repository) VerifyBookingRideOTP(ctx context.Context, userID, bookingID uuid.UUID, otpCode string) error {
	// 1. Verify booking exists and belongs to user
	var (
		actualUserID  uuid.UUID
		bookingStatus string
	)
	err := r.db.QueryRow(ctx, `SELECT user_id, booking_status FROM bookings WHERE id = $1`, bookingID).Scan(&actualUserID, &bookingStatus)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrBookingNotFound
		}
		return fmt.Errorf("failed to fetch booking: %w", err)
	}

	if actualUserID != userID {
		return ErrUnauthorizedRideVerify
	}

	if bookingStatus != "confirmed" && bookingStatus != "completed" {
		return ErrBookingNotConfirmed
	}

	// 2. Verify OTP for user with purpose 'ride_start'
	return r.VerifyOTP(ctx, userID, otpCode, "ride_start")
}
