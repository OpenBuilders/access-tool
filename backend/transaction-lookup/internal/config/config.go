package config

import (
	"log"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

var (
	GlobalConfigURL map[bool]string = map[bool]string{
		true:  "https://ton.org/testnet-global.config.json",
		false: "https://ton.org/global.config.json",
	}
)

type Config struct {
	RedisHost string `env:"REDIS_HOST,required"`
	RedisUser string `env:"REDIS_USER"  endDefault:""`
	RedisPass string `env:"REDIS_PASS"  endDefault:""`
	RedisDB   int    `env:"REDIS_DB"  endDefault:"0"`

	LiteserverHost string `env:"LITESERVER_HOST"`
	LiteserverKey  string `env:"LITESERVER_KEY"`
	IsTestnet      bool   `env:"IS_TESTNET" envDefault:"false"`
	Public         bool   `env:"IS_PUBLIC" envDefault:"true"`
}

func LoadEnvVariables() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env files found, using default environment")
	}

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil
	}
	return cfg
}
