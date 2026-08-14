package reviews

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
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

type passengerRatingReq struct {
	UserID string `json:"user_id"`
	Rating int    `json:"rating"`
	Review string `json:"review,omitempty"`
}

type driverRatingReq struct {
	DriverID string `json:"driver_id"`
	Rating   int    `json:"rating"`
	Review   string `json:"review,omitempty"`
}

type updateReviewReq struct {
	UserID string `json:"user_id"`
	Rating int    `json:"rating"`
	Review string `json:"review,omitempty"`
}

// POST /api/v1/bookings/{booking_id}/rating
func (h *Handler) RateDriver(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req passengerRatingReq
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

	ratingReview, revieweeID, err := h.repo.CreatePassengerRating(r.Context(), bookingID, userID, req.Rating, req.Review)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidRating):
			http.Error(w, `{"error":"invalid rating: score must be between 1 and 5"}`, http.StatusBadRequest)
		case errors.Is(err, ErrReviewTooLong):
			http.Error(w, `{"error":"review text exceeds maximum length of 1000 characters"}`, http.StatusBadRequest)
		case errors.Is(err, ErrSelfReviewNotAllowed):
			http.Error(w, `{"error":"self-review is not allowed"}`, http.StatusBadRequest)
		case errors.Is(err, ErrUnauthorizedRating):
			http.Error(w, `{"error":"unauthorized access to booking rating"}`, http.StatusForbidden)
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotCompleted):
			http.Error(w, `{"error":"rating is only allowed after trip completion"}`, http.StatusConflict)
		case errors.Is(err, ErrDuplicateReview):
			http.Error(w, `{"error":"review has already been submitted for this booking"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	if h.notifService != nil && revieweeID != uuid.Nil {
		_, _ = h.notifService.NotifyUser(r.Context(), revieweeID, "rating_received", "You received a new rating", "A passenger rated your completed ride.", &bookingID, &ratingReview.TripID)
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ratingReview)
}

// POST /api/v1/driver/bookings/{booking_id}/rating
func (h *Handler) RatePassenger(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req driverRatingReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.DriverID) == "" {
		http.Error(w, `{"error":"driver_id is required"}`, http.StatusBadRequest)
		return
	}

	driverID, err := uuid.Parse(req.DriverID)
	if err != nil {
		http.Error(w, `{"error":"invalid driver_id"}`, http.StatusBadRequest)
		return
	}

	ratingReview, revieweeID, err := h.repo.CreateDriverRating(r.Context(), bookingID, driverID, req.Rating, req.Review)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidRating):
			http.Error(w, `{"error":"invalid rating: score must be between 1 and 5"}`, http.StatusBadRequest)
		case errors.Is(err, ErrReviewTooLong):
			http.Error(w, `{"error":"review text exceeds maximum length of 1000 characters"}`, http.StatusBadRequest)
		case errors.Is(err, ErrSelfReviewNotAllowed):
			http.Error(w, `{"error":"self-review is not allowed"}`, http.StatusBadRequest)
		case errors.Is(err, ErrUnauthorizedRating):
			http.Error(w, `{"error":"unauthorized access to booking rating"}`, http.StatusForbidden)
		case errors.Is(err, ErrBookingNotFound):
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrTripNotCompleted):
			http.Error(w, `{"error":"rating is only allowed after trip completion"}`, http.StatusConflict)
		case errors.Is(err, ErrDuplicateReview):
			http.Error(w, `{"error":"review has already been submitted for this booking"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	if h.notifService != nil && revieweeID != uuid.Nil {
		_, _ = h.notifService.NotifyUser(r.Context(), revieweeID, "rating_received", "You received a new rating", "Your driver rated your completed ride.", &bookingID, &ratingReview.TripID)
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ratingReview)
}

// GET /api/v1/drivers/{driver_id}/rating
func (h *Handler) GetDriverRatingSummary(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	summary, err := h.repo.GetDriverRatingSummary(r.Context(), driverID)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(summary)
}

// GET /api/v1/drivers/{driver_id}/reviews
func (h *Handler) GetDriverReviews(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	reviews, err := h.repo.GetDriverReviews(r.Context(), driverID, page, limit)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(reviews)
}

// GET /api/v1/users/{user_id}/reviews
func (h *Handler) GetUserReviews(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	reviews, err := h.repo.GetUserReviews(r.Context(), userID, page, limit)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(reviews)
}

// PATCH /api/v1/ratings/{rating_id}
func (h *Handler) UpdateReview(w http.ResponseWriter, r *http.Request, ratingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPatch {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req updateReviewReq
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

	ratingReview, err := h.repo.UpdateReview(r.Context(), ratingID, userID, req.Rating, req.Review)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidRating):
			http.Error(w, `{"error":"invalid rating: score must be between 1 and 5"}`, http.StatusBadRequest)
		case errors.Is(err, ErrReviewTooLong):
			http.Error(w, `{"error":"review text exceeds maximum length of 1000 characters"}`, http.StatusBadRequest)
		case errors.Is(err, ErrRatingNotFound):
			http.Error(w, `{"error":"rating not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedUpdate):
			http.Error(w, `{"error":"unauthorized: only original reviewer can update this review"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ratingReview)
}
