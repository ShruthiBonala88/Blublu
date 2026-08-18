package chat

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db       *pgxpool.Pool
	mu       sync.RWMutex
	inMemory map[string][]Message
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db:       db,
		inMemory: make(map[string][]Message),
	}
}

func (s *Service) SaveMessage(ctx context.Context, tripID, senderID uuid.UUID, senderName, content string) (*Message, error) {
	msg := &Message{
		ID:         uuid.New(),
		TripID:     tripID,
		SenderID:   senderID,
		SenderName: senderName,
		Message:    content,
		CreatedAt:  time.Now(),
	}

	if s.db != nil {
		query := `
			INSERT INTO chat_messages (id, trip_id, sender_id, sender_name, message, created_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`
		_, err := s.db.Exec(ctx, query, msg.ID, msg.TripID, msg.SenderID, msg.SenderName, msg.Message, msg.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to insert chat message: %w", err)
		}
	}

	s.mu.Lock()
	key := tripID.String()
	s.inMemory[key] = append(s.inMemory[key], *msg)
	s.mu.Unlock()

	return msg, nil
}

func (s *Service) GetTripMessages(ctx context.Context, tripID uuid.UUID) ([]Message, error) {
	if s.db != nil {
		query := `
			SELECT id, trip_id, sender_id, sender_name, message, created_at
			FROM chat_messages
			WHERE trip_id = $1
			ORDER BY created_at ASC
		`
		rows, err := s.db.Query(ctx, query, tripID)
		if err == nil {
			defer rows.Close()
			var messages []Message
			for rows.Next() {
				var m Message
				if err := rows.Scan(&m.ID, &m.TripID, &m.SenderID, &m.SenderName, &m.Message, &m.CreatedAt); err == nil {
					messages = append(messages, m)
				}
			}
			return messages, nil
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()
	list := s.inMemory[tripID.String()]
	if list == nil {
		return []Message{}, nil
	}
	return list, nil
}
