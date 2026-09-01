# babit console: design direction

Minimalist, typography-led, information-dense. No hero imagery. The type, grid, and
data carry the design. Benchmarks: Linear, Vercel/Geist, Stripe Docs, Axiom, Resend,
PlanetScale, Tailscale, WorkOS.

## Principles

1. Two typefaces do all the work: a neutral grotesque sans for UI and prose, and a
   monospace for every machine token. No decorative imagery.
2. Render every id, UUID, hash, and timestamp in monospace with tabular numerals.
   Numeric columns right-align. Hashes truncate with a middle ellipsis, click to copy,
   hover for full. Ticket ids like BAL-482913 stay monospace so columns line up.
3. Near-monochrome neutral system: a ~10-step gray ramp, near-black on white, with a
   dark mode. Exactly one accent, reserved for state (pass, fail, pending). Color is
   semantic, never decorative.
4. A visible editorial grid: 12 columns, hairline rules, an 8px spacing rhythm, and
   generous whitespace so density stays legible. Detail screens use label/value rows
   (2-col label, 10-col value).
5. Tables are compact rows with one status pill each, muted metadata, and a right-side
   overflow menu. A filter bar pins above the table. Clicking a row opens a peek panel
   (detail slides in, the list stays) instead of a full-page navigation.
6. Navigation is keyboard-first: a command palette (Cmd-K), a sticky sectioned left
   sidebar, and breadcrumbs. Delegation renders as an indented tree or breadcrumb:
   principal to agent to sub-agent.
7. The verify screen is a vertical checklist: one row per check (signature, hash chain,
   Merkle proof, external anchor, delegation authority), each with a status icon, a
   one-line monospace evidence string, and an expandable raw payload, ending in a
   single decisive verdict badge. Pair a human-readable view with a raw signed-JSON pane.

## Screens

- Grants: table (ticket, principal, subject, capabilities as chips, scope, expiry,
  revoked). Peek panel shows the signed grant and its chain to root.
- Sessions: table (ticket, root grant, surface, started/ended, event count). Peek panel
  lists the session's events and its anchor.
- Events: dense table (sequence, action type, grant, occurred at, recording ref). Peek
  panel shows the sealed event and a link to its inclusion proof.
- Verify: paste or fetch a receipt, run the checklist, show the verdict.

## Selection test

Every borrowed pattern passes it: remove all imagery and the typography, grid,
hierarchy, and information architecture still carry the screen.
