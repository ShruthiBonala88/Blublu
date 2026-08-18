package kyc

import (
	"time"

	"github.com/google/uuid"
)

type KYCSubmission struct {
	ID              uuid.UUID  `json:"id"`
	DriverID        uuid.UUID  `json:"driver_id"`
	DocumentType    string     `json:"document_type"` // driving_license, aadhaar, vehicle_rc
	DocumentNumber  string     `json:"document_number"`
	DocumentURL     string     `json:"document_url,omitempty"`
	Status          string     `json:"status"` // pending, approved, rejected
	RejectionReason string     `json:"rejection_reason,omitempty"`
	SubmittedAt     time.Time  `json:"submitted_at"`
	ReviewedAt      *time.Time `json:"reviewed_at,omitempty"`
}

type SubmitKYCRequest struct {
	DriverID       string `json:"driver_id"`
	DocumentType   string `json:"document_type"`
	DocumentNumber string `json:"document_number"`
	DocumentURL    string `json:"document_url,omitempty"`
}

type ReviewKYCRequest struct {
	Status          string `json:"status"` // approved, rejected
	RejectionReason string `json:"rejection_reason,omitempty"`
}
