package admin

import (
	"context"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vikas/blublu/internal/auth"
)

type contextKey string

const AdminUserContextKey contextKey = "admin_user_id"

type Middleware struct {
	db         *pgxpool.Pool
	jwtService *auth.JWTService
}

func NewMiddleware(db *pgxpool.Pool, jwtService *auth.JWTService) *Middleware {
	return &Middleware{
		db:         db,
		jwtService: jwtService,
	}
}

func (m *Middleware) AuthenticateAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
		if authHeader == "" {
			http.Error(w, `{"error":"unauthorized: missing authorization header"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			http.Error(w, `{"error":"unauthorized: invalid authorization header"}`, http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimSpace(parts[1])
		if m.jwtService == nil {
			http.Error(w, `{"error":"server configuration error: JWT service unavailable"}`, http.StatusInternalServerError)
			return
		}

		claims, err := m.jwtService.ValidateToken(tokenString)
		if err != nil {
			http.Error(w, `{"error":"unauthorized: invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		adminUserID, err := uuid.Parse(claims.UserID)
		if err != nil {
			http.Error(w, `{"error":"unauthorized: invalid user ID in token"}`, http.StatusUnauthorized)
			return
		}

		if claims.Role != "admin" {
			http.Error(w, `{"error":"forbidden: user does not have admin privileges"}`, http.StatusForbidden)
			return
		}

		if m.db != nil {
			var role string
			err = m.db.QueryRow(r.Context(), `SELECT role FROM users WHERE id = $1 AND is_active = true`, adminUserID).Scan(&role)
			if err != nil {
				http.Error(w, `{"error":"unauthorized: admin user not found or inactive"}`, http.StatusUnauthorized)
				return
			}

			if role != "admin" {
				http.Error(w, `{"error":"forbidden: user does not have admin privileges"}`, http.StatusForbidden)
				return
			}
		}

		ctx := context.WithValue(r.Context(), AdminUserContextKey, adminUserID)
		ctx = context.WithValue(ctx, auth.UserIDContextKey, adminUserID)
		ctx = context.WithValue(ctx, auth.RoleContextKey, claims.Role)
		ctx = context.WithValue(ctx, auth.ClaimsContextKey, claims)

		next(w, r.WithContext(ctx))
	}
}

func GetAdminUserIDFromContext(ctx context.Context) (uuid.UUID, bool) {
	val := ctx.Value(AdminUserContextKey)
	if val == nil {
		return uuid.Nil, false
	}
	id, ok := val.(uuid.UUID)
	return id, ok
}
