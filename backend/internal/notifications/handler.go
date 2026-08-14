package notifications

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/google/uuid"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
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

// GET /api/v1/users/{user_id}/notifications
func (h *Handler) ListByUser(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	page, limit := parsePageAndLimit(r)
	resp, err := h.repo.GetByUserIDPaginated(r.Context(), userID, page, limit)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(resp)
}

// GET /api/v1/users/{user_id}/notifications/unread
func (h *Handler) GetUnread(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	list, err := h.repo.GetUnreadByUserID(r.Context(), userID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(list)
}

// POST /api/v1/users/{user_id}/notifications/{notification_id}/read
func (h *Handler) MarkAsRead(w http.ResponseWriter, r *http.Request, userID, notifID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	err := h.repo.MarkAsRead(r.Context(), userID, notifID)
	if err != nil {
		switch {
		case errors.Is(err, ErrNotificationNotFound):
			http.Error(w, `{"error":"notification not found"}`, http.StatusNotFound)
		case errors.Is(err, ErrUnauthorizedAccess):
			http.Error(w, `{"error":"unauthorized access to notification"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		}
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "notification marked as read",
	})
}

// POST /api/v1/users/{user_id}/notifications/read-all
func (h *Handler) MarkAllAsRead(w http.ResponseWriter, r *http.Request, userID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	err := h.repo.MarkAllAsRead(r.Context(), userID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "all notifications marked as read",
	})
}
