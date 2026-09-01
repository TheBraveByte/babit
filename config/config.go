package config

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	Environment string `env:"NAL_ENV" envDefault:"DEV"`
	GRPCAddr    string `env:"GRPC_ADDR" envDefault:":9090"`
	HTTPAddr    string `env:"HTTP_ADDR" envDefault:":8080"`
	GRPCTarget  string `env:"NAL_GRPC" envDefault:"localhost:9090"`
	OpenAPIPath string `env:"OPENAPI_PATH" envDefault:"gen/openapi/ledger.swagger.json"`
	DatabaseURL string `env:"DATABASE_URL" envDefault:"postgres://postgres:pass@localhost:55432/nal?sslmode=disable"`
	NotarySeed  string `env:"NAL_NOTARY_SEED" envDefault:""`
	APIKey      string `env:"NAL_API_KEY" envDefault:""`
	Solari      SolariConfig
}

type SolariConfig struct {
	APIKey  string `env:"SOLARI_API_KEY" envDefault:""`
	BaseURL string `env:"SOLARI_BASE_URL" envDefault:""`
}

func Load() (*Config, error) {
	if path := findDotenv(); path != "" {
		_ = godotenv.Load(path)
	}
	var c Config
	if err := env.Parse(&c); err != nil {
		return nil, fmt.Errorf("parse env: %w", err)
	}
	if err := c.validate(); err != nil {
		return nil, err
	}
	return &c, nil
}

func (c *Config) validate() error {
	var missing []string
	if c.DatabaseURL == "" {
		missing = append(missing, "DATABASE_URL")
	}
	if c.Environment == "PROD" {
		if c.NotarySeed == "" {
			missing = append(missing, "NAL_NOTARY_SEED")
		}
		if c.Solari.APIKey == "" {
			missing = append(missing, "SOLARI_API_KEY")
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required config: %s", strings.Join(missing, ", "))
	}
	return nil
}

func findDotenv() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	for {
		candidate := filepath.Join(dir, ".env")
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			return ""
		}
		dir = parent
	}
}
