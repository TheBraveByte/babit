import { useState } from "react";

export function SectionLogsVsEvidence() {
  const [logTampered, setLogTampered] = useState(false);

  return (
    <section className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            WHY PASSIVE LOGGING FAILS
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Autonomous software needs more than logs.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Traditional logs tell you what a system recorded. They have no cryptographic authorizer proof,
            no chain-of-custody, and can be edited silently after the fact. Babit creates non-repudiable receipts.
          </p>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
          {/* Left: Traditional Log */}
          <div
            className="rounded-babit-lg p-6 space-y-4 shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs uppercase font-bold" style={{ color: "var(--muted)" }}>
                TRADITIONAL LOG ENTRY
              </span>
              <button
                onClick={() => setLogTampered(!logTampered)}
                className="text-[10px] text-red-700 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded border border-red-200 cursor-pointer transition-colors"
              >
                {logTampered ? "Revert modification" : "Simulate silent edit"}
              </button>
            </div>

            <div
              className="p-4 rounded-babit space-y-1.5 leading-relaxed overflow-x-auto text-[11px]"
              style={{
                backgroundColor: "#111414",
                color: "#929894",
                border: "1px solid #222626",
              }}
            >
              <div>2026-09-01T14:32:08.492Z [INFO] worker-pool-4: executing payout</div>
              <div style={{ color: logTampered ? "#F87171" : "#F5F6F4" }}>
                {logTampered
                  ? '{"action": "approve_payout", "amount": 0.00, "status": "no_action"}'
                  : '{"action": "approve_payout", "amount": 4200.00, "claim": "CLM-48102"}'}
              </div>
              <div>2026-09-01T14:32:08.510Z [INFO] worker-pool-4: request completed (200 OK)</div>
            </div>

            <div className="space-y-2 pt-2 text-[11px]" style={{ color: "var(--muted)" }}>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Unauthenticated plain text: no cryptographic authorizer proof.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span>Mutable: database administrators or attackers can alter entries without detection.</span>
              </div>
            </div>
          </div>

          {/* Right: Babit Sealed Evidence */}
          <div
            className="rounded-babit-lg p-6 space-y-4 shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1.5px solid var(--fg)",
            }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs uppercase font-bold" style={{ color: "var(--fg)" }}>
                BABIT SEALED EVIDENCE
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                TAMPER-EVIDENT
              </span>
            </div>

            <div
              className="p-4 rounded-babit space-y-1.5 leading-relaxed overflow-x-auto text-[11px]"
              style={{
                backgroundColor: "#0C1010",
                color: "#A2B0AC",
                border: "1px solid #1C2424",
              }}
            >
              <div>{`"action_hash": "0xd8291a849102c9184a8b7c120934812a849102c9..."`}</div>
              <div>{`"prev_hash": "0x44d019ac77102948192ba4810294810244d019ac77..."`}</div>
              <div>{`"authority_grant": "BAL-ROOT-100200 (usr_alice)"`}</div>
              <div>{`"notary_signature": "ed25519:5c82a10934812a849102c9184a8b7c12..."`}</div>
            </div>

            <div className="space-y-2 pt-2 text-[11px]" style={{ color: "var(--fg)" }}>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Cryptographically anchored: any altered byte invalidates the Ed25519 signature.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>Delegation-bound: proves exact chain from human principal to executing agent.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
