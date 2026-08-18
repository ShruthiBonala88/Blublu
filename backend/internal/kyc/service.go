package kyc

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db          *pgxpool.Pool
	mu          sync.RWMutex
	submissions map[string]KYCSubmission
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db:          db,
		submissions: make(map[string]KYCSubmission),
	}
}

func (s *Service) SubmitKYC(ctx context.Context, driverID uuid.UUID, docType, docNumber, docURL string) (*KYCSubmission, error) {
	if strings.TrimSpace(docType) == "" {
		return nil, fmt.Errorf("document_type is required")
	}
	if strings.TrimSpace(docNumber) == "" {
		return nil, fmt.Errorf("document_number is required")
	}

	sub := KYCSubmission{
		ID:             uuid.New(),
		DriverID:       driverID,
		DocumentType:   docType,
		DocumentNumber: docNumber,
		DocumentURL:    docURL,
		Status:         "pending",
		SubmittedAt:    time.Now(),
	}

	s.mu.Lock()
	s.submissions[sub.ID.String()] = sub
	s.mu.Unlock()

	return &sub, nil
}

func (s *Service) GetDriverKYCStatus(ctx context.Context, driverID uuid.UUID) ([]KYCSubmission, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []KYCSubmission
	for _, sub := range s.submissions {
		if sub.DriverID == driverID {
			list = append(list, sub)
		}
	}
	return list, nil
}

func (s *Service) ReviewKYC(ctx context.Context, submissionID uuid.UUID, status, rejectionReason string) (*KYCSubmission, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	sub, exists := s.submissions[submissionID.String()]
	if !exists {
		return nil, fmt.Errorf("kyc submission not found")
	}

	status = strings.ToLower(strings.TrimSpace(status))
	if status != "approved" && status != "rejected" {
		return nil, fmt.Errorf("invalid status: must be approved or rejected")
	}

	sub.Status = status
	sub.RejectionReason = rejectionReason
	now := time.Now()
	sub.ReviewedAt = &now

	s.submissions[submissionID.String()] = sub
	return &sub, nil
}

func (s *Service) ListAll(ctx context.Context) ([]KYCSubmission, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []KYCSubmission
	for _, sub := range s.submissions {
		list = append(list, sub)
	}
	return list, nil
}
