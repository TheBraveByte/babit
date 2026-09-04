import { useEffect, useState } from "react";
import { EvidencePipeline } from "@/components/viz/EvidencePipeline";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";
import { IconCheck, IconRefresh } from "@/lib/icons";
import { docsUrl } from "@/lib/links";
import { useRouter } from "@/lib/router";

const SCENARIO = {
  action: "Approved a $4,200 insurance payout",
  agent: "claims-agent",
  principal: "Alice, Risk Supervisor",
  grantId: "BAL-DEL-8921",
  resource: "claims/48102",
  amount: 4200.0,
};

const STATS = [
  { value: "Signed", label: "receipts" },
  { value: "Merkle", label: "inclusion roots" },
];

export function Hero() {
  const { navigate } = useRouter();
  const [liveEvent, setLiveEvent] = useState<LiveSimulatedEvent | null>(null);
  const [computing, setComputing] = useState(false);
  const [sealed, setSealed] = useState(false);

  const generateReceipt = async () => {
    setComputing(true);
    setSealed(false);
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
    setTimeout(() => setSealed(true), 400);
  };

  useEffect(() => {
    generateReceipt();
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* ── Full-bleed cinematic evidence pipeline ──────────────────── */}
      <div className="absolute inset-0">
        <EvidencePipeline className="w-full h-full" />
      </div>

      {/* Subtle gradient overlay for text legibility (theme-aware) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, color-mix(in srgb, var(--bg) 92%, transparent) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 35%, transparent 65%)",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 container-babit min-h-[100vh] flex flex-col justify-center pt-28 pb-20 lg:pt-28 lg:pb-24">
        <div className="max-w-2xl">
          {/* Bold headline — confident, not abstract */}
          <h1
            className="font-medium tracking-[-0.035em] leading-[1.05]"
            style={{
              color: "var(--fg)",
              fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
            }}
          >
            Every agent action,
            <br />
            <span style={{ color: "var(--brand-accent)" }}>signed as evidence.</span>
          </h1>

          {/* Subhead */}
          <p
            className="mt-7 max-w-lg leading-relaxed"
            style={{
              color: "var(--muted)",
              fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)",
            }}
          >
            Babit binds every autonomous action to the person who authorized it, signs it, and
            appends it to a tamper-evident ledger anyone can audit.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-pill px-6 py-3 text-[15px] font-medium transition-all cursor-pointer hover:scale-[1.02]"
              style={{
                backgroundColor: "var(--brand-accent)",
                color: "var(--surface)",
                boxShadow: "0 0 24px color-mix(in srgb, var(--brand-accent) 30%, transparent)",
              }}
            >
              Try babit free
            </button>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-pill px-6 py-3 text-[15px] font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
              style={{
                color: "var(--fg)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>Read the docs</span>
              <span style={{ color: "var(--muted)" }}>↗</span>
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-16 flex items-center gap-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div
                  className="text-[28px] font-medium tracking-tight tnum"
                  style={{ color: "var(--fg)" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-[11px] font-mono uppercase tracking-wider mt-0.5"
                  style={{ color: "var(--muted)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live receipt card (bottom-right, floating) ─────────────── */}
        <div className="hidden lg:block absolute right-[5%] bottom-[12%] w-[380px]">
          <div
            className="rounded-babit-md overflow-hidden transition-all duration-500"
            style={{
              backgroundColor: "color-mix(in srgb, var(--surface) 90%, transparent)",
              backdropFilter: "blur(12px)",
              border: sealed
                ? "1px solid color-mix(in srgb, var(--brand-accent) 40%, transparent)"
                : "1px solid var(--border)",
              boxShadow: "0 24px 48px -12px color-mix(in srgb, var(--fg) 30%, transparent)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 flex items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="type-eyebrow" style={{ color: "var(--muted)" }}>
                Simulated receipt
              </span>
              <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                {SCENARIO.grantId}
              </span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span className="type-eyebrow block" style={{ color: "var(--muted)" }}>
                    Action
                  </span>
                  <p
                    className="text-[14px] font-medium leading-snug truncate"
                    style={{ color: "var(--fg)" }}
                  >
                    {SCENARIO.action}
                  </p>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 transition-all duration-500"
                  style={{
                    backgroundColor: sealed
                      ? "color-mix(in srgb, var(--brand-accent) 15%, transparent)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: sealed ? "var(--brand-accent)" : "var(--muted)",
                    border: sealed
                      ? "1px solid color-mix(in srgb, var(--brand-accent) 30%, transparent)"
                      : "1px solid var(--border)",
                  }}
                >
                  {sealed ? (
                    <>
                      <IconCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>{computing ? "Signing…" : "Pending"}</span>
                  )}
                </div>
              </div>

              {/* Seal line animation */}
              <div
                className="relative h-px overflow-hidden"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                  style={{
                    width: sealed ? "100%" : "0%",
                    backgroundColor: "var(--brand-accent)",
                  }}
                />
              </div>

              {/* Hash rows */}
              {liveEvent && (
                <div
                  className="rounded-babit-sm divide-y animate-fade-in"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "color-mix(in srgb, var(--bg) 50%, transparent)",
                  }}
                >
                  {[
                    { label: "digest", value: liveEvent.eventHash },
                    { label: "signature", value: liveEvent.notarySignature },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 px-3 py-2 font-mono text-[10px]"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <span style={{ color: "var(--muted)" }}>{row.label}</span>
                      <span className="truncate" style={{ color: "var(--fg)" }}>
                        {row.value.slice(0, 24)}…
                      </span>
                      <span style={{ color: "var(--brand-accent)" }}>✓</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>
                  computed in your browser
                </span>
                <button
                  onClick={generateReceipt}
                  disabled={computing}
                  className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-babit-sm transition-opacity cursor-pointer hover:opacity-80"
                  style={{
                    color: "var(--brand-accent)",
                    border: "1px solid rgba(45, 212, 191, 0.2)",
                  }}
                >
                  <IconRefresh className={`w-3 h-3 ${computing ? "animate-spin" : ""}`} />
                  <span>new</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
