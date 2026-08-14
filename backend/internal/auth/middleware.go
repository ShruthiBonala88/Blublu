package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type contextKey string

const (
	UserIDContextKey contextKey = "user_id"
	RoleContextKey   contextKey = "role"
	ClaimsContextKey contextKey = "claims"
)

type Middleware struct {
	jwtService *JWTService
}

func NewMiddleware(jwtService *JWTService) *Middleware {
	return &Middleware{
		jwtService: jwtService,
	}
}

// Authenticate validates the JWT from:
// Authorization: Bearer <token>
func (m *Middleware) Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))

		if authHeader == "" {
			writeAuthError(w, http.StatusUnauthorized, "missing authorization header")
			return
		}

		parts := strings.Fields(authHeader)

		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			writeAuthError(w, http.StatusUnauthorized, "invalid authorization header")
			return
		}

		tokenString := strings.TrimSpace(parts[1])

		claims, err := m.jwtService.ValidateToken(tokenString)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, "invalid or expired token")
			return
		}

		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			writeAuthError(w, http.StatusUnauthorized, "invalid user ID in token")
			return
		}

		ctx := context.WithValue(r.Context(), UserIDContextKey, userID)
		ctx = context.WithValue(ctx, RoleContextKey, claims.Role)
		ctx = context.WithValue(ctx, ClaimsContextKey, claims)

		next(w, r.WithContext(ctx))
	}
}

// RequireRole allows only users with the specified role.
func (m *Middleware) RequireRole(role string, next http.HandlerFunc) http.HandlerFunc {
	return m.RequireAnyRole([]string{role}, next)
}

// RequireAnyRole allows requests if the authenticated user has any of the specified roles.
func (m *Middleware) RequireAnyRole(allowedRoles []string, next http.HandlerFunc) http.HandlerFunc {
	return m.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		currentRole, ok := GetRoleFromContext(r.Context())

		if !ok {
			writeAuthError(w, http.StatusForbidden, "forbidden")
			return
		}

		for _, role := range allowedRoles {
			if currentRole == role {
				next(w, r)
				return
			}
		}

		writeAuthError(w, http.StatusForbidden, "forbidden")
	})
}

func (s *JWTService) Authenticate(next http.Handler) http.Handler {
	m := NewMiddleware(s)
	return http.HandlerFunc(m.Authenticate(next.ServeHTTP))
}

func (s *JWTService) RequireRole(role string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		m := NewMiddleware(s)
		return http.HandlerFunc(m.RequireRole(role, next.ServeHTTP))
	}
}

func (s *JWTService) RequireAnyRole(roles ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		m := NewMiddleware(s)
		return http.HandlerFunc(m.RequireAnyRole(roles, next.ServeHTTP))
	}
}

func GetUserIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	value := ctx.Value(UserIDContextKey)

	if value == nil {
		return uuid.Nil, false
	}

	userID, ok := value.(uuid.UUID)

	return userID, ok
}

func UserIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	return GetUserIDFromContext(ctx)
}

func GetRoleFromContext(ctx context.Context) (string, bool) {
	value := ctx.Value(RoleContextKey)

	if value == nil {
		return "", false
	}

	role, ok := value.(string)

	return role, ok
}

func RoleFromContext(ctx context.Context) (string, bool) {
	return GetRoleFromContext(ctx)
}

func GetClaimsFromContext(ctx context.Context) (*Claims, bool) {
	value := ctx.Value(ClaimsContextKey)

	if value == nil {
		return nil, false
	}

	claims, ok := value.(*Claims)

	return claims, ok
}

func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	return GetClaimsFromContext(ctx)
}

// ValidateOwnershipOrAdmin checks if the context user matches targetUserID or is an admin.
func ValidateOwnershipOrAdmin(ctx context.Context, targetUserID uuid.UUID) bool {
	role, roleOk := GetRoleFromContext(ctx)
	if roleOk && role == "admin" {
		return true
	}

	userID, userOk := GetUserIDFromContext(ctx)
	if !userOk {
		return false
	}

	return userID == targetUserID
}

func writeAuthError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)

	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}
