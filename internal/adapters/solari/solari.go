package solari

import (
	"context"
	"errors"
	"fmt"
	"os"
	"strings"

	solarisdk "github.com/solari-sdk/solari-browser-go"
)

type Client struct {
	sdk *solarisdk.Client
}

func NewFromEnv() (*Client, error) {
	key := os.Getenv("SOLARI_API_KEY")
	if key == "" {
		return nil, errors.New("SOLARI_API_KEY not set")
	}
	opts := solarisdk.ClientOptions{APIKey: key}
	if base := os.Getenv("SOLARI_BASE_URL"); base != "" {
		opts.BaseURL = base
	}
	sdk, err := solarisdk.NewClient(opts)
	if err != nil {
		return nil, fmt.Errorf("new solari client: %w", err)
	}
	return &Client{sdk: sdk}, nil
}

func (c *Client) Recording(ctx context.Context, ref string) ([]byte, error) {
	id := sessionID(ref)
	if id == "" {
		return nil, errors.New("empty recording ref")
	}
	blob, err := c.sdk.Sessions.DownloadReplay(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("download replay %s: %w", id, err)
	}
	return blob, nil
}

func sessionID(ref string) string {
	ref = strings.TrimPrefix(ref, "slr://session/")
	ref = strings.TrimPrefix(ref, "slr://rec/")
	if i := strings.IndexByte(ref, '/'); i >= 0 {
		return ref[:i]
	}
	return ref
}

type disabled struct{}

func Disabled() *disabled { return &disabled{} }

func (d *disabled) Recording(ctx context.Context, ref string) ([]byte, error) {
	return nil, errors.New("solari client not configured")
}
