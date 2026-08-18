package users

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{
		db: db,
	}
}

func (r *Repository) Create(
	ctx context.Context,
	req CreateUserRequest,
) (*User, error) {

	role := "passenger"

	if req.Role != nil && *req.Role != "" {
		role = *req.Role
	}

	query := `
		INSERT INTO users (
			full_name,
			phone,
			email,
			gender,
			profile_photo_url,
			role
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING
			id,
			full_name,
			phone,
			email,
			gender,
			date_of_birth,
			profile_photo_url,
			role,
			is_phone_verified,
			is_active,
			created_at,
			updated_at
	`

	user := &User{}

	err := r.db.QueryRow(
		ctx,
		query,
		req.FullName,
		req.Phone,
		req.Email,
		req.Gender,
		req.ProfilePhotoURL,
		role,
	).Scan(
		&user.ID,
		&user.FullName,
		&user.Phone,
		&user.Email,
		&user.Gender,
		&user.DateOfBirth,
		&user.ProfilePhotoURL,
		&user.Role,
		&user.IsPhoneVerified,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user was not created")
		}

		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

func (r *Repository) GetByPhone(ctx context.Context, phone string) (*User, error) {
	if r.db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	query := `
		SELECT
			id, full_name, phone, email, gender, date_of_birth,
			profile_photo_url, role, is_phone_verified, is_active, created_at, updated_at
		FROM users
		WHERE phone = $1
	`

	user := &User{}
	err := r.db.QueryRow(ctx, query, phone).Scan(
		&user.ID, &user.FullName, &user.Phone, &user.Email, &user.Gender,
		&user.DateOfBirth, &user.ProfilePhotoURL, &user.Role, &user.IsPhoneVerified,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*User, error) {
	if r.db == nil {
		return nil, fmt.Errorf("database connection unavailable")
	}

	query := `
		SELECT
			id, full_name, phone, email, gender, date_of_birth,
			profile_photo_url, role, is_phone_verified, is_active, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	user := &User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.FullName, &user.Phone, &user.Email, &user.Gender,
		&user.DateOfBirth, &user.ProfilePhotoURL, &user.Role, &user.IsPhoneVerified,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, err
	}
	return user, nil
}
