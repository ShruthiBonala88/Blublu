package otp

import (
	"context"
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

type EmailProvider interface {
	SendEmail(ctx context.Context, toEmail, subject, body string) error
}

type DevEmailProvider struct{}

func NewDevEmailProvider() *DevEmailProvider {
	return &DevEmailProvider{}
}

func (p *DevEmailProvider) SendEmail(ctx context.Context, toEmail, subject, body string) error {
	fmt.Printf("\n📧 ================= EMAIL DISPATCH =================\n")
	fmt.Printf("   Recipient: %s\n", toEmail)
	fmt.Printf("   Subject  : %s\n", subject)
	fmt.Printf("   Body     : %s\n", body)
	fmt.Printf("====================================================\n\n")
	return nil
}

type SMTPEmailProvider struct {
	host     string
	port     string
	username string
	password string
	from     string
}

func NewSMTPEmailProvider(host, port, username, password, from string) *SMTPEmailProvider {
	return &SMTPEmailProvider{
		host:     host,
		port:     port,
		username: username,
		password: password,
		from:     from,
	}
}

func (p *SMTPEmailProvider) SendEmail(ctx context.Context, toEmail, subject, body string) error {
	auth := smtp.PlainAuth("", p.username, p.password, p.host)
	addr := fmt.Sprintf("%s:%s", p.host, p.port)
	msg := []byte(fmt.Sprintf("To: %s\r\nFrom: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n%s", toEmail, p.from, subject, body))

	err := smtp.SendMail(addr, auth, p.from, []string{toEmail}, msg)
	if err != nil {
		return fmt.Errorf("failed to send SMTP email: %w", err)
	}

	fmt.Printf("✅ Real Email verification sent to %s via SMTP\n", toEmail)
	return nil
}

func CreateEmailProvider() EmailProvider {
	smtpHost := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	smtpPort := strings.TrimSpace(os.Getenv("SMTP_PORT"))
	smtpUser := strings.TrimSpace(os.Getenv("SMTP_USER"))
	smtpPass := strings.TrimSpace(os.Getenv("SMTP_PASS"))
	smtpFrom := strings.TrimSpace(os.Getenv("SMTP_FROM"))

	if smtpHost != "" && smtpPort != "" && smtpUser != "" && smtpPass != "" {
		fmt.Println("🚀 Using SMTP Email Provider for real email delivery")
		return NewSMTPEmailProvider(smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom)
	}

	fmt.Println("ℹ️  Using Dev Email Provider (logs email codes to terminal console)")
	return NewDevEmailProvider()
}
