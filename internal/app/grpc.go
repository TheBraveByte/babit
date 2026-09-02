package app

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/babit/nal/config"
	"github.com/babit/nal/db"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/adapters/anchor"
	"github.com/babit/nal/internal/adapters/brandfetch"
	"github.com/babit/nal/internal/adapters/solari"
	"github.com/babit/nal/internal/adapters/store"
	coreauth "github.com/babit/nal/internal/core/auth"
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

func NewGRPCServer(ctx context.Context, cfg *config.Config) (*grpc.Server, error) {
	if err := db.Init(ctx, cfg.DatabaseURL); err != nil {
		return nil, fmt.Errorf("init db: %w", err)
	}
	signer, err := notarySigner(cfg.NotarySeed)
	if err != nil {
		return nil, err
	}
	st := store.New(db.Q)
	sealer := seal.New(signer)
	tree := merkle.New()
	verifier := graph.New(signer)
	idgen := ids.New()
	clk := clock.System()
	anc := anchor.NewInMemory(clk)
	sol := solariClient(cfg.Solari)
	brands := brandResolver(cfg.Brandfetch)
	notaryCore := service.NewNotaryCore(st.Events(), sealer, tree, anc)

	srv := grpc.NewServer(grpc.ChainUnaryInterceptor(
		dbAPIKeyInterceptor(st.ApiKeys()),
		apiKeyInterceptor(cfg.APIKey),
		jwtInterceptor(cfg.JWTSecret),
		errs.UnaryInterceptor(),
	))
	ledgerv1.RegisterAuthServiceServer(srv, service.NewAuth(st.Users(), brands, cfg.JWTSecret, 24*time.Hour))
	ledgerv1.RegisterProjectServiceServer(srv, service.NewProjectService(st.Projects()))
	ledgerv1.RegisterApiKeyServiceServer(srv, service.NewAPIKeyService(st.ApiKeys(), st.Projects()))
	ledgerv1.RegisterAnalyticsServiceServer(srv, service.NewAnalyticsService(st.Analytics()))
	ledgerv1.RegisterDelegationServiceServer(srv, service.NewDelegation(st.Grants(), signer, verifier, idgen, clk))
	ledgerv1.RegisterNotaryServiceServer(srv, service.NewNotary(notaryCore, anc, signer))
	ledgerv1.RegisterCaptureServiceServer(srv, service.NewCapture(st.Sessions(), st.Grants(), verifier, notaryCore, notaryCore, idgen, clk))
	ledgerv1.RegisterLedgerServiceServer(srv, service.NewLedger(st.Events(), st.Grants(), tree, anc))
	ledgerv1.RegisterReplayServiceServer(srv, service.NewReplay(st.Events(), sol))
	ledgerv1.RegisterVerifyServiceServer(srv, service.NewVerify(signer, tree, verifier, clk))
	return srv, nil
}

func notarySigner(seedHex string) (*sign.Signer, error) {
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

func solariClient(cfg config.SolariConfig) ports.Solari {
	if cfg.APIKey == "" {
		log.Print("solari disabled: SOLARI_API_KEY not set")
		return solari.Disabled()
	}
	c, err := solari.New(cfg.APIKey, cfg.BaseURL)
	if err != nil {
		log.Printf("solari disabled: %v", err)
		return solari.Disabled()
	}
	return c
}

func brandResolver(cfg config.BrandfetchConfig) ports.BrandResolver {
	if cfg.APIKey == "" {
		log.Print("brandfetch disabled: BRANDFETCH_API_KEY not set")
		return brandfetch.Disabled()
	}
	return brandfetch.New(cfg.APIKey)
}

func jwtInterceptor(secret string) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, _ *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		md, ok := metadata.FromIncomingContext(ctx)
		if ok {
			if vals := md.Get("authorization"); len(vals) > 0 {
				tok := strings.TrimSpace(vals[0])
				tok = strings.TrimPrefix(tok, "Bearer ")
				tok = strings.TrimPrefix(tok, "bearer ")
				if uid, err := coreauth.ParseToken(tok, secret); err == nil {
					ctx = coreauth.WithUserID(ctx, uid)
				}
			}
		}
		return handler(ctx, req)
	}
}

func apiKeyInterceptor(want string) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		if want == "" {
			return handler(ctx, req)
		}
		md, ok := metadata.FromIncomingContext(ctx)
		got := ""
		if ok && len(md.Get("x-api-key")) > 0 {
			got = md.Get("x-api-key")[0]
		}
		// Per-project keys (bak_*) are authenticated by dbAPIKeyInterceptor; let them through.
		if strings.HasPrefix(got, "bak_") {
			return handler(ctx, req)
		}
		if got != want {
			return nil, status.Error(codes.Unauthenticated, "missing or invalid x-api-key")
		}
		return handler(ctx, req)
	}
}


func dbAPIKeyInterceptor(keys ports.APIKeyStore) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, _ *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		if md, ok := metadata.FromIncomingContext(ctx); ok {
			if vals := md.Get("x-api-key"); len(vals) > 0 {
				k := strings.TrimSpace(vals[0])
				if strings.HasPrefix(k, "bak_") {
					sum := sha256.Sum256([]byte(k))
					if rec, err := keys.GetByHash(ctx, hex.EncodeToString(sum[:])); err == nil && rec != nil {
						ctx = coreauth.WithUserID(ctx, rec.UserID)
					}
				}
			}
		}
		return handler(ctx, req)
	}
}
