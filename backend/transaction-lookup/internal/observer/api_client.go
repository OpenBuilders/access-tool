package observer

import (
	"context"
	"log"
	"transaction-lookup/internal/config"

	"github.com/xssnick/tonutils-go/liteclient"
	"github.com/xssnick/tonutils-go/ton"
)

func NewAPIClient(ctx context.Context, cfg *config.Config) (ton.APIClientWrapped, error) {
	client := liteclient.NewConnectionPool()
	globalConfig, err := liteclient.GetConfigFromUrl(ctx, config.GlobalConfigURL[cfg.IsTestnet])
	if err != nil {
		return nil, err
	}
	if !cfg.Public {
		if err = client.AddConnection(ctx, cfg.LiteserverHost, cfg.LiteserverKey); err != nil {
			return nil, err
		}

	} else {
		err = client.AddConnectionsFromConfig(ctx, globalConfig)
		if err != nil {
			return nil, err
		}
	}
	api := ton.NewAPIClient(client, ton.ProofCheckPolicyFast).WithRetry()
	api.SetTrustedBlockFromConfig(globalConfig)

	log.Println("fetching and checking proofs since config init block ...")
	_, err = api.CurrentMasterchainInfo(ctx)
	if err != nil {
		return nil, err
	}
	return api, nil
}
