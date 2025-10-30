package observer

import (
	"context"
	"log/slog"
	"sync"
	"time"
	"transaction-lookup/pkg/buffer"

	"github.com/redis/go-redis/v9"
	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/tlb"
	"github.com/xssnick/tonutils-go/ton"
)

const (
	GetMasterShardsAttemptsLimit = 5
	GetShardsTXsLimit            = 5
	ShardsHandlerLimit           = 10

	lookupBlockTimeoutPerNode     = time.Millisecond * 400
	lookupBlockDelay              = time.Millisecond * 100
	newBlockGenerationAverageTime = time.Second * 3

	masterWorkchain int32 = -1
	masterShard     int64 = 8000000000000000
)

type WalletAddress [32]byte

type liteclient interface {
	GetTransactionIDsFromBlock(ctx context.Context, blockID *ton.BlockIDExt) ([]ton.TransactionShortInfo, error)
	GetMasterchainInfo(ctx context.Context) (*ton.BlockIDExt, error)
	GetBlockShardsInfo(ctx context.Context, master *ton.BlockIDExt) ([]*ton.BlockIDExt, error)
	GetTransaction(ctx context.Context, block *ton.BlockIDExt, addr *address.Address, lt uint64) (*tlb.Transaction, error)
	LookupBlock(ctx context.Context, timeout time.Duration, workchain int32, shard int64, seqno uint32) (*ton.BlockIDExt, error)
}

type rdb interface {
	PSubscribe(ctx context.Context, channels ...string) *redis.PubSub
	XAdd(ctx context.Context, args *redis.XAddArgs) *redis.StringCmd
	Keys(ctx context.Context, pattern string) *redis.StringSliceCmd
}

type Observer struct {
	lt             liteclient
	rdb            rdb
	walletsSet     map[WalletAddress]struct{}
	walletsRWMutex sync.RWMutex
	lastSeenShards *buffer.RingBufferWithSearch
	masterBlocks   chan *ton.BlockIDExt
	shardBlocks    chan *ton.BlockIDExt
	noticedWallets chan WalletAddress
}

func New(lt liteclient, rdb rdb) *Observer {
	return &Observer{
		lt:  lt,
		rdb: rdb,

		walletsSet:     map[WalletAddress]struct{}{},
		walletsRWMutex: sync.RWMutex{},

		lastSeenShards: buffer.NewRingBufferWithSearch(48),
		masterBlocks:   make(chan *ton.BlockIDExt),
		shardBlocks:    make(chan *ton.BlockIDExt),
		noticedWallets: make(chan WalletAddress),
	}
}

func (o *Observer) Start(ctx context.Context, wg *sync.WaitGroup) error {
	slog.Info("loading redis wallets in memory...")
	if err := o.loadWallets(ctx); err != nil {
		return err
	}
	slog.Info("loading done")

	wg.Add(1)
	go func() {
		defer wg.Done()
		o.startRedisEventsHandler(ctx)
	}()
	wg.Add(1)
	go func() {
		defer wg.Done()
		o.startRedisNotifier(ctx)
	}()
	wg.Add(1)
	go func() {
		defer wg.Done()
		o.startShardsHandler(ctx)
	}()
	wg.Add(1)
	go func() {
		defer wg.Done()
		o.startMastersHandler(ctx)
	}()
	wg.Add(1)
	go func() {
		defer wg.Done()
		o.startMasterObserver(ctx)
	}()
	return nil
}
