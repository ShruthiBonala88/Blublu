package trips

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrTripNotFound             = errors.New("trip not found")
	ErrSeatNotFound             = errors.New("seat not found")
	ErrSeatBelongsToAnotherTrip = errors.New("seat belongs to another trip")
	ErrSeatBooked               = errors.New("seat is already booked")
	ErrSeatLocked               = errors.New("seat is currently locked by another user")
	ErrNoSeatsAvailable         = errors.New("no available seats on this trip")
	ErrDriverNotFound           = errors.New("driver not found")
	ErrDriverNotVerified        = errors.New("driver is not verified")
	ErrUnauthorizedDriver       = errors.New("unauthorized: trip does not belong to driver")
	ErrInvalidStateTransition   = errors.New("invalid trip state transition")
)

type LockSeatResponse struct {
	TripSeatID    uuid.UUID `json:"trip_seat_id"`
	TripID        uuid.UUID `json:"trip_id"`
	VehicleSeatID uuid.UUID `json:"vehicle_seat_id"`
	SeatStatus    string    `json:"seat_status"`
	LockedUntil   time.Time `json:"locked_until"`
}

type Trip struct {
	ID                   uuid.UUID  `json:"id"`
	DriverID             uuid.UUID  `json:"driver_id"`
	VehicleID            uuid.UUID  `json:"vehicle_id"`
	OriginName           string     `json:"origin_name"`
	DestinationName      string     `json:"destination_name"`
	OriginLatitude       float64    `json:"origin_latitude"`
	OriginLongitude      float64    `json:"origin_longitude"`
	DestinationLatitude  float64    `json:"destination_latitude"`
	DestinationLongitude float64    `json:"destination_longitude"`
	DepartureTime        time.Time  `json:"departure_time"`
	EstimatedArrivalTime *time.Time `json:"estimated_arrival_time,omitempty"`
	DistanceMeters       int64      `json:"distance_meters"`
	DurationSeconds      int64      `json:"duration_seconds"`
	TotalSeats           int        `json:"total_seats"`
	AvailableSeats       int        `json:"available_seats"`
	PricePerSeat         float64    `json:"price_per_seat"`
	TripStatus           string     `json:"trip_status,omitempty"`
	Notes                string     `json:"notes,omitempty"`
	CancellationReason   string     `json:"cancellation_reason,omitempty"`
	CreatedAt            time.Time  `json:"created_at,omitempty"`
	UpdatedAt            time.Time  `json:"updated_at,omitempty"`
}

type TripSeat struct {
	ID            uuid.UUID  `json:"id"`
	TripID        uuid.UUID  `json:"trip_id"`
	VehicleSeatID uuid.UUID  `json:"vehicle_seat_id"`
	SeatStatus    string     `json:"seat_status"`
	LockedUntil   *time.Time `json:"locked_until,omitempty"`
	CreatedAt     time.Time  `json:"created_at,omitempty"`
	UpdatedAt     time.Time  `json:"updated_at,omitempty"`
	SeatNumber    int        `json:"seat_number,omitempty"`
	SeatPosition  string     `json:"seat_position,omitempty"`
	IsWindowSeat  bool       `json:"is_window_seat,omitempty"`
}

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, trip *Trip) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Verify driver exists
	var driverExists bool
	err = tx.QueryRow(
		ctx,
		`SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`,
		trip.DriverID,
	).Scan(&driverExists)
	if err != nil {
		return fmt.Errorf("failed to verify driver: %w", err)
	}
	if !driverExists {
		return fmt.Errorf("driver not found")
	}

	// 2. Verify vehicle exists and get total_seats
	var totalSeats int
	err = tx.QueryRow(
		ctx,
		`SELECT total_seats FROM vehicles WHERE id = $1`,
		trip.VehicleID,
	).Scan(&totalSeats)
	if err != nil {
		return fmt.Errorf("failed to get vehicle seat capacity: %w", err)
	}

	trip.TotalSeats = totalSeats
	trip.AvailableSeats = totalSeats
	if trip.TripStatus == "" {
		trip.TripStatus = "scheduled"
	}

	query := `
		INSERT INTO trips (
			driver_id,
			vehicle_id,
			origin_name,
			destination_name,
			origin_location,
			destination_location,
			departure_time,
			estimated_arrival_time,
			distance_meters,
			duration_seconds,
			total_seats,
			available_seats,
			price_per_seat,
			trip_status,
			notes
		)
		VALUES (
			$1,
			$2,
			$3,
			$4,
			ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography,
			ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
			$9,
			$10,
			$11,
			$12,
			$13,
			$14,
			$15,
			$16,
			$17
		)
		RETURNING
			id,
			driver_id,
			vehicle_id,
			origin_name,
			destination_name,
			departure_time,
			estimated_arrival_time,
			distance_meters,
			duration_seconds,
			total_seats,
			available_seats,
			price_per_seat,
			trip_status,
			notes,
			created_at,
			updated_at
	`

	err = tx.QueryRow(
		ctx,
		query,
		trip.DriverID,
		trip.VehicleID,
		trip.OriginName,
		trip.DestinationName,
		trip.OriginLongitude,
		trip.OriginLatitude,
		trip.DestinationLongitude,
		trip.DestinationLatitude,
		trip.DepartureTime,
		trip.EstimatedArrivalTime,
		trip.DistanceMeters,
		trip.DurationSeconds,
		trip.TotalSeats,
		trip.AvailableSeats,
		trip.PricePerSeat,
		trip.TripStatus,
		trip.Notes,
	).Scan(
		&trip.ID,
		&trip.DriverID,
		&trip.VehicleID,
		&trip.OriginName,
		&trip.DestinationName,
		&trip.DepartureTime,
		&trip.EstimatedArrivalTime,
		&trip.DistanceMeters,
		&trip.DurationSeconds,
		&trip.TotalSeats,
		&trip.AvailableSeats,
		&trip.PricePerSeat,
		&trip.TripStatus,
		&trip.Notes,
		&trip.CreatedAt,
		&trip.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create trip: %w", err)
	}

	// 3. Read vehicle_seats for vehicle_id and create corresponding trip_seats records
	rows, err := tx.Query(
		ctx,
		`SELECT id FROM vehicle_seats WHERE vehicle_id = $1`,
		trip.VehicleID,
	)
	if err != nil {
		return fmt.Errorf("failed to fetch vehicle seats: %w", err)
	}

	var vehicleSeatIDs []uuid.UUID
	for rows.Next() {
		var vsID uuid.UUID
		if err := rows.Scan(&vsID); err != nil {
			rows.Close()
			return fmt.Errorf("failed to scan vehicle seat id: %w", err)
		}
		vehicleSeatIDs = append(vehicleSeatIDs, vsID)
	}
	rows.Close()

	for _, vsID := range vehicleSeatIDs {
		_, err := tx.Exec(
			ctx,
			`INSERT INTO trip_seats (trip_id, vehicle_seat_id, seat_status)
			 VALUES ($1, $2, 'available')
			 ON CONFLICT (trip_id, vehicle_seat_id) DO NOTHING`,
			trip.ID,
			vsID,
		)
		if err != nil {
			return fmt.Errorf("failed to create trip seat: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *Repository) GetByID(ctx context.Context, id uuid.UUID) (*Trip, error) {
	query := `
		SELECT
			id,
			driver_id,
			vehicle_id,
			origin_name,
			destination_name,
			ST_Y(origin_location::geometry),
			ST_X(origin_location::geometry),
			ST_Y(destination_location::geometry),
			ST_X(destination_location::geometry),
			departure_time,
			estimated_arrival_time,
			distance_meters,
			duration_seconds,
			total_seats,
			available_seats,
			price_per_seat,
			trip_status,
			COALESCE(notes, ''),
			created_at,
			updated_at
		FROM trips
		WHERE id = $1
	`

	trip := &Trip{}

	err := r.db.QueryRow(ctx, query, id).Scan(
		&trip.ID,
		&trip.DriverID,
		&trip.VehicleID,
		&trip.OriginName,
		&trip.DestinationName,
		&trip.OriginLatitude,
		&trip.OriginLongitude,
		&trip.DestinationLatitude,
		&trip.DestinationLongitude,
		&trip.DepartureTime,
		&trip.EstimatedArrivalTime,
		&trip.DistanceMeters,
		&trip.DurationSeconds,
		&trip.TotalSeats,
		&trip.AvailableSeats,
		&trip.PricePerSeat,
		&trip.TripStatus,
		&trip.Notes,
		&trip.CreatedAt,
		&trip.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to get trip: %w", err)
	}

	return trip, nil
}

func (r *Repository) GetSeatsByTripID(ctx context.Context, tripID uuid.UUID) ([]*TripSeat, error) {
	query := `
		SELECT
			ts.id,
			ts.trip_id,
			ts.vehicle_seat_id,
			ts.seat_status,
			ts.locked_until,
			ts.created_at,
			ts.updated_at,
			vs.seat_number,
			vs.seat_position,
			vs.is_window_seat
		FROM trip_seats ts
		JOIN vehicle_seats vs ON ts.vehicle_seat_id = vs.id
		WHERE ts.trip_id = $1
		ORDER BY vs.seat_number
	`

	rows, err := r.db.Query(ctx, query, tripID)
	if err != nil {
		return nil, fmt.Errorf("failed to query trip seats: %w", err)
	}
	defer rows.Close()

	now := time.Now().UTC()
	var tripSeats []*TripSeat
	for rows.Next() {
		ts := &TripSeat{}
		err := rows.Scan(
			&ts.ID,
			&ts.TripID,
			&ts.VehicleSeatID,
			&ts.SeatStatus,
			&ts.LockedUntil,
			&ts.CreatedAt,
			&ts.UpdatedAt,
			&ts.SeatNumber,
			&ts.SeatPosition,
			&ts.IsWindowSeat,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trip seat: %w", err)
		}
		if ts.SeatStatus == "locked" && ts.LockedUntil != nil && !ts.LockedUntil.After(now) {
			ts.SeatStatus = "available"
			ts.LockedUntil = nil
		}
		tripSeats = append(tripSeats, ts)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading trip seats: %w", err)
	}

	return tripSeats, nil
}

func (r *Repository) LockSeat(ctx context.Context, tripID, seatID, userID uuid.UUID, lockDuration time.Duration) (*LockSeatResponse, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Verify trip exists and lock trip row for update
	var availableSeats int
	err = tx.QueryRow(
		ctx,
		`SELECT available_seats FROM trips WHERE id = $1 FOR UPDATE`,
		tripID,
	).Scan(&availableSeats)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTripNotFound
		}
		return nil, fmt.Errorf("failed to fetch trip: %w", err)
	}

	// 2. Fetch and lock trip_seat row for update
	var (
		tsID          uuid.UUID
		actualTripID  uuid.UUID
		vehicleSeatID uuid.UUID
		seatStatus    string
		lockedUntil   *time.Time
		lockedBy      *uuid.UUID
	)

	err = tx.QueryRow(
		ctx,
		`SELECT id, trip_id, vehicle_seat_id, seat_status, locked_until, locked_by
		 FROM trip_seats
		 WHERE id = $1 FOR UPDATE`,
		seatID,
	).Scan(&tsID, &actualTripID, &vehicleSeatID, &seatStatus, &lockedUntil, &lockedBy)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrSeatNotFound
		}
		return nil, fmt.Errorf("failed to fetch trip seat: %w", err)
	}

	// 3. Verify seat belongs to requested trip
	if actualTripID != tripID {
		return nil, ErrSeatBelongsToAnotherTrip
	}

	now := time.Now().UTC()

	// 4. Check seat_status
	if seatStatus == "booked" {
		return nil, ErrSeatBooked
	}

	isExpiredLock := false
	if seatStatus == "locked" {
		if lockedUntil != nil && lockedUntil.After(now) {
			// Allow if locked by the same user
			if lockedBy != nil && userID != uuid.Nil && *lockedBy == userID {
				isExpiredLock = true // Refreshing lock for same user
			} else {
				return nil, ErrSeatLocked
			}
		} else {
			isExpiredLock = true
		}
	}

	// Decrement available_seats on trips table if not replacing an expired/same-user lock
	if !isExpiredLock {
		if availableSeats <= 0 {
			return nil, ErrNoSeatsAvailable
		}

		_, err = tx.Exec(
			ctx,
			`UPDATE trips SET available_seats = available_seats - 1, updated_at = NOW() WHERE id = $1 AND available_seats > 0`,
			tripID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to update available seats: %w", err)
		}
	}

	newLockedUntil := now.Add(lockDuration)

	if userID != uuid.Nil {
		_, err = tx.Exec(
			ctx,
			`UPDATE trip_seats
			 SET seat_status = 'locked', locked_until = $1, locked_by = $2, updated_at = NOW()
			 WHERE id = $3`,
			newLockedUntil,
			userID,
			seatID,
		)
	} else {
		_, err = tx.Exec(
			ctx,
			`UPDATE trip_seats
			 SET seat_status = 'locked', locked_until = $1, updated_at = NOW()
			 WHERE id = $2`,
			newLockedUntil,
			seatID,
		)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to lock seat: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit lock transaction: %w", err)
	}

	return &LockSeatResponse{
		TripSeatID:    seatID,
		TripID:        tripID,
		VehicleSeatID: vehicleSeatID,
		SeatStatus:    "locked",
		LockedUntil:   newLockedUntil,
	}, nil
}

func (r *Repository) Search(ctx context.Context, origin, destination string, parsedDate time.Time, dateStr string) ([]*Trip, error) {
	startOfDay := time.Date(parsedDate.Year(), parsedDate.Month(), parsedDate.Day(), 0, 0, 0, 0, time.UTC)
	endOfDay := startOfDay.AddDate(0, 0, 1)

	query := `
		SELECT
			id,
			driver_id,
			vehicle_id,
			origin_name,
			destination_name,
			ST_Y(origin_location::geometry),
			ST_X(origin_location::geometry),
			ST_Y(destination_location::geometry),
			ST_X(destination_location::geometry),
			departure_time,
			estimated_arrival_time,
			distance_meters,
			duration_seconds,
			total_seats,
			available_seats,
			price_per_seat,
			trip_status,
			COALESCE(notes, ''),
			created_at,
			updated_at
		FROM trips
		WHERE LOWER(TRIM(origin_name)) = LOWER(TRIM($1))
		  AND LOWER(TRIM(destination_name)) = LOWER(TRIM($2))
		  AND (departure_time::date = $3::date OR (departure_time >= $4 AND departure_time < $5))
		  AND trip_status = 'scheduled'
		  AND available_seats > 0
		ORDER BY departure_time ASC
	`

	rows, err := r.db.Query(ctx, query, origin, destination, dateStr, startOfDay, endOfDay)
	if err != nil {
		return nil, fmt.Errorf("failed to search trips: %w", err)
	}
	defer rows.Close()

	var trips []*Trip
	for rows.Next() {
		trip := &Trip{}
		err := rows.Scan(
			&trip.ID,
			&trip.DriverID,
			&trip.VehicleID,
			&trip.OriginName,
			&trip.DestinationName,
			&trip.OriginLatitude,
			&trip.OriginLongitude,
			&trip.DestinationLatitude,
			&trip.DestinationLongitude,
			&trip.DepartureTime,
			&trip.EstimatedArrivalTime,
			&trip.DistanceMeters,
			&trip.DurationSeconds,
			&trip.TotalSeats,
			&trip.AvailableSeats,
			&trip.PricePerSeat,
			&trip.TripStatus,
			&trip.Notes,
			&trip.CreatedAt,
			&trip.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan search trip: %w", err)
		}
		trips = append(trips, trip)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading search trips: %w", err)
	}

	return trips, nil
}

func (r *Repository) GetDriverTrips(ctx context.Context, driverID uuid.UUID, statusFilter string) ([]*Trip, error) {
	var driverExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`, driverID).Scan(&driverExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}
	if !driverExists {
		return nil, ErrDriverNotFound
	}

	var query string
	var args []any

	if statusFilter != "" {
		query = `
			SELECT
				id,
				driver_id,
				vehicle_id,
				origin_name,
				destination_name,
				ST_Y(origin_location::geometry),
				ST_X(origin_location::geometry),
				ST_Y(destination_location::geometry),
				ST_X(destination_location::geometry),
				departure_time,
				estimated_arrival_time,
				distance_meters,
				duration_seconds,
				total_seats,
				available_seats,
				price_per_seat,
				trip_status,
				COALESCE(notes, ''),
				COALESCE(cancellation_reason, ''),
				created_at,
				updated_at
			FROM trips
			WHERE driver_id = $1 AND trip_status = $2
			ORDER BY departure_time DESC
		`
		args = []any{driverID, statusFilter}
	} else {
		query = `
			SELECT
				id,
				driver_id,
				vehicle_id,
				origin_name,
				destination_name,
				ST_Y(origin_location::geometry),
				ST_X(origin_location::geometry),
				ST_Y(destination_location::geometry),
				ST_X(destination_location::geometry),
				departure_time,
				estimated_arrival_time,
				distance_meters,
				duration_seconds,
				total_seats,
				available_seats,
				price_per_seat,
				trip_status,
				COALESCE(notes, ''),
				COALESCE(cancellation_reason, ''),
				created_at,
				updated_at
			FROM trips
			WHERE driver_id = $1
			ORDER BY departure_time DESC
		`
		args = []any{driverID}
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query driver trips: %w", err)
	}
	defer rows.Close()

	var trips []*Trip
	for rows.Next() {
		trip := &Trip{}
		err := rows.Scan(
			&trip.ID,
			&trip.DriverID,
			&trip.VehicleID,
			&trip.OriginName,
			&trip.DestinationName,
			&trip.OriginLatitude,
			&trip.OriginLongitude,
			&trip.DestinationLatitude,
			&trip.DestinationLongitude,
			&trip.DepartureTime,
			&trip.EstimatedArrivalTime,
			&trip.DistanceMeters,
			&trip.DurationSeconds,
			&trip.TotalSeats,
			&trip.AvailableSeats,
			&trip.PricePerSeat,
			&trip.TripStatus,
			&trip.Notes,
			&trip.CancellationReason,
			&trip.CreatedAt,
			&trip.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan driver trip: %w", err)
		}
		trips = append(trips, trip)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading driver trips: %w", err)
	}

	return trips, nil
}

func (r *Repository) GetDriverTripByID(ctx context.Context, driverID, tripID uuid.UUID) (*Trip, error) {
	var driverExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`, driverID).Scan(&driverExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}
	if !driverExists {
		return nil, ErrDriverNotFound
	}

	trip, err := r.GetByID(ctx, tripID)
	if err != nil {
		return nil, err
	}
	if trip.DriverID != driverID {
		return nil, ErrUnauthorizedDriver
	}
	return trip, nil
}

func (r *Repository) UpdateTripStatus(ctx context.Context, tripID, driverID uuid.UUID, targetStatus, cancellationReason string) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Verify driver exists and is verified
	var (
		isVerified         bool
		verificationStatus string
	)
	err = tx.QueryRow(
		ctx,
		`SELECT is_verified, verification_status FROM drivers WHERE id = $1`,
		driverID,
	).Scan(&isVerified, &verificationStatus)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrDriverNotFound
		}
		return fmt.Errorf("failed to fetch driver: %w", err)
	}

	if !isVerified && verificationStatus != "verified" {
		return ErrDriverNotVerified
	}

	// 2. Fetch and lock trip row FOR UPDATE
	var (
		actualDriverID uuid.UUID
		currentStatus  string
	)
	err = tx.QueryRow(
		ctx,
		`SELECT driver_id, trip_status FROM trips WHERE id = $1 FOR UPDATE`,
		tripID,
	).Scan(&actualDriverID, &currentStatus)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrTripNotFound
		}
		return fmt.Errorf("failed to fetch trip: %w", err)
	}

	// 3. Verify driver ownership
	if actualDriverID != driverID {
		return ErrUnauthorizedDriver
	}

	// 4. State Machine Validation
	switch targetStatus {
	case "started":
		if currentStatus != "scheduled" {
			return ErrInvalidStateTransition
		}
	case "completed":
		if currentStatus != "started" {
			return ErrInvalidStateTransition
		}
	case "cancelled":
		if currentStatus != "scheduled" {
			return ErrInvalidStateTransition
		}
	default:
		return ErrInvalidStateTransition
	}

	// 5. Update trip status
	if targetStatus == "cancelled" {
		_, err = tx.Exec(
			ctx,
			`UPDATE trips SET trip_status = $1, cancellation_reason = $2, updated_at = NOW() WHERE id = $3`,
			targetStatus,
			cancellationReason,
			tripID,
		)
	} else {
		_, err = tx.Exec(
			ctx,
			`UPDATE trips SET trip_status = $1, updated_at = NOW() WHERE id = $2`,
			targetStatus,
			tripID,
		)
	}

	if err != nil {
		return fmt.Errorf("failed to update trip status: %w", err)
	}

	return tx.Commit(ctx)
}
