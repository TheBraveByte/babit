import { useState } from "react";
import { IconCheck } from "@/lib/icons";
import { LandingCard, Section, SectionHeader } from "./Section";

export function SectionLogsVsEvidence() {
  const [logTampered, setLogTampered] = useState(false);
  const amount = logTampered ? "$9,700" : "$4,200";

  return (
    <Section id="product">
      <SectionHeader
        eyebrow="Logs vs evidence"
        title="Logs are editable. Evidence is signed."
        lead="Same event. Two very different stories."
      />

      <div className="mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          <LandingCard className="space-y-4">
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="type-eyebrow">The old way: a plain log</span>
              <button
                onClick={() => setLogTampered(!logTampered)}
                className="text-[11px] px-2.5 py-1 rounded-babit-sm cursor-pointer transition-colors font-medium"
                style={
                  logTampered
                    ? {
                        backgroundColor: "var(--color-failed-bg)",
                        color: "var(--color-failed)",
                        border: "1px solid var(--color-failed-border)",
                      }
                    : {
                        backgroundColor: "var(--secondary)",
                        color: "var(--fg)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {logTampered ? "Restore" : "Sneakily edit"}
              </button>
            </div>

            <div
              className="rounded-babit p-4 font-mono text-[12px] leading-relaxed space-y-1"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border-subtle)",
                color: "var(--muted)",
              }}
            >
              <div>2026-09-01 14:32:08 worker-pool-4: executing payout</div>
              <div>
                2026-09-01 14:32:08 worker-pool-4: amount=
                <span style={{ color: logTampered ? "var(--color-failed)" : "var(--fg)" }}>
                  {amount}
                </span>{" "}
                claim=CLM-48102
              </div>
              <div>2026-09-01 14:32:08 worker-pool-4: request completed (200 OK)</div>
            </div>

            <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-failed)" }}>
                  ✗
                </span>
                <span>
                  Anyone with database access can change it, and nothing shows it was changed.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-failed)" }}>
                  ✗
                </span>
                <span>It doesn't say who allowed the action, only that something ran.</span>
              </li>
            </ul>
          </LandingCard>
          <LandingCard emphasis="raised" className="space-y-4">
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="type-eyebrow" style={{ color: "var(--fg)" }}>
                The Babit way: signed evidence
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--color-verified-bg)",
                  color: "var(--color-verified)",
                  border: "1px solid var(--color-verified-border)",
                }}
              >
                <IconCheck className="w-3 h-3" />
                <span>Real dashboard data</span>
              </span>
            </div>

            <img
              src="/dashboard-shots/activity.png"
              alt="Babit Activity dashboard showing recorded action events with IDs, action types, sessions and timestamps"
              className="rounded-babit w-full border"
              style={{ borderColor: "var(--border-subtle)" }}
            />

            <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-verified)" }}>
                  ✓
                </span>
                <span>Every row is signed by the notary and bound to a grant.</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 font-semibold" style={{ color: "var(--color-verified)" }}>
                  ✓
                </span>
                <span>Click any event to see the session, content hash, and signature.</span>
              </li>
            </ul>
          </LandingCard>
        </div>
      </div>
    </Section>
  );
}
