package admin

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
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

func (r *Repository) CreateAuditLog(ctx context.Context, adminID uuid.UUID, action, entityType string, entityID *uuid.UUID, metadata any) error {
	var metaJSON []byte
	if metadata != nil {
		metaJSON, _ = json.Marshal(metadata)
	}

	query := `
		INSERT INTO admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.Exec(ctx, query, adminID, action, entityType, entityID, metaJSON)
	if err != nil {
		fmt.Printf("failed to insert audit log: %v\n", err)
	}
	return nil
}

func (r *Repository) GetDashboardSummary(ctx context.Context) (*DashboardSummary, error) {
	summary := &DashboardSummary{}

	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&summary.Users)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM drivers`).Scan(&summary.Drivers)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM vehicles`).Scan(&summary.Vehicles)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM trips`).Scan(&summary.Trips)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM bookings`).Scan(&summary.Bookings)

	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM trips WHERE trip_status = 'completed'`).Scan(&summary.CompletedTrips)
	_ = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM trips WHERE trip_status = 'cancelled'`).Scan(&summary.CancelledTrips)

	_ = r.db.QueryRow(ctx, `SELECT COALESCE(SUM(amount), 0.00) FROM payments WHERE payment_status = 'paid'`).Scan(&summary.GrossRevenue)
	_ = r.db.QueryRow(ctx, `SELECT COALESCE(SUM(platform_fee), 0.00) FROM driver_earnings`).Scan(&summary.PlatformRevenue)
	_ = r.db.QueryRow(ctx, `SELECT COALESCE(SUM(net_amount), 0.00) FROM driver_earnings`).Scan(&summary.DriverEarnings)
	_ = r.db.QueryRow(ctx, `SELECT COALESCE(SUM(amount), 0.00) FROM driver_payouts WHERE status IN ('pending', 'processing')`).Scan(&summary.PendingPayouts)

	return summary, nil
}

func (r *Repository) GetUsers(ctx context.Context, search, roleFilter, statusFilter string, page, limit int) (*PaginatedResult[*AdminUserDetail], error) {
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

	var whereClauses []string
	var args []any

	if search != "" {
		args = append(args, "%"+strings.ToLower(search)+"%")
		whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(full_name) LIKE $%d OR LOWER(email) LIKE $%d OR phone LIKE $%d)", len(args), len(args), len(args)))
	}

	if roleFilter != "" {
		args = append(args, roleFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("role = $%d", len(args)))
	}

	if statusFilter != "" {
		isActive := statusFilter == "active"
		args = append(args, isActive)
		whereClauses = append(whereClauses, fmt.Sprintf("is_active = $%d", len(args)))
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	err := r.db.QueryRow(ctx, fmt.Sprintf("SELECT COUNT(*) FROM users %s", whereSQL), args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count users: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT id, full_name, phone, email, role, is_phone_verified, is_active, created_at, updated_at
		FROM users
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var usersList []*AdminUserDetail
	for rows.Next() {
		u := &AdminUserDetail{}
		err := rows.Scan(&u.ID, &u.FullName, &u.Phone, &u.Email, &u.Role, &u.IsPhoneVerified, &u.IsActive, &u.CreatedAt, &u.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan user: %w", err)
		}
		usersList = append(usersList, u)
	}

	if usersList == nil {
		usersList = []*AdminUserDetail{}
	}

	return &PaginatedResult[*AdminUserDetail]{
		Data:       usersList,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetUserByID(ctx context.Context, userID uuid.UUID) (*AdminUserDetail, error) {
	u := &AdminUserDetail{}
	query := `SELECT id, full_name, phone, email, role, is_phone_verified, is_active, created_at, updated_at FROM users WHERE id = $1`
	err := r.db.QueryRow(ctx, query, userID).Scan(&u.ID, &u.FullName, &u.Phone, &u.Email, &u.Role, &u.IsPhoneVerified, &u.IsActive, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to fetch user: %w", err)
	}
	return u, nil
}

func (r *Repository) UpdateUserStatus(ctx context.Context, adminID, userID uuid.UUID, isActive bool) (*AdminUserDetail, error) {
	query := `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, phone, email, role, is_phone_verified, is_active, created_at, updated_at`
	u := &AdminUserDetail{}
	err := r.db.QueryRow(ctx, query, isActive, userID).Scan(&u.ID, &u.FullName, &u.Phone, &u.Email, &u.Role, &u.IsPhoneVerified, &u.IsActive, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("failed to update user status: %w", err)
	}

	action := "deactivate_user"
	if isActive {
		action = "activate_user"
	}
	_ = r.CreateAuditLog(ctx, adminID, action, "user", &userID, map[string]any{"is_active": isActive})
	return u, nil
}

func (r *Repository) GetDrivers(ctx context.Context, search, statusFilter string, page, limit int) (*PaginatedResult[*AdminDriverDetail], error) {
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

	var whereClauses []string
	var args []any

	if search != "" {
		args = append(args, "%"+strings.ToLower(search)+"%")
		whereClauses = append(whereClauses, fmt.Sprintf("(LOWER(u.full_name) LIKE $%d OR LOWER(u.email) LIKE $%d OR d.license_number LIKE $%d)", len(args), len(args), len(args)))
	}

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("d.verification_status = $%d", len(args)))
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM drivers d JOIN users u ON d.user_id = u.id %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count drivers: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT d.id, d.user_id, u.full_name, u.phone, u.email, d.license_number, d.license_expiry_date::text, d.verification_status, d.is_verified, d.rejection_reason, d.total_rides, d.average_rating, d.created_at, d.updated_at
		FROM drivers d
		JOIN users u ON d.user_id = u.id
		%s
		ORDER BY d.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query drivers: %w", err)
	}
	defer rows.Close()

	var driversList []*AdminDriverDetail
	for rows.Next() {
		d := &AdminDriverDetail{}
		err := rows.Scan(&d.ID, &d.UserID, &d.FullName, &d.Phone, &d.Email, &d.LicenseNumber, &d.LicenseExpiryDate, &d.VerificationStatus, &d.IsVerified, &d.RejectionReason, &d.TotalRides, &d.AverageRating, &d.CreatedAt, &d.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan driver: %w", err)
		}
		driversList = append(driversList, d)
	}

	if driversList == nil {
		driversList = []*AdminDriverDetail{}
	}

	return &PaginatedResult[*AdminDriverDetail]{
		Data:       driversList,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetDriverByID(ctx context.Context, driverID uuid.UUID) (*AdminDriverDetail, error) {
	d := &AdminDriverDetail{}
	query := `
		SELECT d.id, d.user_id, u.full_name, u.phone, u.email, d.license_number, d.license_expiry_date::text, d.verification_status, d.is_verified, d.rejection_reason, d.total_rides, d.average_rating, d.created_at, d.updated_at
		FROM drivers d
		JOIN users u ON d.user_id = u.id
		WHERE d.id = $1
	`
	err := r.db.QueryRow(ctx, query, driverID).Scan(&d.ID, &d.UserID, &d.FullName, &d.Phone, &d.Email, &d.LicenseNumber, &d.LicenseExpiryDate, &d.VerificationStatus, &d.IsVerified, &d.RejectionReason, &d.TotalRides, &d.AverageRating, &d.CreatedAt, &d.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrDriverNotFound
		}
		return nil, fmt.Errorf("failed to fetch driver: %w", err)
	}
	return d, nil
}

func (r *Repository) ApproveDriver(ctx context.Context, adminID, driverID uuid.UUID) (*AdminDriverDetail, error) {
	query := `UPDATE drivers SET verification_status = 'verified', is_verified = true, rejection_reason = NULL, updated_at = NOW() WHERE id = $1`
	res, err := r.db.Exec(ctx, query, driverID)
	if err != nil || res.RowsAffected() == 0 {
		return nil, ErrDriverNotFound
	}

	_ = r.CreateAuditLog(ctx, adminID, "approve_driver", "driver", &driverID, nil)
	return r.GetDriverByID(ctx, driverID)
}

func (r *Repository) RejectDriver(ctx context.Context, adminID, driverID uuid.UUID, reason string) (*AdminDriverDetail, error) {
	query := `UPDATE drivers SET verification_status = 'rejected', is_verified = false, rejection_reason = $1, updated_at = NOW() WHERE id = $2`
	res, err := r.db.Exec(ctx, query, reason, driverID)
	if err != nil || res.RowsAffected() == 0 {
		return nil, ErrDriverNotFound
	}

	_ = r.CreateAuditLog(ctx, adminID, "reject_driver", "driver", &driverID, map[string]any{"reason": reason})
	return r.GetDriverByID(ctx, driverID)
}

func (r *Repository) GetVehicles(ctx context.Context, driverIDFilter, vehicleTypeFilter string, page, limit int) (*PaginatedResult[*AdminVehicleDetail], error) {
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

	var whereClauses []string
	var args []any

	if driverIDFilter != "" {
		if dID, err := uuid.Parse(driverIDFilter); err == nil {
			args = append(args, dID)
			whereClauses = append(whereClauses, fmt.Sprintf("v.driver_id = $%d", len(args)))
		}
	}

	if vehicleTypeFilter != "" {
		args = append(args, vehicleTypeFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("v.vehicle_type = $%d", len(args)))
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM vehicles v JOIN drivers d ON v.driver_id = d.id JOIN users u ON d.user_id = u.id %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count vehicles: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT v.id, v.driver_id, u.full_name, v.make, v.model, v.manufacture_year, v.color, v.registration_number, v.vehicle_type, v.total_seats, v.is_active, v.created_at, v.updated_at
		FROM vehicles v
		JOIN drivers d ON v.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		%s
		ORDER BY v.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query vehicles: %w", err)
	}
	defer rows.Close()

	var list []*AdminVehicleDetail
	for rows.Next() {
		v := &AdminVehicleDetail{}
		err := rows.Scan(&v.ID, &v.DriverID, &v.DriverName, &v.Make, &v.Model, &v.ManufactureYear, &v.Color, &v.RegistrationNumber, &v.VehicleType, &v.TotalSeats, &v.IsActive, &v.CreatedAt, &v.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan vehicle: %w", err)
		}
		list = append(list, v)
	}

	if list == nil {
		list = []*AdminVehicleDetail{}
	}

	return &PaginatedResult[*AdminVehicleDetail]{
		Data:       list,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetVehicleByID(ctx context.Context, vehicleID uuid.UUID) (*AdminVehicleDetail, error) {
	v := &AdminVehicleDetail{}
	query := `
		SELECT v.id, v.driver_id, u.full_name, v.make, v.model, v.manufacture_year, v.color, v.registration_number, v.vehicle_type, v.total_seats, v.is_active, v.created_at, v.updated_at
		FROM vehicles v
		JOIN drivers d ON v.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		WHERE v.id = $1
	`
	err := r.db.QueryRow(ctx, query, vehicleID).Scan(&v.ID, &v.DriverID, &v.DriverName, &v.Make, &v.Model, &v.ManufactureYear, &v.Color, &v.RegistrationNumber, &v.VehicleType, &v.TotalSeats, &v.IsActive, &v.CreatedAt, &v.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrVehicleNotFound
		}
		return nil, fmt.Errorf("failed to fetch vehicle: %w", err)
	}
	return v, nil
}

func (r *Repository) GetTrips(ctx context.Context, statusFilter, originFilter, destinationFilter, dateFilter string, page, limit int) (*PaginatedResult[*AdminTripDetail], error) {
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

	var whereClauses []string
	var args []any

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("t.trip_status = $%d", len(args)))
	}

	if originFilter != "" {
		args = append(args, "%"+strings.ToLower(originFilter)+"%")
		whereClauses = append(whereClauses, fmt.Sprintf("LOWER(t.origin_name) LIKE $%d", len(args)))
	}

	if destinationFilter != "" {
		args = append(args, "%"+strings.ToLower(destinationFilter)+"%")
		whereClauses = append(whereClauses, fmt.Sprintf("LOWER(t.destination_name) LIKE $%d", len(args)))
	}

	if dateFilter != "" {
		if _, err := time.Parse("2006-01-02", dateFilter); err == nil {
			args = append(args, dateFilter)
			whereClauses = append(whereClauses, fmt.Sprintf("t.departure_time::date = $%d::date", len(args)))
		}
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM trips t %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count trips: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT t.id, t.driver_id, u.full_name, t.vehicle_id, t.origin_name, t.destination_name, t.departure_time, t.estimated_arrival_time, t.trip_status, t.total_seats, t.available_seats, t.price_per_seat, t.distance_meters, t.duration_seconds, t.created_at, t.updated_at
		FROM trips t
		JOIN drivers d ON t.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		%s
		ORDER BY t.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query trips: %w", err)
	}
	defer rows.Close()

	var list []*AdminTripDetail
	for rows.Next() {
		t := &AdminTripDetail{}
		err := rows.Scan(&t.ID, &t.DriverID, &t.DriverName, &t.VehicleID, &t.OriginName, &t.DestinationName, &t.DepartureTime, &t.EstimatedArrivalTime, &t.TripStatus, &t.TotalSeats, &t.AvailableSeats, &t.PricePerSeat, &t.DistanceMeters, &t.DurationSeconds, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan trip: %w", err)
		}
		list = append(list, t)
	}

	if list == nil {
		list = []*AdminTripDetail{}
	}

	return &PaginatedResult[*AdminTripDetail]{
		Data:       list,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetTripByID(ctx context.Context, tripID uuid.UUID) (*AdminTripDetail, error) {
	t := &AdminTripDetail{}
	query := `
		SELECT t.id, t.driver_id, u.full_name, t.vehicle_id, t.origin_name, t.destination_name, t.departure_time, t.estimated_arrival_time, t.trip_status, t.total_seats, t.available_seats, t.price_per_seat, t.distance_meters, t.duration_seconds, t.created_at, t.updated_at
		FROM trips t
		JOIN drivers d ON t.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		WHERE t.id = $1
	`
	err := r.db.QueryRow(ctx, query, tripID).Scan(&t.ID, &t.DriverID, &t.DriverName, &t.VehicleID, &t.OriginName, &t.DestinationName, &t.DepartureTime, &t.EstimatedArrivalTime, &t.TripStatus, &t.TotalSeats, &t.AvailableSeats, &t.PricePerSeat, &t.DistanceMeters, &t.DurationSeconds, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTripNotFound
		}
		return nil, fmt.Errorf("failed to fetch trip: %w", err)
	}
	return t, nil
}

func (r *Repository) GetBookings(ctx context.Context, statusFilter, tripIDFilter, driverIDFilter, userIDFilter string, page, limit int) (*PaginatedResult[*AdminBookingDetail], error) {
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

	var whereClauses []string
	var args []any

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("b.booking_status = $%d", len(args)))
	}

	if tripIDFilter != "" {
		if id, err := uuid.Parse(tripIDFilter); err == nil {
			args = append(args, id)
			whereClauses = append(whereClauses, fmt.Sprintf("b.trip_id = $%d", len(args)))
		}
	}

	if driverIDFilter != "" {
		if id, err := uuid.Parse(driverIDFilter); err == nil {
			args = append(args, id)
			whereClauses = append(whereClauses, fmt.Sprintf("t.driver_id = $%d", len(args)))
		}
	}

	if userIDFilter != "" {
		if id, err := uuid.Parse(userIDFilter); err == nil {
			args = append(args, id)
			whereClauses = append(whereClauses, fmt.Sprintf("b.user_id = $%d", len(args)))
		}
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM bookings b JOIN trips t ON b.trip_id = t.id JOIN users u ON b.user_id = u.id %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count bookings: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT b.id, b.trip_id, b.user_id, u.full_name, u.phone, (SELECT COUNT(*) FROM booking_seats bs WHERE bs.booking_id = b.id) as seat_count, b.amount, b.booking_status, b.payment_status, b.created_at, b.updated_at
		FROM bookings b
		JOIN trips t ON b.trip_id = t.id
		JOIN users u ON b.user_id = u.id
		%s
		ORDER BY b.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query bookings: %w", err)
	}
	defer rows.Close()

	var list []*AdminBookingDetail
	for rows.Next() {
		b := &AdminBookingDetail{}
		err := rows.Scan(&b.ID, &b.TripID, &b.UserID, &b.UserName, &b.UserPhone, &b.SeatCount, &b.Amount, &b.BookingStatus, &b.PaymentStatus, &b.CreatedAt, &b.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan booking: %w", err)
		}
		list = append(list, b)
	}

	if list == nil {
		list = []*AdminBookingDetail{}
	}

	return &PaginatedResult[*AdminBookingDetail]{
		Data:       list,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetBookingByID(ctx context.Context, bookingID uuid.UUID) (*AdminBookingDetail, error) {
	b := &AdminBookingDetail{}
	query := `
		SELECT b.id, b.trip_id, b.user_id, u.full_name, u.phone, (SELECT COUNT(*) FROM booking_seats bs WHERE bs.booking_id = b.id) as seat_count, b.amount, b.booking_status, b.payment_status, b.created_at, b.updated_at
		FROM bookings b
		JOIN users u ON b.user_id = u.id
		WHERE b.id = $1
	`
	err := r.db.QueryRow(ctx, query, bookingID).Scan(&b.ID, &b.TripID, &b.UserID, &b.UserName, &b.UserPhone, &b.SeatCount, &b.Amount, &b.BookingStatus, &b.PaymentStatus, &b.CreatedAt, &b.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrBookingNotFound
		}
		return nil, fmt.Errorf("failed to fetch booking: %w", err)
	}
	return b, nil
}

func (r *Repository) GetPayments(ctx context.Context, statusFilter, fromDate, toDate string, page, limit int) (*PaginatedResult[*AdminPaymentDetail], error) {
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

	var whereClauses []string
	var args []any

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("p.payment_status = $%d", len(args)))
	}

	if fromDate != "" {
		if _, err := time.Parse("2006-01-02", fromDate); err == nil {
			args = append(args, fromDate)
			whereClauses = append(whereClauses, fmt.Sprintf("p.created_at >= $%d::date", len(args)))
		}
	}

	if toDate != "" {
		if _, err := time.Parse("2006-01-02", toDate); err == nil {
			args = append(args, toDate+" 23:59:59")
			whereClauses = append(whereClauses, fmt.Sprintf("p.created_at <= $%d::timestamp", len(args)))
		}
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM payments p JOIN users u ON p.user_id = u.id %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count payments: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT p.id, p.booking_id, p.user_id, u.full_name, p.amount, p.currency, p.payment_status, p.razorpay_order_id, p.razorpay_payment_id, p.created_at, p.updated_at
		FROM payments p
		JOIN users u ON p.user_id = u.id
		%s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query payments: %w", err)
	}
	defer rows.Close()

	var list []*AdminPaymentDetail
	for rows.Next() {
		p := &AdminPaymentDetail{}
		err := rows.Scan(&p.ID, &p.BookingID, &p.UserID, &p.UserName, &p.Amount, &p.Currency, &p.PaymentStatus, &p.RazorpayOrderID, &p.RazorpayPaymentID, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan payment: %w", err)
		}
		list = append(list, p)
	}

	if list == nil {
		list = []*AdminPaymentDetail{}
	}

	return &PaginatedResult[*AdminPaymentDetail]{
		Data:       list,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetPaymentByID(ctx context.Context, paymentID uuid.UUID) (*AdminPaymentDetail, error) {
	p := &AdminPaymentDetail{}
	query := `
		SELECT p.id, p.booking_id, p.user_id, u.full_name, p.amount, p.currency, p.payment_status, p.razorpay_order_id, p.razorpay_payment_id, p.created_at, p.updated_at
		FROM payments p
		JOIN users u ON p.user_id = u.id
		WHERE p.id = $1
	`
	err := r.db.QueryRow(ctx, query, paymentID).Scan(&p.ID, &p.BookingID, &p.UserID, &p.UserName, &p.Amount, &p.Currency, &p.PaymentStatus, &p.RazorpayOrderID, &p.RazorpayPaymentID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPaymentNotFound
		}
		return nil, fmt.Errorf("failed to fetch payment: %w", err)
	}
	return p, nil
}

func (r *Repository) GetEarnings(ctx context.Context, driverIDFilter, statusFilter, fromDate, toDate string, page, limit int) (*PaginatedResult[*AdminEarningDetail], error) {
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

	var whereClauses []string
	var args []any

	if driverIDFilter != "" {
		if id, err := uuid.Parse(driverIDFilter); err == nil {
			args = append(args, id)
			whereClauses = append(whereClauses, fmt.Sprintf("e.driver_id = $%d", len(args)))
		}
	}

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("e.status = $%d", len(args)))
	}

	if fromDate != "" {
		if _, err := time.Parse("2006-01-02", fromDate); err == nil {
			args = append(args, fromDate)
			whereClauses = append(whereClauses, fmt.Sprintf("e.created_at >= $%d::date", len(args)))
		}
	}

	if toDate != "" {
		if _, err := time.Parse("2006-01-02", toDate); err == nil {
			args = append(args, toDate+" 23:59:59")
			whereClauses = append(whereClauses, fmt.Sprintf("e.created_at <= $%d::timestamp", len(args)))
		}
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM driver_earnings e JOIN drivers d ON e.driver_id = d.id JOIN users u ON d.user_id = u.id %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count earnings: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT e.id, e.driver_id, u.full_name, e.trip_id, e.booking_id, e.gross_amount, e.platform_fee, e.net_amount, e.currency, e.status, e.created_at, e.updated_at
		FROM driver_earnings e
		JOIN drivers d ON e.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		%s
		ORDER BY e.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query earnings: %w", err)
	}
	defer rows.Close()

	var list []*AdminEarningDetail
	for rows.Next() {
		e := &AdminEarningDetail{}
		err := rows.Scan(&e.ID, &e.DriverID, &e.DriverName, &e.TripID, &e.BookingID, &e.GrossAmount, &e.PlatformFee, &e.NetAmount, &e.Currency, &e.Status, &e.CreatedAt, &e.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan earning: %w", err)
		}
		list = append(list, e)
	}

	if list == nil {
		list = []*AdminEarningDetail{}
	}

	return &PaginatedResult[*AdminEarningDetail]{
		Data:       list,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetEarningByID(ctx context.Context, earningID uuid.UUID) (*AdminEarningDetail, error) {
	e := &AdminEarningDetail{}
	query := `
		SELECT e.id, e.driver_id, u.full_name, e.trip_id, e.booking_id, e.gross_amount, e.platform_fee, e.net_amount, e.currency, e.status, e.created_at, e.updated_at
		FROM driver_earnings e
		JOIN drivers d ON e.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		WHERE e.id = $1
	`
	err := r.db.QueryRow(ctx, query, earningID).Scan(&e.ID, &e.DriverID, &e.DriverName, &e.TripID, &e.BookingID, &e.GrossAmount, &e.PlatformFee, &e.NetAmount, &e.Currency, &e.Status, &e.CreatedAt, &e.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrEarningNotFound
		}
		return nil, fmt.Errorf("failed to fetch earning: %w", err)
	}
	return e, nil
}

func (r *Repository) GetPayouts(ctx context.Context, driverIDFilter, statusFilter, fromDate, toDate string, page, limit int) (*PaginatedResult[*AdminPayoutDetail], error) {
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

	var whereClauses []string
	var args []any

	if driverIDFilter != "" {
		if id, err := uuid.Parse(driverIDFilter); err == nil {
			args = append(args, id)
			whereClauses = append(whereClauses, fmt.Sprintf("p.driver_id = $%d", len(args)))
		}
	}

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("p.status = $%d", len(args)))
	}

	if fromDate != "" {
		if _, err := time.Parse("2006-01-02", fromDate); err == nil {
			args = append(args, fromDate)
			whereClauses = append(whereClauses, fmt.Sprintf("p.requested_at >= $%d::date", len(args)))
		}
	}

	if toDate != "" {
		if _, err := time.Parse("2006-01-02", toDate); err == nil {
			args = append(args, toDate+" 23:59:59")
			whereClauses = append(whereClauses, fmt.Sprintf("p.requested_at <= $%d::timestamp", len(args)))
		}
	}

	whereSQL := ""
	if len(whereClauses) > 0 {
		whereSQL = "WHERE " + strings.Join(whereClauses, " AND ")
	}

	var total int
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM driver_payouts p JOIN drivers d ON p.driver_id = d.id JOIN users u ON d.user_id = u.id %s", whereSQL)
	err := r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count payouts: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	query := fmt.Sprintf(`
		SELECT p.id, p.driver_id, u.full_name, p.amount, p.currency, p.status, p.payment_reference, p.failure_reason, p.requested_at, p.processed_at, p.created_at, p.updated_at
		FROM driver_payouts p
		JOIN drivers d ON p.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		%s
		ORDER BY p.requested_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, query, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query payouts: %w", err)
	}
	defer rows.Close()

	var list []*AdminPayoutDetail
	for rows.Next() {
		p := &AdminPayoutDetail{}
		err := rows.Scan(&p.ID, &p.DriverID, &p.DriverName, &p.Amount, &p.Currency, &p.Status, &p.PaymentReference, &p.FailureReason, &p.RequestedAt, &p.ProcessedAt, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan payout: %w", err)
		}
		list = append(list, p)
	}

	if list == nil {
		list = []*AdminPayoutDetail{}
	}

	return &PaginatedResult[*AdminPayoutDetail]{
		Data:       list,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetPayoutByID(ctx context.Context, payoutID uuid.UUID) (*AdminPayoutDetail, error) {
	p := &AdminPayoutDetail{}
	query := `
		SELECT p.id, p.driver_id, u.full_name, p.amount, p.currency, p.status, p.payment_reference, p.failure_reason, p.requested_at, p.processed_at, p.created_at, p.updated_at
		FROM driver_payouts p
		JOIN drivers d ON p.driver_id = d.id
		JOIN users u ON d.user_id = u.id
		WHERE p.id = $1
	`
	err := r.db.QueryRow(ctx, query, payoutID).Scan(&p.ID, &p.DriverID, &p.DriverName, &p.Amount, &p.Currency, &p.Status, &p.PaymentReference, &p.FailureReason, &p.RequestedAt, &p.ProcessedAt, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPayoutNotFound
		}
		return nil, fmt.Errorf("failed to fetch payout: %w", err)
	}
	return p, nil
}

func (r *Repository) ProcessPayout(ctx context.Context, adminID, payoutID uuid.UUID) (*AdminPayoutDetail, error) {
	ref := fmt.Sprintf("ADMIN-PAYOUT-REF-%d", time.Now().UnixNano())
	query := `UPDATE driver_payouts SET status = 'completed', payment_reference = $1, processed_at = NOW(), updated_at = NOW() WHERE id = $2 AND status IN ('pending', 'processing')`
	res, err := r.db.Exec(ctx, query, ref, payoutID)
	if err != nil || res.RowsAffected() == 0 {
		return nil, ErrPayoutNotFound
	}

	_ = r.CreateAuditLog(ctx, adminID, "process_payout", "payout", &payoutID, map[string]any{"reference": ref})
	return r.GetPayoutByID(ctx, payoutID)
}

func (r *Repository) RejectPayout(ctx context.Context, adminID, payoutID uuid.UUID, reason string) (*AdminPayoutDetail, error) {
	query := `UPDATE driver_payouts SET status = 'failed', failure_reason = $1, updated_at = NOW() WHERE id = $2 AND status IN ('pending', 'processing')`
	res, err := r.db.Exec(ctx, query, reason, payoutID)
	if err != nil || res.RowsAffected() == 0 {
		return nil, ErrPayoutNotFound
	}

	_ = r.CreateAuditLog(ctx, adminID, "reject_payout", "payout", &payoutID, map[string]any{"reason": reason})
	return r.GetPayoutByID(ctx, payoutID)
}
