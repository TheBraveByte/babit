import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck, IconRefresh, IconCopy } from "@/lib/icons";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";
import { docsUrl } from "@/lib/links";
import { EvidenceLedger } from "@/components/viz/EvidenceLedger";

const PRESETS = [
  { name: "Payout", action: "Approved a $4,200 insurance payout", agent: "claims-agent", principal: "Alice — Risk Supervisor", grantId: "BAL-DEL-8921", resource: "claims/48102", amount: 4200.0 },
  { name: "Deploy", action: "Deployed the payments service to production", agent: "infra-orchestrator", principal: "Marcus — SecOps Lead", grantId: "BAL-ROOT-5501", resource: "prod-cluster/payment-svc:v2.4", amount: 0 },
  { name: "Export", action: "Exported 5,000 audit records", agent: "compliance-bot", principal: "Elena — Data Protection Officer", grantId: "BAL-DEL-1029", resource: "vault/audit_log", amount: 0 },
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
      actionName: p.action, agent: p.agent, principal: p.principal,
      grantId: p.grantId, resource: p.resource, amountUsd: p.amount > 0 ? p.amount : undefined,
    });
    setLiveEvent(result);
    setComputing(false);
  };

  useEffect(() => { generateReceipt(PRESETS[0]); }, []);
  const handleSelectPreset = (idx: number) => { setActivePresetIndex(idx); generateReceipt(PRESETS[idx]); };
  const handleCopyReceipt = () => {
    if (!liveEvent) return;
    navigator.clipboard?.writeText(JSON.stringify(liveEvent, null, 2));
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mesh-bg pt-24 pb-24 sm:pt-28 sm:pb-32 relative overflow-hidden">
      <div className="absolute inset-0 grid-fade pointer-events-none" />
      {/* The append-only evidence chain the whole hero rests on (real ActionEvent model) */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 opacity-60 pointer-events-none hidden sm:block"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <EvidenceLedger className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-16 items-center">

          {/* ── Left: message ─────────────────────────────────────────── */}
          <div className="max-w-xl animate-float-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
              style={{ color: "var(--muted)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
              <span>Agent accountability infrastructure</span>
            </div>

            <h1 className="mt-6 text-[44px] sm:text-6xl lg:text-[64px] font-semibold tracking-[-0.03em] leading-[1.02]" style={{ color: "var(--fg)" }}>
              Proof for autonomous action.
            </h1>

            <p className="mt-6 text-lg sm:text-[19px] leading-relaxed" style={{ color: "var(--muted)" }}>
              babit binds every action an agent takes to the authority that permitted it, and
              seals it as independently verifiable evidence — a system of record for what your
              autonomous software does.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="px-6 py-3 text-[15px] font-semibold rounded-babit transition-all cursor-pointer hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: "var(--brand-accent)", color: "#fff", boxShadow: "0 10px 30px -12px var(--brand-accent)" }}
              >
                Get started
              </button>
              <a
                href={docsUrl} target="_blank" rel="noreferrer"
                className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all cursor-pointer inline-flex items-center gap-1.5 glass-subtle hover:opacity-90"
                style={{ color: "var(--fg)" }}
              >
                <span>Read the docs</span>
                <span style={{ color: "var(--muted)" }}>↗</span>
              </a>
            </div>

            <div className="mt-8 flex items-center gap-2 text-[13px]" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-4 h-4" /></span>
              <span>Every receipt is verifiable independently — no trust in babit required.</span>
            </div>
          </div>

          {/* ── Right: live evidence receipt — the product surface ───────── */}
          <div className="relative" style={{ perspective: "1600px" }}>
            <div className="ambient-glow animate-glow-pulse" style={{ inset: "-14% 2% 18% 6%" }} />
            <div className="ambient-glow" style={{ inset: "22% -8% -12% 30%", opacity: 0.28 }} />

            <div className="glass rounded-babit-lg overflow-hidden relative animate-float-up" style={{ animationDelay: "140ms" }}>
              <div className="h-px accent-hairline" />
              <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>Evidence receipt</span>
                <div className="flex items-center gap-1.5 font-mono">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={p.name} onClick={() => handleSelectPreset(idx)}
                      className="px-2.5 py-1 rounded-full transition-all cursor-pointer text-[11px]"
                      style={{
                        backgroundColor: activePresetIndex === idx ? "var(--fg)" : "transparent",
                        color: activePresetIndex === idx ? "var(--surface)" : "var(--muted)",
                        fontWeight: activePresetIndex === idx ? 600 : 400,
                        border: `1px solid ${activePresetIndex === idx ? "var(--fg)" : "var(--border)"}`,
                      }}
                    >{p.name}</button>
                  ))}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>Action</span>
                    <p className="text-[16px] font-medium leading-snug" style={{ color: "var(--fg)" }}>{preset.action}</p>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                    style={{ backgroundColor: "var(--color-verified-bg)", color: "var(--color-verified)", border: "1px solid var(--color-verified-border)" }}
                  >
                    <IconCheck className="w-3.5 h-3.5" /><span>Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted)" }}>Agent</span>
                    <span className="text-sm font-medium font-mono" style={{ color: "var(--fg)" }}>{preset.agent}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted)" }}>Authorized by</span>
                    <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{preset.principal}</span>
                  </div>
                </div>

                {liveEvent && (
                  <div className="rounded-babit p-3.5 space-y-2 glass-subtle animate-fade-in">
                    <span className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>Cryptographic proof</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate" style={{ color: "var(--muted)" }}>digest {liveEvent.eventHash.slice(0, 12)}…</span>
                        <span style={{ color: "var(--color-verified)" }} className="font-semibold shrink-0">✓</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate" style={{ color: "var(--muted)" }}>signature {liveEvent.notarySignature.slice(0, 12)}…</span>
                        <span style={{ color: "var(--color-verified)" }} className="font-semibold shrink-0">✓</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px]" style={{ color: "var(--muted)" }}>Computed and verified in your browser.</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyReceipt} disabled={!liveEvent}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-babit-sm transition-colors cursor-pointer glass-subtle"
                      style={{ color: "var(--fg)" }}
                    >
                      <IconCopy className="w-3 h-3" /><span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={() => generateReceipt()} disabled={computing}
                      className="px-3 py-1.5 rounded-babit-sm text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "var(--fg)", color: "var(--surface)" }}
                    >
                      <IconRefresh className={`w-3 h-3 ${computing ? "animate-spin" : ""}`} /><span>{computing ? "Working…" : "New receipt"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
