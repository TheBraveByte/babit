import { Section } from "./Section";

/**
 * ProductPreview — real screenshots of the babit console, framed in
 * browser chrome windows. This is the "show, don't tell" section that
 * Linear, Stripe, and Clerk all use right after the hero.
 *
 * Screenshots are captured from the live console against the real backend.
 */
export function ProductPreview() {
  return (
    <Section id="product-preview" size="default">
      {/* Primary: dashboard overview */}
      <div
        className="rounded-babit-md overflow-hidden mx-auto max-w-[1080px]"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow:
            "0 2px 8px -2px color-mix(in srgb, var(--fg) 6%, transparent), 0 40px 80px -32px color-mix(in srgb, var(--fg) 18%, transparent)",
        }}
      >
        {/* Browser top bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
          <div
            className="ml-3 flex-1 max-w-[320px] px-3 py-1 rounded-babit-sm text-[11px] font-mono"
            style={{ backgroundColor: "var(--bg)", color: "var(--muted)" }}
          >
            babit / console
          </div>
        </div>

        {/* Screenshot */}
        <div style={{ backgroundColor: "var(--bg)" }}>
          <img
            src="/console-dashboard.png"
            alt="babit console dashboard showing notarized action counts, sessions, and active grants"
            className="w-full block"
            loading="lazy"
          />
        </div>
      </div>

      {/* Secondary: analytics + delegations side by side */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1080px] mx-auto">
        {/* Analytics */}
        <div
          className="rounded-babit-md overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 2px 8px -2px color-mix(in srgb, var(--fg) 5%, transparent), 0 24px 48px -24px color-mix(in srgb, var(--fg) 14%, transparent)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28C840" }} />
            <span className="ml-2 text-[10px] font-mono" style={{ color: "var(--muted)" }}>
              analytics
            </span>
          </div>
          <div style={{ backgroundColor: "var(--bg)" }}>
            <img
              src="/console-analytics.png"
              alt="babit analytics page showing event counts, surface breakdown, and delegation health"
              className="w-full block"
              loading="lazy"
            />
          </div>
        </div>

        {/* Delegations — authority chain */}
        <div
          className="rounded-babit-md overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow:
              "0 2px 8px -2px color-mix(in srgb, var(--fg) 5%, transparent), 0 24px 48px -24px color-mix(in srgb, var(--fg) 14%, transparent)",
          }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2.5"
            style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28C840" }} />
            <span className="ml-2 text-[10px] font-mono" style={{ color: "var(--muted)" }}>
              delegations
            </span>
          </div>
          <div style={{ backgroundColor: "var(--bg)" }}>
            <img
              src="/console-delegations.png"
              alt="babit delegations page showing a verified authority chain from human principal to agent"
              className="w-full block"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-6 text-center type-body">
        The console reads everything from the ledger. No cached numbers, no approximations.
      </p>
    </Section>
  );
}
