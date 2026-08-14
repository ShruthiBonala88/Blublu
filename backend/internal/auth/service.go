package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrUserNotFound = errors.New("user not found")
	ErrUserInactive = errors.New("user account is inactive")
)

type AuthResponse struct {
	Token     string      `json:"token"`
	TokenType string      `json:"token_type"`
	ExpiresIn int64       `json:"expires_in"`
	User      UserSummary `json:"user"`
}

type UserSummary struct {
	ID    string `json:"id"`
	Role  string `json:"role"`
	Phone string `json:"phone,omitempty"`
}

type Service struct {
	db         *pgxpool.Pool
	jwtService *JWTService
}

func NewService(db *pgxpool.Pool, jwtService *JWTService) *Service {
	return &Service{
		db:         db,
		jwtService: jwtService,
	}
}

func (s *Service) AuthenticateUserByID(ctx context.Context, userID uuid.UUID) (*AuthResponse, error) {
	if s.jwtService == nil {
		return nil, errors.New("JWT service unavailable")
	}

	if s.db == nil {
		token, err := s.jwtService.GenerateToken(userID, "passenger")
		if err != nil {
			return nil, err
		}
		resp := &AuthResponse{
			Token:     token,
			TokenType: "Bearer",
			ExpiresIn: 86400,
			User: UserSummary{
				ID:   userID.String(),
				Role: "passenger",
			},
		}
		return resp, nil
	}

	var role, phone string
	var isActive bool
	query := `SELECT role, phone, is_active FROM users WHERE id = $1`

	err := s.db.QueryRow(ctx, query, userID).Scan(&role, &phone, &isActive)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if !isActive {
		return nil, ErrUserInactive
	}

	token, err := s.jwtService.GenerateToken(userID, role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	resp := &AuthResponse{
		Token:     token,
		TokenType: "Bearer",
		ExpiresIn: 86400,
		User: UserSummary{
			ID:    userID.String(),
			Role:  role,
			Phone: phone,
		},
	}

	return resp, nil
}
