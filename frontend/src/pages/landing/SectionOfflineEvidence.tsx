import { LandingCard, Section, SectionHeader } from "./Section";

export function SectionOfflineEvidence() {
  return (
    <>
      {/* Public anchoring */}
      <section id="offline-globe" className="dark-section relative overflow-hidden section-y-lg">
        <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.06) 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10 container-babit">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <p className="type-eyebrow" style={{ color: "var(--brand-accent)" }}>
                Public anchoring
              </p>
              <h2 className="type-h2 mt-4" style={{ color: "var(--dark-section-fg)" }}>
                Witnessed where babit cannot reach.
              </h2>
              <p className="type-lead mt-5" style={{ color: "var(--dark-section-muted)" }}>
                The notary public key is published in the console. Every receipt is signed against
                it, so anyone can verify a record without trusting babit.
              </p>
              <div
                className="mt-8 flex items-center gap-2 text-[12px] font-mono"
                style={{ color: "var(--dark-section-muted)" }}
              >
                <span style={{ color: "var(--brand-accent)" }}>→</span>
                <span>No special access required · anyone can audit</span>
              </div>
            </div>

            <div
              className="rounded-babit-md overflow-hidden"
              style={{
                backgroundColor: "var(--dark-section-surface)",
                border: "1px solid var(--dark-section-border)",
              }}
            >
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--dark-section-border)" }}
              >
                <span className="type-eyebrow" style={{ color: "var(--dark-section-muted)" }}>
                  Notary public key
                </span>
                <span
                  className="font-mono text-[11px]"
                  style={{ color: "var(--dark-section-muted)" }}
                >
                  Brave Byte Labs
                </span>
              </div>

              <img
                src="/dashboard-shots/overview.png"
                alt="Babit Overview dashboard showing the notary public key used to verify receipts"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Offline verification */}
      <Section id="offline">
        <SectionHeader
          eyebrow="Offline verification"
          title="Evidence that stands on its own."
          lead="A receipt carries everything needed to check it. No account required."
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <LandingCard emphasis="raised" className="space-y-4">
            <div className="space-y-2">
              <span className="type-eyebrow block" style={{ color: "var(--brand-accent)" }}>
                Check it yourself
              </span>
              <h3 className="type-h3" style={{ color: "var(--fg)" }}>
                Verify from a file, a JSON paste or an event ID.
              </h3>
              <p className="type-body">
                The console lets you verify receipts directly. For full offline use, download the
                receipt and the notary public key, then run the open verification logic yourself.
              </p>
            </div>

            <img
              src="/dashboard-shots/verify.png"
              alt="Babit Verify dashboard with event ID input, file upload and JSON paste"
              className="w-full rounded-babit border"
              style={{ borderColor: "var(--border-subtle)" }}
            />
          </LandingCard>

          <div className="grid grid-cols-1 gap-5">
            {[
              {
                title: "Save the receipt",
                body: "Download a receipt as plain JSON. It contains the event, content hashes and the notary signature.",
              },
              {
                title: "Get the public key",
                body: "Fetch the notary public key from the console once and keep it anywhere you audit.",
              },
              {
                title: "Check it anywhere",
                body: "Verify signatures and chain integrity without calling babit. The math is public.",
              },
            ].map((p) => (
              <LandingCard key={p.title} className="space-y-2">
                <h3 className="text-[15px] font-medium" style={{ color: "var(--fg)" }}>
                  {p.title}
                </h3>
                <p className="type-body">{p.body}</p>
              </LandingCard>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
