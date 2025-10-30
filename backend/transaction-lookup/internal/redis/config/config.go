package config

type Config struct {
	Host          string `env:"HOST" env-default:"redis"`
	Port          int    `env:"PORT" env-default:"6379"`
	User          string `env:"USER" env-default:""`
	Password      string `env:"PASSWORD" env-default:""`
	Database      int    `env:"DB" env-default:"0"`
	TLS           bool   `env:"ENABLE_TLS" env-default:"false"`
	MinTLSVersion uint16 `env:"MIN_TLS_VERSION" env-default:"769"` // 769 - default in package

}
