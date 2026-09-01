package main

import (
	"context"
	"log"
	"net/http"

	"github.com/babit/nal/config"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type registrar func(context.Context, *runtime.ServeMux, string, []grpc.DialOption) error

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	ctx := context.Background()
	mux := runtime.NewServeMux()
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}

	registrars := []registrar{
		ledgerv1.RegisterDelegationServiceHandlerFromEndpoint,
		ledgerv1.RegisterCaptureServiceHandlerFromEndpoint,
		ledgerv1.RegisterNotaryServiceHandlerFromEndpoint,
		ledgerv1.RegisterLedgerServiceHandlerFromEndpoint,
		ledgerv1.RegisterReplayServiceHandlerFromEndpoint,
		ledgerv1.RegisterVerifyServiceHandlerFromEndpoint,
	}
	for _, register := range registrars {
		if err := register(ctx, mux, cfg.GRPCTarget, opts); err != nil {
			log.Fatalf("register gateway handler: %v", err)
		}
	}

	root := http.NewServeMux()
	root.Handle("/", mux)
	root.HandleFunc("/openapi.json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, cfg.OpenAPIPath)
	})

	log.Printf("gateway http listening on %s (grpc %s)", cfg.HTTPAddr, cfg.GRPCTarget)
	if err := http.ListenAndServe(cfg.HTTPAddr, root); err != nil {
		log.Fatalf("serve http: %v", err)
	}
}
