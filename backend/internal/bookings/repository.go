package bookings

import (
	"context"
	"errors"
	"fmt"
	"math"
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

func (r *Repository) CreateBooking(ctx context.Context, userID, tripID uuid.UUID, seatIDs []uuid.UUID) (*Booking, error) {
	if len(seatIDs) == 0 {
		return nil, fmt.Errorf("no seats requested")
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Verify User Exists
	var userExists bool
	err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&userExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	// 2. Verify Trip Exists and Lock Row FOR UPDATE
	var (
		originName      string
		destinationName string
		departureTime   time.Time
		pricePerSeat    float64
		availableSeats  int
		tripStatus      string
	)

	err = tx.QueryRow(
		ctx,
		`SELECT origin_name, destination_name, departure_time, price_per_seat, available_seats, trip_status
		 FROM trips WHERE id = $1 FOR UPDATE`,
		tripID,
	).Scan(&originName, &destinationName, &departureTime, &pricePerSeat, &availableSeats, &tripStatus)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTripNotFound
		}
		return nil, fmt.Errorf("failed to fetch trip: %w", err)
	}

	if tripStatus != "scheduled" {
		return nil, ErrTripNotScheduled
	}

	now := time.Now().UTC()
	if departureTime.Before(now) {
		return nil, ErrTripPassed
	}

	// 3. Query & Lock all requested trip_seats FOR UPDATE
	query := `
		SELECT ts.id, ts.trip_id, ts.seat_status, ts.locked_until, ts.locked_by, vs.seat_number, vs.seat_position, vs.is_window_seat
		FROM trip_seats ts
		JOIN vehicle_seats vs ON ts.vehicle_seat_id = vs.id
		WHERE ts.id = ANY($1)
		FOR UPDATE OF ts
	`

	rows, err := tx.Query(ctx, query, seatIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to lock requested trip seats: %w", err)
	}

	type seatInfo struct {
		id           uuid.UUID
		actualTripID uuid.UUID
		status       string
		lockedUntil  *time.Time
		lockedBy     *uuid.UUID
		seatNumber   int
		seatPosition string
		isWindowSeat bool
	}

	var scannedSeats []seatInfo
	for rows.Next() {
		var s seatInfo
		if err := rows.Scan(&s.id, &s.actualTripID, &s.status, &s.lockedUntil, &s.lockedBy, &s.seatNumber, &s.seatPosition, &s.isWindowSeat); err != nil {
			rows.Close()
			return nil, fmt.Errorf("failed to scan seat: %w", err)
		}
		scannedSeats = append(scannedSeats, s)
	}
	rows.Close()

	if len(scannedSeats) != len(seatIDs) {
		return nil, ErrSeatNotFound
	}

	// 4. Validate each seat
	var bookedSeats []BookingSeat
	for _, s := range scannedSeats {
		if s.actualTripID != tripID {
			return nil, ErrSeatBelongsToAnotherTrip
		}

		if s.status == "booked" {
			return nil, ErrSeatAlreadyBooked
		}

		if s.status != "locked" {
			return nil, ErrSeatNotLocked
		}

		if s.lockedUntil == nil || !s.lockedUntil.After(now) {
			return nil, ErrSeatLockExpired
		}

		if s.lockedBy != nil && *s.lockedBy != userID {
			return nil, ErrSeatLockedByAnotherUser
		}

		bookedSeats = append(bookedSeats, BookingSeat{
			TripSeatID:   s.id,
			SeatNumber:   s.seatNumber,
			SeatPosition: s.seatPosition,
			IsWindowSeat: s.isWindowSeat,
			Price:        pricePerSeat,
		})
	}

	totalAmount := float64(len(seatIDs)) * pricePerSeat

	// 5. Insert into bookings
	var (
		bookingID uuid.UUID
		createdAt time.Time
		updatedAt time.Time
	)

	err = tx.QueryRow(
		ctx,
		`INSERT INTO bookings (user_id, trip_id, booking_status, payment_status, amount, booked_at)
		 VALUES ($1, $2, 'confirmed', 'pending', $3, NOW())
		 RETURNING id, created_at, updated_at`,
		userID,
		tripID,
		totalAmount,
	).Scan(&bookingID, &createdAt, &updatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to insert booking: %w", err)
	}

	// 6. Insert into booking_seats
	for i := range bookedSeats {
		var bsID uuid.UUID
		var bsCreatedAt time.Time
		err = tx.QueryRow(
			ctx,
			`INSERT INTO booking_seats (booking_id, trip_seat_id, price)
			 VALUES ($1, $2, $3)
			 RETURNING id, created_at`,
			bookingID,
			bookedSeats[i].TripSeatID,
			bookedSeats[i].Price,
		).Scan(&bsID, &bsCreatedAt)

		if err != nil {
			return nil, fmt.Errorf("failed to insert booking seat: %w", err)
		}

		bookedSeats[i].ID = bsID
		bookedSeats[i].BookingID = bookingID
		bookedSeats[i].CreatedAt = bsCreatedAt
	}

	// 7. Update trip_seats status to 'booked' and clear locks
	_, err = tx.Exec(
		ctx,
		`UPDATE trip_seats
		 SET seat_status = 'booked', locked_until = NULL, locked_by = NULL, updated_at = NOW()
		 WHERE id = ANY($1)`,
		seatIDs,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update trip seats status: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit booking transaction: %w", err)
	}

	return &Booking{
		ID:              bookingID,
		UserID:          userID,
		TripID:          tripID,
		BookingStatus:   "confirmed",
		PaymentStatus:   "pending",
		TotalAmount:     totalAmount,
		Seats:           bookedSeats,
		CreatedAt:       createdAt,
		UpdatedAt:       updatedAt,
		OriginName:      originName,
		DestinationName: destinationName,
		DepartureTime:   &departureTime,
		Trip: &TripDetails{
			OriginName:      originName,
			DestinationName: destinationName,
			DepartureTime:   departureTime,
			TripStatus:      tripStatus,
		},
	}, nil
}

func (r *Repository) CancelBooking(ctx context.Context, bookingID, userID uuid.UUID, reason string) (*Booking, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 1. Fetch & lock booking FOR UPDATE
	var (
		actualUserID  uuid.UUID
		tripID        uuid.UUID
		bookingStatus string
	)

	err = tx.QueryRow(
		ctx,
		`SELECT user_id, trip_id, booking_status FROM bookings WHERE id = $1 FOR UPDATE`,
		bookingID,
	).Scan(&actualUserID, &tripID, &bookingStatus)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrBookingNotFound
		}
		return nil, fmt.Errorf("failed to fetch booking: %w", err)
	}

	// 2. Verify lock ownership / user_id
	if actualUserID != userID {
		return nil, ErrUnauthorizedCancellation
	}

	// 3. Check booking status
	if bookingStatus == "cancelled" {
		return nil, ErrBookingAlreadyCancelled
	}
	if bookingStatus == "completed" {
		return nil, ErrBookingAlreadyCompleted
	}

	// 4. Fetch all trip_seat_id values for this booking
	rows, err := tx.Query(ctx, `SELECT trip_seat_id FROM booking_seats WHERE booking_id = $1`, bookingID)
	if err != nil {
		return nil, fmt.Errorf("failed to query booking seats: %w", err)
	}

	var seatIDs []uuid.UUID
	for rows.Next() {
		var sid uuid.UUID
		if err := rows.Scan(&sid); err != nil {
			rows.Close()
			return nil, fmt.Errorf("failed to scan trip_seat_id: %w", err)
		}
		seatIDs = append(seatIDs, sid)
	}
	rows.Close()

	now := time.Now().UTC()

	// 5. Update bookings status to 'cancelled'
	_, err = tx.Exec(
		ctx,
		`UPDATE bookings
		 SET booking_status = 'cancelled', cancelled_at = $1, cancellation_reason = $2, updated_at = NOW()
		 WHERE id = $3`,
		now,
		reason,
		bookingID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking status: %w", err)
	}

	// 6. Release trip_seats: set seat_status = 'available', clear locks
	if len(seatIDs) > 0 {
		_, err = tx.Exec(
			ctx,
			`UPDATE trip_seats
			 SET seat_status = 'available', locked_until = NULL, locked_by = NULL, updated_at = NOW()
			 WHERE id = ANY($1)`,
			seatIDs,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to release trip seats: %w", err)
		}

		// 7. Increment trips.available_seats
		_, err = tx.Exec(
			ctx,
			`UPDATE trips
			 SET available_seats = available_seats + $1, updated_at = NOW()
			 WHERE id = $2`,
			len(seatIDs),
			tripID,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to increment available seats: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit cancellation transaction: %w", err)
	}

	return r.GetByID(ctx, bookingID)
}

func (r *Repository) GetByID(ctx context.Context, bookingID uuid.UUID) (*Booking, error) {
	query := `
		SELECT
			b.id,
			b.user_id,
			b.trip_id,
			b.booking_status,
			b.payment_status,
			b.amount,
			b.cancelled_at,
			COALESCE(b.cancellation_reason, ''),
			b.created_at,
			b.updated_at,
			t.origin_name,
			t.destination_name,
			t.departure_time,
			t.trip_status
		FROM bookings b
		JOIN trips t ON b.trip_id = t.id
		WHERE b.id = $1
	`

	b := &Booking{}
	var tripStatus string
	var depTime time.Time

	err := r.db.QueryRow(ctx, query, bookingID).Scan(
		&b.ID,
		&b.UserID,
		&b.TripID,
		&b.BookingStatus,
		&b.PaymentStatus,
		&b.TotalAmount,
		&b.CancelledAt,
		&b.CancellationReason,
		&b.CreatedAt,
		&b.UpdatedAt,
		&b.OriginName,
		&b.DestinationName,
		&depTime,
		&tripStatus,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrBookingNotFound
		}
		return nil, fmt.Errorf("failed to get booking: %w", err)
	}

	b.DepartureTime = &depTime
	b.Trip = &TripDetails{
		OriginName:      b.OriginName,
		DestinationName: b.DestinationName,
		DepartureTime:   depTime,
		TripStatus:      tripStatus,
	}

	// Fetch seats
	seatsQuery := `
		SELECT
			bs.id,
			bs.booking_id,
			bs.trip_seat_id,
			bs.price,
			bs.created_at,
			vs.seat_number,
			vs.seat_position,
			vs.is_window_seat
		FROM booking_seats bs
		JOIN trip_seats ts ON bs.trip_seat_id = ts.id
		JOIN vehicle_seats vs ON ts.vehicle_seat_id = vs.id
		WHERE bs.booking_id = $1
		ORDER BY vs.seat_number
	`

	rows, err := r.db.Query(ctx, seatsQuery, bookingID)
	if err != nil {
		return nil, fmt.Errorf("failed to query booking seats: %w", err)
	}
	defer rows.Close()

	var seats []BookingSeat
	for rows.Next() {
		var bs BookingSeat
		if err := rows.Scan(&bs.ID, &bs.BookingID, &bs.TripSeatID, &bs.Price, &bs.CreatedAt, &bs.SeatNumber, &bs.SeatPosition, &bs.IsWindowSeat); err != nil {
			return nil, fmt.Errorf("failed to scan booking seat: %w", err)
		}
		seats = append(seats, bs)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading booking seats: %w", err)
	}

	b.Seats = seats
	return b, nil
}

func (r *Repository) GetPassengerBookingByID(ctx context.Context, userID, bookingID uuid.UUID) (*Booking, error) {
	var userExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&userExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	b, err := r.GetByID(ctx, bookingID)
	if err != nil {
		return nil, err
	}

	if b.UserID != userID {
		return nil, ErrUnauthorizedBookingAccess
	}

	return b, nil
}

func (r *Repository) GetByUserID(ctx context.Context, userID uuid.UUID, statusFilter string) ([]*Booking, error) {
	resp, err := r.GetPassengerBookingsPaginated(ctx, userID, statusFilter, 1, 100)
	if err != nil {
		return nil, err
	}
	return resp.Data, nil
}

func (r *Repository) GetPassengerBookingsPaginated(ctx context.Context, userID uuid.UUID, statusFilter string, page, limit int) (*PaginatedResponse[*Booking], error) {
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

	var userExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&userExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	var countQuery string
	var countArgs []any
	if statusFilter != "" {
		countQuery = `SELECT COUNT(*) FROM bookings WHERE user_id = $1 AND booking_status = $2`
		countArgs = []any{userID, statusFilter}
	} else {
		countQuery = `SELECT COUNT(*) FROM bookings WHERE user_id = $1`
		countArgs = []any{userID}
	}

	var total int
	if err := r.db.QueryRow(ctx, countQuery, countArgs...).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count bookings: %w", err)
	}

	var query string
	var args []any

	if statusFilter != "" {
		query = `
			SELECT
				b.id,
				b.user_id,
				b.trip_id,
				b.booking_status,
				b.payment_status,
				b.amount,
				b.cancelled_at,
				COALESCE(b.cancellation_reason, ''),
				b.created_at,
				b.updated_at,
				t.origin_name,
				t.destination_name,
				t.departure_time,
				t.trip_status
			FROM bookings b
			JOIN trips t ON b.trip_id = t.id
			WHERE b.user_id = $1 AND b.booking_status = $2
			ORDER BY b.created_at DESC
			LIMIT $3 OFFSET $4
		`
		args = []any{userID, statusFilter, limit, offset}
	} else {
		query = `
			SELECT
				b.id,
				b.user_id,
				b.trip_id,
				b.booking_status,
				b.payment_status,
				b.amount,
				b.cancelled_at,
				COALESCE(b.cancellation_reason, ''),
				b.created_at,
				b.updated_at,
				t.origin_name,
				t.destination_name,
				t.departure_time,
				t.trip_status
			FROM bookings b
			JOIN trips t ON b.trip_id = t.id
			WHERE b.user_id = $1
			ORDER BY b.created_at DESC
			LIMIT $2 OFFSET $3
		`
		args = []any{userID, limit, offset}
	}

	rows, err := r.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query user bookings: %w", err)
	}
	defer rows.Close()

	var result []*Booking
	for rows.Next() {
		b := &Booking{}
		var tripStatus string
		var depTime time.Time
		err := rows.Scan(
			&b.ID,
			&b.UserID,
			&b.TripID,
			&b.BookingStatus,
			&b.PaymentStatus,
			&b.TotalAmount,
			&b.CancelledAt,
			&b.CancellationReason,
			&b.CreatedAt,
			&b.UpdatedAt,
			&b.OriginName,
			&b.DestinationName,
			&depTime,
			&tripStatus,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		b.DepartureTime = &depTime
		b.Trip = &TripDetails{
			OriginName:      b.OriginName,
			DestinationName: b.DestinationName,
			DepartureTime:   depTime,
			TripStatus:      tripStatus,
		}
		result = append(result, b)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading user bookings: %w", err)
	}

	for i, b := range result {
		fullBooking, err := r.GetByID(ctx, b.ID)
		if err == nil && fullBooking != nil {
			result[i].Seats = fullBooking.Seats
		}
	}

	if result == nil {
		result = []*Booking{}
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &PaginatedResponse[*Booking]{
		Data:       result,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetPassengerRides(ctx context.Context, userID uuid.UUID, category string, statusFilter string, page, limit int) (*PaginatedResponse[*PassengerRide], error) {
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

	var userExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`, userID).Scan(&userExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check user: %w", err)
	}
	if !userExists {
		return nil, ErrUserNotFound
	}

	whereClause := "WHERE b.user_id = $1"
	orderByClause := "ORDER BY b.created_at DESC"

	switch category {
	case "upcoming":
		whereClause += " AND b.booking_status != 'cancelled' AND t.trip_status = 'scheduled' AND t.departure_time > NOW()"
		orderByClause = "ORDER BY t.departure_time ASC"
	case "active":
		whereClause += " AND b.booking_status != 'cancelled' AND (t.trip_status = 'started' OR t.trip_status = 'in_progress')"
		orderByClause = "ORDER BY t.departure_time ASC"
	case "completed":
		whereClause += " AND (t.trip_status = 'completed' OR b.booking_status = 'completed')"
		orderByClause = "ORDER BY t.departure_time DESC"
	case "cancelled":
		whereClause += " AND (b.booking_status = 'cancelled' OR t.trip_status = 'cancelled')"
		orderByClause = "ORDER BY b.updated_at DESC"
	}

	if statusFilter != "" {
		whereClause += fmt.Sprintf(" AND b.booking_status = '%s'", statusFilter)
	}

	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM bookings b JOIN trips t ON b.trip_id = t.id %s`, whereClause)
	var total int
	if err := r.db.QueryRow(ctx, countQuery, userID).Scan(&total); err != nil {
		return nil, fmt.Errorf("failed to count passenger rides: %w", err)
	}

	query := fmt.Sprintf(`
		SELECT
			b.id AS booking_id,
			b.trip_id,
			b.user_id,
			b.booking_status,
			b.payment_status,
			b.amount AS total_amount,
			b.created_at,
			b.updated_at,
			t.origin_name,
			t.destination_name,
			t.departure_time,
			t.price_per_seat,
			t.trip_status
		FROM bookings b
		JOIN trips t ON b.trip_id = t.id
		%s
		%s
		LIMIT $2 OFFSET $3
	`, whereClause, orderByClause)

	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query passenger rides: %w", err)
	}
	defer rows.Close()

	var rides []*PassengerRide
	for rows.Next() {
		pr := &PassengerRide{}
		err := rows.Scan(
			&pr.BookingID,
			&pr.TripID,
			&pr.UserID,
			&pr.BookingStatus,
			&pr.PaymentStatus,
			&pr.TotalAmount,
			&pr.CreatedAt,
			&pr.UpdatedAt,
			&pr.OriginName,
			&pr.DestinationName,
			&pr.DepartureTime,
			&pr.PricePerSeat,
			&pr.TripStatus,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan passenger ride: %w", err)
		}

		// Determine Ride Category
		switch {
		case pr.BookingStatus == "cancelled" || pr.TripStatus == "cancelled":
			pr.RideCategory = "cancelled"
		case pr.TripStatus == "completed" || pr.BookingStatus == "completed":
			pr.RideCategory = "completed"
		case pr.TripStatus == "started" || pr.TripStatus == "in_progress":
			pr.RideCategory = "active"
		case pr.TripStatus == "scheduled":
			pr.RideCategory = "upcoming"
		default:
			pr.RideCategory = "upcoming"
		}

		rides = append(rides, pr)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading passenger rides: %w", err)
	}

	// Fetch seats for each ride
	for _, pr := range rides {
		fullBooking, err := r.GetByID(ctx, pr.BookingID)
		if err == nil && fullBooking != nil && len(fullBooking.Seats) > 0 {
			pr.Seats = fullBooking.Seats
			pr.SeatNumber = fullBooking.Seats[0].SeatNumber
			pr.SeatPosition = fullBooking.Seats[0].SeatPosition
			pr.IsWindowSeat = fullBooking.Seats[0].IsWindowSeat
		}
	}

	if rides == nil {
		rides = []*PassengerRide{}
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &PaginatedResponse[*PassengerRide]{
		Data:       rides,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}
