package otp

import (
	"context"
	"fmt"
)

type SMSProvider interface {
	SendSMS(ctx context.Context, phone, message string) error
}

type DevSMSProvider struct{}

func NewDevSMSProvider() *DevSMSProvider {
	return &DevSMSProvider{}
}

func (p *DevSMSProvider) SendSMS(ctx context.Context, phone, message string) error {
	fmt.Printf("[DEV SMS PROVIDER] To: %s | Message: %s\n", phone, message)
	return nil
}
