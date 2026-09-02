# Visualization concepts — grounded in babit's real data model

Rule: every visual must depict what babit actually does (from the proto model + real API
routes). No fabricated scale, no decorative nonsense. Terminology comes from the protos.

## Ground truth — data model (proto/solari/ledger/v1)
- **Grant**: grant_id, parent_grant_id, principal_id, subject_id, capabilities[],
  scope{resource_globs[], max_value_cents, max_depth}, parent_signature.
  → a SIGNED delegation DAG: human principal issues a root grant, then delegates scoped
    authority to an agent (subject), which can sub-delegate down to max_depth.
- **ActionEvent**: event_id, session_id, sequence, surface(BROWSER|SANDBOX|DESKTOP),
  action_type, action_payload, grant_id, pre_state_hash, post_state_hash, content_hash,
  **prev_hash**, notary_signature.
  → an append-only per-session chain: each event links to the previous via prev_hash and
    is sealed by the notary_signature.
- **Proof**: event, merkle_path[], merkle_root, anchor, delegation_chain[].
  → offline-verifiable inclusion proof: event → merkle_path → merkle_root → anchor, plus
    the full delegation_chain back to root.
- **Anchor**: kind(TRANSPARENCY_LOG|PUBLIC_CHAIN), root, anchor_receipt.
  → the sealed root is anchored to an external, public transparency log / chain.
- **VerifyProofResponse**: valid, chain_intact, signature_valid, anchored, authority_valid,
  reason. → exactly four independent checks.

## Real API routes (openapi.v3.json) — used by the API reference + dashboard
Auth: POST /v1/auth/login, GET /v1/auth/me, POST /v1/auth/signup
Grants (delegation): POST /v1/grants:root, POST /v1/grants,
  POST /v1/grants/{id}/revoke, GET /v1/grants/{id}:verify
Sessions: POST /v1/sessions, POST /v1/sessions/{id}/actions,
  GET /v1/sessions/{id}/anchor, POST /v1/sessions/{id}/end, GET /v1/sessions/{id}:replay
Events/Proofs: GET /v1/events/{id}, GET /v1/events/{id}:proof, POST /v1/proofs:verify
Notary: GET /v1/notary/public-key

## The four visualizations (library + honest concept)

### 1. Hero evidence-ledger (bespoke Canvas 2D)
Depicts a live capture session: ActionEvents arrive in `sequence` order, each rendered as a
node carrying a short content_hash; a link draws from prev_hash to the new event (the chain);
a brief "seal" pulse marks the notary_signature. Surface (browser/sandbox/desktop) shown as a
small glyph. NOT random particles — a real append-only chain forming. Respect
prefers-reduced-motion (render a static sealed chain). One teal accent for the seal pulse.

### 2. Authority graph (@xyflow/react)
A signed delegation DAG: root grant (human principal) → agent grants (subject_id) →
sub-agents, to max_depth. Edge = parent_signature (a signed delegation); node shows subject
+ capabilities + scope (resource_globs, max_value_cents). Revoked branches greyed. On the
landing: a curated example. In the dashboard Delegations page: fed by
GET /v1/grants/{id}:verify (real chain array) — interactive, not a fake tree.

### 3. Merkle-seal (bespoke Canvas/SVG)
event.content_hash → merkle_path → merkle_root → Anchor(transparency log). Show
tamper-evidence: mutate one leaf → root changes → verification fails. Ties to
GET /v1/events/{id}:proof and POST /v1/proofs:verify.

### 4. Globe (cobe)
Honest framing ONLY: the anchor is published to a public transparency log, so a receipt is
"verifiable anywhere, without trusting babit." Decorative but tied to Anchor.KIND_*. Keep it
subtle (small, one accent, slow spin); no fake traffic arcs implying customers/scale.

## Reference patterns (how premium sites do this)
- Cloudflare: real product/network visuals (globe = their real network). We mirror the
  *approach* (a truthful product visual), not a borrowed globe of fake data.
- Linear/Stripe/Vercel docs: three-column API reference (nav | description + plain-language
  "what this does" | request/response example), monospace, restrained. Our reference is
  generated from openapi.v3.json so it never drifts from the backend.
- Restraint everywhere: near-monochrome, one teal accent for state/seal/CTA, motion limited
  to reveals + the seal pulse + slow globe. prefers-reduced-motion respected.
