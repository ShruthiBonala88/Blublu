package otp

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
)

const otpSecretKey = "blublu_otp_secret_key_v1"

func GenerateSecure6DigitOTP() (string, error) {
	nBig, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", nBig.Int64()), nil
}

func HashOTP(otp string) string {
	h := hmac.New(sha256.New, []byte(otpSecretKey))
	h.Write([]byte(otp))
	return hex.EncodeToString(h.Sum(nil))
}

func VerifyHash(otp, hash string) bool {
	return hmac.Equal([]byte(HashOTP(otp)), []byte(hash))
}
