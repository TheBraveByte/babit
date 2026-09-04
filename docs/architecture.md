# Notarized Action Ledger — Architecture & System Flow

> **Product:** a cryptographic chain-of-custody for AI-agent actions. Every action an
> agent takes on Solari (browser, sandbox, desktop) is captured, tied to a signed
> human-to-agent-to-sub-agent delegation chain, hash-linked into an append-only log,
> committed to a Merkle root and external anchor, and independently verifiable offline —
> designed to produce court-ready, machine-verifiable evidence for regulated environments.

## How to get these into Excalidraw

Every diagram below is Mermaid. In Excalidraw: **top-left menu → "Open" is not needed** —
use the command palette (`Ctrl/Cmd+P`) → **"Mermaid to Excalidraw"**, or the
[mermaid-to-excalidraw playground](https://mermaid-to-excalidraw.vercel.app/), paste a
block, and it drops editable shapes onto the canvas. Do the four blocks on four frames.

---

## 1. System context (C4 level 1)

```mermaid
flowchart LR
  H([Human principal]):::actor
  AG([AI agent / sub-agent]):::actor
  AUD([Auditor / Insurer / Regulator]):::actor

  subgraph NAL["Notarized Action Ledger (our system)"]
    GW[API Gateway<br/>grpc-gateway REST/JSON]:::core
    SVC[gRPC services]:::core
    LOG[(Append-only ledger<br/>+ recording blobs)]:::store
  end

  subgraph SOLARI["Solari (execution)"]
    BR[Cloud Browser]:::ext
    SB[Sandbox microVM]:::ext
    DK[Desktop / VNC]:::ext
  end

  ANCHOR[[External trust anchor<br/>TSA / transparency log / chain]]:::ext

  H -->|delegates authority| GW
  AG -->|acts through interceptor| SOLARI
  SOLARI -->|action + recording ref| GW
  GW --> SVC --> LOG
  SVC -->|periodic Merkle root| ANCHOR
  AUD -->|verify proof, offline-checkable| GW

  classDef actor fill:#eef,stroke:#557;
  classDef core fill:#dfe9ff,stroke:#2a4d9b,color:#12245c;
  classDef store fill:#e6f6e6,stroke:#3a7d3a;
  classDef ext fill:#f4f4f4,stroke:#888;
```

---

## 2. Container / service architecture

```mermaid
flowchart TB
  subgraph EDGE["Edge"]
    GW["API Gateway<br/>(grpc-gateway)<br/>authn · rate-limit · REST↔gRPC"]:::core
  end

  subgraph SERVICES["gRPC services (internal mTLS)"]
    DEL["DelegationService<br/>issue / verify / revoke grants"]:::svc
    CAP["CaptureService<br/>begin · record · end session"]:::svc
    NOT["NotaryService<br/>hash-link · sign · Merkle · anchor"]:::svc
    LED["LedgerService<br/>read events + inclusion proofs"]:::svc
    REP["ReplayService<br/>deterministic frame stream"]:::svc
    VER["VerifyService<br/>trust-minimized proof check"]:::svc
  end

  subgraph CORE["internal/core (pure, unit-tested)"]
    MERK["merkle + hash-chain"]:::dom
    SIG["signing / key mgmt"]:::dom
    GRAPH["delegation graph"]:::dom
  end

  subgraph ADAPTERS["internal/adapters"]
    SOL["solari client<br/>browser · sandbox · desktop"]:::adp
    STORE["WORM store<br/>events + blobs"]:::adp
    ANC["anchor client<br/>TSA / CT / chain"]:::adp
  end

  GW --> DEL & CAP & LED & REP & VER
  CAP --> NOT
  DEL --> GRAPH
  NOT --> MERK & SIG
  NOT --> STORE & ANC
  CAP --> SOL
  LED --> STORE
  REP --> STORE & SOL
  VER --> MERK & SIG & GRAPH

  classDef core fill:#dfe9ff,stroke:#2a4d9b,color:#12245c;
  classDef svc fill:#eaf1ff,stroke:#3a5fb0;
  classDef dom fill:#fff2d8,stroke:#b8862a;
  classDef adp fill:#f0f0f0,stroke:#777;
```

**Layering (proto-first, contract-down).** See [code-layer-design.md](./code-layer-design.md).

```
proto/ (contract)  →  cmd/gateway (grpc-gateway)  →  internal/<service> (gRPC)
                                                   →  internal/core (domain, pure)
                                                   →  internal/adapters (solari, store, anchor)
```

---

## 3. Runtime flow — capture → notarize → anchor

```mermaid
sequenceDiagram
  autonumber
  participant H as Human
  participant D as DelegationService
  participant A as AI Agent
  participant S as Solari runtime
  participant C as CaptureService
  participant N as NotaryService
  participant L as Ledger (WORM)
  participant X as External anchor

  H->>D: IssueRootGrant(principal, scope)
  D-->>H: root Grant (signed)
  H->>D: Delegate(root → agent, caps, scope)
  D-->>A: scoped Grant (parent-signed)

  A->>S: action (click/exec/type) + grant
  Note over C,S: interceptor snapshots pre-state
  S-->>A: result + recording_ref
  Note over C,S: interceptor snapshots post-state
  A->>C: RecordAction(session, grant, payload, pre/post hash, recording_ref)
  C->>D: VerifyChain(grant) — scope + depth + expiry
  D-->>C: valid + chain-to-root
  C->>N: Notarize(event)
  N->>N: content_hash, prev_hash link, sign
  N->>L: append sealed ActionEvent
  N-->>C: sealed event
  C-->>A: sealed event (event_id)

  loop every batch / interval
    N->>N: build Merkle root
    N->>X: anchor(root) → receipt
    N->>L: store Anchor
  end
```

---

## 4. Verification flow — trust-minimized

```mermaid
sequenceDiagram
  autonumber
  participant V as Auditor/Insurer/Regulator
  participant G as Gateway
  participant Led as LedgerService
  participant Ver as VerifyService

  V->>G: GET /v1/events/{id}:proof
  G->>Led: GetInclusionProof(event_id)
  Led-->>V: Proof { event, merkle_path, root, anchor, delegation_chain }

  Note over V: can verify OFFLINE, or:
  V->>G: POST /v1/proofs:verify { proof }
  G->>Ver: VerifyProof(proof)
  Ver-->>V: { chain_intact, signature_valid, anchored, authority_valid }
```

**What each check proves**

| Check | Question it answers |
|---|---|
| `chain_intact` | Was the log tampered with? (prev_hash links unbroken) |
| `signature_valid` | Did our notary actually seal this event? |
| `anchored` | Was the Merkle root committed externally, so we can't backdate? |
| `authority_valid` | Did a real human authorize this exact agent for this exact action? |

---

## 5. Excalidraw layout hints (if you place boxes by hand)

Four frames, left→right: **Context → Containers → Capture flow → Verify flow.**

| Frame | Key shapes | Emphasis |
|---|---|---|
| Context | 3 actors (left), NAL box (center), Solari + Anchor (right) | one arrow loop: delegate → act → record → verify |
| Containers | Gateway on top, 6 service pills, core (yellow) + adapters (grey) rows | color = layer; arrows only downward |
| Capture flow | vertical swimlanes per participant | highlight the `Notarize` → `append` → `anchor` band |
| Verify flow | 2 lanes (verifier, us) | callout: "verifiable offline" on the Proof arrow |

Palette: core `#dfe9ff`, services `#eaf1ff`, domain `#fff2d8`, adapters `#f0f0f0`,
stores `#e6f6e6`, external `#f4f4f4`.

## Repository layout

```
proto/solari/ledger/v1/   API contract (generates Go, gRPC, REST gateway, OpenAPI)
gen/                      generated code (committed)
db/                       migrations, sqlc queries, event store
internal/core/            domain logic: signing, Merkle trees, canon, ids, clock
internal/ports/           shared interfaces
internal/service/         gRPC service implementations
internal/adapters/        Solari client, Postgres store, anchor clients
internal/interceptor/     browser/sandbox notarization of Solari actions
internal/receipt/         portable receipt and offline verification
internal/errs/            typed domain errors mapped to gRPC status
internal/app/             gRPC server and gateway assembly
cmd/                      nald, gateway, server, babit CLI
```
