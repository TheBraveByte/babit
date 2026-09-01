package app

import (
	"encoding/json"
	"net/http"
	"os"
)

const scalarHTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Babit API Reference</title>
    <style>body{margin:0}</style>
  </head>
  <body>
    <script id="api-reference" data-url="/openapi.json" data-configuration='{"theme":"purple","layout":"modern","showSidebar":true}'></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`

func scalarHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, _ *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "public, max-age=300")
		_, _ = w.Write([]byte(scalarHTML))
	}
}

// openapiHandler serves the spec with host and scheme filled in from the
// request, so Scalar's base URL matches whatever origin served /docs.
func openapiHandler(path string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		raw, err := os.ReadFile(path)
		if err != nil {
			http.Error(w, "openapi spec unavailable", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		var spec map[string]any
		if json.Unmarshal(raw, &spec) != nil {
			_, _ = w.Write(raw)
			return
		}
		spec["host"] = r.Host
		spec["schemes"] = []string{requestScheme(r)}
		out, err := json.Marshal(spec)
		if err != nil {
			_, _ = w.Write(raw)
			return
		}
		_, _ = w.Write(out)
	}
}

func requestScheme(r *http.Request) string {
	if proto := r.Header.Get("X-Forwarded-Proto"); proto != "" {
		return proto
	}
	if r.TLS != nil {
		return "https"
	}
	return "http"
}
