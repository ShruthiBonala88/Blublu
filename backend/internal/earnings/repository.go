package earnings

import (
	"context"
	"errors"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db             *pgxpool.Pool
	payoutProvider PayoutProvider
}

func NewRepository(db *pgxpool.Pool, payoutProvider PayoutProvider) *Repository {
	if payoutProvider == nil {
		payoutProvider = NewDevPayoutProvider()
	}
	return &Repository{
		db:             db,
		payoutProvider: payoutProvider,
	}
}

func getPlatformFeePercent() float64 {
	valStr := strings.TrimSpace(os.Getenv("PLATFORM_FEE_PERCENT"))
	if valStr != "" {
		if val, err := strconv.ParseFloat(valStr, 64); err == nil && val >= 0 && val <= 100 {
			return val
		}
	}
	return 10.0
}

func (r *Repository) GenerateEarningsForTrip(ctx context.Context, tripID, driverID uuid.UUID) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		SELECT b.id, b.amount
		FROM bookings b
		WHERE b.trip_id = $1 AND b.booking_status = 'confirmed' AND b.payment_status = 'paid'
	`

	rows, err := tx.Query(ctx, query, tripID)
	if err != nil {
		return fmt.Errorf("failed to query trip bookings: %w", err)
	}
	defer rows.Close()

	type bookingEarning struct {
		bookingID   uuid.UUID
		grossAmount float64
	}

	var bookingsToEarn []bookingEarning
	for rows.Next() {
		var be bookingEarning
		if err := rows.Scan(&be.bookingID, &be.grossAmount); err != nil {
			return fmt.Errorf("failed to scan booking earning: %w", err)
		}
		bookingsToEarn = append(bookingsToEarn, be)
	}
	rows.Close()

	feePercent := getPlatformFeePercent()

	for _, be := range bookingsToEarn {
		platformFee := math.Round((be.grossAmount*feePercent/100.0)*100) / 100.0
		netAmount := math.Round((be.grossAmount-platformFee)*100) / 100.0

		queryInsert := `
			INSERT INTO driver_earnings (driver_id, trip_id, booking_id, gross_amount, platform_fee, net_amount, currency, status)
			VALUES ($1, $2, $3, $4, $5, $6, 'INR', 'payable')
			ON CONFLICT (driver_id, trip_id, booking_id) DO NOTHING
		`

		_, err := tx.Exec(ctx, queryInsert, driverID, tripID, be.bookingID, be.grossAmount, platformFee, netAmount)
		if err != nil {
			return fmt.Errorf("failed to insert driver earning: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *Repository) GetDriverEarningsSummary(ctx context.Context, driverID uuid.UUID) (*DriverEarningsSummary, error) {
	var driverExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`, driverID).Scan(&driverExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}
	if !driverExists {
		return nil, ErrDriverNotFound
	}

	query := `
		SELECT 
			COALESCE(SUM(gross_amount), 0.00),
			COALESCE(SUM(platform_fee), 0.00),
			COALESCE(SUM(net_amount), 0.00),
			COALESCE(SUM(CASE WHEN status = 'pending' THEN net_amount ELSE 0.00 END), 0.00),
			COALESCE(SUM(CASE WHEN status = 'payable' THEN net_amount ELSE 0.00 END), 0.00),
			COALESCE(SUM(CASE WHEN status = 'paid' THEN net_amount ELSE 0.00 END), 0.00)
		FROM driver_earnings
		WHERE driver_id = $1
	`

	summary := &DriverEarningsSummary{
		DriverID: driverID,
		Currency: "INR",
	}

	err = r.db.QueryRow(ctx, query, driverID).Scan(
		&summary.GrossEarnings,
		&summary.PlatformFees,
		&summary.NetEarnings,
		&summary.PendingAmount,
		&summary.PayableAmount,
		&summary.PaidAmount,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to query earnings summary: %w", err)
	}

	return summary, nil
}

func (r *Repository) GetDriverEarnings(ctx context.Context, driverID uuid.UUID, statusFilter, fromDate, toDate string, page, limit int) (*PaginatedEarnings, error) {
	var driverExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`, driverID).Scan(&driverExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}
	if !driverExists {
		return nil, ErrDriverNotFound
	}

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

	args = append(args, driverID)
	whereClauses = append(whereClauses, fmt.Sprintf("driver_id = $%d", len(args)))

	if statusFilter != "" {
		args = append(args, statusFilter)
		whereClauses = append(whereClauses, fmt.Sprintf("status = $%d", len(args)))
	}

	if fromDate != "" {
		if _, err := time.Parse("2006-01-02", fromDate); err == nil {
			args = append(args, fromDate)
			whereClauses = append(whereClauses, fmt.Sprintf("created_at >= $%d::date", len(args)))
		}
	}

	if toDate != "" {
		if _, err := time.Parse("2006-01-02", toDate); err == nil {
			args = append(args, toDate+" 23:59:59")
			whereClauses = append(whereClauses, fmt.Sprintf("created_at <= $%d::timestamp", len(args)))
		}
	}

	whereSQL := strings.Join(whereClauses, " AND ")

	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM driver_earnings WHERE %s", whereSQL)
	var total int
	err = r.db.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count earnings: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	selectArgs := append([]any{}, args...)
	selectArgs = append(selectArgs, limit, offset)
	selectQuery := fmt.Sprintf(`
		SELECT id, driver_id, trip_id, booking_id, gross_amount, platform_fee, net_amount, currency, status, created_at, updated_at
		FROM driver_earnings
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereSQL, len(selectArgs)-1, len(selectArgs))

	rows, err := r.db.Query(ctx, selectQuery, selectArgs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query earnings list: %w", err)
	}
	defer rows.Close()

	var earnings []*DriverEarning
	for rows.Next() {
		e := &DriverEarning{}
		err := rows.Scan(
			&e.ID,
			&e.DriverID,
			&e.TripID,
			&e.BookingID,
			&e.GrossAmount,
			&e.PlatformFee,
			&e.NetAmount,
			&e.Currency,
			&e.Status,
			&e.CreatedAt,
			&e.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan earning: %w", err)
		}
		earnings = append(earnings, e)
	}

	if earnings == nil {
		earnings = []*DriverEarning{}
	}

	return &PaginatedEarnings{
		Data:       earnings,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) RequestPayout(ctx context.Context, driverID uuid.UUID, amount float64) (*DriverPayout, error) {
	if amount <= 0 {
		return nil, ErrInvalidPayoutAmount
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var activePayoutCount int
	err = tx.QueryRow(ctx, `SELECT COUNT(*) FROM driver_payouts WHERE driver_id = $1 AND status IN ('pending', 'processing')`, driverID).Scan(&activePayoutCount)
	if err != nil {
		return nil, fmt.Errorf("failed to check active payouts: %w", err)
	}
	if activePayoutCount > 0 {
		return nil, ErrDuplicatePayoutRequest
	}

	var totalPayable float64
	err = tx.QueryRow(ctx, `SELECT COALESCE(SUM(net_amount), 0.00) FROM driver_earnings WHERE driver_id = $1 AND status = 'payable'`, driverID).Scan(&totalPayable)
	if err != nil {
		return nil, fmt.Errorf("failed to lock payable earnings: %w", err)
	}

	if totalPayable < amount {
		return nil, ErrInsufficientBalance
	}

	payout := &DriverPayout{}
	queryInsertPayout := `
		INSERT INTO driver_payouts (driver_id, amount, currency, status)
		VALUES ($1, $2, 'INR', 'processing')
		RETURNING id, driver_id, amount, currency, status, payment_reference, failure_reason, requested_at, processed_at, created_at, updated_at
	`

	err = tx.QueryRow(ctx, queryInsertPayout, driverID, amount).Scan(
		&payout.ID,
		&payout.DriverID,
		&payout.Amount,
		&payout.Currency,
		&payout.Status,
		&payout.PaymentReference,
		&payout.FailureReason,
		&payout.RequestedAt,
		&payout.ProcessedAt,
		&payout.CreatedAt,
		&payout.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert payout record: %w", err)
	}

	rows, err := tx.Query(ctx, `SELECT id, net_amount FROM driver_earnings WHERE driver_id = $1 AND status = 'payable' ORDER BY created_at ASC FOR UPDATE`, driverID)
	if err != nil {
		return nil, fmt.Errorf("failed to query payable earnings to reserve: %w", err)
	}

	type earningItem struct {
		id        uuid.UUID
		netAmount float64
	}
	var items []earningItem
	for rows.Next() {
		var item earningItem
		if err := rows.Scan(&item.id, &item.netAmount); err == nil {
			items = append(items, item)
		}
	}
	rows.Close()

	var reservedSum float64
	var reservedIDs []uuid.UUID
	for _, item := range items {
		if reservedSum < amount {
			reservedSum += item.netAmount
			reservedIDs = append(reservedIDs, item.id)
		}
	}

	for _, id := range reservedIDs {
		_, _ = tx.Exec(ctx, `UPDATE driver_earnings SET status = 'reserved', updated_at = NOW() WHERE id = $1`, id)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit payout request transaction: %w", err)
	}

	payoutResult, err := r.payoutProvider.ProcessPayout(ctx, payout.ID, amount, payout.Currency)
	if err != nil || payoutResult.Status == "failed" {
		_, _ = r.db.Exec(ctx, `UPDATE driver_earnings SET status = 'payable', updated_at = NOW() WHERE id = ANY($1)`, reservedIDs)
		failMsg := "payout processing failed"
		if payoutResult != nil && payoutResult.FailureReason != "" {
			failMsg = payoutResult.FailureReason
		}
		_, _ = r.db.Exec(ctx, `UPDATE driver_payouts SET status = 'failed', failure_reason = $1, updated_at = NOW() WHERE id = $2`, failMsg, payout.ID)
		payout.Status = "failed"
		payout.FailureReason = &failMsg
		return payout, nil
	}

	now := time.Now().UTC()
	_, _ = r.db.Exec(ctx, `UPDATE driver_earnings SET status = 'paid', updated_at = NOW() WHERE id = ANY($1)`, reservedIDs)
	_, _ = r.db.Exec(ctx, `UPDATE driver_payouts SET status = 'completed', payment_reference = $1, processed_at = NOW(), updated_at = NOW() WHERE id = $2`, payoutResult.PaymentReference, payout.ID)

	payout.Status = "completed"
	payout.PaymentReference = &payoutResult.PaymentReference
	payout.ProcessedAt = &now

	return payout, nil
}

func (r *Repository) GetDriverPayouts(ctx context.Context, driverID uuid.UUID, page, limit int) (*PaginatedPayouts, error) {
	var driverExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`, driverID).Scan(&driverExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}
	if !driverExists {
		return nil, ErrDriverNotFound
	}

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
	err = r.db.QueryRow(ctx, `SELECT COUNT(*) FROM driver_payouts WHERE driver_id = $1`, driverID).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count payouts: %w", err)
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	query := `
		SELECT id, driver_id, amount, currency, status, payment_reference, failure_reason, requested_at, processed_at, created_at, updated_at
		FROM driver_payouts
		WHERE driver_id = $1
		ORDER BY requested_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, driverID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query payouts: %w", err)
	}
	defer rows.Close()

	var payouts []*DriverPayout
	for rows.Next() {
		p := &DriverPayout{}
		err := rows.Scan(
			&p.ID,
			&p.DriverID,
			&p.Amount,
			&p.Currency,
			&p.Status,
			&p.PaymentReference,
			&p.FailureReason,
			&p.RequestedAt,
			&p.ProcessedAt,
			&p.CreatedAt,
			&p.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan payout: %w", err)
		}
		payouts = append(payouts, p)
	}

	if payouts == nil {
		payouts = []*DriverPayout{}
	}

	return &PaginatedPayouts{
		Data:       payouts,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetPayoutByID(ctx context.Context, driverID, payoutID uuid.UUID) (*DriverPayout, error) {
	var driverExists bool
	err := r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)`, driverID).Scan(&driverExists)
	if err != nil {
		return nil, fmt.Errorf("failed to check driver: %w", err)
	}
	if !driverExists {
		return nil, ErrDriverNotFound
	}

	query := `
		SELECT id, driver_id, amount, currency, status, payment_reference, failure_reason, requested_at, processed_at, created_at, updated_at
		FROM driver_payouts
		WHERE id = $1
	`

	p := &DriverPayout{}
	err = r.db.QueryRow(ctx, query, payoutID).Scan(
		&p.ID,
		&p.DriverID,
		&p.Amount,
		&p.Currency,
		&p.Status,
		&p.PaymentReference,
		&p.FailureReason,
		&p.RequestedAt,
		&p.ProcessedAt,
		&p.CreatedAt,
		&p.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPayoutNotFound
		}
		return nil, fmt.Errorf("failed to fetch payout: %w", err)
	}

	if p.DriverID != driverID {
		return nil, ErrUnauthorizedEarningsAccess
	}

	return p, nil
}

func (r *Repository) GetDriverUserID(ctx context.Context, driverID uuid.UUID) (uuid.UUID, error) {
	var userID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT user_id FROM drivers WHERE id = $1`, driverID).Scan(&userID)
	if err != nil {
		return uuid.Nil, err
	}
	return userID, nil
}
