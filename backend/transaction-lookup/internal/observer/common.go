package observer

import (
	"context"
	"log"
	"sort"

	"github.com/xssnick/tonutils-go/ton"
)

func (o *Observer) GetTransactionIDsFromBlock(ctx context.Context, blockID *ton.BlockIDExt) ([]ton.TransactionShortInfo, error) {
	var (
		txIDList []ton.TransactionShortInfo
		after    *ton.TransactionID3
		next     = true
		attempts = 0
	)
	for next {
		fetchedIDs, more, err := o.api.GetBlockTransactionsV2(ctx, blockID, 256, after)
		if err != nil {
			attempts += 1
			if attempts == GetShardsTXsLimit {
				return nil, err // Retries limit exceeded for batch
			}

			logAfter := uint64(0)
			if after != nil {
				logAfter = after.LT
			}
			log.Printf("failed to get block (%d,%d,%d) transactions batch %d: %v\n", blockID.Workchain, blockID.Shard, blockID.SeqNo, logAfter, err)
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
