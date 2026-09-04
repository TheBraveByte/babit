import { IconCheck } from "@/lib/icons";
import { LandingCard, Section, SectionHeader } from "./Section";

export function SectionReceiptCenterpiece() {
  return (
    <Section id="receipt" tone="raised">
      <SectionHeader
        eyebrow="The receipt"
        align="center"
        title="A receipt you can take to court."
        lead="What happened, who said yes, and the proof underneath. In plain English and in math."
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
                  BAL-997507
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
                  Signed
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                From the live Babit console
              </span>
            </div>

            <img
              src="/dashboard-shots/receipts.png"
              alt="Babit Receipts dashboard showing recorded events with cryptographic proof links"
              className="w-full"
            />
          </LandingCard>

          <p className="text-center text-sm mt-6" style={{ color: "var(--muted)" }}>
            Click any row to see the signature, content hash, and the grant behind it.
          </p>
        </div>
      </div>
    </Section>
  );
}
