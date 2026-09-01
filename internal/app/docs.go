package app

import "net/http"

const scalarHTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>babit — API Reference</title>
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
