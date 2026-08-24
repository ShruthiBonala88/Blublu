package otp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type SMSProvider interface {
	SendSMS(ctx context.Context, phone, message string) error
}

// DevSMSProvider logs SMS to the backend console
type DevSMSProvider struct{}

func NewDevSMSProvider() *DevSMSProvider {
	return &DevSMSProvider{}
}

func (p *DevSMSProvider) SendSMS(ctx context.Context, phone, message string) error {
	fmt.Printf("\n📱 ================= SMS DISPATCH =================\n")
	fmt.Printf("   Recipient: %s\n", phone)
	fmt.Printf("   Message  : %s\n", message)
	fmt.Printf("==================================================\n\n")
	return nil
}

// Fast2SMSProvider sends real SMS to Indian mobile numbers via Fast2SMS API
type Fast2SMSProvider struct {
	apiKey     string
	httpClient *http.Client
}

func NewFast2SMSProvider(apiKey string) *Fast2SMSProvider {
	return &Fast2SMSProvider{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (p *Fast2SMSProvider) SendSMS(ctx context.Context, phone, message string) error {
	// Strip +91 or non-digits for Fast2SMS Indian number format
	cleanPhone := strings.TrimPrefix(phone, "+91")
	cleanPhone = strings.TrimPrefix(cleanPhone, "+")
	cleanPhone = strings.ReplaceAll(cleanPhone, " ", "")

	payload := map[string]any{
		"route":     "otp",
		"variables_values": message,
		"numbers":   cleanPhone,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://www.fast2sms.com/dev/bulkV2", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return err
	}

	req.Header.Set("authorization", p.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("fast2sms request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("fast2sms returned status %d: %s", resp.StatusCode, string(respBody))
	}

	fmt.Printf("✅ Real SMS sent via Fast2SMS to %s: %s\n", phone, string(respBody))
	return nil
}

// TwilioSMSProvider sends real SMS globally via Twilio API
type TwilioSMSProvider struct {
	accountSID string
	authToken  string
	fromPhone  string
	httpClient *http.Client
}

func NewTwilioSMSProvider(accountSID, authToken, fromPhone string) *TwilioSMSProvider {
	return &TwilioSMSProvider{
		accountSID: accountSID,
		authToken:  authToken,
		fromPhone:  fromPhone,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (p *TwilioSMSProvider) SendSMS(ctx context.Context, phone, message string) error {
	apiURL := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", p.accountSID)

	data := url.Values{}
	data.Set("To", phone)
	data.Set("From", p.fromPhone)
	data.Set("Body", message)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.SetBasicAuth(p.accountSID, p.authToken)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("twilio request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("twilio returned status %d: %s", resp.StatusCode, string(respBody))
	}

	fmt.Printf("✅ Real SMS sent via Twilio to %s: %s\n", phone, string(respBody))
	return nil
}

// CreateSMSProvider initializes the appropriate SMS provider based on environment configuration
func CreateSMSProvider() SMSProvider {
	fast2SMSKey := strings.TrimSpace(os.Getenv("FAST2SMS_API_KEY"))
	if fast2SMSKey != "" {
		fmt.Println("🚀 Using Fast2SMS Provider for real cellular SMS delivery")
		return NewFast2SMSProvider(fast2SMSKey)
	}

	twilioSID := strings.TrimSpace(os.Getenv("TWILIO_ACCOUNT_SID"))
	twilioToken := strings.TrimSpace(os.Getenv("TWILIO_AUTH_TOKEN"))
	twilioFrom := strings.TrimSpace(os.Getenv("TWILIO_FROM_PHONE"))
	if twilioSID != "" && twilioToken != "" && twilioFrom != "" {
		fmt.Println("🚀 Using Twilio SMS Provider for real cellular SMS delivery")
		return NewTwilioSMSProvider(twilioSID, twilioToken, twilioFrom)
	}

	fmt.Println("ℹ️  Using Dev SMS Provider (logs SMS codes to terminal console)")
	return NewDevSMSProvider()
}
