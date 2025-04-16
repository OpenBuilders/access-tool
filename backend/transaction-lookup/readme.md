# WARNING: This is currently a detached for of [the original repository](https://github.com/OpenBuilders/transaction-lookup) and should be replaced with an image instead


# Transactions Observer
A Go-based service designed to monitor wallet activity in real-time, providing notifications for new transactions as they occur. This functionality enables seamless tracking of wallet activity and ensures that metadata updates are triggered only when necessary, optimizing efficiency and responsiveness.
### Key points:
- All observed wallets are stored as keys with TTL in Redis.
- These keys must be **raw TON addresses** or they won't be added into memory.
- When service is being initialized it loads from Redis all keys that match raw address format into memory.
- Only new key expiration set triggers addition that key to memory.
- When key is expired it triggers sending event to certain channel that service listens to.
- All noticed wallets are sent to `noticed_wallets` stream in Redis.
# Usage
## Redis Preparation
1. Deploy Redis instance
2. Enable notifications in redis about new expire sets and about expired keys
   ```console
    redis-cli config set notify-keyspace-events Egx
   ```

## Environment
Set these environment variables
|Name of variable|Value|
|:---------------|:---:|
|Redis variables||
|`REDIS_HOST`|hostname:port|
|`REDIS_USER`|username|
|`REDIS_PASS`|password|
|`REDIS_DB`|db index, default - **0**|
|Liteserver variables||
|`LITESERVER_HOST`|ip:port|
|`LITESERVER_KEY`|key|
|`IS_TESTNET`|**true** for testnet, **false** for mainnet|
|`IS_PUBLIC`|**true** for public node else **false**|

## Deploy

Use `build/Dockerfile.worker` image or just deploy with docker-compose
```console
docker-compose up
```

# Structure
These goroutines ensure seamless operation and continuous notification by efficiently processing blockchain data and handling related events in real time. They are responsible for monitoring the generation of new master blocks, fetching and processing shard blocks and transactions, and managing notifications and event handling through Redis.  
|Name of worker|Amount|Description|
|:-------------|:----:|:----------|
|**Blockchain**||
|Master-blocks observer|1|Observes TON new master-blocks generation|
|Master-blocks handler|1|Fetchs all shard-blocks for generated master-block|
|Shard-blocks handler|10|Fetchs & handles all TXs from shard-block|
|**Redis**||
|Redis sender|1|Sends notification (stream) about noticed wallets|
|Redis events handler|1|Handles new keys & expired TTL events|
