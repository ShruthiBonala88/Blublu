package payments

import (
	"testing"
)

func TestRazorpaySignatureVerification(t *testing.T) {
	rzp := NewRazorpayService()

	orderID := "order_9A33XWu170gUtm"
	paymentID := "pay_29q7yfRvnNwZEH"
	sig := rzp.GenerateTestSignature(orderID, paymentID)

	if !rzp.VerifyPaymentSignature(orderID, paymentID, sig) {
		t.Fatalf("Expected signature verification to succeed")
	}

	if rzp.VerifyPaymentSignature(orderID, paymentID, "invalid_sig") {
		t.Fatalf("Expected signature verification to fail for invalid signature")
	}
}

func TestRazorpayWebhookSignatureVerification(t *testing.T) {
	rzp := NewRazorpayService()

	body := []byte(`{"event":"payment.captured","payload":{}}`)
	sig := rzp.GenerateTestWebhookSignature(body)

	if !rzp.VerifyWebhookSignature(body, sig) {
		t.Fatalf("Expected webhook signature verification to succeed")
	}

	if rzp.VerifyWebhookSignature(body, "invalid_webhook_sig") {
		t.Fatalf("Expected webhook signature verification to fail for invalid signature")
	}
}
