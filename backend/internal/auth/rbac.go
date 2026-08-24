package auth

import (
	"net/http"
)

// Role constants
const (
	RolePassenger = "passenger"
	RoleDriver    = "driver"
	RoleAdmin     = "admin"
)

// Permission represents a fine-grained authorization action
type Permission string

const (
	// Passenger permissions
	PermSearchTrips   Permission = "trips:search"
	PermBookTrip      Permission = "trips:book"
	PermMakePayment   Permission = "payments:pay"
	PermTriggerSOS    Permission = "safety:sos"
	PermRateDriver    Permission = "reviews:rate_driver"

	// Driver permissions
	PermCreateTrip    Permission = "trips:create"
	PermManageVehicle Permission = "vehicles:manage"
	PermVerifyRideOTP Permission = "rides:verify_otp"
	PermViewEarnings  Permission = "earnings:view"
	PermRequestPayout Permission = "payouts:request"
	PermSubmitKYC     Permission = "kyc:submit"
	PermRatePassenger Permission = "reviews:rate_passenger"

	// Admin permissions
	PermManageUsers   Permission = "admin:users:manage"
	PermReviewKYC     Permission = "admin:kyc:review"
	PermProcessPayout Permission = "admin:payouts:process"
	PermViewAnalytics Permission = "admin:analytics:view"
)

// RolePermissions defines the permissions allowed for each role
var RolePermissions = map[string]map[Permission]bool{
	RolePassenger: {
		PermSearchTrips: true,
		PermBookTrip:    true,
		PermMakePayment: true,
		PermTriggerSOS:  true,
		PermRateDriver:  true,
	},
	RoleDriver: {
		PermSearchTrips:   true,
		PermCreateTrip:    true,
		PermManageVehicle: true,
		PermVerifyRideOTP: true,
		PermViewEarnings:  true,
		PermRequestPayout: true,
		PermSubmitKYC:     true,
		PermRatePassenger: true,
		PermTriggerSOS:    true,
	},
	RoleAdmin: {
		PermSearchTrips:   true,
		PermBookTrip:      true,
		PermMakePayment:   true,
		PermTriggerSOS:    true,
		PermRateDriver:    true,
		PermCreateTrip:    true,
		PermManageVehicle: true,
		PermVerifyRideOTP: true,
		PermViewEarnings:  true,
		PermRequestPayout: true,
		PermSubmitKYC:     true,
		PermRatePassenger: true,
		PermManageUsers:   true,
		PermReviewKYC:     true,
		PermProcessPayout: true,
		PermViewAnalytics: true,
	},
}

// HasPermission checks if a given role possesses a specific permission
func HasPermission(role string, perm Permission) bool {
	if perms, exists := RolePermissions[role]; exists {
		return perms[perm]
	}
	return false
}

// RequirePermission ensures the authenticated user's role has the required permission
func (m *Middleware) RequirePermission(perm Permission, next http.HandlerFunc) http.HandlerFunc {
	return m.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		currentRole, ok := GetRoleFromContext(r.Context())
		if !ok || !HasPermission(currentRole, perm) {
			writeAuthError(w, http.StatusForbidden, "forbidden: insufficient permissions")
			return
		}
		next(w, r)
	})
}
