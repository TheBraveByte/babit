# Linear — app UI reference

- **Pages / screenshots viewed:** `shots/linear-product.png`, `shots/linear-docs.png`, `shots/linear-method-hero.png`

## What app surfaces these show
- **linear-docs** — a real **docs shell**: fixed left sidebar with grouped nav, a wide content pane, and a card grid of topics. The closest thing to an app console in the set.
- **linear-product** — feature cards that embed cropped screenshots of the actual app (issue triage panel "Product Intelligence", an analytics line chart, a customer-request thread). Good source for what Linear's in-app cards/lists look like.
- **linear-method** — long-form editorial (serif display type); not app UI, but the typographic restraint is instructive.

## Concrete patterns to borrow for a data-dense console
- **Left sidebar with grouped, single-word nav labels** (Getting started, Account, AI, Teams, Issues, Issue properties, Projects, Initiatives, Cycles, Views, Find and filter, Integrations, Analytics, Administration). Each row has a right-facing chevron affordance for expandable sections. A separated lower cluster (Docs / Developers / Learn / Contact support) with small leading icons. This is exactly babit's shell: primary nav (Overview, Activity, Agents, Delegations, Sessions, Receipts, Verification) up top, utility (Settings, Docs, Support) in a divided lower group.
- **Sidebar is quiet:** near-black panel, ~13-14px labels in mid-grey, active item goes white. Almost no chrome — no boxes around rows, just a hairline divider separating the app-nav from the meta-nav.
- **Content header pattern:** big page title ("Linear Docs") + one grey sub-line describing the surface. babit pages should open the same way (e.g. "Receipts" + "Every sealed record your agents produced").
- **Section-labelled card grids** ("Popular", "Linear basics") — a small bold section heading, then a 4-up grid of cards, each = mono/line icon top-left, bold title, 2-line grey description. Reusable for babit's Overview quick-links and empty-state suggestion cards.
- **Cards use a subtle top-lit gradient** (lighter at top, fading to panel colour) so an icon can float in negative space without a border fighting it.
- **In-product list rows** (from linear-product's triage card): tight rows, a leading status glyph, an ID token (`ENG-1299`, `DES-8331`) in mono, then the human title — precisely the id+label pairing babit needs for receipt/session rows.

## Dark mode / typography
- **True dark, not navy:** background is ~#08090A, panels a hair lighter, dividers are 1px low-opacity white. Depth comes from tiny lightness steps, never from shadows or color.
- **Grayscale-first with one restrained accent** (a warm yellow used only on the "Building" chart line and status dots). babit should do the same: monochrome console, one accent reserved for VERIFIED / state.
- **Type:** Inter-like grotesk; page titles large and tight-tracked; IDs in mono. Body sits at ~14px with generous line-height.

## What NOT to borrow
- The **marketing hero collage** (floating glyph grid, product-development serif poetry) — that's landing language, not console.
- Method page's editorial serif — wrong register for data screens.
- Don't over-rely on card grids for dense data; cards are for navigation/empty states, tables are for records.

## Scores (1-10)
- Information density done well: 8
- Table / list craft: 8 (glimpsed, very clean)
- Detail-view craft: 7 (inferred from cards)
- Navigation: 9 (sidebar grouping is exemplary)
- Empty-state quality: 7 (card grids read as friendly empties)
- Dark-mode quality: 9
