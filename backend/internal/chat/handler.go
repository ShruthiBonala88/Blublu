package chat

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// POST /api/v1/chat/trips/{trip_id}/messages
// GET /api/v1/chat/trips/{trip_id}/messages
func (h *Handler) HandleTripMessages(w http.ResponseWriter, r *http.Request, tripID uuid.UUID) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		messages, err := h.service.GetTripMessages(r.Context(), tripID)
		if err != nil {
			http.Error(w, `{"error":"failed to fetch messages"}`, http.StatusInternalServerError)
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"trip_id":  tripID.String(),
			"messages": messages,
		})

	case http.MethodPost:
		var req SendMessageRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
			return
		}

		if strings.TrimSpace(req.Message) == "" {
			http.Error(w, `{"error":"message content cannot be empty"}`, http.StatusBadRequest)
			return
		}

		senderID, err := uuid.Parse(req.SenderID)
		if err != nil {
			http.Error(w, `{"error":"invalid sender_id"}`, http.StatusBadRequest)
			return
		}

		senderName := strings.TrimSpace(req.SenderName)
		if senderName == "" {
			senderName = "User"
		}

		msg, err := h.service.SaveMessage(r.Context(), tripID, senderID, senderName, req.Message)
		if err != nil {
			http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(msg)

	default:
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	}
}
