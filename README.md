# babit

Chain-of-custody for AI-agent actions. When an agent acts on Solari (a browser click,
sandbox code), babit records the action, binds it to the signed human-to-agent-to-sub-agent
authority that permitted it, seals it into an append-only, Merkle-anchored log, and lets
anyone verify a single receipt offline. Solari runs and records the agent; babit adds
identity, delegation, and independently verifiable evidence.

## How it works

A human issues a root grant; agents delegate scoped, signed sub-grants. Each action is
recorded against a grant, hash-chained, signed (Ed25519), and folded into a Merkle root
committed to an external anchor. A receipt (event, delegation chain, inclusion proof,
anchor, public key) verifies offline — change one byte and verification fails.

## Architecture

Proto-first: the contract in `proto/` generates the Go types, gRPC, REST gateway, and
OpenAPI. Dependencies run one way — `gateway -> services -> core <- adapters`.

```
proto/solari/ledger/v1/   contract (one file per service)
gen/                      generated code (committed)
db/                       goose migrations, sqlc queries, accessor (events are WORM)
internal/core/            pure domain: sign, merkle, seal, graph, canon, ids, clock
internal/ports/           shared interfaces
internal/service/         six gRPC services
internal/adapters/        Solari client, Postgres store, anchor
internal/interceptor/     browser/sandbox wrappers that notarize real Solari actions
internal/receipt/         portable receipt and offline verification
internal/errs/            typed domain errors mapped to gRPC status
internal/app/             gRPC server and gateway assembly
cmd/                      nald (gRPC), gateway (REST), server (combined), babit (CLI)
```

## Getting started

Requires Go 1.26 and Docker.

```sh
make db-up      # Postgres
make run        # nald on :9090 (migrations run on boot)
make gateway    # REST gateway on :8080, OpenAPI at /openapi.json
make test       # tests against Postgres
make generate   # regenerate proto, sqlc, and mocks
```

## Configuration

Set via environment (or a local `.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres DSN (Neon: include `?sslmode=require`) |
| `NAL_NOTARY_SEED` | 32-byte hex Ed25519 seed; needed for stable receipts across restarts |
| `SOLARI_API_KEY` | optional; enables recordings and replay |
| `NAL_API_KEY` | optional gateway auth (`x-api-key`) |

## CLI

```sh
babit fetch --event <id> --grpc localhost:9090 --out receipt.json
babit verify receipt.json
```

`verify` runs offline (no server or database) and checks the signature, hash chain, Merkle
proof, anchor, and delegation authority.

## License

Proprietary and source-available; see `LICENSE`. No use, copy, or distribution without
written permission.
