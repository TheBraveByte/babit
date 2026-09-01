# Synthesis: making babit understandable to a layman

Grounded in the 10 records (Stripe, Vercel, Linear, Cloudflare, Vanta, Persona, WorkOS,
Sentry, Ramp, Mercury). The through-line of every premium reference: **lead with the
outcome in plain words, show the real product, explain the mechanism as a few simple
steps, and stay restrained.**

## A plain-language analogy for babit
babit is a **tamper-proof receipt and paper trail for software that acts on its own**.
Like a black-box flight recorder plus a notary: when an AI agent does something, babit
writes down exactly what it did and who allowed it, seals that record so it can't be
changed, and lets anyone check the record is genuine, without having to trust babit.

## The layman explainer (four steps, no jargon)
1. **Authority** — a person gives an agent permission to do a specific thing (and only
   that thing).
2. **Action** — the agent does it: clicks in a browser, runs code, moves money.
3. **Evidence** — babit records what happened and who authorized it, then seals it so it
   can't be altered after the fact.
4. **Verification** — anyone can confirm the record is real and unchanged, on their own,
   without trusting babit's word for it.

Show this as four simple steps with one small visual per step. Do NOT show a hash chain or
Merkle diagram as the hero; the cryptography is a detail, not the pitch.

## Three candidate hero headline + subhead pairs (plain, no AI-slop)
1. **"Know what your AI did, and prove it."**
   Babit records every action an autonomous agent takes, ties it to who authorized it,
   and turns it into evidence anyone can verify.
2. **"Proof for autonomous actions."**
   When software acts on its own, babit keeps a tamper-proof record of what it did and who
   allowed it, so you can always prove what happened.
3. **"A receipt for everything your agents do."**
   Babit links every AI action to the authority behind it and seals it as evidence you can
   check independently.

Recommendation: #1 as the headline (it states the two jobs plainly: know + prove), with
#2's phrasing available as an eyebrow ("Agent accountability").

## The lessons (what to apply to babit's landing)
1. **Outcome first, mechanism later.** WorkOS ("Your app, Enterprise Ready"), Stripe,
   Vercel all lead with what you GET. babit's hero must say "know what your AI did and
   prove it" — not "Merkle-anchored hash chain".
2. **One sentence a non-engineer understands**, then depth below (Stripe, Vanta).
3. **Show the real product as the hero visual** — an actual babit receipt card in a
   VERIFIED state (like WorkOS's toggle list, Linear's app, Stripe's dashboard). Not an
   illustration, not a diagram.
4. **Explain "how it works" as 3-4 plain steps** with a simple visual each (Vanta,
   Persona explain compliance/identity this way). Use the four steps above.
5. **Trust without fabrication.** babit has NO customers/logos yet, so do not fake a logo
   wall. Its differentiator IS verifiability, so make that the trust device: "Don't trust
   us. Verify it yourself." A live "verify this receipt" demo beats any logo wall.
6. **Restraint.** Near-monochrome + one accent used only for state and the CTA. No
   gradients everywhere, no 3D, no particle fields. Every premium reference is restrained.
7. **Confident large typography + generous whitespace** carry the page (Linear, Vercel,
   Stripe). babit already has Geist/Geist Mono; use bigger, calmer type.
8. **Human contrasts.** "Logs tell you what a system recorded. babit proves who authorized
   it and whether the record is real." Concrete comparisons land (WorkOS "minutes instead
   of months").
9. **A real developer section.** Show the actual babit API call and the receipt it
   returns (Stripe, Sentry, Vercel do this). Do not imply APIs that don't exist.
10. **One decisive CTA pair** ("Get started" + "Read the docs"). Not eight buttons.

## Anti-patterns babit currently commits (fix these)
- Jargon-first hero (hashes / Merkle / anchor before the plain benefit).
- Diagram/architecture as the hero instead of a real receipt.
- Fabricated metrics, customers, or capabilities (removed from the app; keep the landing
  honest too).
- Everything technical, nothing plain — a layman bounces.
