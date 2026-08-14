package maps

import (
	"fmt"
	"sync"
	"time"
)

type cacheEntry struct {
	result    *RouteResult
	expiresAt time.Time
}

type MemoryCache struct {
	mu    sync.RWMutex
	items map[string]cacheEntry
	ttl   time.Duration
}

func NewMemoryCache(ttl time.Duration) *MemoryCache {
	return &MemoryCache{
		items: make(map[string]cacheEntry),
		ttl:   ttl,
	}
}

func (c *MemoryCache) makeKey(originLat, originLon, destLat, destLon float64) string {
	return fmt.Sprintf("%.4f,%.4f:%.4f,%.4f", originLat, originLon, destLat, destLon)
}

func (c *MemoryCache) Get(originLat, originLon, destLat, destLon float64) (*RouteResult, bool) {
	key := c.makeKey(originLat, originLon, destLat, destLon)
	c.mu.RLock()
	defer c.mu.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	if time.Now().After(item.expiresAt) {
		return nil, false
	}

	return item.result, true
}

func (c *MemoryCache) Set(originLat, originLon, destLat, destLon float64, result *RouteResult) {
	key := c.makeKey(originLat, originLon, destLat, destLon)
	c.mu.Lock()
	defer c.mu.Unlock()

	c.items[key] = cacheEntry{
		result:    result,
		expiresAt: time.Now().Add(c.ttl),
	}
}
