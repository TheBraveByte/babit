import { useState } from "react";
import { IconCheck } from "@/lib/icons";

export function SectionLogsVsEvidence() {
  const [logTampered, setLogTampered] = useState(false);

  return (
    <section className="py-24 sm:py-32 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
        {/* Header */}
        <div className="max-w-3xl space-y-4 animate-float-up">
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            A log can be quietly changed. Evidence can't.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Try editing the log below. Nothing stops you and nothing shows it changed.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Ordinary log */}
          <div className="glass-subtle rounded-babit-lg p-6 space-y-4 animate-float-up">
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: "var(--muted)" }}>
                An ordinary log entry
              </span>
              <button
                onClick={() => setLogTampered(!logTampered)}
                className="text-[10px] px-2 py-0.5 rounded-babit-sm cursor-pointer transition-colors"
                style={{
                  color: "var(--color-failed)",
                  backgroundColor: "var(--color-failed-bg)",
                  border: "1px solid var(--color-failed-border)",
                }}
              >
                {logTampered ? "Undo the edit" : "Edit it silently"}
              </button>
            </div>

            <div
              className="p-4 rounded-babit space-y-1.5 leading-relaxed overflow-x-auto text-[11px] font-mono"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              <div>2026-09-01 14:32:08  worker-pool-4: executing payout</div>
              <div style={{ color: logTampered ? "var(--color-failed)" : "var(--fg)" }}>
                {logTampered
                  ? '{"action": "approve_payout", "amount": 0.00, "status": "no_action"}'
                  : '{"action": "approve_payout", "amount": 4200.00, "claim": "CLM-48102"}'}
              </div>
              <div>2026-09-01 14:32:08  worker-pool-4: request completed (200 OK)</div>
            </div>

            <div className="space-y-2 pt-2 text-[13px]" style={{ color: "var(--muted)" }}>
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0" style={{ color: "var(--color-failed)" }}>✕</span>
                <span>Anyone with database access can change it, and nothing shows it was changed.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0" style={{ color: "var(--color-failed)" }}>✕</span>
                <span>It doesn't say who allowed the action, only that something ran.</span>
              </div>
            </div>
          </div>

          {/* Right: babit evidence */}
          <div className="relative">
            <div className="ambient-glow animate-glow-pulse" style={{ inset: "-12% 4% 14% 4%" }} />
            <div className="glass rounded-babit-lg p-6 space-y-4 relative overflow-hidden animate-float-up" style={{ animationDelay: "120ms" }}>
            <div className="h-px accent-hairline absolute inset-x-0 top-0" />
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs uppercase font-semibold tracking-wider" style={{ color: "var(--fg)" }}>
                A babit receipt
              </span>
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-babit-sm"
                style={{ color: "var(--color-verified)", backgroundColor: "var(--color-verified-bg)", border: "1px solid var(--color-verified-border)" }}
              >
                <IconCheck className="w-3 h-3" />
                Sealed
              </span>
            </div>

            {/* Plain-language summary first */}
            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: "var(--muted)" }}>What happened</span>
                <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>Approved a $4,200 payout on claim CLM-48102</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: "var(--muted)" }}>Who did it</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>claims-agent</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: "var(--muted)" }}>Who allowed it</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>Alice, Risk Supervisor</span>
                </div>
              </div>
              {/* The seal — secondary detail */}
              <div
                className="p-3 rounded-babit font-mono text-[11px] flex items-center justify-between gap-2"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)", color: "var(--muted)" }}
              >
                <span className="truncate">seal 0xd8291a84…7c120934</span>
                <span className="font-semibold shrink-0" style={{ color: "var(--color-verified)" }}>ok</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-[13px]" style={{ color: "var(--fg)" }}>
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0" style={{ color: "var(--color-verified)" }}>✓</span>
                <span>Change one character and the seal breaks, so tampering is obvious.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold shrink-0" style={{ color: "var(--color-verified)" }}>✓</span>
                <span>It names who authorized the action, all the way back to a person.</span>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
