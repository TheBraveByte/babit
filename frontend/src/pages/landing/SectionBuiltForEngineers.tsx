import { IconArrowUpRight } from "@/lib/icons";
import { Link } from "@/lib/router";
import { LandingCard, Section, SectionHeader } from "./Section";

export function SectionBuiltForEngineers() {
  return (
    <Section id="developers">
      <SectionHeader
        eyebrow="Built for engineers"
        title="One call to record. One call to verify."
        lead="REST, gRPC, OpenAPI. No SDK required. The console is just a nice UI on the same API."
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div
            className="rounded-babit-md overflow-hidden h-full"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 30px 70px -24px color-mix(in srgb, var(--fg) 10%, transparent)",
            }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{
                backgroundColor: "var(--secondary)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span className="type-eyebrow" style={{ color: "var(--muted)" }}>
                Live analytics
              </span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                Brave Byte Labs
              </span>
            </div>

            <img
              src="/console-analytics.png"
              alt="Babit Analytics dashboard showing events over time, by surface and delegation health"
              className="w-full"
            />
          </div>
        </div>

        <LandingCard className="flex flex-col">
          <div className="space-y-1.5 mb-4">
            <span className="type-eyebrow" style={{ color: "var(--brand-accent)" }}>
              The API surface
            </span>
            <h3 className="type-h3" style={{ color: "var(--fg)" }}>
              Every endpoint documented.
            </h3>
            <p className="type-body">
              Auth, grants, sessions, events, verification. Copy-paste examples included.
            </p>
          </div>
          <div className="mt-auto">
            <Link
              to="/api"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-pill transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--brand-accent)", color: "var(--surface)" }}
            >
              <span>Open API reference</span>
              <IconArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </LandingCard>
      </div>
    </Section>
  );
}
