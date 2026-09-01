# babit

babit is a chain-of-custody system for AI-agent actions. When an agent does something on
Solari — clicks in a browser, runs code in a sandbox — babit records that action, ties it
to the chain of authority that permitted it (which human authorized which agent, and any
sub-agent it delegated to), seals it into a tamper-evident log, and lets anyone verify a
single receipt offline without trusting babit's servers.

It does not run the agent or the browser. Solari does that and records the session. babit
adds the parts Solari does not: identity, delegation, and independently verifiable
evidence connecting authorization to delegation to execution to recorded evidence.

## Concepts

- **Principal and grants.** A human principal issues a root grant. Agents delegate scoped,
  signed sub-grants from it. Every grant carries capabilities, a resource/value scope, an
  optional expiry, and a signature from its parent, so the chain is verifiable back to the
  root without trusting any intermediary.
- **Action events.** Each action an agent performs is recorded against a grant. The event
  captures the action, a Solari recording reference, and before/after state hashes.
- **Sealing.** The notary computes a content hash over the event, links it to the previous
  event's hash (an append-only chain), and signs it with an Ed25519 key.
- **Anchoring.** Sealed events are folded into a Merkle root that is committed to an
  external anchor, so history cannot be backdated or rewritten.
- **Receipts.** A receipt bundles one event, its delegation chain, the Merkle inclusion
  proof, the anchor, and the notary's public key. It is self-contained and verifiable
  offline.

Change one byte of a sealed action and verification fails.

## Architecture

The proto contract is the single source of truth; everything is generated from it or
implements against it. Dependencies run one way:

```
gateway -> services -> core <- adapters
```

- **Contract** (`proto/solari/ledger/v1/`): one file per service; `buf` generates the Go
  types, gRPC stubs, REST gateway, and OpenAPI.
- **Services** (`internal/service/`): six gRPC services — Delegation, Capture, Notary,
  Ledger, Replay, Verify.
- **Core** (`internal/core/`): pure domain with no I/O — `sign` (Ed25519), `merkle`
  (RFC6962), `seal` (hash chain), `graph` (delegation verification), `canon` (deterministic
  encoding), `ids`, `clock`.
- **Adapters** (`internal/adapters/`): the Solari SDK client, the Postgres store, and the
  external anchor. Adapters implement interfaces the inner layers define (`internal/ports`).
- **Database** (`db/`): all database setup in one place — goose migrations (one file per
  table), sqlc queries, and the connection accessor. The `events` table is append-only
  (WORM), enforced by a trigger that rejects updates and deletes.
- **Binaries** (`cmd/`): `nald` (gRPC host), `gateway` (REST/JSON via grpc-gateway), and
  `babit` (the fetch/verify CLI).

Errors are typed domain values (`internal/errs`) mapped to gRPC status codes at the edge
by an interceptor; internal errors never leak their cause to clients.

## Getting started

Requires Go 1.26 and Docker.

```sh
make db-up      # start Postgres
make run        # start nald (gRPC on :9090); migrations run on boot
make test       # unit and integration tests against Postgres
make generate   # regenerate proto, sqlc, and mocks
```

`cmd/gateway` exposes the same API over REST/JSON and serves the generated OpenAPI at
`/openapi.json`.

## Configuration

| Variable | Used by | Purpose |
|---|---|---|
| `DATABASE_URL` | nald | Postgres DSN; migrations run at startup |
| `NAL_NOTARY_SEED` | nald | 32-byte hex Ed25519 seed for a stable notary key across restarts |
| `NAL_API_KEY` | nald | when set, requires `x-api-key` on gRPC calls |
| `GRPC_ADDR`, `HTTP_ADDR` | nald, gateway | listen addresses |
| `SOLARI_API_KEY`, `SOLARI_BASE_URL` | nald | Solari credentials for fetching recordings |

Without `NAL_NOTARY_SEED` a fresh key is generated per process, so receipts cannot be
verified after a restart. Set it in any real deployment.

## HTTP API

Grants and delegation:

```
POST /v1/grants:root                    issue a root grant
POST /v1/grants                         delegate a scoped sub-grant
GET  /v1/grants/{grant_id}:verify       verify a delegation chain
POST /v1/grants/{grant_id}/revoke       revoke a grant
```

Capture and sessions:

```
POST /v1/sessions                       begin a capture session
POST /v1/sessions/{session_id}/actions  record and notarize an action
POST /v1/sessions/{session_id}/end      end a session and checkpoint
GET  /v1/sessions/{session_id}:replay   stream a deterministic replay
GET  /v1/sessions/{session_id}/anchor   fetch the session's anchor
```

Ledger, notary, and verification:

```
GET  /v1/events/{event_id}              read a sealed event
GET  /v1/events/{event_id}:proof        build an inclusion proof
GET  /v1/notary/public-key              fetch the notary public key
POST /v1/proofs:verify                  verify a proof server-side
```

## The CLI

```sh
babit fetch --event <event_id> --grpc localhost:9090 --out receipt.json
babit verify receipt.json
```

`verify` needs no server and no database. It prints the delegation chain and five checks —
signature, hash chain, Merkle proof, external anchor, and delegation authority — then a
verdict. The process exit code is non-zero when the receipt does not verify.

## Development

The proto is authored first; regenerate and commit the output:

```sh
make generate
```

CI runs the same generation and fails if committed output drifts, plus `go vet` and the
full test suite against a Postgres service. Migrations serialize behind a Postgres advisory
lock, so concurrent startups (and parallel test packages) are safe.

## Project layout

```
proto/solari/ledger/v1/   the contract; one file per service
gen/                      generated Go, gRPC, gateway, and OpenAPI (committed)
db/                       migrations (per table), sqlc queries, connection accessor
internal/core/            pure domain: sign, merkle, seal, graph, canon, ids, clock
internal/ports/           interfaces shared across layers
internal/service/         the six gRPC services
internal/adapters/        Solari SDK client, Postgres store, anchor
internal/interceptor/     browser and sandbox wrappers that notarize real Solari actions
internal/receipt/         portable receipt format and offline verification
internal/errs/            typed domain errors and gRPC mapping
cmd/nald, cmd/gateway     gRPC host and REST gateway
cmd/babit                 the fetch/verify CLI
```

## License

Proprietary and source-available; see `LICENSE`. Viewing the code here grants no right to
use, copy, modify, or distribute it. Contact the owner for licensing.
