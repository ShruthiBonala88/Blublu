package notifications

import (
	"context"
	"fmt"

	"github.com/google/uuid"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) NotifyUser(ctx context.Context, userID uuid.UUID, notifType, title, message string, bookingID, tripID *uuid.UUID) (*Notification, error) {
	return s.repo.Create(ctx, userID, notifType, title, message, bookingID, tripID)
}

func (s *Service) NotifyTripPassengers(ctx context.Context, tripID uuid.UUID, notifType, title, message string) ([]*Notification, error) {
	passengerIDs, err := s.repo.GetPassengerIDsForTrip(ctx, tripID)
	if err != nil {
		return nil, fmt.Errorf("failed to get trip passengers for notification: %w", err)
	}

	var created []*Notification
	for _, uid := range passengerIDs {
		n, err := s.repo.Create(ctx, uid, notifType, title, message, nil, &tripID)
		if err == nil {
			created = append(created, n)
		}
	}
	return created, nil
}
