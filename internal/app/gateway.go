package app

import (
	"context"
	"encoding/json"
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
		runtime.WithIncomingHeaderMatcher(func(key string) (string, bool) {
			if strings.EqualFold(key, "x-api-key") {
				return "x-api-key", true
			}
			if strings.EqualFold(key, "cookie") {
				return "cookie", true
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
	root.Handle("/", withAuthCookies(mux))
	root.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	root.HandleFunc("/openapi.json", openapiHandler(cfg.OpenAPIPath))
	root.Handle("/docs", scalarHandler())
	return withCORS(root), nil
}

func withAuthCookies(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost ||
			(!strings.HasSuffix(r.URL.Path, "/v1/auth/login") &&
				!strings.HasSuffix(r.URL.Path, "/v1/auth/signup")) {
			h.ServeHTTP(w, r)
			return
		}

		rw := &bufferedWriter{header: http.Header{}, buf: &strings.Builder{}}
		h.ServeHTTP(rw, r)

		for k, vs := range rw.header {
			for _, v := range vs {
				w.Header().Add(k, v)
			}
		}

		var body map[string]any
		if err := json.Unmarshal([]byte(rw.buf.String()), &body); err == nil {
			if token, ok := body["token"].(string); ok && token != "" {
				cookie := &http.Cookie{
					Name:     "babit_session",
					Value:    token,
					Path:     "/",
					HttpOnly: true,
					Secure:   r.URL.Scheme == "https" || strings.HasPrefix(r.Host, "localhost") == false,
					SameSite: http.SameSiteLaxMode,
					MaxAge:   86400 * 7, // 7 days
				}
				http.SetCookie(w, cookie)
			}
		}

		w.WriteHeader(rw.status)
		_, _ = w.Write([]byte(rw.buf.String()))
	})
}

type bufferedWriter struct {
	header http.Header
	status int
	buf    *strings.Builder
}

func (b *bufferedWriter) Header() http.Header {
	if b.header == nil {
		b.header = http.Header{}
	}
	return b.header
}

func (b *bufferedWriter) WriteHeader(status int) {
	b.status = status
}

func (b *bufferedWriter) Write(p []byte) (int, error) {
	return b.buf.Write(p)
}

func withCORS(h http.Handler) http.Handler {
	allowed := os.Getenv("CORS_ALLOWED_ORIGINS")
	if allowed == "" {
		allowed = "https://babit-inky.vercel.app,http://localhost:5173,http://localhost:3000"
	}
	list := strings.Split(allowed, ",")
	for i := range list {
		list[i] = strings.TrimSuffix(strings.TrimSpace(list[i]), "/")
	}
	allowAll := false
	for _, o := range list {
		if o == "*" {
			allowAll = true
			break
		}
	}

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
				w.Header().Set("Access-Control-Allow-Credentials", "true")
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
