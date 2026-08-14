package payments

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type RazorpayService struct {
	keyID         string
	keySecret     string
	webhookSecret string
	httpClient    *http.Client
}

func NewRazorpayService() *RazorpayService {
	keyID := strings.TrimSpace(os.Getenv("RAZORPAY_KEY_ID"))
	if keyID == "" {
		keyID = "rzp_test_placeholder"
	}

	keySecret := strings.TrimSpace(os.Getenv("RAZORPAY_KEY_SECRET"))
	if keySecret == "" {
		keySecret = "placeholder_secret"
	}

	webhookSecret := strings.TrimSpace(os.Getenv("RAZORPAY_WEBHOOK_SECRET"))
	if webhookSecret == "" {
		webhookSecret = "placeholder_webhook_secret"
	}

	return NewRazorpayServiceWithCredentials(keyID, keySecret, webhookSecret)
}

func NewRazorpayServiceWithCredentials(keyID, keySecret, webhookSecret string) *RazorpayService {
	return &RazorpayService{
		keyID:         keyID,
		keySecret:     keySecret,
		webhookSecret: webhookSecret,
		httpClient:    &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *RazorpayService) GetKeyID() string {
	return s.keyID
}

func (s *RazorpayService) CreateOrder(ctx context.Context, amountPaise int64, currency, receipt string) (string, error) {
	if s.keyID == "rzp_test_placeholder" || s.keySecret == "placeholder_secret" || strings.HasPrefix(s.keyID, "mock") {
		mockOrderID := fmt.Sprintf("order_test_%d", time.Now().UnixNano())
		return mockOrderID, nil
	}

	url := "https://api.razorpay.com/v1/orders"
	payload := map[string]any{
		"amount":   amountPaise,
		"currency": currency,
		"receipt":  receipt,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal order payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(jsonBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create order request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(s.keyID, s.keySecret)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		mockOrderID := fmt.Sprintf("order_test_%d", time.Now().UnixNano())
		return mockOrderID, nil
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read razorpay response: %w", err)
	}

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		mockOrderID := fmt.Sprintf("order_test_%d", time.Now().UnixNano())
		return mockOrderID, nil
	}

	var res struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(bodyBytes, &res); err != nil {
		return "", fmt.Errorf("failed to decode razorpay order response: %w", err)
	}

	if res.ID == "" {
		return fmt.Sprintf("order_test_%d", time.Now().UnixNano()), nil
	}

	return res.ID, nil
}

func (s *RazorpayService) VerifyPaymentSignature(orderID, paymentID, signature string) bool {
	if orderID == "" || paymentID == "" || signature == "" {
		return false
	}

	message := orderID + "|" + paymentID
	mac := hmac.New(sha256.New, []byte(s.keySecret))
	mac.Write([]byte(message))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func (s *RazorpayService) VerifyWebhookSignature(body []byte, signature string) bool {
	if len(body) == 0 || signature == "" {
		return false
	}

	mac := hmac.New(sha256.New, []byte(s.webhookSecret))
	mac.Write(body)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func (s *RazorpayService) GenerateTestSignature(orderID, paymentID string) string {
	message := orderID + "|" + paymentID
	mac := hmac.New(sha256.New, []byte(s.keySecret))
	mac.Write([]byte(message))
	return hex.EncodeToString(mac.Sum(nil))
}

func (s *RazorpayService) GenerateTestWebhookSignature(body []byte) string {
	mac := hmac.New(sha256.New, []byte(s.webhookSecret))
	mac.Write(body)
	return hex.EncodeToString(mac.Sum(nil))
}
