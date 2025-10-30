package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"transaction-lookup/internal/config"
	"transaction-lookup/internal/liteclient"
	"transaction-lookup/internal/log"
	"transaction-lookup/internal/observer"
	"transaction-lookup/internal/redis"
)

func main() {
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())
	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		return
	}

	log.Setup(cfg.LogLevel)

	slog.Info("initializing redis client...")
	rdb, err := redis.NewClient(cfg.RedisConfig)
	if err != nil {
		slog.Error("failed to create redis client", "error", err)
		return
	}

	slog.Info("initializing new liteserver client...")
	lt, err := liteclient.NewClient(ctx, cfg.LiteclientConfig, cfg.IsTestnet, cfg.Public)
	if err != nil {
		slog.Error("failed to create liteserver client", "error", err)
		return
	}

	slog.Info("initializing new observer...")
	obs := observer.New(lt, rdb)

	slog.Info("monitoring new blocks...")
	if err := obs.Start(ctx, &wg); err != nil {
		slog.Error("something wrong with observer", "error", err)
	}

	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)
	<-stopChan
	slog.Info("received shutdown signal, initiating graceful shutdown...")

	cancel()
	wg.Wait()
	slog.Info("graceful shutdown finished")
}
