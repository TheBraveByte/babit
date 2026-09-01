package solari

import (
	"context"
	"errors"
	"fmt"
	"strings"

	solarisdk "github.com/solari-sdk/solari-browser-go"
)

type Client struct {
	sdk *solarisdk.Client
}

func New(apiKey, baseURL string) (*Client, error) {
	if apiKey == "" {
		return nil, errors.New("solari api key is required")
	}
	opts := solarisdk.ClientOptions{APIKey: apiKey}
	if baseURL != "" {
		opts.BaseURL = baseURL
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
