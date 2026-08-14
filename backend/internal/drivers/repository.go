package drivers

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Driver struct {
	ID                 uuid.UUID `json:"id"`
	UserID             uuid.UUID `json:"user_id"`
	LicenseNumber      string    `json:"license_number"`
	LicenseExpiryDate  time.Time `json:"license_expiry_date"`
	VerificationStatus string    `json:"verification_status"`
	IsVerified         bool      `json:"is_verified"`
	TotalRides         int       `json:"total_rides"`
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, driver *Driver) error {
	query := `
		INSERT INTO drivers (
			user_id,
			license_number,
			license_expiry_date
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			user_id,
			license_number,
			license_expiry_date,
			verification_status,
			is_verified,
			total_rides
	`

	err := r.db.QueryRow(
		ctx,
		query,
		driver.UserID,
		driver.LicenseNumber,
		driver.LicenseExpiryDate,
	).Scan(
		&driver.ID,
		&driver.UserID,
		&driver.LicenseNumber,
		&driver.LicenseExpiryDate,
		&driver.VerificationStatus,
		&driver.IsVerified,
		&driver.TotalRides,
	)

	if err != nil {
		return fmt.Errorf("failed to create driver: %w", err)
	}

	return nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Driver, error) {
	query := `
		SELECT
			id,
			user_id,
			license_number,
			license_expiry_date,
			verification_status,
			is_verified,
			total_rides
		FROM drivers
		WHERE id = $1
	`

	driver := &Driver{}

	err := r.db.QueryRow(ctx, query, id).Scan(
		&driver.ID,
		&driver.UserID,
		&driver.LicenseNumber,
		&driver.LicenseExpiryDate,
		&driver.VerificationStatus,
		&driver.IsVerified,
		&driver.TotalRides,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get driver: %w", err)
	}

	return driver, nil
}
