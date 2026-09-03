import { IconCheck } from "@/lib/icons";
import { Link } from "@/lib/router";
import { Footer } from "./landing/Footer";
import { Nav } from "./landing/Nav";
import { CardGrid, FlushCard, Section, SectionHeader } from "./landing/Section";

const PLANS = [
  {
    name: "Developer",
    price: "Free",
    body: "For solo builders and evaluation.",
    features: ["1 project", "1,000 events / month", "Full API access", "Community support"],
    cta: "Get started",
    href: "/signup",
  },
  {
    name: "Team",
    price: "$99 / mo",
    body: "For teams shipping agent pipelines.",
    features: ["10 projects", "100,000 events / month", "Audit log export", "Email support"],
    cta: "Start trial",
    href: "/signup",
  },
  {
    name: "Enterprise",
    price: "Custom",
    body: "For regulated and enterprise deployments.",
    features: [
      "Unlimited projects",
      "Custom event volume",
      "SSO / SAML",
      "Dedicated support",
      "On-prem option",
    ],
    cta: "Contact us",
    href: "/contact",
  },
];

export function PricingPage() {
  return (
    <div
      className="min-h-screen font-sans"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <Nav />
      <main className="pt-20">
        <Section id="pricing" tone="base">
          <SectionHeader
            eyebrow="Pricing"
            align="center"
            title="Simple, honest pricing."
            lead="Start free. Upgrade when you need more. Cancel anytime."
          />

          <div className="mt-12">
            <CardGrid cols={3}>
              {PLANS.map((plan) => (
                <FlushCard key={plan.name}>
                  <div className="p-6 sm:p-7 flex flex-col h-full">
                    <h3 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--fg)" }}>
                      {plan.price}
                    </p>
                    <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
                      {plan.body}
                    </p>

                    <ul className="mt-6 space-y-3 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm">
                          <span
                            style={{ color: "var(--color-verified)" }}
                            className="mt-0.5 shrink-0"
                          >
                            <IconCheck className="w-4 h-4" />
                          </span>
                          <span style={{ color: "var(--fg)" }}>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={plan.href}
                      className="mt-8 inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-[15px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
                      style={{
                        backgroundColor:
                          plan.name === "Team" ? "var(--brand-accent)" : "var(--surface)",
                        color: plan.name === "Team" ? "var(--surface)" : "var(--fg)",
                        border: plan.name === "Team" ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </FlushCard>
              ))}
            </CardGrid>
          </div>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
