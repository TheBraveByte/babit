import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck, IconRefresh, IconCopy } from "@/lib/icons";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";
import { docsUrl } from "@/lib/links";

const PRESETS = [
  {
    name: "Approved a payout",
    action: "Approved a $4,200 insurance payout",
    agent: "claims-agent",
    principal: "Alice — Risk Supervisor",
    grantId: "BAL-DEL-8921",
    resource: "claims/48102",
    amount: 4200.0,
  },
  {
    name: "Deployed a service",
    action: "Deployed the payments service to production",
    agent: "infra-orchestrator",
    principal: "Marcus — SecOps Lead",
    grantId: "BAL-ROOT-5501",
    resource: "prod-cluster/payment-svc:v2.4",
    amount: 0,
  },
  {
    name: "Exported records",
    action: "Exported 5,000 audit records",
    agent: "compliance-bot",
    principal: "Elena — Data Protection Officer",
    grantId: "BAL-DEL-1029",
    resource: "vault/audit_log",
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
      <div className="absolute inset-0 bg-dot-subtle opacity-50 pointer-events-none" />
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-babit-sm text-xs font-mono font-medium uppercase tracking-wider"
            style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--fg)" }}
          >
            <span>Agent accountability</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-[72px] font-semibold tracking-tight leading-[1.04]"
            style={{ color: "var(--fg)" }}
          >
            Know what your AI did, and prove it.
          </h1>

          <p className="text-lg sm:text-[19px] leading-relaxed max-w-2xl mx-auto font-normal" style={{ color: "var(--muted)" }}>
            When software acts on its own, babit records every action it takes, ties it to the person who
            authorized it, and turns it into evidence anyone can verify.
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
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:bg-[var(--secondary)]"
              style={{ backgroundColor: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
            >
              <span>Read the docs</span>
              <span style={{ color: "var(--muted)" }}>↗</span>
            </a>
          </div>
        </div>

        {/* A real receipt, in plain language — the cryptography is the supporting detail */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-babit-lg shadow-sm overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}>
            <div
              className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}
            >
              <span className="text-xs font-mono font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                Example receipt
              </span>
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

            <div className="p-6 space-y-5">
              {/* Verdict + plain-language summary */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>What happened</span>
                  <p className="text-[15px] font-medium leading-snug" style={{ color: "var(--fg)" }}>{preset.action}</p>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-babit-sm shrink-0"
                  style={{ backgroundColor: "var(--color-verified-bg)", color: "var(--color-verified)", border: "1px solid var(--color-verified-border)" }}
                >
                  <IconCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: "var(--muted)" }}>Who did it</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{preset.agent}</span>
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider block mb-0.5" style={{ color: "var(--muted)" }}>Who authorized it</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{preset.principal}</span>
                </div>
              </div>

              {/* The cryptographic proof — secondary, muted */}
              {liveEvent && (
                <div
                  className="rounded-babit p-3 space-y-2 animate-fade-in"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
                >
                  <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>The proof</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" style={{ color: "var(--muted)" }}>fingerprint {liveEvent.eventHash.slice(0, 14)}…</span>
                      <span className="text-emerald-700 font-semibold shrink-0">ok</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate" style={{ color: "var(--muted)" }}>signature {liveEvent.notarySignature.slice(0, 14)}…</span>
                      <span className="text-emerald-700 font-semibold shrink-0">ok</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                  Generated and checked live in your browser.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReceipt}
                    disabled={!liveEvent}
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-babit-sm transition-colors cursor-pointer"
                    style={{ backgroundColor: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
                  >
                    <IconCopy className="w-3 h-3" />
                    <span>{copied ? "Copied" : "Copy receipt"}</span>
                  </button>
                  <button
                    onClick={() => generateReceipt()}
                    disabled={computing}
                    className="px-3 py-1.5 rounded-babit-sm text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: "var(--fg)", color: "var(--surface)" }}
                  >
                    <IconRefresh className={`w-3 h-3 ${computing ? "animate-spin" : ""}`} />
                    <span>{computing ? "Working…" : "New receipt"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
