# dev

Manual API testing with the HTTP Client (JetBrains IDEs, or the VS Code REST Client
extension).

## Run

```sh
make db-up     # Postgres
make run       # nald, gRPC on :9090
make gateway   # REST gateway on :8080
```

Open `api.http`, choose the `dev` environment (from `http-client.env.json`), and send the
requests top to bottom. Each request captures the ids it needs for the next one, so the
whole flow runs without editing values by hand.

Set `apiKey` in `http-client.env.json` only if `nald` was started with `NAL_API_KEY`.
