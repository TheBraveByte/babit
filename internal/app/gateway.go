package app

import (
	"context"
	"net/http"

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
	)
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	registrars := []gwRegistrar{
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
	return root, nil
}
