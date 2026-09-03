import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck, IconRefresh } from "@/lib/icons";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";
import { docsUrl } from "@/lib/links";

const EvidencePipeline = lazy(() =>
  import("@/components/viz/EvidencePipeline").then((m) => ({ default: m.EvidencePipeline })),
);

const SCENARIO = {
  action: "Approved a $4,200 insurance payout",
  agent: "claims-agent",
  principal: "Alice, Risk Supervisor",
  grantId: "BAL-DEL-8921",
  resource: "claims/48102",
  amount: 4200.0,
};

const STATS = [
  { value: "< 1ms", label: "seal time" },
  { value: "100%", label: "offline verifiable" },
  { value: "0", label: "trust required" },
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
    <section
      className="dark-section relative overflow-hidden"
      style={{ backgroundColor: "var(--dark-section-bg)" }}
    >
      {/* ── Full-bleed cinematic evidence pipeline ──────────────────── */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <EvidencePipeline className="w-full h-full" />
        </Suspense>
      </div>

      {/* Vignette overlay for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(5, 8, 7, 0.7) 0%, transparent 60%)",
        }}
      />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 container-babit min-h-[100vh] flex flex-col justify-center pt-28 pb-20 lg:pt-28 lg:pb-24">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: "#2dd4bf", boxShadow: "0 0 8px #2dd4bf" }}
            />
            <span
              className="type-eyebrow"
              style={{ color: "var(--brand-accent)", letterSpacing: "0.08em" }}
            >
              Chain of custody for AI agents
            </span>
          </div>

          {/* Bold headline — confident, not abstract */}
          <h1
            className="font-medium tracking-[-0.035em] leading-[1.05]"
            style={{
              color: "var(--dark-section-fg)",
              fontSize: "clamp(2.5rem, 5.5vw, 4rem)",
            }}
          >
            Every agent action,
            <br />
            <span style={{ color: "#2dd4bf" }}>sealed as evidence.</span>
          </h1>

          {/* Subhead */}
          <p
            className="mt-7 max-w-lg leading-relaxed"
            style={{
              color: "var(--dark-section-muted)",
              fontSize: "clamp(1.0625rem, 1.4vw, 1.25rem)",
            }}
          >
            Babit binds every autonomous action to the person who authorized it,
            notary-seals it, and appends it to a ledger anyone can verify —
            without trusting babit.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-pill px-6 py-3 text-[15px] font-medium transition-all cursor-pointer hover:scale-[1.02]"
              style={{
                backgroundColor: "#2dd4bf",
                color: "#050807",
                boxShadow: "0 0 24px rgba(45, 212, 191, 0.3)",
              }}
            >
              Start recording actions
            </button>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-pill px-6 py-3 text-[15px] font-medium transition-colors cursor-pointer inline-flex items-center gap-2"
              style={{
                color: "var(--dark-section-fg)",
                border: "1px solid var(--dark-section-border)",
                backgroundColor: "rgba(19, 22, 21, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>Read the docs</span>
              <span style={{ color: "var(--dark-section-muted)" }}>↗</span>
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-16 flex items-center gap-10">
            {STATS.map((s) => (
              <div key={s.label}>
                <div
                  className="text-[28px] font-medium tracking-tight tnum"
                  style={{ color: "var(--dark-section-fg)" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-[11px] font-mono uppercase tracking-wider mt-0.5"
                  style={{ color: "var(--dark-section-muted)" }}
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
              backgroundColor: "rgba(19, 22, 21, 0.85)",
              backdropFilter: "blur(12px)",
              border: sealed
                ? "1px solid rgba(45, 212, 191, 0.4)"
                : "1px solid var(--dark-section-border)",
              boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-3 flex items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--dark-section-border)" }}
            >
              <span
                className="type-eyebrow"
                style={{ color: "var(--dark-section-muted)" }}
              >
                Live receipt
              </span>
              <span
                className="font-mono text-[11px]"
                style={{ color: "var(--dark-section-muted)" }}
              >
                {SCENARIO.grantId}
              </span>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <span
                    className="type-eyebrow block"
                    style={{ color: "var(--dark-section-muted)" }}
                  >
                    Action
                  </span>
                  <p
                    className="text-[14px] font-medium leading-snug truncate"
                    style={{ color: "var(--dark-section-fg)" }}
                  >
                    {SCENARIO.action}
                  </p>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 transition-all duration-500"
                  style={{
                    backgroundColor: sealed
                      ? "rgba(45, 212, 191, 0.15)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: sealed ? "#2dd4bf" : "var(--dark-section-muted)",
                    border: sealed
                      ? "1px solid rgba(45, 212, 191, 0.3)"
                      : "1px solid var(--dark-section-border)",
                  }}
                >
                  {sealed ? (
                    <>
                      <IconCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <span>{computing ? "Sealing…" : "Pending"}</span>
                  )}
                </div>
              </div>

              {/* Seal line animation */}
              <div
                className="relative h-px overflow-hidden"
                style={{ backgroundColor: "var(--dark-section-border)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 ease-out"
                  style={{
                    width: sealed ? "100%" : "0%",
                    backgroundColor: "#2dd4bf",
                  }}
                />
              </div>

              {/* Hash rows */}
              {liveEvent && (
                <div
                  className="rounded-babit-sm divide-y animate-fade-in"
                  style={{
                    border: "1px solid var(--dark-section-border)",
                    backgroundColor: "rgba(5, 8, 7, 0.5)",
                  }}
                >
                  {[
                    { label: "digest", value: liveEvent.eventHash },
                    { label: "signature", value: liveEvent.notarySignature },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 px-3 py-2 font-mono text-[10px]"
                      style={{ borderColor: "var(--dark-section-border)" }}
                    >
                      <span style={{ color: "var(--dark-section-muted)" }}>
                        {row.label}
                      </span>
                      <span
                        className="truncate"
                        style={{ color: "var(--dark-section-fg)" }}
                      >
                        {row.value.slice(0, 24)}…
                      </span>
                      <span style={{ color: "#2dd4bf" }}>✓</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <span
                  className="text-[10px] font-mono"
                  style={{ color: "var(--dark-section-muted)" }}
                >
                  computed in your browser
                </span>
                <button
                  onClick={generateReceipt}
                  disabled={computing}
                  className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-babit-sm transition-opacity cursor-pointer hover:opacity-80"
                  style={{
                    color: "#2dd4bf",
                    border: "1px solid rgba(45, 212, 191, 0.2)",
                  }}
                >
                  <IconRefresh
                    className={`w-3 h-3 ${computing ? "animate-spin" : ""}`}
                  />
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
