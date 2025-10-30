package observer

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/ton"
)

func (o *Observer) startMasterObserver(ctx context.Context) {
	master, err := o.lt.GetMasterchainInfo(ctx)
	if err != nil {
		slog.Error("failed to get masterchain info", "error", err)
		return
	}

	lastMasterSeqNo := master.SeqNo
	lastMasterLookupTime := time.Now()
	for {
		select {
		case <-ctx.Done():
			close(o.masterBlocks)
			slog.Info("master-blocks channel closed")
			slog.Info("master-blocks observer stopped")
			return
		default:
			time.Sleep(lookupBlockDelay)

			// That lookup request will try dirrefent nodes in case of timeout
			currentMaster, err := o.lt.LookupBlock(ctx, lookupBlockTimeoutPerNode, masterWorkchain, masterShard, lastMasterSeqNo+1)
			if err != nil {
				if !errors.Is(err, context.DeadlineExceeded) && !errors.Is(err, ton.ErrBlockNotFound) {
					slog.Error("failed to get current master block", "error", err)
				}
				continue
			}

			if currentMaster.SeqNo > lastMasterSeqNo {
				slog.Debug("current seqno", "v", currentMaster.SeqNo, "time", time.Since(lastMasterLookupTime))
				if time.Since(lastMasterLookupTime) > newBlockGenerationAverageTime {
					slog.Warn("new block lookup took too long", "time", time.Since(lastMasterLookupTime), "seqno", currentMaster.SeqNo)
				}
				lastMasterLookupTime = time.Now()
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
	slog.Info("shard-blocks channel closed")
	slog.Info("master-blocks handler stopped")
}

func (o *Observer) handleNewMaster(ctx context.Context, master *ton.BlockIDExt) {
	slog.Info("handling new master", "workchain", master.Workchain, "shard", master.Shard, "seqno", master.SeqNo)
	attempt := 0
	for ; attempt < GetMasterShardsAttemptsLimit; attempt += 1 {
		shards, err := o.lt.GetBlockShardsInfo(ctx, master)
		if err != nil {
			slog.Debug("failed to get block shards info", "workchain", master.Workchain, "shard", master.Shard, "seqno", master.SeqNo, "error", err)
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
	slog.Error("failed to get shards", "workchain", master.Workchain, "shard", master.Shard, "seqno", master.SeqNo)
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
	slog.Info("noticed wallets channel closed")
	slog.Info("shards-handler observer stopped")
}

func (o *Observer) shardHandleWorker(ctx context.Context, idx int) {
	for shardBlock := range o.shardBlocks {
		slog.Debug("handling new shard", "workchain", shardBlock.Workchain, "shard", shardBlock.Shard, "seqno", shardBlock.SeqNo)
		blockTXs, err := o.lt.GetTransactionIDsFromBlock(ctx, shardBlock)
		if err != nil {
			slog.Error("failed to get block transactions", "workchain", shardBlock.Workchain, "shard", shardBlock.Shard, "seqno", shardBlock.SeqNo, "error", err)
			continue
		}
		for _, blockTX := range blockTXs {
			if !o.isWalletExists(WalletAddress(blockTX.Account)) {
				continue
			}
			o.noticedWallets <- WalletAddress(blockTX.Account)
			slog.Debug("noticed wallet",
				"wid", idx,
				"address", address.NewAddress(0, 0, blockTX.Account).String(),
				"lt", blockTX.LT,
				"workchain", shardBlock.Workchain,
				"shard", shardBlock.Shard,
				"seqno", shardBlock.SeqNo,
			)
		}
	}
	slog.Info("shards-handler worker stopped", "wid", idx)
}
