package observer

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/redis/go-redis/v9"
	"github.com/xssnick/tonutils-go/address"
)

const (
	RedisChannelExpired   = "__keyevent@0__:expired"
	RedisChannelNewExpire = "__keyevent@0__:expire"
)

func (o *Observer) startRedisEventsHandler(ctx context.Context) {
	pubsub := o.rdb.PSubscribe(ctx, "__keyevent@0__:*")
	defer pubsub.Close()

	for {
		select {
		case <-ctx.Done():
			slog.Info("redis events handler stopped")
			return
		case message := <-pubsub.Channel():
			switch message.Channel {
			case RedisChannelExpired:
				slog.Debug("wallet expired", "wallet", message.Payload)
				wallet, err := getWalletAddressFromMessage(message)
				if err != nil {
					slog.Error("received bad message", "message", message.Payload, "channel", RedisChannelExpired, "error", err)
				}
				o.delWallet(wallet)
			case RedisChannelNewExpire:
				slog.Debug("new wallet set", "wallet", message.Payload)
				wallet, err := getWalletAddressFromMessage(message)
				if err != nil {
					slog.Error("received bad message", "message", message.Payload, "channel", RedisChannelNewExpire, "error", err)
				}
				o.setWallet(wallet)
			default:
				slog.Warn("new unknown event", "channel", message.Channel, "message", message.Payload)
			}
		}
	}
}

func getWalletAddressFromMessage(msg *redis.Message) (WalletAddress, error) {
	address, err := address.ParseRawAddr(msg.Payload)
	if err != nil {
		return WalletAddress{}, err
	}
	return WalletAddress(address.Data()), nil
}

func (o *Observer) startRedisNotifier(ctx context.Context) {
	for noticedWallet := range o.noticedWallets {
		_, err := o.rdb.XAdd(
			ctx,
			&redis.XAddArgs{
				Stream: "noticed_wallets",
				Values: map[string]interface{}{
					"wallet": fmt.Sprintf("%d:%x", 0, noticedWallet),
				},
			},
		).Result()
		if err != nil {
			slog.Error("failed to write to stream", "wallet", fmt.Sprintf("%d:%x", 0, noticedWallet), "error", err)
			continue
		}
	}
	slog.Info("redis notifier stopped")
}

func (o *Observer) loadWallets(ctx context.Context) error {
	wallets, err := o.rdb.Keys(ctx, "*").Result()
	if err != nil {
		return fmt.Errorf("failed to get redis db keys: %v", err)
	}

	o.walletsRWMutex.Lock()
	defer o.walletsRWMutex.Unlock()
	for _, wallet := range wallets {
		walletAddress, err := address.ParseRawAddr(wallet)
		if err != nil {
			slog.Error("failed to parse address from redis", "wallet", wallet, "error", err)
			continue
		}
		o.walletsSet[WalletAddress(walletAddress.Data())] = struct{}{}
	}
	return nil
}

func (o *Observer) isWalletExists(key WalletAddress) bool {
	o.walletsRWMutex.RLock()
	defer o.walletsRWMutex.RUnlock()
	_, exists := o.walletsSet[key]
	return exists
}

func (o *Observer) setWallet(key WalletAddress) {
	o.walletsRWMutex.Lock()
	defer o.walletsRWMutex.Unlock()
	o.walletsSet[key] = struct{}{}
}

func (o *Observer) delWallet(key WalletAddress) {
	o.walletsRWMutex.Lock()
	defer o.walletsRWMutex.Unlock()
	delete(o.walletsSet, key)
}
