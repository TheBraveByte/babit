package main

import (
	"context"
	"log"
	"net"
	"net/http"

	"github.com/babit/nal/config"
	"github.com/babit/nal/db"
	"github.com/babit/nal/internal/app"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	ctx := context.Background()

	srv, err := app.NewGRPCServer(ctx, cfg)
	if err != nil {
		log.Fatalf("build server: %v", err)
	}
	defer db.Close()

	lis, err := net.Listen("tcp", cfg.GRPCAddr)
	if err != nil {
		log.Fatalf("listen %s: %v", cfg.GRPCAddr, err)
	}
	go func() {
		log.Printf("grpc listening on %s", cfg.GRPCAddr)
		if err := srv.Serve(lis); err != nil {
			log.Fatalf("serve grpc: %v", err)
		}
	}()

	handler, err := app.NewGatewayHandler(ctx, cfg)
	if err != nil {
		log.Fatalf("build gateway: %v", err)
	}
	log.Printf("gateway http listening on %s", cfg.HTTPAddr)
	if err := http.ListenAndServe(cfg.HTTPAddr, handler); err != nil {
		log.Fatalf("serve http: %v", err)
	}
}
