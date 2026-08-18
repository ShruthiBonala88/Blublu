package database

import (
	"bufio"
	"context"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"
)

type RedisClient struct {
	addr string
	mu   sync.Mutex
}

func NewRedisClient(redisURL string) (*RedisClient, error) {
	addr := "127.0.0.1:6379"

	if strings.TrimSpace(redisURL) != "" {
		if strings.HasPrefix(redisURL, "redis://") {
			parsed, err := url.Parse(redisURL)
			if err == nil && parsed.Host != "" {
				addr = parsed.Host
			}
		} else {
			addr = strings.TrimSpace(redisURL)
		}
	}

	client := &RedisClient{
		addr: addr,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err := client.Ping(ctx); err != nil {
		return nil, fmt.Errorf("redis ping failed at %s: %w", addr, err)
	}

	return client, nil
}

func (c *RedisClient) execCommand(ctx context.Context, args ...string) (string, error) {
	c.mu.Lock()
	defer c.mu.Unlock()

	var d net.Dialer
	conn, err := d.DialContext(ctx, "tcp", c.addr)
	if err != nil {
		return "", fmt.Errorf("failed to connect to redis: %w", err)
	}
	defer conn.Close()

	_ = conn.SetDeadline(time.Now().Add(3 * time.Second))

	var cmdBuilder strings.Builder
	cmdBuilder.WriteString(fmt.Sprintf("*%d\r\n", len(args)))
	for _, arg := range args {
		cmdBuilder.WriteString(fmt.Sprintf("$%d\r\n%s\r\n", len(arg), arg))
	}

	if _, err := conn.Write([]byte(cmdBuilder.String())); err != nil {
		return "", fmt.Errorf("failed to write command to redis: %w", err)
	}

	reader := bufio.NewReader(conn)
	line, err := reader.ReadString('\n')
	if err != nil {
		return "", fmt.Errorf("failed to read response from redis: %w", err)
	}

	line = strings.TrimRight(line, "\r\n")
	if len(line) == 0 {
		return "", fmt.Errorf("empty response from redis")
	}

	switch line[0] {
	case '+': // Simple String e.g. +PONG or +OK
		return line[1:], nil
	case '-': // Error
		return "", fmt.Errorf("redis error: %s", line[1:])
	case ':': // Integer e.g. :1
		return line[1:], nil
	case '$': // Bulk String e.g. $6\r\nfoobar\r\n
		length, err := strconv.Atoi(line[1:])
		if err != nil || length < 0 {
			return "", nil // key nil/not found
		}
		buf := make([]byte, length+2) // +2 for \r\n
		_, err = ioReadFull(reader, buf)
		if err != nil {
			return "", fmt.Errorf("failed to read bulk string payload: %w", err)
		}
		return string(buf[:length]), nil
	default:
		return line, nil
	}
}

func ioReadFull(r *bufio.Reader, buf []byte) (int, error) {
	total := 0
	for total < len(buf) {
		n, err := r.Read(buf[total:])
		total += n
		if err != nil {
			return total, err
		}
	}
	return total, nil
}

func (c *RedisClient) Ping(ctx context.Context) error {
	res, err := c.execCommand(ctx, "PING")
	if err != nil {
		return err
	}
	if res != "PONG" {
		return fmt.Errorf("unexpected ping response: %s", res)
	}
	return nil
}

func (c *RedisClient) Set(ctx context.Context, key, value string, ttl time.Duration) error {
	if ttl > 0 {
		seconds := strconv.Itoa(int(ttl.Seconds()))
		_, err := c.execCommand(ctx, "SET", key, value, "EX", seconds)
		return err
	}
	_, err := c.execCommand(ctx, "SET", key, value)
	return err
}

func (c *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return c.execCommand(ctx, "GET", key)
}

func (c *RedisClient) Del(ctx context.Context, key string) error {
	_, err := c.execCommand(ctx, "DEL", key)
	return err
}
