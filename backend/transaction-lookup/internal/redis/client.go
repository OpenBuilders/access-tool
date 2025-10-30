package redis

import (
	"context"
	"crypto/tls"
	"fmt"
	"transaction-lookup/internal/redis/config"

	"github.com/redis/go-redis/v9"
)

type client struct {
	client *redis.Client
}

func NewClient(cfg config.Config) (*client, error) {
	var tlsConfig *tls.Config
	if cfg.TLS {
		tlsConfig = &tls.Config{ // nolint:gosec
			MinVersion: cfg.MinTLSVersion,
		}
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:      fmt.Sprintf("%s:%d", cfg.Host, cfg.Port),
		Username:  cfg.User,
		Password:  cfg.Password,
		DB:        cfg.Database,
		TLSConfig: tlsConfig,
	})

	// Test the connection
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	return &client{
		client: redisClient,
	}, nil
}

func (c *client) PSubscribe(ctx context.Context, channels ...string) *redis.PubSub {
	return c.client.PSubscribe(ctx, channels...)
}

func (c *client) XAdd(ctx context.Context, args *redis.XAddArgs) *redis.StringCmd {
	return c.client.XAdd(ctx, args)
}

func (c *client) Keys(ctx context.Context, pattern string) *redis.StringSliceCmd {
	return c.client.Keys(ctx, pattern)
}
