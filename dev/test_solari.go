package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	solarisdk "github.com/solari-sdk/solari-browser-go"
)

func main() {
	apiKey := os.Getenv("SOLARI_API_KEY")
	baseURL := os.Getenv("SOLARI_BASE_URL")
	if apiKey == "" {
		log.Fatal("SOLARI_API_KEY is required")
	}
	if baseURL == "" {
		baseURL = "https://api.getsolari.com"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
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
	fmt.Printf("cdp endpoint: %s\n", session.CDPEndpoint)
	fmt.Printf("expires at: %s\n", session.ExpiresAt)

	if err := client.Sessions.Release(ctx, session.ID); err != nil {
		log.Fatalf("release session: %v", err)
	}
	fmt.Println("session released")
}
