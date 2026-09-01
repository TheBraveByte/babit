package brandfetch

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/babit/nal/internal/ports"
)

type Client struct {
	http *http.Client
	key  string
}

func New(apiKey string) *Client {
	return &Client{http: &http.Client{Timeout: 8 * time.Second}, key: apiKey}
}

type brandResponse struct {
	Name  string `json:"name"`
	Logos []struct {
		Type    string `json:"type"`
		Formats []struct {
			Src    string `json:"src"`
			Format string `json:"format"`
		} `json:"formats"`
	} `json:"logos"`
	Colors []struct {
		Hex  string `json:"hex"`
		Type string `json:"type"`
	} `json:"colors"`
}

func (c *Client) Resolve(ctx context.Context, domain string) (ports.Branding, error) {
	url := "https://api.brandfetch.io/v2/brands/" + domain
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return ports.Branding{}, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+c.key)
	resp, err := c.http.Do(req)
	if err != nil {
		return ports.Branding{}, fmt.Errorf("fetch brand: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return ports.Branding{}, fmt.Errorf("brandfetch %s: status %d", domain, resp.StatusCode)
	}
	var body brandResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return ports.Branding{}, fmt.Errorf("decode brand: %w", err)
	}
	return ports.Branding{
		CompanyName: body.Name,
		LogoURL:     pickLogo(body),
		BrandColor:  pickColor(body),
	}, nil
}

func pickLogo(b brandResponse) string {
	for _, want := range []string{"logo", "icon", "symbol"} {
		for _, l := range b.Logos {
			if l.Type == want && len(l.Formats) > 0 {
				return l.Formats[0].Src
			}
		}
	}
	if len(b.Logos) > 0 && len(b.Logos[0].Formats) > 0 {
		return b.Logos[0].Formats[0].Src
	}
	return ""
}

func pickColor(b brandResponse) string {
	for _, want := range []string{"accent", "brand", "dark"} {
		for _, c := range b.Colors {
			if c.Type == want && c.Hex != "" {
				return c.Hex
			}
		}
	}
	if len(b.Colors) > 0 {
		return b.Colors[0].Hex
	}
	return ""
}

type disabled struct{}

func Disabled() *disabled { return &disabled{} }

func (d *disabled) Resolve(context.Context, string) (ports.Branding, error) {
	return ports.Branding{}, nil
}
