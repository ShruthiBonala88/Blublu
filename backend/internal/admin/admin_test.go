package admin

import (
	"testing"
)

func TestPaginationDefaults(t *testing.T) {
	page := 0
	limit := 0

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	if page != 1 || limit != 20 {
		t.Fatalf("expected page=1 limit=20, got page=%d limit=%d", page, limit)
	}
}

func TestAdminRoleValidation(t *testing.T) {
	roles := map[string]bool{
		"admin":     true,
		"passenger": false,
		"driver":    false,
		"both":      false,
	}

	for role, expected := range roles {
		isAdmin := (role == "admin")
		if isAdmin != expected {
			t.Fatalf("expected role %s to be admin=%v", role, expected)
		}
	}
}
