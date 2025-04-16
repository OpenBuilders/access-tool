package observer

import (
	"context"
	"log"
	"sync"
	"time"
	"transaction-lookup/internal/buffer"

	"github.com/redis/go-redis/v9"
	"github.com/xssnick/tonutils-go/ton"
)

const (
	GetMasterShardsAttemptsLimit = 5
	GetShardsTXsLimit            = 5
	ShardsHandlerLimit           = 10
)

type WalletAddress [32]byte

type Observer struct {
	ctx            context.Context
	api            ton.APIClientWrapped
	rdb            *redis.Client
	walletsSet     map[WalletAddress]struct{}
	walletsRWMutex sync.RWMutex
	lastSeenShards *buffer.RingBufferWithSearch
	masterBlocks   chan *ton.BlockIDExt
	shardBlocks    chan *ton.BlockIDExt
	noticedWallets chan WalletAddress
}

func NewBlockScanner(api ton.APIClientWrapped, rdb *redis.Client) *Observer {
	ctx := api.Client().StickyContext(context.Background())
	return &Observer{
		ctx:            ctx,
		api:            api,
		rdb:            rdb,
		walletsSet:     map[WalletAddress]struct{}{},
		lastSeenShards: buffer.NewRingBufferWithSearch(48),
		masterBlocks:   make(chan *ton.BlockIDExt),
		shardBlocks:    make(chan *ton.BlockIDExt),
		noticedWallets: make(chan WalletAddress),
	}
}

func (o *Observer) startMasterObserver(ctx context.Context) {
	var lastMasterSeqNo uint32
	for {
		select {
		case <-ctx.Done():
			close(o.masterBlocks)
			log.Println("master-blocks channel closed")
			log.Println("master-blocks observer stopped")
			return
		default:
			time.Sleep(time.Millisecond * 500)
			currentMaster, err := o.api.GetMasterchainInfo(ctx)
			if err != nil {
				log.Printf("failed to get current master block: %v\n", err)
				continue
			}
			if currentMaster.SeqNo > lastMasterSeqNo {
				lastMasterSeqNo = currentMaster.SeqNo
				o.masterBlocks <- currentMaster
			}
		}
	}
}

func (o *Observer) startMastersHandler(ctx context.Context) {
	var wg sync.WaitGroup
	for master := range o.masterBlocks {
		wg.Add(1)
		go func() {
			defer wg.Done()
			o.handleNewMaster(ctx, master)
		}()
	}
	wg.Wait()
	close(o.shardBlocks)
	log.Println("shard-blocks channel closed")
	log.Println("master-blocks handler stopped")
}

func (o *Observer) handleNewMaster(ctx context.Context, master *ton.BlockIDExt) {
	attempt := 0
	for ; attempt < GetMasterShardsAttemptsLimit; attempt += 1 {
		shards, err := o.api.GetBlockShardsInfo(ctx, master)
		if err != nil {
			continue
		}

		for _, shard := range shards {
			if !o.lastSeenShards.AddIfNotExists(shard.SeqNo) {
				continue
			}
			o.shardBlocks <- shard
		}
		return
	}
	log.Printf("failed to get shards (%d, %d, %d)\n", master.Workchain, master.Shard, master.SeqNo)
}

func (o *Observer) startShardsHandler(ctx context.Context) {
	var wg sync.WaitGroup
	for idx := 0; idx < ShardsHandlerLimit; idx += 1 {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			o.shardHandleWorker(ctx, idx)
		}(idx)
	}
	wg.Wait()
	close(o.noticedWallets)
	log.Println("noticed wallets channel closed")
	log.Println("shards-handler observer stopped")
}

func (o *Observer) shardHandleWorker(ctx context.Context, idx int) {
	for shardBlock := range o.shardBlocks {
		blockTXs, err := o.GetTransactionIDsFromBlock(ctx, shardBlock)
		if err != nil {
			log.Printf("failed to get block (%d,%d,%d) transactions: %v\n", shardBlock.Workchain, shardBlock.Shard, shardBlock.SeqNo, err)
			continue
		}
		for _, blockTX := range blockTXs {
			if !o.isWalletExists(WalletAddress(blockTX.Account)) {
				continue
			}
			o.noticedWallets <- WalletAddress(blockTX.Account)
			// log.Printf(
			// 	"[WORKER %d] Address: %s; LT: %d; WC: %d, Shard: %d, SeqNo: %d\n",
			// 	workerID,
			// 	address.NewAddress(0, 0, blockTX.Account).String(),
			// 	blockTX.LT,
			// 	shardBlock.Workchain,
			// 	shardBlock.Shard,
			// 	shardBlock.SeqNo,
			// )
		}
	}
	log.Printf("shards-handler worker %d stopped\n", idx)
}

func (o *Observer) Start(ctx context.Context, wg *sync.WaitGroup) error {
	log.Println("loading redis wallets in memory...")
	if err := o.loadWallets(ctx); err != nil {
		return err
	}
	log.Println("loading done")

	wg.Add(5)
	go func() {
		defer wg.Done()
		o.startRedisEventsHandler(ctx)
	}()
	go func() {
		defer wg.Done()
		o.startRedisNotifier(ctx)
	}()
	go func() {
		defer wg.Done()
		o.startShardsHandler(ctx)
	}()
	go func() {
		defer wg.Done()
		o.startMastersHandler(ctx)
	}()
	go func() {
		defer wg.Done()
		o.startMasterObserver(ctx)
	}()
	return nil
}
