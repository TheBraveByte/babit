# Vercel — app UI reference

- **Pages / screenshots viewed:** `shots/vercel-home.png`, `shots/vercel-docs.png` (both redirected to the Acceptable Use Policy legal page)

## Capture note (partial miss)
Both `https://vercel.com/home` and `https://vercel.com/docs` **redirected in headless to the Acceptable Use Policy** legal page — I never reached the marketing home or the docs app shell. Logged as a miss; the useful long-form/legal patterns below are still worth recording, and the prior landing pass already covered Vercel's hero (`research/vercel.md`).

## What this surface shows
A **long-form legal / policy document** page: minimal top nav, a centered title block, numbered sections, and a **sticky right-rail anchor table of contents**. This maps to babit's long, scannable pages (Settings sub-pages, Verification methodology, legal/terms).

## Concrete patterns to borrow
- **Right-rail anchor TOC** that lists the section headings ("Scope", "Prohibited Activities", "Artificial Intelligence Services", "Violations", "Changes to Policy") and tracks scroll. babit's **Verification** page (explaining how to independently verify a receipt) and long Settings pages should use this exact right-rail jump nav.
- **Numbered H2 sections** (`1. Scope`, `2. Prohibited Activities`) — turns a wall of text into a navigable outline. Good for babit's methodology/verification write-ups.
- **Signature grid-corner motif:** faint plus-marks and 1px column guide lines frame the content column. A subtle, engineering-flavored way to structure whitespace babit can echo sparingly.
- **"Last Updated April 21, 2026"** timestamp centered under the title — babit should stamp every policy/methodology page with a visible last-updated date (fits the evidence/audit ethos).
- **Ultra-restrained top nav:** wordmark + 4 text links (Products, Resources, Enterprise, Pricing) + a 3-button auth cluster (Get a Demo / Log In / Sign Up), the primary CTA a solid black pill. Clean auth-bar model for babit's logged-out pages.
- **Large geometric grotesk title, generous leading** in body prose; blue used only for links. Same one-accent discipline babit wants.

## What NOT to borrow
- Nothing app-specific here to over-copy; it's a legal page. Don't infer Vercel's actual dashboard from this capture.
- The grid guide-lines can look busy if applied to dense data screens — reserve for airy long-form pages only.

## Scores (1-10)
- Information density done well: 6 (airy legal doc, not dense)
- Table / list craft: n/a (no tables captured)
- Detail-view craft: 6
- Navigation: 8 (right-rail anchor TOC is the takeaway)
- Empty-state quality: n/a
- Dark-mode quality: n/a (light legal page)
