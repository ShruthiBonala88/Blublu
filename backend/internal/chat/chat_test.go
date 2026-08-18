package chat

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
)

func TestChatServiceAndHandler(t *testing.T) {
	service := NewService(nil)
	handler := NewHandler(service)

	tripID := uuid.New()
	senderID := uuid.New()

	payload := SendMessageRequest{
		SenderID:   senderID.String(),
		SenderName: "Test Passenger",
		Message:    "Hello driver, I am waiting at the pickup point!",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/chat/trips/"+tripID.String()+"/messages", bytes.NewReader(body))
	w := httptest.NewRecorder()

	handler.HandleTripMessages(w, req, tripID)

	if w.Code != http.StatusCreated {
		t.Fatalf("Expected status 201 Created, got %d. Body: %s", w.Code, w.Body.String())
	}

	// Fetch messages
	reqGet := httptest.NewRequest(http.MethodGet, "/api/v1/chat/trips/"+tripID.String()+"/messages", nil)
	wGet := httptest.NewRecorder()

	handler.HandleTripMessages(wGet, reqGet, tripID)

	if wGet.Code != http.StatusOK {
		t.Fatalf("Expected status 200 OK, got %d", wGet.Code)
	}

	messages, err := service.GetTripMessages(context.Background(), tripID)
	if err != nil {
		t.Fatalf("GetTripMessages failed: %v", err)
	}
	if len(messages) != 1 {
		t.Fatalf("Expected 1 message, got %d", len(messages))
	}
	if messages[0].Message != payload.Message {
		t.Errorf("Expected message text %q, got %q", payload.Message, messages[0].Message)
	}
}
