package earnings

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

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

type requestPayoutReq struct {
	Amount float64 `json:"amount"`
}

// GET /api/v1/drivers/{driver_id}/earnings/summary
func (h *Handler) GetEarningsSummary(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	summary, err := h.repo.GetDriverEarningsSummary(r.Context(), driverID)
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

// GET /api/v1/drivers/{driver_id}/earnings
func (h *Handler) GetEarningsHistory(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	statusFilter := r.URL.Query().Get("status")
	fromDate := r.URL.Query().Get("from")
	toDate := r.URL.Query().Get("to")
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	earnings, err := h.repo.GetDriverEarnings(r.Context(), driverID, statusFilter, fromDate, toDate, page, limit)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(earnings)
}

// POST /api/v1/drivers/{driver_id}/payouts
func (h *Handler) RequestPayout(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req requestPayoutReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.Amount <= 0 {
		http.Error(w, `{"error":"payout amount must be greater than zero"}`, http.StatusBadRequest)
		return
	}

	payout, err := h.repo.RequestPayout(r.Context(), driverID, req.Amount)
	if err != nil {
		switch {
		case errors.Is(err, ErrDriverNotFound):
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrInvalidPayoutAmount):
			http.Error(w, `{"error":"payout amount must be greater than zero"}`, http.StatusBadRequest)
		case errors.Is(err, ErrInsufficientBalance):
			http.Error(w, `{"error":"insufficient payable balance for payout"}`, http.StatusBadRequest)
		case errors.Is(err, ErrDuplicatePayoutRequest):
			http.Error(w, `{"error":"a payout request is currently processing for this driver"}`, http.StatusConflict)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	if h.notifService != nil {
		if driverUserID, err := h.repo.GetDriverUserID(r.Context(), driverID); err == nil {
			msg := fmt.Sprintf("₹%.2f payout requested.", payout.Amount)
			_, _ = h.notifService.NotifyUser(r.Context(), driverUserID, "payout_requested", "Payout Requested", msg, nil, nil)
			if payout.Status == "completed" {
				msgComp := fmt.Sprintf("₹%.2f payout completed successfully.", payout.Amount)
				_, _ = h.notifService.NotifyUser(r.Context(), driverUserID, "payout_completed", "Payout Completed", msgComp, nil, nil)
			}
		}
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(payout)
}

// GET /api/v1/drivers/{driver_id}/payouts
func (h *Handler) GetPayouts(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	payouts, err := h.repo.GetDriverPayouts(r.Context(), driverID, page, limit)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payouts)
}

// GET /api/v1/drivers/{driver_id}/payouts/{payout_id}
func (h *Handler) GetPayoutByID(w http.ResponseWriter, r *http.Request, driverID, payoutID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	payout, err := h.repo.GetPayoutByID(r.Context(), driverID, payoutID)
	if err != nil {
		switch {
		case errors.Is(err, ErrDriverNotFound):
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrPayoutNotFound):
			http.Error(w, `{"error":"payout record not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedEarningsAccess):
			http.Error(w, `{"error":"unauthorized: driver can only access their own earnings and payouts"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payout)
}
