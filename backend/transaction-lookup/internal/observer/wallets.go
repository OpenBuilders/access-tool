package observer

import (
	"context"
	"fmt"
	"log"

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
			log.Println("redis events handler stopped")
			return
		case message := <-pubsub.Channel():
			switch message.Channel {
			case RedisChannelExpired:
				// log.Printf("wallet expired: %s\n", message.Payload)
				wallet, err := getWalletAddressFromMessage(message)
				if err != nil {
					log.Printf("received bad message \"%s\" in %s: %v\n", message.Payload, RedisChannelExpired, err)
				}
				o.delWallet(wallet)
			case RedisChannelNewExpire:
				// log.Printf("new wallet set: %s\n", message.Payload)
				wallet, err := getWalletAddressFromMessage(message)
				if err != nil {
					log.Printf("received bad message \"%s\" in %s: %v\n", message.Payload, RedisChannelExpired, err)
				}
				o.setWallet(wallet)
			default:
				log.Printf("new unknown event: %s, %s\n", message.Channel, message.Payload)
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
			log.Printf("failed to write to stream (%d:%x): %v\n", 0, noticedWallet, err)
			continue
		}
	}
	log.Println("redis notifier stopped")
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
			log.Printf("failed to parse address from redis: %s: %v\n", wallet, err)
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
