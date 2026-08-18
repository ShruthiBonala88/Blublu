package chat

import (
	"time"

	"github.com/google/uuid"
)

type Message struct {
	ID         uuid.UUID `json:"id"`
	TripID     uuid.UUID `json:"trip_id"`
	SenderID   uuid.UUID `json:"sender_id"`
	SenderName string    `json:"sender_name"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}

type SendMessageRequest struct {
	SenderID   string `json:"sender_id"`
	SenderName string `json:"sender_name"`
	Message    string `json:"message"`
}
