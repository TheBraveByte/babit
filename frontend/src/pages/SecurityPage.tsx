import { IconActivity, IconCheck, IconLock, IconShieldCheck } from "@/lib/icons";
import { Link } from "@/lib/router";
import { Footer } from "./landing/Footer";
import { Nav } from "./landing/Nav";
import { CardGrid, FlushCard, Section, SectionHeader } from "./landing/Section";

const CONTROLS = [
  {
    Icon: IconLock,
    title: "Key custody",
    body: "Notary signing keys are generated server-side and never exposed to the browser. API keys are hashed with SHA-256 before storage. JWTs are issued in httpOnly cookies, not localStorage.",
  },
  {
    Icon: IconActivity,
    title: "Audit logs",
    body: "Every event is append-only. Each carries a content hash, a notary signature, and a Merkle inclusion proof. The ledger cannot be edited without breaking the chain.",
  },
  {
    Icon: IconShieldCheck,
    title: "Tamper evidence",
    body: "Ed25519 signatures and Merkle roots anchor every batch. Any modification to a past event invalidates the root and fails verification.",
  },
];

const STATUS = [
  { label: "SOC 2 Type II", state: "In progress" },
  { label: "Audit log export", state: "Available" },
  { label: "httpOnly cookie auth", state: "Available" },
  { label: "Ed25519 signatures", state: "Available" },
  { label: "Merkle anchoring", state: "Available" },
  { label: "SSO / SAML", state: "Planned" },
];

export function SecurityPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Nav />
      <main className="pt-20">
        <Section id="security-top" tone="base">
          <SectionHeader
            eyebrow="Security & compliance"
            align="center"
            title="Cryptographically bound. Independently auditable."
            lead="Babit is built on signatures, Merkle roots, and delegation chains. Here is what is in place today and what is in progress."
          />
        </Section>

        <Section id="security-controls" tone="base">
          <CardGrid>
            {CONTROLS.map((c) => (
              <FlushCard key={c.title}>
                <div className="p-6 sm:p-7">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span style={{ color: "var(--brand-accent)" }}>
                      <c.Icon className="w-5 h-5" />
                    </span>
                    <h3 className="type-h3">{c.title}</h3>
                  </div>
                  <p className="type-body">{c.body}</p>
                </div>
              </FlushCard>
            ))}
          </CardGrid>
        </Section>

        <Section id="security-status" tone="raised">
          <SectionHeader
            eyebrow="Compliance status"
            align="center"
            title="What is ready, what is next."
          />
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="space-y-3">
              {STATUS.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-3 px-5"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "4px",
                  }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {s.label}
                  </span>
                  <span
                    className="text-xs font-mono px-2.5 py-1"
                    style={{
                      color: s.state === "Available" ? "var(--color-verified)" : "var(--muted)",
                      backgroundColor:
                        s.state === "Available" ? "var(--color-verified-bg)" : "var(--secondary)",
                      borderRadius: "4px",
                    }}
                  >
                    {s.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section id="security-cta" tone="base">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="type-h2 mb-4">Need a security review?</h3>
            <p className="type-body mb-8">
              We can share architecture diagrams, threat models, and the signing key custody flow.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-pill px-5 py-2.5 text-[15px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: "var(--brand-accent)", color: "var(--surface)" }}
            >
              <IconCheck className="w-4 h-4" />
              Contact us
            </Link>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
