package cache

import (
    "context"
    "time"

    "github.com/redis/go-redis/v9"
)

// ConnectRedis parses the provided Redis URL and returns a connected client.
// If an empty URL is provided, it returns (nil, nil) to indicate Redis is unused.
func ConnectRedis(ctx context.Context, redisURL string) (*redis.Client, error) {
    if redisURL == "" {
        return nil, nil
    }

    opts, err := redis.ParseURL(redisURL)
    if err != nil {
        return nil, err
    }

    client := redis.NewClient(opts)

    // Quick health-check with a short timeout
    cctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    if err := client.Ping(cctx).Err(); err != nil {
        _ = client.Close()
        return nil, err
    }

    return client, nil
}
