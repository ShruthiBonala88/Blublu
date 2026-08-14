package admin

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/google/uuid"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

type updateUserStatusReq struct {
	IsActive bool `json:"is_active"`
}

type updateDriverStatusReq struct {
	Status string `json:"status"`
}

type rejectReq struct {
	Reason string `json:"reason"`
}

// GET /api/v1/admin/dashboard
func (h *Handler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	summary, err := h.repo.GetDashboardSummary(r.Context())
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(summary)
}

// GET /api/v1/admin/users
func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	search := strings.TrimSpace(r.URL.Query().Get("search"))
	roleFilter := strings.TrimSpace(r.URL.Query().Get("role"))
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetUsers(r.Context(), search, roleFilter, statusFilter, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/users/{id}
func (h *Handler) GetUserByID(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	user, err := h.repo.GetUserByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// PATCH /api/v1/admin/users/{id}/status
func (h *Handler) UpdateUserStatus(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	adminID, _ := GetAdminUserIDFromContext(r.Context())

	var req updateUserStatusReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	user, err := h.repo.UpdateUserStatus(r.Context(), adminID, userID, req.IsActive)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			http.Error(w, `{"error":"user not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

// GET /api/v1/admin/drivers
func (h *Handler) GetDrivers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	search := strings.TrimSpace(r.URL.Query().Get("search"))
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetDrivers(r.Context(), search, statusFilter, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/drivers/{id}
func (h *Handler) GetDriverByID(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	driver, err := h.repo.GetDriverByID(r.Context(), driverID)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(driver)
}

// POST /api/v1/admin/drivers/{id}/approve
func (h *Handler) ApproveDriver(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")
	adminID, _ := GetAdminUserIDFromContext(r.Context())

	driver, err := h.repo.ApproveDriver(r.Context(), adminID, driverID)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(driver)
}

// POST /api/v1/admin/drivers/{id}/reject
func (h *Handler) RejectDriver(w http.ResponseWriter, r *http.Request, driverID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")
	adminID, _ := GetAdminUserIDFromContext(r.Context())

	var req rejectReq
	_ = json.NewDecoder(r.Body).Decode(&req)
	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		reason = "Document verification failed"
	}

	driver, err := h.repo.RejectDriver(r.Context(), adminID, driverID, reason)
	if err != nil {
		if errors.Is(err, ErrDriverNotFound) {
			http.Error(w, `{"error":"driver not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(driver)
}

// GET /api/v1/admin/vehicles
func (h *Handler) GetVehicles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	driverID := strings.TrimSpace(r.URL.Query().Get("driver_id"))
	vehicleType := strings.TrimSpace(r.URL.Query().Get("vehicle_type"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetVehicles(r.Context(), driverID, vehicleType, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/vehicles/{id}
func (h *Handler) GetVehicleByID(w http.ResponseWriter, r *http.Request, vehicleID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	v, err := h.repo.GetVehicleByID(r.Context(), vehicleID)
	if err != nil {
		if errors.Is(err, ErrVehicleNotFound) {
			http.Error(w, `{"error":"vehicle not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(v)
}

// GET /api/v1/admin/trips
func (h *Handler) GetTrips(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	origin := strings.TrimSpace(r.URL.Query().Get("origin"))
	destination := strings.TrimSpace(r.URL.Query().Get("destination"))
	dateStr := strings.TrimSpace(r.URL.Query().Get("date"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetTrips(r.Context(), statusFilter, origin, destination, dateStr, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/trips/{id}
func (h *Handler) GetTripByID(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	t, err := h.repo.GetTripByID(r.Context(), tripID)
	if err != nil {
		if errors.Is(err, ErrTripNotFound) {
			http.Error(w, `{"error":"trip not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(t)
}

// GET /api/v1/admin/bookings
func (h *Handler) GetBookings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	tripID := strings.TrimSpace(r.URL.Query().Get("trip_id"))
	driverID := strings.TrimSpace(r.URL.Query().Get("driver_id"))
	userID := strings.TrimSpace(r.URL.Query().Get("user_id"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetBookings(r.Context(), statusFilter, tripID, driverID, userID, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/bookings/{id}
func (h *Handler) GetBookingByID(w http.ResponseWriter, r *http.Request, bookingID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	b, err := h.repo.GetBookingByID(r.Context(), bookingID)
	if err != nil {
		if errors.Is(err, ErrBookingNotFound) {
			http.Error(w, `{"error":"booking not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(b)
}

// GET /api/v1/admin/payments
func (h *Handler) GetPayments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	fromDate := strings.TrimSpace(r.URL.Query().Get("from"))
	toDate := strings.TrimSpace(r.URL.Query().Get("to"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetPayments(r.Context(), statusFilter, fromDate, toDate, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/payments/{id}
func (h *Handler) GetPaymentByID(w http.ResponseWriter, r *http.Request, paymentID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	p, err := h.repo.GetPaymentByID(r.Context(), paymentID)
	if err != nil {
		if errors.Is(err, ErrPaymentNotFound) {
			http.Error(w, `{"error":"payment not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(p)
}

// GET /api/v1/admin/earnings
func (h *Handler) GetEarnings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	driverID := strings.TrimSpace(r.URL.Query().Get("driver_id"))
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	fromDate := strings.TrimSpace(r.URL.Query().Get("from"))
	toDate := strings.TrimSpace(r.URL.Query().Get("to"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetEarnings(r.Context(), driverID, statusFilter, fromDate, toDate, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/earnings/{id}
func (h *Handler) GetEarningByID(w http.ResponseWriter, r *http.Request, earningID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	e, err := h.repo.GetEarningByID(r.Context(), earningID)
	if err != nil {
		if errors.Is(err, ErrEarningNotFound) {
			http.Error(w, `{"error":"earning not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(e)
}

// GET /api/v1/admin/payouts
func (h *Handler) GetPayouts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	driverID := strings.TrimSpace(r.URL.Query().Get("driver_id"))
	statusFilter := strings.TrimSpace(r.URL.Query().Get("status"))
	fromDate := strings.TrimSpace(r.URL.Query().Get("from"))
	toDate := strings.TrimSpace(r.URL.Query().Get("to"))
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	res, err := h.repo.GetPayouts(r.Context(), driverID, statusFilter, fromDate, toDate, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(res)
}

// GET /api/v1/admin/payouts/{id}
func (h *Handler) GetPayoutByID(w http.ResponseWriter, r *http.Request, payoutID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	p, err := h.repo.GetPayoutByID(r.Context(), payoutID)
	if err != nil {
		if errors.Is(err, ErrPayoutNotFound) {
			http.Error(w, `{"error":"payout not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(p)
}

// POST /api/v1/admin/payouts/{id}/process
func (h *Handler) ProcessPayout(w http.ResponseWriter, r *http.Request, payoutID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")
	adminID, _ := GetAdminUserIDFromContext(r.Context())

	payout, err := h.repo.ProcessPayout(r.Context(), adminID, payoutID)
	if err != nil {
		if errors.Is(err, ErrPayoutNotFound) {
			http.Error(w, `{"error":"payout not found or already processed"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payout)
}

// POST /api/v1/admin/payouts/{id}/reject
func (h *Handler) RejectPayout(w http.ResponseWriter, r *http.Request, payoutID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")
	adminID, _ := GetAdminUserIDFromContext(r.Context())

	var req rejectReq
	_ = json.NewDecoder(r.Body).Decode(&req)
	reason := strings.TrimSpace(req.Reason)
	if reason == "" {
		reason = "Administrative payout rejection"
	}

	payout, err := h.repo.RejectPayout(r.Context(), adminID, payoutID, reason)
	if err != nil {
		if errors.Is(err, ErrPayoutNotFound) {
			http.Error(w, `{"error":"payout not found or already processed"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payout)
}
