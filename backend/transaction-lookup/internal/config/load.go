package config

import (
	"os"

	"github.com/ilyakaznacheev/cleanenv"
	"github.com/joho/godotenv"
	"github.com/pkg/errors"
)

// Load provide app config.
func Load() (*Config, error) {
	if err := loadEnv(); err != nil {
		return nil, err
	}

	return makeConfig()
}

func loadEnv() error {
	envFile := envFile

	if customEnvFile, ok := os.LookupEnv(envFileEnv); ok {
		envFile = customEnvFile
	}

	if _, err := os.Stat(envFile); err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil
		}

		return errors.Wrap(err, "os file stat")
	}

	if err := godotenv.Load(envFile); err != nil {
		return errors.Wrapf(err, "on load config from %s", envFile)
	}

	return nil
}

func makeConfig() (*Config, error) {
	var cfg Config
	if err := cleanenv.ReadEnv(&cfg); err != nil {
		return nil, errors.Wrap(err, "read environment")
	}

	return &cfg, nil
}
