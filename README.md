# babit

babit is a chain-of-custody system for AI-agent actions. When an agent does something on
Solari — clicks in a browser, runs code in a sandbox — babit records that action, ties it
to the chain of authority that permitted it (which human authorized which agent, and any
sub-agent it delegated to), and seals it into a tamper-evident log. Anyone can later take
a single receipt and verify it offline, without trusting babit's servers.

It does not run the agent or the browser. Solari does that, and records the session.
babit adds the parts Solari doesn't: identity, delegation, and verifiable evidence.

## How it works

1. A human issues a root grant; agents delegate scoped, signed sub-grants from it.
2. Each action is recorded against a grant, hashed, linked to the previous action, signed
   by the notary key, and folded into a Merkle root that is anchored externally.
3. A receipt bundles the action, its delegation chain, the Merkle proof, and the notary's
   public key. `babit verify` checks all of it offline and reconstructs who authorized what.

Change one byte of a sealed action and verification fails.

## Getting started

Requires Go 1.26 and Docker.

```sh
make db-up     # start Postgres
make run       # start nald (gRPC on :9090); migrations run on boot
make test      # unit and integration tests against Postgres
```

The gRPC gateway (`cmd/gateway`) exposes the same API over REST/JSON and serves the
generated OpenAPI at `/openapi.json`.

## Verifying a receipt

```sh
babit fetch --event <event_id> --grpc localhost:9090 --out receipt.json
babit verify receipt.json
```

`verify` needs no server and no database. It prints the delegation chain and five checks —
signature, hash chain, Merkle proof, external anchor, and delegation authority — then a
verdict. Exit code is non-zero when the receipt does not verify.

## Project layout

```
proto/solari/ledger/v1/   the contract; one file per service
db/                       migrations, sqlc queries, and the connection accessor
internal/core/            pure domain: sign, merkle, seal, delegation graph, canon
internal/service/         the six gRPC services
internal/adapters/        Solari SDK client, Postgres store, anchor
internal/interceptor/     browser and sandbox wrappers that notarize real Solari actions
internal/receipt/         portable receipt format and offline verification
cmd/nald, cmd/gateway     gRPC host and REST gateway
cmd/babit                 the fetch/verify CLI
```

## Development

The proto is the source of truth. Change it, then regenerate:

```sh
make generate   # buf generate, sqlc, and mocks
```

CI runs the same generation and fails if the committed output drifts. Dependencies run one
way: gateway to services to core, with adapters implementing interfaces the inner layers
define. `docs/` covers the architecture, the code layers, and the Solari integration.

## License

Proprietary and source-available; see `LICENSE`. Viewing the code here grants no right to
use, copy, modify, or distribute it. Contact the owner for licensing.
