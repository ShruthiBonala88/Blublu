package notifications

import (
	"context"
	"fmt"
	"math"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, userID uuid.UUID, notifType, title, message string, bookingID, tripID *uuid.UUID) (*Notification, error) {
	query := `
		INSERT INTO notifications (user_id, type, title, message, booking_id, trip_id)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, type, title, message, booking_id, trip_id, is_read, created_at
	`
	n := &Notification{}
	err := r.db.QueryRow(ctx, query, userID, notifType, title, message, bookingID, tripID).Scan(
		&n.ID,
		&n.UserID,
		&n.Type,
		&n.Title,
		&n.Message,
		&n.BookingID,
		&n.TripID,
		&n.IsRead,
		&n.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create notification: %w", err)
	}
	return n, nil
}

func (r *Repository) GetByUserIDPaginated(ctx context.Context, userID uuid.UUID, page, limit int) (*PaginatedNotifications, error) {
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
	err := r.db.QueryRow(ctx, `SELECT COUNT(*) FROM notifications WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count notifications: %w", err)
	}

	query := `
		SELECT id, user_id, type, title, message, booking_id, trip_id, is_read, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(ctx, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query notifications: %w", err)
	}
	defer rows.Close()

	var data []*Notification
	for rows.Next() {
		n := &Notification{}
		err := rows.Scan(
			&n.ID,
			&n.UserID,
			&n.Type,
			&n.Title,
			&n.Message,
			&n.BookingID,
			&n.TripID,
			&n.IsRead,
			&n.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}
		data = append(data, n)
	}

	if data == nil {
		data = []*Notification{}
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	return &PaginatedNotifications{
		Data:       data,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}, nil
}

func (r *Repository) GetUnreadByUserID(ctx context.Context, userID uuid.UUID) ([]*Notification, error) {
	query := `
		SELECT id, user_id, type, title, message, booking_id, trip_id, is_read, created_at
		FROM notifications
		WHERE user_id = $1 AND is_read = false
		ORDER BY created_at DESC
	`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query unread notifications: %w", err)
	}
	defer rows.Close()

	var data []*Notification
	for rows.Next() {
		n := &Notification{}
		err := rows.Scan(
			&n.ID,
			&n.UserID,
			&n.Type,
			&n.Title,
			&n.Message,
			&n.BookingID,
			&n.TripID,
			&n.IsRead,
			&n.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan notification: %w", err)
		}
		data = append(data, n)
	}

	if data == nil {
		data = []*Notification{}
	}

	return data, nil
}

func (r *Repository) MarkAsRead(ctx context.Context, userID, notificationID uuid.UUID) error {
	var actualUserID uuid.UUID
	err := r.db.QueryRow(ctx, `SELECT user_id FROM notifications WHERE id = $1`, notificationID).Scan(&actualUserID)
	if err != nil {
		return ErrNotificationNotFound
	}

	if actualUserID != userID {
		return ErrUnauthorizedAccess
	}

	_, err = r.db.Exec(ctx, `UPDATE notifications SET is_read = true WHERE id = $1`, notificationID)
	if err != nil {
		return fmt.Errorf("failed to mark notification as read: %w", err)
	}
	return nil
}

func (r *Repository) MarkAllAsRead(ctx context.Context, userID uuid.UUID) error {
	_, err := r.db.Exec(ctx, `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, userID)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications as read: %w", err)
	}
	return nil
}

func (r *Repository) GetPassengerIDsForTrip(ctx context.Context, tripID uuid.UUID) ([]uuid.UUID, error) {
	query := `
		SELECT DISTINCT user_id
		FROM bookings
		WHERE trip_id = $1 AND booking_status != 'cancelled'
	`
	rows, err := r.db.Query(ctx, query, tripID)
	if err != nil {
		return nil, fmt.Errorf("failed to get trip passengers: %w", err)
	}
	defer rows.Close()

	var userIDs []uuid.UUID
	for rows.Next() {
		var uid uuid.UUID
		if err := rows.Scan(&uid); err == nil {
			userIDs = append(userIDs, uid)
		}
	}
	return userIDs, nil
}
