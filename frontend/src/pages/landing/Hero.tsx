import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck, IconRefresh, IconCopy } from "@/lib/icons";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";

const PRESETS = [
  {
    name: "Financial Payout",
    action: "approve_payout",
    agent: "claims-agent",
    principal: "usr_alice (Risk Supervisor)",
    grantId: "BAL-DEL-8921",
    resource: "https://internal.bank.io/claims/48102",
    amount: 4200.0,
  },
  {
    name: "Infrastructure Deploy",
    action: "deploy_service",
    agent: "infra-orchestrator",
    principal: "usr_marcus (SecOps Lead)",
    grantId: "BAL-ROOT-5501",
    resource: "k8s://prod-cluster.us-east/payment-svc:v2.4",
    amount: 0,
  },
  {
    name: "Database Export",
    action: "export_audit_records",
    agent: "compliance-bot",
    principal: "usr_elena (DPO)",
    grantId: "BAL-DEL-1029",
    resource: "postgres://vault.internal/audit_log?limit=5000",
    amount: 0,
  },
];

export function Hero() {
  const { navigate } = useRouter();
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [liveEvent, setLiveEvent] = useState<LiveSimulatedEvent | null>(null);
  const [computing, setComputing] = useState(false);
  const [copied, setCopied] = useState(false);

  const preset = PRESETS[activePresetIndex];

  const generateReceipt = async (p = preset) => {
    setComputing(true);
    const result = await computeLiveReceipt({
      actionName: p.action,
      agent: p.agent,
      principal: p.principal,
      grantId: p.grantId,
      resource: p.resource,
      amountUsd: p.amount > 0 ? p.amount : undefined,
    });
    setLiveEvent(result);
    setComputing(false);
  };

  useEffect(() => {
    generateReceipt(PRESETS[0]);
  }, []);

  const handleSelectPreset = (idx: number) => {
    setActivePresetIndex(idx);
    generateReceipt(PRESETS[idx]);
  };

  const handleCopyReceipt = () => {
    if (!liveEvent) return;
    navigator.clipboard?.writeText(JSON.stringify(liveEvent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="pt-28 pb-24 sm:pt-36 sm:pb-32 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Background Variant B: Technical Dot Grid */}
      <div className="absolute inset-0 bg-dot-subtle opacity-50 pointer-events-none" />
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-babit-sm text-xs font-mono font-medium uppercase tracking-wider"
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            <span>EVIDENCE LAYER FOR AUTONOMOUS AGENTS</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-[72px] font-semibold tracking-tight leading-[1.04]"
            style={{ color: "var(--fg)" }}
          >
            Proof for autonomous actions.
          </h1>

          <p
            className="text-lg sm:text-[19px] leading-relaxed max-w-2xl mx-auto font-normal"
            style={{ color: "var(--muted)" }}
          >
            Babit connects autonomous agent actions to the human authority behind them and seals
            cryptographically verifiable receipts into an immutable hash-chained ledger.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all cursor-pointer shadow-xs hover:opacity-90 active:scale-[0.99]"
              style={{ backgroundColor: "var(--fg)", color: "var(--surface)" }}
            >
              Get started
            </button>

            <a
              href="#developers"
              className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:bg-[var(--secondary)]"
              style={{
                backgroundColor: "var(--surface)",
                color: "var(--fg)",
                border: "1px solid var(--border)",
              }}
            >
              <span>Explore API</span>
              <span style={{ color: "var(--muted)" }}>↓</span>
            </a>
          </div>
        </div>

        {/* Live Interactive Attestation Sandbox */}
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-babit-lg shadow-sm overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {/* Sandbox Header with Presets */}
            <div
              className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                backgroundColor: "var(--secondary)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  LIVE ATTESTATION SANDBOX
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
              </div>

              {/* Preset selectors */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                {PRESETS.map((p, idx) => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectPreset(idx)}
                    className="px-2.5 py-1 rounded-babit-sm transition-all cursor-pointer text-[11px]"
                    style={{
                      backgroundColor: activePresetIndex === idx ? "var(--fg)" : "transparent",
                      color: activePresetIndex === idx ? "var(--surface)" : "var(--muted)",
                      fontWeight: activePresetIndex === idx ? 600 : 400,
                      border: `1px solid ${activePresetIndex === idx ? "var(--fg)" : "var(--border)"}`,
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sandbox Execution Body */}
            <div className="p-6 space-y-5 font-mono text-xs">
              {/* Action summary bar */}
              <div
                className="p-4 rounded-babit grid grid-cols-2 sm:grid-cols-4 gap-4"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Action Type</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{preset.action}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Executing Agent</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{preset.agent}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Authorizer</span>
                  <span className="font-semibold text-xs truncate block" style={{ color: "var(--fg)" }}>{preset.principal}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Grant Reference</span>
                  <span className="font-semibold text-xs block truncate" style={{ color: "var(--fg)" }}>{preset.grantId}</span>
                </div>
              </div>

              {/* Live Notarized Output */}
              {liveEvent && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className="p-3 rounded-babit space-y-1"
                      style={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase" style={{ color: "var(--muted)" }}>SHA-256 Digest (Payload)</span>
                        <span className="text-[10px] text-emerald-700 font-bold">COMPUTED</span>
                      </div>
                      <div className="text-[11px] truncate font-semibold" style={{ color: "var(--fg)" }}>
                        {liveEvent.eventHash}
                      </div>
                    </div>

                    <div
                      className="p-3 rounded-babit space-y-1"
                      style={{
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase" style={{ color: "var(--muted)" }}>Ed25519 Notary Seal</span>
                        <span className="text-[10px] text-emerald-700 font-bold">SEALED</span>
                      </div>
                      <div className="text-[11px] truncate font-semibold" style={{ color: "var(--fg)" }}>
                        {liveEvent.notarySignature}
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-3 rounded-babit flex items-center justify-between text-xs"
                    style={{
                      backgroundColor: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      color: "#065F46",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Receipt <strong>{liveEvent.receiptId}</strong> sealed into immutable ledger at {liveEvent.timestamp.split("T")[1]?.replace("Z", "")} UTC
                      </span>
                    </div>

                    <button
                      onClick={handleCopyReceipt}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <IconCopy className="w-3 h-3" />
                      <span>{copied ? "Copied JSON" : "Copy Receipt"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                  Zero round-trip latency demo. Uses native Web Crypto SHA-256 in your browser.
                </span>

                <button
                  onClick={() => generateReceipt()}
                  disabled={computing}
                  className="px-4 py-2 rounded-babit text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: "var(--fg)",
                    color: "var(--surface)",
                  }}
                >
                  <IconRefresh className={`w-3.5 h-3.5 ${computing ? "animate-spin" : ""}`} />
                  <span>{computing ? "Computing Hash..." : "Re-Calculate Digest"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
