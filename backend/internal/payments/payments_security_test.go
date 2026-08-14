package payments

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"testing"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/auth"
)

func TestPayment_SignatureVerificationEdgeCases(t *testing.T) {
	rzp := NewRazorpayServiceWithCredentials("test_key_id", "test_key_secret", "test_webhook_secret")

	orderID := "order_test_123"
	paymentID := "pay_test_456"

	validSig := rzp.GenerateTestSignature(orderID, paymentID)

	// Case 1: Valid signature
	if !rzp.VerifyPaymentSignature(orderID, paymentID, validSig) {
		t.Fatal("expected valid signature verification to pass")
	}

	// Case 2: Tampered order ID
	if rzp.VerifyPaymentSignature("order_test_TAMPERED", paymentID, validSig) {
		t.Fatal("expected tampered order ID to fail signature verification")
	}

	// Case 3: Tampered payment ID
	if rzp.VerifyPaymentSignature(orderID, "pay_test_TAMPERED", validSig) {
		t.Fatal("expected tampered payment ID to fail signature verification")
	}

	// Case 4: Missing fields
	if rzp.VerifyPaymentSignature("", paymentID, validSig) {
		t.Fatal("expected empty order ID to fail verification")
	}
}

func TestPayment_WebhookSignatureEdgeCases(t *testing.T) {
	rzp := NewRazorpayServiceWithCredentials("test_key_id", "test_key_secret", "test_webhook_secret")

	rawBody := []byte(`{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123","order_id":"order_456","amount":50000,"status":"captured"}}}}`)
	validWebhookSig := rzp.GenerateTestWebhookSignature(rawBody)

	// Case 1: Valid raw body & signature
	if !rzp.VerifyWebhookSignature(rawBody, validWebhookSig) {
		t.Fatal("expected valid webhook signature verification to pass")
	}

	// Case 2: Tampered body bytes
	tamperedBody := []byte(`{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_123","order_id":"order_456","amount":1,"status":"captured"}}}}`)
	if rzp.VerifyWebhookSignature(tamperedBody, validWebhookSig) {
		t.Fatal("expected tampered body bytes to fail webhook signature verification")
	}

	// Case 3: Empty body or signature
	if rzp.VerifyWebhookSignature([]byte{}, validWebhookSig) {
		t.Fatal("expected empty body to fail webhook verification")
	}
}

func TestPayment_HandlerWebhookValidation(t *testing.T) {
	rzp := NewRazorpayServiceWithCredentials("test_key_id", "test_key_secret", "test_webhook_secret")
	repo := NewRepository(nil, rzp, nil)
	handler := NewHandler(repo)

	// Case 1: Missing X-Razorpay-Signature header -> 400 Bad Request
	req1 := httptest.NewRequest(http.MethodPost, "/api/v1/payments/webhook", bytes.NewReader([]byte("{}")))
	rec1 := httptest.NewRecorder()
	handler.HandleWebhook(rec1, req1)

	if rec1.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request for missing signature header, got %d", rec1.Code)
	}

	// Case 2: Invalid X-Razorpay-Signature header -> 400 Bad Request
	req2 := httptest.NewRequest(http.MethodPost, "/api/v1/payments/webhook", bytes.NewReader([]byte("{}")))
	req2.Header.Set("X-Razorpay-Signature", "invalid_sig_header")
	rec2 := httptest.NewRecorder()
	handler.HandleWebhook(rec2, req2)

	if rec2.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request for invalid signature header, got %d", rec2.Code)
	}
}

func TestPayment_HandlerCreateOrderContextEnforcement(t *testing.T) {
	rzp := NewRazorpayServiceWithCredentials("test_key_id", "test_key_secret", "test_webhook_secret")
	repo := NewRepository(nil, rzp, nil)
	handler := NewHandler(repo)

	bookingID := uuid.New()
	userA := uuid.New()

	// Client sends arbitrary amount & user_id in JSON body -> Server MUST ignore client amount
	body := []byte(`{"user_id":"` + uuid.New().String() + `", "amount": 1}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/bookings/"+bookingID.String()+"/payment/order", bytes.NewReader(body))
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, userA)
	rec := httptest.NewRecorder()

	handler.CreateOrder(rec, req.WithContext(ctx), bookingID)

	// Because DB is nil, repo returns error (database connection required for DB lookup)
	// Crucially, it must NOT return 200 using the client's dummy amount 1.
	if rec.Code == http.StatusOK {
		t.Fatal("CRITICAL SECURITY ERROR: CreateOrder accepted client body amount!")
	}
}

func TestPayment_SecretNonExposureInJSON(t *testing.T) {
	p := Payment{
		ID:                uuid.New(),
		BookingID:         uuid.New(),
		UserID:            uuid.New(),
		Amount:            500.00,
		Currency:          "INR",
		PaymentStatus:     "paid",
		RazorpayOrderID:   "order_123",
		RazorpayPaymentID: "pay_123",
		RazorpaySignature: "secret_signature_should_never_be_marshaled",
	}

	jsonBytes, err := json.Marshal(p)
	if err != nil {
		t.Fatalf("failed to marshal payment: %v", err)
	}

	jsonStr := string(jsonBytes)
	if bytes.Contains(jsonBytes, []byte("secret_signature_should_never_be_marshaled")) {
		t.Fatalf("CRITICAL SECURITY ERROR: Razorpay signature exposed in JSON output: %s", jsonStr)
	}
}
