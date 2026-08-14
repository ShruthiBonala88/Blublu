package users

import "time"

type User struct {
	ID              string     `json:"id"`
	FullName        string     `json:"full_name"`
	Phone           string     `json:"phone"`
	Email           *string    `json:"email,omitempty"`
	Gender          *string    `json:"gender,omitempty"`
	DateOfBirth     *time.Time `json:"date_of_birth,omitempty"`
	ProfilePhotoURL *string    `json:"profile_photo_url,omitempty"`
	Role            string     `json:"role"`
	IsPhoneVerified bool       `json:"is_phone_verified"`
	IsActive        bool       `json:"is_active"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateUserRequest struct {
	FullName        string  `json:"full_name"`
	Phone           string  `json:"phone"`
	Email           *string `json:"email,omitempty"`
	Gender          *string `json:"gender,omitempty"`
	DateOfBirth     *string `json:"date_of_birth,omitempty"`
	ProfilePhotoURL *string `json:"profile_photo_url,omitempty"`
	Role            *string `json:"role,omitempty"`
}
