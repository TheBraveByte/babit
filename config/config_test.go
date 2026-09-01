package config_test

import (
	"testing"

	"github.com/babit/nal/config"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLoadDefaults(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://localhost/nal")
	cfg, err := config.Load()
	require.NoError(t, err)
	assert.Equal(t, "DEV", cfg.Environment)
	assert.Equal(t, ":9090", cfg.GRPCAddr)
}

func TestLoadReadsSolariFromEnv(t *testing.T) {
	t.Setenv("SOLARI_API_KEY", "slr_live_test")
	t.Setenv("SOLARI_BASE_URL", "https://gw.example.com")
	cfg, err := config.Load()
	require.NoError(t, err)
	assert.Equal(t, "slr_live_test", cfg.Solari.APIKey)
	assert.Equal(t, "https://gw.example.com", cfg.Solari.BaseURL)
}

func TestValidateRequiresNotarySeedInProd(t *testing.T) {
	t.Setenv("NAL_ENV", "PROD")
	t.Setenv("DATABASE_URL", "postgres://localhost/nal")
	t.Setenv("NAL_NOTARY_SEED", "")
	_, err := config.Load()
	require.Error(t, err)
	assert.Contains(t, err.Error(), "NAL_NOTARY_SEED")
}

func TestPortOverridesHTTPAddr(t *testing.T) {
	t.Setenv("PORT", "10000")
	cfg, err := config.Load()
	require.NoError(t, err)
	assert.Equal(t, ":10000", cfg.HTTPAddr)
}
