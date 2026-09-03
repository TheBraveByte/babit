import { useState } from "react";
import { IconCheck } from "@/lib/icons";
import { Section, SectionHeader, LandingCard } from "./Section";

export function SectionLogsVsEvidence() {
  const [logTampered, setLogTampered] = useState(false);
  const amount = logTampered ? "$9,700" : "$4,200";

  return (
    <Section>
      <SectionHeader
        eyebrow="Logs vs evidence"
        title="A log can be quietly changed. Evidence can't."
        lead="Try editing the log below. Nothing stops you and nothing shows it changed."
      />

      <div className="mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Left: an ordinary log entry, silently editable */}
          <LandingCard className="space-y-4">
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="type-eyebrow">An ordinary log entry</span>
              <button
                onClick={() => setLogTampered(!logTampered)}
                className="text-[11px] px-2.5 py-1 rounded-babit-sm cursor-pointer transition-colors font-medium"
                style={
                  logTampered
                    ? { backgroundColor: "var(--color-failed-bg)", color: "var(--color-failed)", border: "1px solid var(--color-failed-border)" }
                    : { backgroundColor: "var(--secondary)", color: "var(--fg)", border: "1px solid var(--border)" }
                }
              >
                {logTampered ? "Restore" : "Tamper with it"}
              </button>
            </div>

            <div
              className="rounded-babit p-4 font-mono text-[12px] leading-relaxed space-y-1"
              style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)", color: "var(--muted)" }}
            >
              <div>2026-09-01 14:32:08 worker-pool-4: executing payout</div>
              <div>
                2026-09-01 14:32:08 worker-pool-4: amount=
                <span style={{ color: logTampered ? "var(--color-failed)" : "var(--fg)" }}>{amount}</span>
                {" "}claim=CLM-48102
              </div>
              <div>2026-09-01 14:32:08 worker-pool-4: request completed (200 OK)</div>
            </div>

            <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-failed)" }}>✗</span>
                <span>Anyone with database access can change it, and nothing shows it was changed.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-failed)" }}>✗</span>
                <span>It doesn't say who allowed the action, only that something ran.</span>
              </li>
            </ul>
          </LandingCard>

          {/* Right: the babit receipt for the same action */}
          <LandingCard emphasis="raised" className="space-y-4">
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="type-eyebrow" style={{ color: "var(--fg)" }}>A babit receipt</span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--color-verified-bg)", color: "var(--color-verified)", border: "1px solid var(--color-verified-border)" }}
              >
                <IconCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
            </div>

            {/* Plain-language summary first */}
            <div className="space-y-3">
              <div>
                <span className="type-eyebrow block mb-1">What happened</span>
                <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                  Approved a $4,200 payout on claim CLM-48102
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="type-eyebrow block mb-1">Who did it</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>claims-agent</span>
                </div>
                <div>
                  <span className="type-eyebrow block mb-1">Who allowed it</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>Alice, Risk Supervisor</span>
                </div>
              </div>
            </div>

            {/* The seal, secondary detail */}
            <div
              className="rounded-babit px-3.5 py-2.5 flex items-center justify-between gap-3 font-mono text-[11px]"
              style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
            >
              <span style={{ color: "var(--muted)" }}>seal 0xd8291a84…fe120934</span>
              <span className="font-semibold" style={{ color: "var(--color-verified)" }}>OK</span>
            </div>

            <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
              <li className="flex gap-2">
                <span className="shrink-0" style={{ color: "var(--color-verified)" }}><IconCheck className="w-4 h-4" /></span>
                <span>Change one character and the seal breaks, so tampering is obvious.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0" style={{ color: "var(--color-verified)" }}><IconCheck className="w-4 h-4" /></span>
                <span>It names who authorized the action, all the way back to a person.</span>
              </li>
            </ul>
          </LandingCard>
        </div>
      </div>
    </Section>
  );
}
