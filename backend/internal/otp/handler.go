package otp

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	repo          *Repository
	smsProvider   SMSProvider
	emailProvider EmailProvider
}

func NewHandler(repo *Repository, smsProvider SMSProvider, emailProvider ...EmailProvider) *Handler {
	var ep EmailProvider
	if len(emailProvider) > 0 && emailProvider[0] != nil {
		ep = emailProvider[0]
	} else {
		ep = CreateEmailProvider()
	}

	return &Handler{
		repo:          repo,
		smsProvider:   smsProvider,
		emailProvider: ep,
	}
}

type requestOTPPayload struct {
	UserID    string  `json:"user_id,omitempty"`
	Phone     string  `json:"phone,omitempty"`
	Email     string  `json:"email,omitempty"`
	Purpose   string  `json:"purpose"`
	BookingID *string `json:"booking_id,omitempty"`
}

type verifyOTPPayload struct {
	UserID  string `json:"user_id,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Email   string `json:"email,omitempty"`
	OTP     string `json:"otp"`
	Purpose string `json:"purpose"`
}

type verifyRideOTPPayload struct {
	UserID string `json:"user_id"`
	OTP    string `json:"otp"`
}

// POST /api/v1/otp/request
func (h *Handler) RequestOTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req requestOTPPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	purpose := strings.TrimSpace(req.Purpose)
	if purpose == "" {
		purpose = "login"
	}

	otpCode, err := GenerateSecure6DigitOTP()
	if err != nil {
		http.Error(w, `{"error":"failed to generate OTP"}`, http.StatusInternalServerError)
		return
	}

	targetPhone := strings.TrimSpace(req.Phone)
	targetEmail := strings.TrimSpace(req.Email)

	if targetEmail != "" {
		_, err = h.repo.CreateOTPByEmail(r.Context(), targetEmail, purpose, otpCode, 5*time.Minute)
		if err == nil {
			_ = h.emailProvider.SendEmail(
				r.Context(),
				targetEmail,
				"Your Blublu Verification Code",
				fmt.Sprintf("Hello,\n\nYour Blublu verification code is: %s\n\nThis code will expire in 5 minutes.\n\nBest regards,\nBlublu Team", otpCode),
			)
		}
	} else if targetPhone != "" {
		_, err = h.repo.CreateOTPByPhone(r.Context(), targetPhone, purpose, otpCode, 5*time.Minute)
		if err == nil {
			_ = h.smsProvider.SendSMS(r.Context(), targetPhone, fmt.Sprintf("Your Blublu verification code is: %s", otpCode))
		}
	} else if strings.TrimSpace(req.UserID) != "" {
		userID, parseErr := uuid.Parse(req.UserID)
		if parseErr != nil {
			http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
			return
		}

		var bookingID *uuid.UUID
		if req.BookingID != nil && *req.BookingID != "" {
			bid, parseErr := uuid.Parse(*req.BookingID)
			if parseErr == nil {
				bookingID = &bid
			}
		}

		_, err = h.repo.CreateOTP(r.Context(), userID, bookingID, purpose, otpCode, 5*time.Minute)
		if err == nil {
			_ = h.smsProvider.SendSMS(r.Context(), "User "+userID.String(), fmt.Sprintf("Your Blublu verification code is: %s", otpCode))
		}
	} else {
		http.Error(w, `{"error":"phone number, email, or user_id is required"}`, http.StatusBadRequest)
		return
	}

	if err != nil {
		switch {
		case errors.Is(err, ErrUserNotFound):
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrRateLimitExceeded):
			http.Error(w, `{"error":"too many OTP requests, please wait 30 seconds"}`, http.StatusTooManyRequests)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	resp := RequestOTPResponse{
		Message:   "OTP generated and sent successfully",
		ExpiresIn: 300,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// POST /api/v1/otp/verify
func (h *Handler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req verifyOTPPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.OTP) == "" {
		http.Error(w, `{"error":"otp is required"}`, http.StatusBadRequest)
		return
	}

	purpose := strings.TrimSpace(req.Purpose)
	if purpose == "" {
		purpose = "login"
	}

	var verifiedUserID uuid.UUID
	var err error

	if strings.TrimSpace(req.Email) != "" {
		verifiedUserID, err = h.repo.VerifyOTPByEmail(r.Context(), strings.TrimSpace(req.Email), req.OTP, purpose)
	} else if strings.TrimSpace(req.Phone) != "" {
		verifiedUserID, err = h.repo.VerifyOTPByPhone(r.Context(), strings.TrimSpace(req.Phone), req.OTP, purpose)
	} else if strings.TrimSpace(req.UserID) != "" {
		userID, parseErr := uuid.Parse(req.UserID)
		if parseErr != nil {
			http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
			return
		}
		verifiedUserID = userID
		err = h.repo.VerifyOTP(r.Context(), userID, req.OTP, purpose)
	} else {
		http.Error(w, `{"error":"phone number, email, or user_id is required"}`, http.StatusBadRequest)
		return
	}

	if err != nil {
		switch {
		case errors.Is(err, ErrOTPNotFound):
			http.Error(w, `{"error":"OTP record not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrOTPExpired):
			http.Error(w, `{"error":"OTP has expired"}`, http.StatusGone)
		case errors.Is(err, ErrOTPMaxAttemptsExceeded):
			http.Error(w, `{"error":"maximum OTP verification attempts exceeded"}`, http.StatusTooManyRequests)
		case errors.Is(err, ErrOTPAlreadyVerified):
			http.Error(w, `{"error":"OTP has already been verified"}`, http.StatusBadRequest)
		case errors.Is(err, ErrInvalidOTP):
			http.Error(w, `{"error":"invalid OTP code"}`, http.StatusBadRequest)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"verified": true,
		"user_id":  verifiedUserID.String(),
		"message":  "OTP verified successfully",
	})
}

// POST /api/v1/bookings/{booking_id}/verify-ride-otp
func (h *Handler) VerifyRideOTP(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req verifyRideOTPPayload
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.UserID) == "" {
		http.Error(w, `{"error":"user_id is required"}`, http.StatusBadRequest)
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.OTP) == "" {
		http.Error(w, `{"error":"otp is required"}`, http.StatusBadRequest)
		return
	}

	err = h.repo.VerifyBookingRideOTP(r.Context(), userID, bookingID, req.OTP)
	if err != nil {
		switch {
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedRideVerify):
			http.Error(w, `{"error":"unauthorized: booking does not belong to user"}`, http.StatusForbidden)
		case errors.Is(err, ErrBookingNotConfirmed):
			http.Error(w, `{"error":"booking is not in confirmed state"}`, http.StatusBadRequest)
		case errors.Is(err, ErrOTPNotFound):
			http.Error(w, `{"error":"OTP record not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrOTPExpired):
			http.Error(w, `{"error":"OTP has expired"}`, http.StatusGone)
		case errors.Is(err, ErrOTPMaxAttemptsExceeded):
			http.Error(w, `{"error":"maximum OTP verification attempts exceeded"}`, http.StatusTooManyRequests)
		case errors.Is(err, ErrInvalidOTP):
			http.Error(w, `{"error":"invalid OTP code"}`, http.StatusBadRequest)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(VerifyOTPResponse{
		Verified:  true,
		Message:   "ride verification successful",
		BookingID: bookingID.String(),
	})
}
