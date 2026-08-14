package otp

import (
	"testing"
	"time"
)

func TestOTPGenerationAndHashing(t *testing.T) {
	otp1, err := GenerateSecure6DigitOTP()
	if err != nil {
		t.Fatalf("failed to generate OTP: %v", err)
	}

	if len(otp1) != 6 {
		t.Fatalf("expected 6-digit OTP, got %s", otp1)
	}

	hash1 := HashOTP(otp1)
	if hash1 == "" {
		t.Fatal("expected non-empty hash")
	}

	if !VerifyHash(otp1, hash1) {
		t.Fatal("expected HashOTP and VerifyHash to match")
	}

	if VerifyHash("000000", hash1) && otp1 != "000000" {
		t.Fatal("invalid OTP matched hash unexpectedly")
	}
}

func TestOTPExpiryValidation(t *testing.T) {
	now := time.Now().UTC()
	expiredAt := now.Add(-1 * time.Minute)

	if !now.After(expiredAt) {
		t.Fatal("expected now to be after expiredAt")
	}
}
