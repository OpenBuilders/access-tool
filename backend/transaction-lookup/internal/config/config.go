package config

import (
	liteclientconfig "transaction-lookup/internal/liteclient/config"
	redisconfig "transaction-lookup/internal/redis/config"
)

var (
	GlobalConfigURL map[bool]string = map[bool]string{
		true:  "https://ton.org/testnet-global.config.json",
		false: "https://ton.org/global.config.json",
	}
)

type Config struct {
	LogLevel string `env:"LOG_LEVEL" env-default:"INFO"`

	IsTestnet bool `env:"IS_TESTNET" env-default:"false"`
	Public    bool `env:"IS_PUBLIC" env-default:"true"`

	RedisConfig      redisconfig.Config      `end-prefix:"REDIS_"`
	LiteclientConfig liteclientconfig.Config `end-prefix:"LITESERVER_"`
}
