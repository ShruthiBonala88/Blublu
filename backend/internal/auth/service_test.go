package auth

import (
	"context"
	"os"
	"testing"

	"github.com/google/uuid"
)

func TestAuthService_MockAuthenticate(t *testing.T) {
	secret := "service-test-secret-123"
	os.Setenv("JWT_SECRET", secret)

	jwtService, err := NewJWTServiceWithSecret(secret)
	if err != nil {
		t.Fatalf("failed to init jwtService: %v", err)
	}

	authService := NewService(nil, jwtService)
	userID := uuid.New()

	resp, err := authService.AuthenticateUserByID(context.Background(), userID)
	if err != nil {
		t.Fatalf("unexpected error from AuthenticateUserByID: %v", err)
	}

	if resp.Token == "" {
		t.Fatal("expected token in auth response, got empty")
	}

	if resp.TokenType != "Bearer" {
		t.Fatalf("expected token type Bearer, got %s", resp.TokenType)
	}

	if resp.User.ID != userID.String() {
		t.Fatalf("expected user ID %s, got %s", userID.String(), resp.User.ID)
	}

	// Validate generated token claims
	claims, err := jwtService.ValidateToken(resp.Token)
	if err != nil {
		t.Fatalf("failed to validate token from auth service: %v", err)
	}

	if claims.UserID != userID.String() {
		t.Fatalf("claims user ID mismatch: expected %s, got %s", userID.String(), claims.UserID)
	}
}

func TestJWTValidation_NilUserIDAndInvalidRole(t *testing.T) {
	secret := "service-test-secret-123"
	jwtService, _ := NewJWTServiceWithSecret(secret)

	// Test Nil User ID
	_, err := jwtService.GenerateToken(uuid.Nil, "passenger")
	if err == nil {
		t.Fatal("expected error when generating token for Nil user ID")
	}

	// Test Invalid Role
	_, err = jwtService.GenerateToken(uuid.New(), "hacker_role")
	if err == nil {
		t.Fatal("expected error when generating token for invalid role")
	}
}
