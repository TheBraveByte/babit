package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"net"
	"os"

	"github.com/babit/nal/db"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/adapters/anchor"
	"github.com/babit/nal/internal/adapters/solari"
	"github.com/babit/nal/internal/adapters/store"
	"github.com/babit/nal/internal/core/clock"
	"github.com/babit/nal/internal/core/graph"
	"github.com/babit/nal/internal/core/ids"
	"github.com/babit/nal/internal/core/merkle"
	"github.com/babit/nal/internal/core/seal"
	"github.com/babit/nal/internal/core/sign"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"github.com/babit/nal/internal/service"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

func main() {
	ctx := context.Background()
	dsn := getenv("DATABASE_URL", "postgres://postgres:pass@localhost:55432/nal?sslmode=disable")
	if err := db.Init(ctx, dsn); err != nil {
		log.Fatalf("init db: %v", err)
	}
	defer db.Close()

	st := store.New(db.Q)
	signer, err := notarySigner()
	if err != nil {
		log.Fatalf("init signer: %v", err)
	}
	sealer := seal.New(signer)
	tree := merkle.New()
	verifier := graph.New(signer)
	idgen := ids.New()
	clk := clock.System()
	anc := anchor.NewInMemory(clk)
	sol := solariClient()
	notaryCore := service.NewNotaryCore(st.Events(), sealer, tree, anc)

	srv := grpc.NewServer(grpc.ChainUnaryInterceptor(apiKeyInterceptor(os.Getenv("NAL_API_KEY")), errs.UnaryInterceptor()))
	ledgerv1.RegisterDelegationServiceServer(srv, service.NewDelegation(st.Grants(), signer, verifier, idgen, clk))
	ledgerv1.RegisterNotaryServiceServer(srv, service.NewNotary(notaryCore, anc, signer))
	ledgerv1.RegisterCaptureServiceServer(srv, service.NewCapture(st.Sessions(), st.Grants(), verifier, notaryCore, notaryCore, idgen, clk))
	ledgerv1.RegisterLedgerServiceServer(srv, service.NewLedger(st.Events(), st.Grants(), tree, anc))
	ledgerv1.RegisterReplayServiceServer(srv, service.NewReplay(st.Events(), sol))
	ledgerv1.RegisterVerifyServiceServer(srv, service.NewVerify(signer, tree, verifier, clk))

	addr := getenv("GRPC_ADDR", ":9090")
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("listen %s: %v", addr, err)
	}
	log.Printf("nald grpc listening on %s", addr)
	if err := srv.Serve(lis); err != nil {
		log.Fatalf("serve: %v", err)
	}
}

func notarySigner() (*sign.Signer, error) {
	seedHex := os.Getenv("NAL_NOTARY_SEED")
	if seedHex == "" {
		log.Print("NAL_NOTARY_SEED unset: generating an ephemeral notary key (receipts break across restarts)")
		return sign.NewEd25519()
	}
	seed, err := hex.DecodeString(seedHex)
	if err != nil {
		return nil, fmt.Errorf("decode NAL_NOTARY_SEED: %w", err)
	}
	return sign.FromSeed(seed)
}

func apiKeyInterceptor(want string) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		if want == "" {
			return handler(ctx, req)
		}
		md, ok := metadata.FromIncomingContext(ctx)
		if !ok || len(md.Get("x-api-key")) == 0 || md.Get("x-api-key")[0] != want {
			return nil, status.Error(codes.Unauthenticated, "missing or invalid x-api-key")
		}
		return handler(ctx, req)
	}
}

func solariClient() ports.Solari {
	c, err := solari.NewFromEnv()
	if err != nil {
		log.Printf("solari disabled: %v", err)
		return solari.Disabled()
	}
	return c
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
