package drivers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

type createDriverRequest struct {
	UserID            string `json:"user_id"`
	LicenseNumber     string `json:"license_number"`
	LicenseExpiryDate string `json:"license_expiry_date"`
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req createDriverRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
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

	expiryDate, err := time.Parse("2006-01-02", req.LicenseExpiryDate)
	if err != nil {
		http.Error(w, `{"error":"invalid license_expiry_date, use YYYY-MM-DD"}`, http.StatusBadRequest)
		return
	}

	driver := &Driver{
		UserID:            userID,
		LicenseNumber:     req.LicenseNumber,
		LicenseExpiryDate: expiryDate,
	}

	if err := h.repo.Create(r.Context(), driver); err != nil {
		http.Error(w, `{"error":"failed to create driver"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(driver)
}
