# babit — Notarized Action Ledger

The **black box for AI agents**. Every action an agent takes on Solari (browser /
sandbox / desktop) is captured, bound to a signed human→agent→sub-agent delegation
chain, hash-linked into an append-only log, Merkle-anchored to an external trust root,
and replayable — court-admissible, insurer-priceable, regulator-ready.

Built on [Solari](https://github.com/solari-sdk/solari-cookbook/) primitives (session
recording + isolated microVMs + delegation identity). We don't build execution — we
build the accountability layer nobody owns yet.

## Repo map

| Path | What |
|---|---|
| `docs/research.md` | Market gap, why-now, TAM, risks, sources |
| `docs/architecture.md` | Architecture + system flows (Mermaid → **Excalidraw-importable**) |
| `docs/code-layer-design.md` | Proto-first Go/gRPC/grpc-gateway layering (rixl-style) |
| `proto/ledger/v1/ledger.proto` | Layer 0 — the contract, single source of truth |
| `.claude/skills/agent-task-design/SKILL.md` | Task-design + this repo's code-layer conventions |

## Get the diagrams into Excalidraw

Open `docs/architecture.md`, copy a ```mermaid``` block, and in Excalidraw run
`Cmd/Ctrl+P → "Mermaid to Excalidraw"` (or the
[playground](https://mermaid-to-excalidraw.vercel.app/)). Four blocks → four frames:
Context, Containers, Capture flow, Verify flow.

## Design approach (rixl/rx)

Proto is the contract; everything else is generated or implements against it.
`gateway → services → core ← adapters`, one-way. See `docs/code-layer-design.md`.

## First build slice

1. `internal/core` merkle + sign + delegation graph (pure, TDD).
2. Notarize + Verify happy path over the cookbook's `browser-session-recording` recipe.
3. Demo: run a recorded browser task, tamper one event, watch `VerifyProof` catch it and
   the delegation chain prove which human authorized it.
