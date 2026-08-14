package payments

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

// POST /api/v1/bookings/{booking_id}/payment/order
func (h *Handler) CreateOrder(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req CreateOrderRequest
	if r.Body != nil {
		_ = json.NewDecoder(r.Body).Decode(&req)
	}

	ctxUserID, hasCtxUser := auth.GetUserIDFromContext(r.Context())
	var userID uuid.UUID
	if hasCtxUser {
		userID = ctxUserID
	} else if strings.TrimSpace(req.UserID) != "" {
		parsed, err := uuid.Parse(req.UserID)
		if err != nil {
			http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
			return
		}
		userID = parsed
	}

	resp, err := h.repo.CreatePaymentOrder(r.Context(), bookingID, userID)
	if err != nil {
		switch {
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedBooking):
			http.Error(w, `{"error":"booking does not belong to user"}`, http.StatusForbidden)
		case errors.Is(err, ErrBookingCancelled):
			http.Error(w, `{"error":"cannot create payment for cancelled booking"}`, http.StatusConflict)
		case errors.Is(err, ErrBookingAlreadyPaid):
			http.Error(w, `{"error":"booking is already paid"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// POST /api/v1/payments/verify
func (h *Handler) VerifyPayment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req VerifyPaymentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.RazorpayOrderID) == "" || strings.TrimSpace(req.RazorpayPaymentID) == "" || strings.TrimSpace(req.RazorpaySignature) == "" {
		http.Error(w, `{"error":"missing required razorpay fields"}`, http.StatusBadRequest)
		return
	}

	resp, err := h.repo.VerifyPayment(r.Context(), req.RazorpayOrderID, req.RazorpayPaymentID, req.RazorpaySignature)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidSignature):
			http.Error(w, `{"error":"invalid payment signature"}`, http.StatusBadRequest)
		case errors.Is(err, ErrPaymentNotFound):
			http.Error(w, `{"error":"payment record not found"}`, http.StatusNotFound)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

// POST /api/v1/payments/webhook
func (h *Handler) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	sigHeader := r.Header.Get("X-Razorpay-Signature")
	if sigHeader == "" {
		http.Error(w, `{"error":"missing X-Razorpay-Signature header"}`, http.StatusBadRequest)
		return
	}

	bodyBytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"failed to read request body"}`, http.StatusBadRequest)
		return
	}

	err = h.repo.ProcessWebhook(r.Context(), bodyBytes, sigHeader)
	if err != nil {
		if errors.Is(err, ErrInvalidWebhookSignature) {
			http.Error(w, `{"error":"invalid webhook signature"}`, http.StatusBadRequest)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, `{"status":"ok"}`)
}

// GET /api/v1/bookings/{booking_id}/payment
func (h *Handler) GetByBookingID(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	p, err := h.repo.GetPaymentByBookingID(r.Context(), bookingID)
	if err != nil {
		if errors.Is(err, ErrPaymentNotFound) {
			http.Error(w, `{"error":"payment not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(p)
}
