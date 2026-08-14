package notifications

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrNotificationNotFound = errors.New("notification not found")
	ErrUnauthorizedAccess   = errors.New("unauthorized access to notifications")
)

type Notification struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	Type      string     `json:"type"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	BookingID *uuid.UUID `json:"booking_id,omitempty"`
	TripID    *uuid.UUID `json:"trip_id,omitempty"`
	IsRead    bool       `json:"is_read"`
	CreatedAt time.Time  `json:"created_at"`
}

type PaginatedNotifications struct {
	Data       []*Notification `json:"data"`
	Page       int             `json:"page"`
	Limit      int             `json:"limit"`
	Total      int             `json:"total"`
	TotalPages int             `json:"total_pages"`
}
