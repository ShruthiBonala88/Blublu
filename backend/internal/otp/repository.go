package otp

import (
	"context"
	"errors"
	"fmt"
	"strings"
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

// GetOrCreateUserByPhone finds a user by phone number or creates a new passenger record if not found.
func (r *Repository) GetOrCreateUserByPhone(ctx context.Context, phone string) (uuid.UUID, error) {
	phone = strings.TrimSpace(phone)
	if phone == "" {
		return uuid.Nil, errors.New("phone number cannot be empty")
	}

	var userID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT id FROM users WHERE phone = $1`, phone).Scan(&userID)
	if err == nil {
		return userID, nil
	}

	// Not found, create user
	newID := uuid.New()
	fullName := "User " + phone[max(0, len(phone)-4):]
	_, err = r.db.Exec(
		ctx,
		`INSERT INTO users (id, full_name, phone, role, is_phone_verified, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, 'passenger', false, true, NOW(), NOW())
		 ON CONFLICT (phone) DO UPDATE SET updated_at = NOW() RETURNING id`,
		newID,
		fullName,
		phone,
	)
	if err != nil {
		// Fallback query if conflict or already inserted
		err = r.db.QueryRow(ctx, `SELECT id FROM users WHERE phone = $1`, phone).Scan(&userID)
		if err != nil {
			return uuid.Nil, fmt.Errorf("failed to create user for phone %s: %w", phone, err)
		}
		return userID, nil
	}

	return newID, nil
}

func (r *Repository) CreateOTPByPhone(ctx context.Context, phone, purpose, otpCode string, expiryDuration time.Duration) (*OTPVerification, error) {
	userID, err := r.GetOrCreateUserByPhone(ctx, phone)
	if err != nil {
		return nil, err
	}
	return r.CreateOTP(ctx, userID, nil, purpose, otpCode, expiryDuration)
}

func (r *Repository) VerifyOTPByPhone(ctx context.Context, phone, otpCode, purpose string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT id FROM users WHERE phone = $1`, phone).Scan(&userID)
	if err != nil {
		return uuid.Nil, ErrUserNotFound
	}

	err = r.VerifyOTP(ctx, userID, otpCode, purpose)
	if err != nil {
		return uuid.Nil, err
	}

	// Mark phone as verified
	_, _ = r.db.Exec(ctx, `UPDATE users SET is_phone_verified = true, updated_at = NOW() WHERE id = $1`, userID)

	return userID, nil
}

// GetOrCreateUserByEmail finds a user by email or creates a new record if not found.
func (r *Repository) GetOrCreateUserByEmail(ctx context.Context, email string) (uuid.UUID, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" {
		return uuid.Nil, errors.New("email cannot be empty")
	}

	var userID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT id FROM users WHERE email = $1`, email).Scan(&userID)
	if err == nil {
		return userID, nil
	}

	// Not found, create user
	newID := uuid.New()
	parts := strings.Split(email, "@")
	fullName := parts[0]
	_, err = r.db.Exec(
		ctx,
		`INSERT INTO users (id, full_name, email, role, is_phone_verified, is_active, created_at, updated_at)
		 VALUES ($1, $2, $3, 'passenger', true, true, NOW(), NOW())
		 ON CONFLICT (email) DO UPDATE SET updated_at = NOW() RETURNING id`,
		newID,
		fullName,
		email,
	)
	if err != nil {
		err = r.db.QueryRow(ctx, `SELECT id FROM users WHERE email = $1`, email).Scan(&userID)
		if err != nil {
			return uuid.Nil, fmt.Errorf("failed to create user for email %s: %w", email, err)
		}
		return userID, nil
	}

	return newID, nil
}

func (r *Repository) CreateOTPByEmail(ctx context.Context, email, purpose, otpCode string, expiryDuration time.Duration) (*OTPVerification, error) {
	userID, err := r.GetOrCreateUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return r.CreateOTP(ctx, userID, nil, purpose, otpCode, expiryDuration)
}

func (r *Repository) VerifyOTPByEmail(ctx context.Context, email, otpCode, purpose string) (uuid.UUID, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	var userID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT id FROM users WHERE email = $1`, email).Scan(&userID)
	if err != nil {
		return uuid.Nil, ErrUserNotFound
	}

	err = r.VerifyOTP(ctx, userID, otpCode, purpose)
	if err != nil {
		return uuid.Nil, err
	}

	return userID, nil
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
