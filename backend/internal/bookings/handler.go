package bookings

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
	"github.com/vikas/blublu/internal/notifications"
)

type Handler struct {
	repo         *Repository
	notifService *notifications.Service
}

func NewHandler(repo *Repository, notifService *notifications.Service) *Handler {
	return &Handler{
		repo:         repo,
		notifService: notifService,
	}
}

type createBookingRequest struct {
	UserID      string   `json:"user_id"`
	TripID      string   `json:"trip_id"`
	TripSeatIDs []string `json:"trip_seat_ids"`
}

type cancelBookingRequest struct {
	UserID string `json:"user_id"`
	Reason string `json:"reason"`
}

func parsePageAndLimit(r *http.Request) (int, int) {
	page := 1
	limit := 20
	if pStr := r.URL.Query().Get("page"); pStr != "" {
		if p, err := strconv.Atoi(pStr); err == nil && p > 0 {
			page = p
		}
	}
	if lStr := r.URL.Query().Get("limit"); lStr != "" {
		if l, err := strconv.Atoi(lStr); err == nil && l > 0 {
			limit = l
		}
	}
	return page, limit
}

// POST /api/v1/bookings
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req createBookingRequest
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

	if _, ok := auth.GetUserIDFromContext(r.Context()); ok {
		if !auth.ValidateOwnershipOrAdmin(r.Context(), userID) {
			http.Error(w, `{"error":"forbidden: user_id does not match authenticated user"}`, http.StatusForbidden)
			return
		}
	}

	if strings.TrimSpace(req.TripID) == "" {
		http.Error(w, `{"error":"trip_id is required"}`, http.StatusBadRequest)
		return
	}

	tripID, err := uuid.Parse(req.TripID)
	if err != nil {
		http.Error(w, `{"error":"invalid trip_id"}`, http.StatusBadRequest)
		return
	}

	if len(req.TripSeatIDs) == 0 {
		http.Error(w, `{"error":"trip_seat_ids cannot be empty"}`, http.StatusBadRequest)
		return
	}

	var seatIDs []uuid.UUID
	for _, idStr := range req.TripSeatIDs {
		sid, err := uuid.Parse(idStr)
		if err != nil {
			http.Error(w, `{"error":"invalid trip_seat_id"}`, http.StatusBadRequest)
			return
		}
		seatIDs = append(seatIDs, sid)
	}

	booking, err := h.repo.CreateBooking(r.Context(), userID, tripID, seatIDs)
	if err != nil {
		switch {
		case errors.Is(err, ErrUserNotFound):
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotFound):
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrSeatNotFound):
			http.Error(w, `{"error":"seat not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrSeatBelongsToAnotherTrip):
			http.Error(w, `{"error":"seat belongs to another trip"}`, http.StatusBadRequest)
		case errors.Is(err, ErrTripNotScheduled):
			http.Error(w, `{"error":"trip is not scheduled"}`, http.StatusBadRequest)
		case errors.Is(err, ErrTripPassed):
			http.Error(w, `{"error":"trip departure time has passed"}`, http.StatusBadRequest)
		case errors.Is(err, ErrSeatAlreadyBooked):
			http.Error(w, `{"error":"seat is already booked"}`, http.StatusConflict)
		case errors.Is(err, ErrSeatNotLocked):
			http.Error(w, `{"error":"seat must be locked before booking"}`, http.StatusConflict)
		case errors.Is(err, ErrSeatLockExpired):
			http.Error(w, `{"error":"seat lock has expired"}`, http.StatusConflict)
		case errors.Is(err, ErrSeatLockedByAnotherUser):
			http.Error(w, `{"error":"seat is locked by another user"}`, http.StatusConflict)
		case errors.Is(err, ErrInsufficientSeats):
			http.Error(w, `{"error":"insufficient available seats"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	if h.notifService != nil {
		_, _ = h.notifService.NotifyUser(r.Context(), booking.UserID, "booking_confirmed", "Booking Confirmed", "Your booking has been confirmed.", &booking.ID, &booking.TripID)
	}
	json.NewEncoder(w).Encode(booking)
}

// GET /api/v1/bookings/{id} and POST /api/v1/bookings/{id}/cancel
func (h *Handler) GetByID(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) < 4 || parts[0] != "api" || parts[1] != "v1" || parts[2] != "bookings" {
		http.Error(w, `{"error":"invalid booking path"}`, http.StatusBadRequest)
		return
	}

	bookingIDStr := parts[3]
	bookingID, err := uuid.Parse(bookingIDStr)
	if err != nil {
		http.Error(w, `{"error":"invalid booking_id"}`, http.StatusBadRequest)
		return
	}

	if len(parts) == 5 && parts[4] == "cancel" {
		h.Cancel(w, r, bookingID)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	booking, err := h.repo.GetByID(r.Context(), bookingID)
	if err != nil {
		if errors.Is(err, ErrBookingNotFound) {
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(booking)
}

// POST /api/v1/bookings/{id}/cancel
func (h *Handler) Cancel(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req cancelBookingRequest
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

	if _, ok := auth.GetUserIDFromContext(r.Context()); ok {
		if !auth.ValidateOwnershipOrAdmin(r.Context(), userID) {
			http.Error(w, `{"error":"forbidden: user_id does not match authenticated user"}`, http.StatusForbidden)
			return
		}
	}

	booking, err := h.repo.CancelBooking(r.Context(), bookingID, userID, req.Reason)
	if err != nil {
		switch {
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedCancellation):
			http.Error(w, `{"error":"unauthorized to cancel this booking"}`, http.StatusForbidden)
		case errors.Is(err, ErrBookingAlreadyCancelled):
			http.Error(w, `{"error":"booking is already cancelled"}`, http.StatusConflict)
		case errors.Is(err, ErrBookingAlreadyCompleted):
			http.Error(w, `{"error":"booking is already completed"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	if h.notifService != nil {
		_, _ = h.notifService.NotifyUser(r.Context(), booking.UserID, "booking_cancelled", "Booking Cancelled", "Your booking has been cancelled.", &booking.ID, &booking.TripID)
	}
	json.NewEncoder(w).Encode(booking)
}

// GET /api/v1/users/{user_id}/bookings
func (h *Handler) ListByUser(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	h.ListByUserPaginated(w, r, userID)
}

// GET /api/v1/users/{user_id}/bookings (Paginated)
func (h *Handler) ListByUserPaginated(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	page, limit := parsePageAndLimit(r)
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))

	resp, err := h.repo.GetPassengerBookingsPaginated(r.Context(), userID, statusFilter, page, limit)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}

// GET /api/v1/users/{user_id}/bookings/{booking_id}
func (h *Handler) GetPassengerBookingByID(w http.ResponseWriter, r *http.Request, userID, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	booking, err := h.repo.GetPassengerBookingByID(r.Context(), userID, bookingID)
	if err != nil {
		switch {
		case errors.Is(err, ErrUserNotFound):
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedBookingAccess):
			http.Error(w, `{"error":"unauthorized: booking does not belong to user"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	json.NewEncoder(w).Encode(booking)
}

// POST /api/v1/users/{user_id}/bookings/{booking_id}/cancel
func (h *Handler) CancelPassengerBooking(w http.ResponseWriter, r *http.Request, userID, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req cancelBookingRequest
	_ = json.NewDecoder(r.Body).Decode(&req)

	booking, err := h.repo.CancelBooking(r.Context(), bookingID, userID, req.Reason)
	if err != nil {
		switch {
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedCancellation):
			http.Error(w, `{"error":"unauthorized to cancel this booking"}`, http.StatusForbidden)
		case errors.Is(err, ErrBookingAlreadyCancelled):
			http.Error(w, `{"error":"booking is already cancelled"}`, http.StatusConflict)
		case errors.Is(err, ErrBookingAlreadyCompleted):
			http.Error(w, `{"error":"booking is already completed"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(booking)
}

// GET /api/v1/users/{user_id}/rides/*
func (h *Handler) ListPassengerRides(w http.ResponseWriter, r *http.Request, userID uuid.UUID, category string) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	page, limit := parsePageAndLimit(r)
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))

	resp, err := h.repo.GetPassengerRides(r.Context(), userID, category, statusFilter, page, limit)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}
