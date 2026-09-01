# dev

Manual API testing with the HTTP Client (JetBrains IDEs, or the VS Code REST Client
extension).

## Run

```sh
make db-up     # Postgres
make run       # nald, gRPC on :9090
make gateway   # REST gateway on :8080
```

Copy the template to a local, gitignored env file, then open `api.http`, choose the `dev`
environment, and send the requests top to bottom. Each request captures the ids it needs
for the next one, so the whole flow runs without editing values by hand.

```sh
cp http-client.env.json.example http-client.env.json
```

`http-client.env.json` is gitignored so local secrets never reach the repo. Set `apiKey`
there only if the server was started with `NAL_API_KEY` (this is babit's gateway auth, not
the Solari key).

Environments:
- `dev` — the local gateway (`make run` + `make gateway`).
- `render` — the deployed instance. Select it in the HTTP Client and run the same steps
  against the live service.
