package app

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/babit/nal/config"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/protobuf/encoding/protojson"
)

type gwRegistrar func(context.Context, *runtime.ServeMux, string, []grpc.DialOption) error

func NewGatewayHandler(ctx context.Context, cfg *config.Config) (http.Handler, error) {
	mux := runtime.NewServeMux(
		runtime.WithMarshalerOption(runtime.MIMEWildcard, &runtime.JSONPb{
			MarshalOptions:   protojson.MarshalOptions{UseProtoNames: true, EmitUnpopulated: true},
			UnmarshalOptions: protojson.UnmarshalOptions{DiscardUnknown: true},
		}),
		// Forward the per-project API key header to gRPC (Authorization passes by default).
		runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
			if strings.EqualFold(key, "x-api-key") {
				return "x-api-key", true
			}
			return runtime.DefaultHeaderMatcher(key)
		}),
	)
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	registrars := []gwRegistrar{
		ledgerv1.RegisterAuthServiceHandlerFromEndpoint,
		ledgerv1.RegisterProjectServiceHandlerFromEndpoint,
		ledgerv1.RegisterApiKeyServiceHandlerFromEndpoint,
		ledgerv1.RegisterAnalyticsServiceHandlerFromEndpoint,
		ledgerv1.RegisterDelegationServiceHandlerFromEndpoint,
		ledgerv1.RegisterCaptureServiceHandlerFromEndpoint,
		ledgerv1.RegisterNotaryServiceHandlerFromEndpoint,
		ledgerv1.RegisterLedgerServiceHandlerFromEndpoint,
		ledgerv1.RegisterReplayServiceHandlerFromEndpoint,
		ledgerv1.RegisterVerifyServiceHandlerFromEndpoint,
	}
	for _, register := range registrars {
		if err := register(ctx, mux, cfg.GRPCTarget, opts); err != nil {
			return nil, err
		}
	}

	root := http.NewServeMux()
	root.Handle("/", mux)
	root.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	root.HandleFunc("/openapi.json", openapiHandler(cfg.OpenAPIPath))
	root.Handle("/docs", scalarHandler())
	return withCORS(root), nil
}


func withCORS(h http.Handler) http.Handler {
	allowed := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowed == "" {
		allowed = "*"
	}
	list := strings.Split(allowed, ",")
	for i := range list {
		list[i] = strings.TrimSpace(list[i])
	}
	allowAll := allowed == "*"

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			ok := allowAll
			for _, o := range list {
				if o == origin {
					ok = true
					break
				}
			}
			if ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				// Credentials are only safe with an explicit allowlist, never with reflect-all.
				if !allowAll {
					w.Header().Set("Access-Control-Allow-Credentials", "true")
				}
			}
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, x-api-key")
		w.Header().Set("Access-Control-Max-Age", "600")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		h.ServeHTTP(w, r)
	})
}
