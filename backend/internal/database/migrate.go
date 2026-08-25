package database

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AutoMigrate applies all pending .sql migrations from the migrations directory
func AutoMigrate(ctx context.Context, db *pgxpool.Pool) error {
	if db == nil {
		return nil
	}

	// Create migrations tracking table if not exists
	createTableSQL := `
	CREATE TABLE IF NOT EXISTS schema_migrations (
		version VARCHAR(255) PRIMARY KEY,
		applied_at TIMESTAMPTZ DEFAULT NOW()
	);`
	if _, err := db.Exec(ctx, createTableSQL); err != nil {
		return fmt.Errorf("failed to create schema_migrations table: %w", err)
	}

	// Find migrations folder
	candidates := []string{"migrations", "./migrations", "../migrations", "../../migrations"}
	var migDir string
	for _, c := range candidates {
		if stat, err := os.Stat(c); err == nil && stat.IsDir() {
			migDir = c
			break
		}
	}

	if migDir == "" {
		fmt.Println("ℹ️  Notice: No migrations directory found, skipping auto-migration")
		return nil
	}

	entries, err := os.ReadDir(migDir)
	if err != nil {
		return fmt.Errorf("failed to read migrations dir: %w", err)
	}

	var files []string
	for _, entry := range entries {
		if !entry.IsDir() && strings.HasSuffix(entry.Name(), ".sql") {
			files = append(files, entry.Name())
		}
	}
	sort.Strings(files)

	for _, file := range files {
		var exists bool
		err := db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)`, file).Scan(&exists)
		if err == nil && exists {
			continue
		}

		fullPath := filepath.Join(migDir, file)
		content, err := os.ReadFile(fullPath)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", file, err)
		}

		upSQL := extractUpSQL(string(content))
		if strings.TrimSpace(upSQL) == "" {
			continue
		}

		tx, err := db.Begin(ctx)
		if err != nil {
			return fmt.Errorf("failed to begin tx for migration %s: %w", file, err)
		}

		if _, err := tx.Exec(ctx, upSQL); err != nil {
			tx.Rollback(ctx)
			errStr := strings.ToLower(err.Error())
			// If already created prior to migrations tracker, mark as done
			if strings.Contains(errStr, "already exists") || strings.Contains(errStr, "42p07") || strings.Contains(errStr, "42701") {
				_, _ = db.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`, file)
			} else {
				fmt.Printf("⚠️  Migration notice for %s: %v\n", file, err)
			}
		} else {
			if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`, file); err != nil {
				tx.Rollback(ctx)
				return fmt.Errorf("failed to record migration %s: %w", file, err)
			}
			if err := tx.Commit(ctx); err != nil {
				return fmt.Errorf("failed to commit migration %s: %w", file, err)
			}
			fmt.Printf("✅ Applied migration: %s\n", file)
		}
	}

	return nil
}

func extractUpSQL(content string) string {
	lines := strings.Split(content, "\n")
	var upLines []string
	isUp := false

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "-- +goose Up") {
			isUp = true
			continue
		}
		if strings.HasPrefix(trimmed, "-- +goose Down") {
			isUp = false
			break
		}
		if strings.HasPrefix(trimmed, "-- +goose") {
			continue
		}
		if isUp {
			upLines = append(upLines, line)
		}
	}

	if len(upLines) == 0 {
		// Fallback: if no goose tags, return full content
		return content
	}

	return strings.Join(upLines, "\n")
}
