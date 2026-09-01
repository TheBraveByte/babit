# Stripe — app UI reference

- **Pages / screenshots viewed:** `shots/stripe-docs.png` (API reference), `shots/stripe-dashboard.png` / `-hero.png` (docs "Payments" hub)

## What app surfaces these show
- **stripe-docs** — the canonical **three-pane API reference**: left nav tree, center prose, right rail of code + reference panels. The gold standard for a developer console's docs and for a record with a "spec on the left, evidence on the right" shape.
- **stripe-dashboard** — the docs Payments hub: top product nav + left section tree + content with linked cards. A cleaner, lighter shell than the API ref.

## Concrete patterns to borrow
- **Three-column reference layout.** Left = collapsible nav tree grouped by section ("ONLINE PAYMENTS", "Core Resources") with each resource as a plain text row; center = documentation prose; right = **sticky code/context panels**. babit's **Receipt detail** should adopt this: left = receipt field index / navigation, center = human-readable event narrative, right = the raw JSON payload + verification/hash block. This is the single most useful capture in the set for the flagship page.
- **Dark code panels inside a light page.** The `BASE URL` and `AUTHENTICATED REQUEST` blocks are near-black cards with a labelled uppercase header bar, a copy icon, and a language switcher (`cURL ▾`), containing **monospace** content with line numbers. This is exactly how babit should render a receipt's raw payload / hash / signature — dark mono card, uppercase label, copy button, even in light mode.
- **Per-section utility row:** "Ask about this section · Copy for LLM · View as Markdown" repeated above each block. babit's receipt detail should offer "Copy JSON · Copy hash · Verify" as an equivalent inline utility row.
- **Version selector as a pill in the header** (`2026-08-26.dahlia ▾`). babit can surface schema/ledger version the same way.
- **Nav tree uses tiny superscript qualifiers** (`Accounts v2`, `Account Links v2`) to disambiguate without extra rows — a clean way to tag receipt types/versions.
- **Left tree section headers** are uppercase, letter-spaced, muted; items are dark, active item gets a soft tinted (indigo) highlight pill. Good density without clutter.
- **"Was this section helpful? Yes / No"** micro-feedback inline — low-cost, human.
- **Client-libraries card** = grid of language logos as a compact reference block.

## Dark mode / typography
- Docs are **light-mode primary** with a light/dark toggle top-left. Depth from hairline rules, not shadows.
- **Restraint in color:** indigo is the only accent (links, active nav). Everything else is ink-on-white. babit should keep the same one-accent discipline.
- **Numbers/IDs/keys always in monospace**; test keys shown inline in a bordered mono chip (`sk_test_`). babit should chip receipt IDs and hashes identically.

## What NOT to borrow
- The sheer **breadth of the nav tree** (dozens of resources) — babit has far fewer surfaces; don't manufacture depth.
- Light-first is fine for docs, but babit's **console** should be dark-first (see Linear); reserve Stripe's light treatment for docs/marketing.
- Don't scatter AI affordances everywhere ("Ask AI", "Copy for LLM" on every block) unless they truly work.

## Scores (1-10)
- Information density done well: 9
- Table / list craft: 7 (nav tree; little tabular data shown)
- Detail-view craft: 9 (three-pane reference is exemplary)
- Navigation: 9
- Empty-state quality: 6 (n/a on these pages)
- Dark-mode quality: 7 (toggle exists; light is the default)
