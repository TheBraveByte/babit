import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck, IconRefresh, IconCopy } from "@/lib/icons";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";
import { docsUrl } from "@/lib/links";
import { SealingStream } from "@/components/viz/SealingStream";

const SCENARIO = {
  action: "Approved a $4,200 insurance payout",
  agent: "claims-agent",
  principal: "Alice, Risk Supervisor",
  grantId: "BAL-DEL-8921",
  resource: "claims/48102",
  amount: 4200.0,
};

const GUARANTEES = [
  { k: "Signatures", v: "Notary-signed per action" },
  { k: "Ledger", v: "Append-only, Merkle-sealed" },
  { k: "Anchoring", v: "Public, independent witness" },
  { k: "Verification", v: "Offline, without babit" },
];

export function Hero() {
  const { navigate } = useRouter();
  const [liveEvent, setLiveEvent] = useState<LiveSimulatedEvent | null>(null);
  const [computing, setComputing] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReceipt = async () => {
    setComputing(true);
    const result = await computeLiveReceipt({
      actionName: SCENARIO.action,
      agent: SCENARIO.agent,
      principal: SCENARIO.principal,
      grantId: SCENARIO.grantId,
      resource: SCENARIO.resource,
      amountUsd: SCENARIO.amount,
    });
    setLiveEvent(result);
    setComputing(false);
  };

  useEffect(() => {
    generateReceipt();
  }, []);

  const handleCopyReceipt = () => {
    if (!liveEvent) return;
    navigator.clipboard?.writeText(JSON.stringify(liveEvent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}
    >
      {/* Full-bleed SealingStream as the hero canvas */}
      <div className="absolute inset-0">
        <SealingStream className="w-full h-full" />
      </div>

      {/* Radial glow for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(45, 212, 191, 0.08), transparent 60%)",
        }}
      />

      {/* Hero content — centered, confident, one-liner */}
      <div className="relative z-10 container-babit flex flex-col items-center justify-center min-h-[100vh] pt-28 pb-20 text-center">
        <p className="type-eyebrow mb-6" style={{ color: "var(--brand-accent)" }}>
          Chain of custody for AI agents
        </p>

        <h1
          className="type-display max-w-3xl"
          style={{ color: "var(--fg)" }}
        >
          Proof for autonomous action.
        </h1>

        <p
          className="type-lead mt-6 max-w-xl"
          style={{ color: "var(--muted)" }}
        >
          Every action an agent takes, bound to the person who allowed it and sealed as evidence anyone can verify, without trusting babit.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="rounded-pill px-5 py-2.5 text-[15px] font-medium transition-opacity cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
          >
            Start recording actions
          </button>
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill px-5 py-2.5 text-[15px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
            style={{ color: "var(--fg)", border: "1px solid var(--border)" }}
          >
            <span>Read the docs</span>
            <span style={{ color: "var(--muted)" }}>↗</span>
          </a>
        </div>

        {/* Monospace metadata strip — Cloudflare-style */}
        <div
          className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-wide"
          style={{ color: "var(--muted)" }}
        >
          {GUARANTEES.map((g, i) => (
            <span key={g.k} className="flex items-center gap-2">
              {i > 0 && <span style={{ color: "var(--border)" }}>·</span>}
              <span style={{ color: "var(--brand-accent)" }}>{g.k}</span>
              <span>{g.v}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Interactive receipt below the fold ──────────────────────── */}
      <div className="relative z-10 container-babit py-24 lg:py-32">
        <div className="grid lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] gap-14 items-center">
          {/* Left: explanation */}
          <div>
            <p className="type-eyebrow mb-4" style={{ color: "var(--brand-accent)" }}>Try it yourself</p>
            <h2 className="type-h2" style={{ color: "var(--fg)" }}>
              A receipt computed in your browser.
            </h2>
            <p className="type-lead mt-4" style={{ color: "var(--muted)" }}>
              This receipt is real — the hash and signature are computed live, right now,
              using the same crypto babit uses to seal agent actions.
            </p>
          </div>

          {/* Right: the interactive receipt card */}
          <div
            className="rounded-babit-md overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.04), 0 32px 64px -32px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
            >
              <span className="type-eyebrow" style={{ color: "var(--muted)" }}>Evidence receipt</span>
              <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                {SCENARIO.grantId}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="type-eyebrow block" style={{ color: "var(--muted)" }}>Action</span>
                  <p className="text-[17px] font-medium leading-snug" style={{ color: "var(--fg)" }}>
                    {SCENARIO.action}
                  </p>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                  style={{
                    backgroundColor: "var(--color-verified-bg)",
                    color: "var(--color-verified)",
                    border: "1px solid var(--color-verified-border)",
                  }}
                >
                  <IconCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                <div className="space-y-1">
                  <span className="type-eyebrow block" style={{ color: "var(--muted)" }}>Agent</span>
                  <span className="text-sm font-mono" style={{ color: "var(--fg)" }}>
                    {SCENARIO.agent}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="type-eyebrow block" style={{ color: "var(--muted)" }}>Authorized by</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {SCENARIO.principal}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="type-eyebrow block" style={{ color: "var(--muted)" }}>Resource</span>
                  <span className="text-sm font-mono" style={{ color: "var(--fg)" }}>
                    {SCENARIO.resource}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="type-eyebrow block" style={{ color: "var(--muted)" }}>Value</span>
                  <span className="text-sm font-mono tnum" style={{ color: "var(--fg)" }}>
                    ${SCENARIO.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {liveEvent && (
                <div
                  className="rounded-babit-sm divide-y animate-fade-in"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--secondary)" }}
                >
                  {[
                    { label: "digest", value: liveEvent.eventHash },
                    { label: "signature", value: liveEvent.notarySignature },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 font-mono text-[11px]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span style={{ color: "var(--muted)" }}>{row.label}</span>
                      <span className="truncate" style={{ color: "var(--fg)" }}>
                        {row.value.slice(0, 28)}…
                      </span>
                      <span className="shrink-0" style={{ color: "var(--color-verified)" }}>✓</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                  Computed and verified in your browser.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyReceipt}
                    disabled={!liveEvent}
                    className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-babit-sm transition-colors cursor-pointer"
                    style={{ color: "var(--fg)", border: "1px solid var(--border)" }}
                  >
                    <IconCopy className="w-3 h-3" />
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={generateReceipt}
                    disabled={computing}
                    className="rounded-pill px-3 py-1.5 text-[12px] font-medium inline-flex items-center gap-1.5 transition-opacity cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
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
