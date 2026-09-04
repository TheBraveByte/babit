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
            title="Anchored where we can't touch it."
            lead="Anchored to public transparency logs. Even if Babit disappears, the proof survives."
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

        <div className="relative h-[520px] lg:h-[620px]">
          <Suspense fallback={null}>
            <AnchorGlobe className="w-full h-full" />
          </Suspense>
        </div>
      </div>
    </Section>
  );
}
