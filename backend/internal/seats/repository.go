package seats

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type VehicleSeat struct {
	ID           uuid.UUID `json:"id"`
	VehicleID    uuid.UUID `json:"vehicle_id"`
	SeatNumber   int       `json:"seat_number"`
	SeatPosition string    `json:"seat_position"`
	IsWindowSeat bool      `json:"is_window_seat"`
	IsAvailable  bool      `json:"is_available"`
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(
	ctx context.Context,
	seat *VehicleSeat,
) error {
	query := `
		INSERT INTO vehicle_seats (
			vehicle_id,
			seat_number,
			seat_position,
			is_window_seat,
			is_available
		)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING
			id,
			vehicle_id,
			seat_number,
			seat_position,
			is_window_seat,
			is_available
	`

	err := r.db.QueryRow(
		ctx,
		query,
		seat.VehicleID,
		seat.SeatNumber,
		seat.SeatPosition,
		seat.IsWindowSeat,
		seat.IsAvailable,
	).Scan(
		&seat.ID,
		&seat.VehicleID,
		&seat.SeatNumber,
		&seat.SeatPosition,
		&seat.IsWindowSeat,
		&seat.IsAvailable,
	)

	if err != nil {
		return fmt.Errorf("failed to create vehicle seat: %w", err)
	}

	return nil
}

func (r *Repository) GetByID(
	ctx context.Context,
	id uuid.UUID,
) (*VehicleSeat, error) {
	query := `
		SELECT
			id,
			vehicle_id,
			seat_number,
			seat_position,
			is_window_seat,
			is_available
		FROM vehicle_seats
		WHERE id = $1
	`

	seat := &VehicleSeat{}

	err := r.db.QueryRow(
		ctx,
		query,
		id,
	).Scan(
		&seat.ID,
		&seat.VehicleID,
		&seat.SeatNumber,
		&seat.SeatPosition,
		&seat.IsWindowSeat,
		&seat.IsAvailable,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get vehicle seat: %w", err)
	}

	return seat, nil
}

func (r *Repository) ListByVehicle(
	ctx context.Context,
	vehicleID uuid.UUID,
) ([]*VehicleSeat, error) {
	query := `
		SELECT
			id,
			vehicle_id,
			seat_number,
			seat_position,
			is_window_seat,
			is_available
		FROM vehicle_seats
		WHERE vehicle_id = $1
		ORDER BY seat_number
	`

	rows, err := r.db.Query(ctx, query, vehicleID)
	if err != nil {
		return nil, fmt.Errorf("failed to list vehicle seats: %w", err)
	}
	defer rows.Close()

	var seats []*VehicleSeat

	for rows.Next() {
		seat := &VehicleSeat{}

		if err := rows.Scan(
			&seat.ID,
			&seat.VehicleID,
			&seat.SeatNumber,
			&seat.SeatPosition,
			&seat.IsWindowSeat,
			&seat.IsAvailable,
		); err != nil {
			return nil, fmt.Errorf("failed to scan vehicle seat: %w", err)
		}

		seats = append(seats, seat)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to read vehicle seats: %w", err)
	}

	return seats, nil
}
