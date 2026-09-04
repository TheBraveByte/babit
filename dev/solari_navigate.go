//go:build ignore

package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/chromedp/chromedp"
	solarisdk "github.com/solari-sdk/solari-browser-go"
)

func main() {
	url := flag.String("url", "https://github.com/TheBraveByte/babit", "URL to navigate")
	flag.Parse()

	apiKey := os.Getenv("SOLARI_API_KEY")
	baseURL := os.Getenv("SOLARI_BASE_URL")
	if apiKey == "" {
		log.Fatal("SOLARI_API_KEY is required")
	}
	if baseURL == "" {
		baseURL = "https://api.getsolari.com"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	client, err := solarisdk.NewClient(solarisdk.ClientOptions{APIKey: apiKey, BaseURL: baseURL})
	if err != nil {
		log.Fatalf("solari client: %v", err)
	}

	session, err := client.Sessions.Create(ctx, solarisdk.CreateSessionOptions{Recording: true})
	if err != nil {
		log.Fatalf("create session: %v", err)
	}
	fmt.Printf("session id: %s\n", session.ID)

	browserCtx, cancelBrowser, err := solarisdk.Connect(ctx, session)
	if err != nil {
		_ = client.Sessions.Release(ctx, session.ID)
		log.Fatalf("connect browser: %v", err)
	}
	defer func() {
		cancelBrowser()
		if err := client.Sessions.Release(ctx, session.ID); err != nil {
			log.Printf("release: %v", err)
		}
	}()

	if err := chromedp.Run(browserCtx,
		chromedp.Navigate(*url),
		chromedp.Sleep(2*time.Second),
	); err != nil {
		log.Fatalf("navigate: %v", err)
	}
	fmt.Printf("navigated %s\n", *url)
}
