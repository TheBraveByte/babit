package main

import (
	"context"
	"log"
	"net/http"
	"os"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type registrar func(context.Context, *runtime.ServeMux, string, []grpc.DialOption) error

func main() {
	ctx := context.Background()
	grpcAddr := getenv("GRPC_ADDR", "localhost:9090")
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
		if err := register(ctx, mux, grpcAddr, opts); err != nil {
			log.Fatalf("register gateway handler: %v", err)
		}
	}

	root := http.NewServeMux()
	root.Handle("/", mux)
	openapiPath := getenv("OPENAPI_PATH", "gen/openapi/ledger.swagger.json")
	root.HandleFunc("/openapi.json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, openapiPath)
	})

	addr := getenv("HTTP_ADDR", ":8080")
	log.Printf("gateway http listening on %s (grpc %s)", addr, grpcAddr)
	if err := http.ListenAndServe(addr, root); err != nil {
		log.Fatalf("serve http: %v", err)
	}
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
