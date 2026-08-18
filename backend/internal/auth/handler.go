package auth

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/vikas/blublu/internal/users"
)

type AuthHandler struct {
	authService *Service
	userRepo    *users.Repository
}

func NewAuthHandler(authService *Service, userRepo *users.Repository) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		userRepo:    userRepo,
	}
}

type registerRequest struct {
	FullName string  `json:"full_name"`
	Phone    string  `json:"phone"`
	Email    *string `json:"email,omitempty"`
	Gender   *string `json:"gender,omitempty"`
	Role     *string `json:"role,omitempty"`
}

type loginRequest struct {
	Phone  string `json:"phone,omitempty"`
	UserID string `json:"user_id,omitempty"`
}

// POST /api/v1/auth/register
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.FullName) == "" {
		http.Error(w, `{"error":"full_name is required"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Phone) == "" {
		http.Error(w, `{"error":"phone is required"}`, http.StatusBadRequest)
		return
	}

	userReq := users.CreateUserRequest{
		FullName: strings.TrimSpace(req.FullName),
		Phone:    strings.TrimSpace(req.Phone),
		Email:    req.Email,
		Gender:   req.Gender,
		Role:     req.Role,
	}

	user, err := h.userRepo.Create(r.Context(), userReq)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	uid, err := uuid.Parse(user.ID)
	if err != nil {
		http.Error(w, `{"error":"invalid user id format"}`, http.StatusInternalServerError)
		return
	}

	authResp, err := h.authService.AuthenticateUserByID(r.Context(), uid)
	if err != nil {
		// Fallback: return created user if token auth failed
		w.WriteHeader(http.StatusCreated)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"message": "user created",
			"user":    user,
		})
		return
	}

	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(authResp)
}

// POST /api/v1/auth/login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid request body"}`, http.StatusBadRequest)
		return
	}

	var uid uuid.UUID
	var err error

	if strings.TrimSpace(req.UserID) != "" {
		uid, err = uuid.Parse(req.UserID)
		if err != nil {
			http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
			return
		}
	} else if strings.TrimSpace(req.Phone) != "" {
		user, err := h.userRepo.GetByPhone(r.Context(), strings.TrimSpace(req.Phone))
		if err != nil {
			http.Error(w, `{"error":"user not found with provided phone"}`, http.StatusNotFound)
			return
		}
		uid, err = uuid.Parse(user.ID)
		if err != nil {
			http.Error(w, `{"error":"invalid user_id in DB"}`, http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(w, `{"error":"phone or user_id is required for login"}`, http.StatusBadRequest)
		return
	}

	authResp, err := h.authService.AuthenticateUserByID(r.Context(), uid)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(authResp)
}
