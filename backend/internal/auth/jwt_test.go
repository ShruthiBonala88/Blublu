package auth

import (
	"os"
	"testing"

	"github.com/google/uuid"
)

func TestJWTGenerateAndValidate(t *testing.T) {
	originalSecret := os.Getenv("JWT_SECRET")
	defer os.Setenv("JWT_SECRET", originalSecret)

	os.Setenv("JWT_SECRET", "test-secret-for-unit-tests")

	service, err := NewJWTService()
	if err != nil {
		t.Fatalf("failed to create JWT service: %v", err)
	}

	userID := uuid.New()

	token, err := service.GenerateToken(userID, "admin")
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	claims, err := service.ValidateToken(token)
	if err != nil {
		t.Fatalf("failed to validate token: %v", err)
	}

	if claims.UserID != userID.String() {
		t.Fatalf(
			"expected user ID %s, got %s",
			userID.String(),
			claims.UserID,
		)
	}

	if claims.Role != "admin" {
		t.Fatalf(
			"expected role admin, got %s",
			claims.Role,
		)
	}
}

func TestJWTRejectsInvalidToken(t *testing.T) {
	originalSecret := os.Getenv("JWT_SECRET")
	defer os.Setenv("JWT_SECRET", originalSecret)

	os.Setenv("JWT_SECRET", "test-secret-for-unit-tests")

	service, err := NewJWTService()
	if err != nil {
		t.Fatalf("failed to create JWT service: %v", err)
	}

	_, err = service.ValidateToken("this-is-not-a-valid-jwt")
	if err == nil {
		t.Fatal("expected invalid token to be rejected")
	}
}

func TestJWTRejectsMissingOrInvalidClaims(t *testing.T) {
	secret := "test-secret-claims"
	service, _ := NewJWTServiceWithSecret(secret)

	// Test Nil User ID Generation
	_, err := service.GenerateToken(uuid.Nil, "passenger")
	if err == nil {
		t.Fatal("expected error when generating token for Nil user ID")
	}

	// Test Empty Role Generation
	_, err = service.GenerateToken(uuid.New(), "")
	if err == nil {
		t.Fatal("expected error when generating token for empty role")
	}

	// Test Arbitrary/Invalid Role Generation
	_, err = service.GenerateToken(uuid.New(), "superuser_fake")
	if err == nil {
		t.Fatal("expected error when generating token for unrecognized role")
	}
}
