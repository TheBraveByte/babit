import { IconCheck } from "@/lib/icons";
import { LandingCard, Section, SectionHeader } from "./Section";

export function SectionVerifyRecord() {
  return (
    <Section id="security" tone="raised">
      <SectionHeader
        eyebrow="Verification"
        align="center"
        title="Independently auditable."
        lead="Every receipt carries its own proof. Verify it inside the dashboard, from a file, or anywhere with the public key."
      />

      <div className="mt-14">
        <div className="max-w-4xl mx-auto">
          <LandingCard padding="none" emphasis="raised" className="overflow-hidden">
            <div
              className="px-5 py-4 flex flex-wrap items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-semibold text-sm" style={{ color: "var(--fg)" }}>
                  Verify by event ID
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-babit-sm"
                  style={{
                    color: "var(--color-verified)",
                    backgroundColor: "var(--color-verified-bg)",
                    border: "1px solid var(--color-verified-border)",
                  }}
                >
                  <IconCheck className="w-3 h-3" />
                  Works in browser
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                From the live Babit console
              </span>
            </div>

            <img
              src="/dashboard-shots/verify.png"
              alt="Babit Verify dashboard showing event ID verification, file upload and receipt JSON paste options"
              className="w-full"
            />
          </LandingCard>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              "Enter an event ID and the console pulls the proof from the ledger.",
              "Upload a saved receipt JSON and verify it locally.",
              "Fetch the notary public key to check signatures anywhere offline.",
            ].map((text, i) => (
              <div key={i} className="flex gap-3 text-sm" style={{ color: "var(--muted)" }}>
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-verified)" }}>
                  ✓
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
