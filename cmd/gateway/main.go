package main

import (
	"context"
	"log"
	"net/http"

	"github.com/babit/nal/config"
	"github.com/babit/nal/internal/app"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	handler, err := app.NewGatewayHandler(context.Background(), cfg)
	if err != nil {
		log.Fatalf("build gateway: %v", err)
	}
	log.Printf("gateway http listening on %s (grpc %s)", cfg.HTTPAddr, cfg.GRPCTarget)
	if err := http.ListenAndServe(cfg.HTTPAddr, handler); err != nil {
		log.Fatalf("serve http: %v", err)
	}
}
