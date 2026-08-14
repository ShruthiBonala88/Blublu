package auth

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var ErrMissingJWTSecret = errors.New("JWT_SECRET is not configured")

type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

type JWTService struct {
	secret     []byte
	expiration time.Duration
}

func NewJWTService() (*JWTService, error) {
	secret := strings.TrimSpace(os.Getenv("JWT_SECRET"))
	return NewJWTServiceWithSecret(secret)
}

func NewJWTServiceWithSecret(secret string) (*JWTService, error) {
	secret = strings.TrimSpace(secret)
	if secret == "" {
		return nil, ErrMissingJWTSecret
	}

	expiration := 24 * time.Hour

	return &JWTService{
		secret:     []byte(secret),
		expiration: expiration,
	}, nil
}

func (s *JWTService) GenerateToken(userID uuid.UUID, role string) (string, error) {
	if userID == uuid.Nil {
		return "", errors.New("cannot generate token for nil user ID")
	}

	role = strings.TrimSpace(role)
	if role == "" {
		return "", errors.New("role is required")
	}

	validRoles := map[string]bool{
		"passenger": true,
		"driver":    true,
		"both":      true,
		"admin":     true,
	}
	if !validRoles[role] {
		return "", errors.New("invalid role for token generation")
	}

	now := time.Now()

	claims := Claims{
		UserID: userID.String(),
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.expiration)),
			NotBefore: jwt.NewNumericDate(now),
			ID:        uuid.New().String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString(s.secret)
}

func (s *JWTService) ValidateToken(tokenString string) (*Claims, error) {
	tokenString = strings.TrimSpace(tokenString)

	if tokenString == "" {
		return nil, errors.New("missing token")
	}

	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}

			return s.secret, nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	parsedID, err := uuid.Parse(claims.UserID)
	if err != nil || parsedID == uuid.Nil {
		return nil, errors.New("invalid user ID in token")
	}

	role := strings.TrimSpace(claims.Role)
	if role == "" {
		return nil, errors.New("missing role in token")
	}

	validRoles := map[string]bool{
		"passenger": true,
		"driver":    true,
		"both":      true,
		"admin":     true,
	}
	if !validRoles[role] {
		return nil, errors.New("invalid role in token")
	}

	return claims, nil
}
