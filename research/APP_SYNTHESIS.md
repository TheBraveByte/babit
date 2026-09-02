# App synthesis: the design system for babit's console pages

Complements SYNTHESIS.md (landing). Grounded in the captured app/console surfaces of
Linear, Stripe, Vercel, Sentry, Datadog, PlanetScale, Neon, WorkOS, Clerk. The goal for
every babit app page: dense but calm, typography-led, one accent used only for state, no
default/dump tables, honest empty states, real endpoints only.

## Dashboard shell
- Left sidebar ~240px, sectioned groups, workspace/brand at top, account + theme at
  bottom, collapsible. Active item = accent, not a heavy fill block. (Linear, Vercel)
- Top contextual header: breadcrumb or page title on the left, the page's ONE primary
  action on the right, plus a small status chip (notary online). ~56px, hairline bottom.
- Content column max-width ~1100-1200px, generous padding (32-40px), 8px rhythm.

## Data tables (the core surface)
- Compact rows ~40-44px, 14px text. Sticky header, small muted column labels.
- One status pill per row; muted secondary metadata; right-align numerics.
- Monospace + tabular figures for ids/hashes/timestamps; truncate hashes middle-ellipsis
  with click-to-copy, hover for full.
- Filter/search bar pinned above the table. Row hover highlight. Row click opens a detail
  (drawer for quick peek, full page for the flagship).
- EMPTY STATE is mandatory: a small icon, one plain sentence, and either the primary
  action or an honest "no listing endpoint yet" note. Never a blank/dump table.
  (Stripe payments, Linear issues, PlanetScale insights)

## Detail views
- Two patterns: (a) slide-in drawer/sheet to peek without losing the list; (b) full-page
  detail for the flagship Receipt. Layout = header (title/id + status badge + actions),
  then stacked LABELED sections with label/value rows (mono values) — not everything in a
  rounded card. (Stripe transaction detail, Vercel deployment, PlanetScale deploy request)

## Settings
- Sub-nav or tabs: General, Security, API, Members. Each section = heading + one-line
  description + form rows + a save action, with success/error states. Read-only rows where
  no write endpoint exists. No decorative cards. (Vercel, Stripe, WorkOS)

## Forms + auth
- Centered, minimal card, generous spacing, clear labels above inputs, inline validation,
  full-width primary button, a single secondary link below. No marketing art, no shader.
  Signup adds account-type (personal/organization) and, for org, industry + work email.
  (WorkOS, Clerk, Linear auth)

## Dark mode
- Deliberate near-black surfaces (#090A0A / #101212) with subtle elevation and hairline
  borders, high-contrast primary text, muted secondary, one accent adjusted for contrast.
  Every reference console (Linear, Vercel, Neon, PlanetScale) has a strong dark mode; ours
  must too, driven entirely by tokens.

## Typography + numbers
- Geist for UI, Geist Mono for every machine token. Tabular figures for ids/timestamps.
  Confident scale: page title 30-34, section 18-22, body 15-16, table 14, technical 13-14
  mono. Whitespace keeps density legible.

## Interactions
- Cmd-K command palette; full keyboard nav + visible focus; skeleton loading; toast for
  confirmations (saved / verified / revoked); subtle 120-180ms transitions; respect
  prefers-reduced-motion.

## Anti-slop rules (what "not sloppy / not default" means here)
- No raw/dump tables (no density control, no empty state, no status treatment).
- No unstyled forms; no bare `alert()`; no fabricated data, metrics, customers.
- One accent, semantic color only; hairline borders over shadows; consistent spacing.
- Every screen has an intentional empty/loading/error state.

## babit page-by-page (real endpoints only)
- Overview: real summary from /me (account type, org, industry) + notary status + quick
  actions. Honest "no aggregate metrics endpoint yet" note; NO fake numbers.
- Activity: event lookup by id (GET /v1/events/{id}) -> detail; honest empty (no list API).
- Agents: honest empty state (agents exist only as grant subjects) linking to Delegations.
- Delegations: a workbench — verify chain / issue root / delegate / revoke — not a fake tree.
- Sessions: anchor inspector (GET /v1/sessions/{id}/anchor) + begin/record/end lifecycle.
- Receipts: fetch inclusion proof by event id (GET /v1/events/{id}:proof) -> Receipt detail.
- Receipt detail (FLAGSHIP): human summary header + Verified badge, then sections (action,
  authority, delegation, execution, evidence, verification, technical), download/copy/verify.
- Verification: paste/fetch a receipt -> checklist -> verdict. "Don't trust us. Verify it
  yourself."
- Settings: read-only profile/branding + notary public key (no fabricated keys/members).
- Auth: login / signup (personal|org + industry) / forgot / reset — minimal, centered.
