package config

var (
	GlobalConfigURL map[bool]string = map[bool]string{
		true:  "https://ton-blockchain.github.io/testnet-global.config.json",
		false: "https://ton-blockchain.github.io/global.config.json",
	}
)

type Config struct {
	LiteserverHost string `env:"HOST"`
	LiteserverKey  string `env:"KEY"`
}
