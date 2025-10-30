package liteclient

import (
	"context"
	"fmt"
	"log/slog"
	"sort"
	"time"

	"transaction-lookup/internal/liteclient/config"

	"github.com/xssnick/tonutils-go/address"
	"github.com/xssnick/tonutils-go/liteclient"
	"github.com/xssnick/tonutils-go/tlb"
	"github.com/xssnick/tonutils-go/ton"
)

const (
	GetShardsTXsLimit = 5
)

type client struct {
	api ton.APIClientWrapped
}

func NewClient(ctx context.Context, cfg config.Config, isTestnet bool, public bool) (*client, error) {
	pool := liteclient.NewConnectionPool()
	globalConfig, err := liteclient.GetConfigFromUrl(ctx, config.GlobalConfigURL[isTestnet])
	if err != nil {
		return nil, fmt.Errorf("failed to get global config: %w", err)
	}
	if !public {
		if err = pool.AddConnection(ctx, cfg.LiteserverHost, cfg.LiteserverKey); err != nil {
			return nil, fmt.Errorf("failed to add connection: %w", err)
		}

	} else {
		err = pool.AddConnectionsFromConfig(ctx, globalConfig)
		if err != nil {
			return nil, fmt.Errorf("failed to add connections from config: %w", err)
		}
	}

	api := ton.NewAPIClient(pool, ton.ProofCheckPolicyFast)
	api.SetTrustedBlockFromConfig(globalConfig)

	slog.Info("fetching and checking proofs since config init block ...")
	_, err = api.CurrentMasterchainInfo(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get current masterchain info: %w", err)
	}
	return &client{
		api: api,
	}, nil
}

func (c *client) GetTransactionIDsFromBlock(ctx context.Context, blockID *ton.BlockIDExt) ([]ton.TransactionShortInfo, error) {
	var (
		txIDList []ton.TransactionShortInfo
		after    *ton.TransactionID3
		next     = true
		attempts = 0
	)
	for next {
		fetchedIDs, more, err := c.api.WithRetry().GetBlockTransactionsV2(ctx, blockID, 256, after)
		if err != nil {
			attempts += 1
			if attempts == GetShardsTXsLimit {
				return nil, err // Retries limit exceeded for batch
			}

			logAfter := uint64(0)
			if after != nil {
				logAfter = after.LT
			}
			slog.Error("failed to get block transactions batch", "workchain", blockID.Workchain, "shard", blockID.Shard, "seqno", blockID.SeqNo, "logAfter", logAfter, "error", err)
			continue
		}
		txIDList = append(txIDList, fetchedIDs...)
		next = more
		if more {
			after = fetchedIDs[len(fetchedIDs)-1].ID3()
		}
		attempts = 0 // Refresh attempts for next batch
	}
	sort.Slice(txIDList, func(i, j int) bool {
		return txIDList[i].LT < txIDList[j].LT
	})
	return txIDList, nil
}

func (c *client) GetMasterchainInfo(ctx context.Context) (*ton.BlockIDExt, error) {
	return c.api.WithRetry().CurrentMasterchainInfo(ctx)
}

func (c *client) GetBlockShardsInfo(ctx context.Context, master *ton.BlockIDExt) ([]*ton.BlockIDExt, error) {
	return c.api.WithRetry().GetBlockShardsInfo(ctx, master)
}

func (c *client) GetTransaction(ctx context.Context, block *ton.BlockIDExt, addr *address.Address, lt uint64) (*tlb.Transaction, error) {
	return c.api.WithRetry().GetTransaction(ctx, block, addr, lt)
}

func (c *client) LookupBlock(ctx context.Context, timeout time.Duration, workchain int32, shard int64, seqno uint32) (*ton.BlockIDExt, error) {
	if timeout == 0 {
		timeout = 3 * time.Second
	}
	return c.api.WithTimeout(timeout).WithRetry().LookupBlock(ctx, workchain, shard, seqno)
}
