package main

import (
	"context"
	"crypto/tls"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"transaction-lookup/internal/config"
	"transaction-lookup/internal/observer"

	"github.com/redis/go-redis/v9"
)

func main() {
	var wg sync.WaitGroup
	ctx, cancel := context.WithCancel(context.Background())
	cfg := config.LoadEnvVariables()
	if cfg == nil {
		log.Println("Not enough environment variables to start")
		return
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisHost,
		Username: cfg.RedisUser,
		Password: cfg.RedisPass,
		DB:       cfg.RedisDB,
		TLSConfig: &tls.Config{
			InsecureSkipVerify: true,
		},
		// ReadTimeout: -1, // Disable read timeout for initial wallets load
	})

	log.Println("initializing new api client...")
	api, err := observer.NewAPIClient(ctx, cfg)
	if err != nil {
		log.Println("liteserver api client init failed")
		return
	}

	log.Println("initializing new block scanner...")
	scanner := observer.NewBlockScanner(api, rdb)

	log.Println("monitoring new blocks...")
	if err := scanner.Start(ctx, &wg); err != nil {
		log.Printf("something wrong with observer: %v\n", err)
	}

	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)
	<-stopChan
	log.Println("received shutdown signal, initiating graceful shutdown...")

	cancel()
	wg.Wait()
	log.Println("graceful shutdown finished")
}
