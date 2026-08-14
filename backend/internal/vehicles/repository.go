package vehicles

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Vehicle struct {
	ID                 uuid.UUID `json:"id"`
	DriverID           uuid.UUID `json:"driver_id"`
	VehicleType        string    `json:"vehicle_type"`
	Make               string    `json:"make"`
	Model              string    `json:"model"`
	ManufactureYear    *int      `json:"manufacture_year,omitempty"`
	RegistrationNumber string    `json:"registration_number"`
	TotalSeats         int       `json:"total_seats"`
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, vehicle *Vehicle) error {
	query := `
		INSERT INTO vehicles (
			driver_id,
			vehicle_type,
			make,
			model,
			manufacture_year,
			registration_number,
			total_seats
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING
			id,
			driver_id,
			vehicle_type,
			make,
			model,
			manufacture_year,
			registration_number,
			total_seats
	`

	err := r.db.QueryRow(
		ctx,
		query,
		vehicle.DriverID,
		vehicle.VehicleType,
		vehicle.Make,
		vehicle.Model,
		vehicle.ManufactureYear,
		vehicle.RegistrationNumber,
		vehicle.TotalSeats,
	).Scan(
		&vehicle.ID,
		&vehicle.DriverID,
		&vehicle.VehicleType,
		&vehicle.Make,
		&vehicle.Model,
		&vehicle.ManufactureYear,
		&vehicle.RegistrationNumber,
		&vehicle.TotalSeats,
	)

	if err != nil {
		return fmt.Errorf("failed to create vehicle: %w", err)
	}

	return nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Vehicle, error) {
	query := `
		SELECT
			id,
			driver_id,
			vehicle_type,
			make,
			model,
			manufacture_year,
			registration_number,
			total_seats
		FROM vehicles
		WHERE id = $1
	`

	vehicle := &Vehicle{}

	err := r.db.QueryRow(ctx, query, id).Scan(
		&vehicle.ID,
		&vehicle.DriverID,
		&vehicle.VehicleType,
		&vehicle.Make,
		&vehicle.Model,
		&vehicle.ManufactureYear,
		&vehicle.RegistrationNumber,
		&vehicle.TotalSeats,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get vehicle: %w", err)
	}

	return vehicle, nil
}
