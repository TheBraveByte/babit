package app

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

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
	opts := []grpc.DialOption{
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithDefaultCallOptions(
			grpc.MaxCallRecvMsgSize(64<<20),
			grpc.MaxCallSendMsgSize(64<<20),
		),
	}
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
	root.HandleFunc("/v1/auth/logout", logoutHandler())
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
				secure, sameSite := cookieFlags(r)
				cookie := &http.Cookie{
					Name:     "babit_session",
					Value:    token,
					Path:     "/",
					HttpOnly: true,
					Secure:   secure,
					SameSite: sameSite,
					MaxAge:   int(24 * time.Hour.Seconds()), // align with JWT TTL
				}
				http.SetCookie(w, cookie)
			}
		}

		status := rw.status
		if status == 0 {
			status = http.StatusOK
		}
		w.WriteHeader(status)
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
	if b.status == 0 {
		b.status = http.StatusOK
	}
	return b.buf.Write(p)
}

func logoutHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		secure, sameSite := cookieFlags(r)
		http.SetCookie(w, &http.Cookie{
			Name:     "babit_session",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			Expires:  time.Unix(0, 0),
			HttpOnly: true,
			Secure:   secure,
			SameSite: sameSite,
		})
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("{}"))
	}
}

func cookieFlags(r *http.Request) (secure bool, sameSite http.SameSite) {
	if isHTTPS(r) {
		return true, http.SameSiteNoneMode
	}
	return false, http.SameSiteLaxMode
}

func isHTTPS(r *http.Request) bool {
	if r.TLS != nil {
		return true
	}
	if p := r.Header.Get("X-Forwarded-Proto"); p == "https" {
		return true
	}
	if s := r.Header.Get("X-Forwarded-Scheme"); s == "https" {
		return true
	}
	return false
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
