import { lazy, Suspense } from "react";
import { Section, SectionHeader } from "./Section";

const AnchorGlobe = lazy(() =>
  import("@/components/viz/AnchorGlobe").then((m) => ({ default: m.AnchorGlobe })),
);

/**
 * SectionGlobalAnchor — a full-bleed globe section showing the public
 * anchoring network. Evidence is witnessed globally, not just in one place.
 */
export function SectionGlobalAnchor() {
  return (
    <Section id="global-anchor" size="lg">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="Public anchoring"
            title="Witnessed across the globe."
            lead="Anchored to public transparency logs worldwide. If one goes dark, the evidence still holds."
          />
          <div className="mt-8 space-y-4">
            {[
              { label: "Anchor types", value: "RFC 3161 · Transparency logs" },
              { label: "Verification", value: "Offline, no babit required" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span
                  className="text-[13px] font-mono uppercase tracking-wider"
                  style={{ color: "var(--muted)" }}
                >
                  {item.label}
                </span>
                <span className="text-[14px] font-medium" style={{ color: "var(--fg)" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-[400px] lg:h-[500px]">
          <Suspense fallback={null}>
            <AnchorGlobe className="w-full h-full" />
          </Suspense>
          <p
            className="absolute bottom-2 right-2 text-[11px] font-mono"
            style={{ color: "var(--muted)", opacity: 0.7 }}
          >
            Illustration. Not live data.
          </p>
        </div>
      </div>
    </Section>
  );
}
