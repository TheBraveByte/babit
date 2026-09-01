package main

import (
	"context"
	"log"

	"github.com/babit/nal/config"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/interceptor"
	solarisdk "github.com/solari-sdk/solari-browser-go"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func main() {
	ctx := context.Background()
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	if cfg.Solari.APIKey == "" {
		log.Fatal("SOLARI_API_KEY required")
	}
	sdk, err := solarisdk.NewClient(solarisdk.ClientOptions{APIKey: cfg.Solari.APIKey, BaseURL: cfg.Solari.BaseURL})
	if err != nil {
		log.Fatalf("solari client: %v", err)
	}

	conn, err := grpc.NewClient(cfg.GRPCTarget, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("dial nald: %v", err)
	}
	defer conn.Close()

	delegation := ledgerv1.NewDelegationServiceClient(conn)
	capture := ledgerv1.NewCaptureServiceClient(conn)

	root, err := delegation.IssueRootGrant(ctx, &ledgerv1.IssueRootGrantRequest{PrincipalId: "usr_demo", Scope: &ledgerv1.Scope{MaxDepth: 3}})
	if err != nil {
		log.Fatalf("issue root: %v", err)
	}
	child, err := delegation.Delegate(ctx, &ledgerv1.DelegateRequest{
		ParentGrantId: root.GetGrant().GetGrantId(),
		SubjectId:     "agt_demo",
		Capabilities:  []string{"browser.navigate", "browser.click", "browser.type"},
		Scope:         &ledgerv1.Scope{},
	})
	if err != nil {
		log.Fatalf("delegate: %v", err)
	}

	br, err := interceptor.NewBrowser(ctx, capture, sdk, root.GetGrant().GetGrantId(), child.GetGrant().GetGrantId())
	if err != nil {
		log.Fatalf("interceptor: %v", err)
	}
	defer func() {
		if err := br.Close(ctx); err != nil {
			log.Printf("close: %v", err)
		}
	}()

	ev, err := br.Navigate(ctx, "https://example.com")
	if err != nil {
		log.Fatalf("navigate: %v", err)
	}
	log.Printf("notarized action %s seq=%d", ev.GetEventId(), ev.GetSequence())
}
