package database

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestRedisClient(t *testing.T) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "127.0.0.1:6379"
	}

	client, err := NewRedisClient(redisURL)
	if err != nil {
		t.Skipf("Skipping Redis tests: %v", err)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx); err != nil {
		t.Fatalf("Ping failed: %v", err)
	}

	testKey := "test:blublu:key"
	testVal := "blublu_redis_value_123"

	if err := client.Set(ctx, testKey, testVal, 10*time.Second); err != nil {
		t.Fatalf("Set failed: %v", err)
	}

	val, err := client.Get(ctx, testKey)
	if err != nil {
		t.Fatalf("Get failed: %v", err)
	}
	if val != testVal {
		t.Errorf("Expected %s, got %s", testVal, val)
	}

	if err := client.Del(ctx, testKey); err != nil {
		t.Fatalf("Del failed: %v", err)
	}
}
