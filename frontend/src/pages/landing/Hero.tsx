import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck, IconRefresh, IconCopy } from "@/lib/icons";
import { computeLiveReceipt, type LiveSimulatedEvent } from "@/lib/crypto";
import { docsUrl } from "@/lib/links";


const SCENARIO = {
  action: "Approved a $4,200 insurance payout",
  agent: "claims-agent",
  principal: "Alice, Risk Supervisor",
  grantId: "BAL-DEL-8921",
  resource: "claims/48102",
  amount: 4200.0,
};

/** The hero closes on the guarantees, not on decoration. */
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
    setTimeout(() => setCopied(false), 1500);  };

  return (
    <section className="relative overflow-hidden pt-32 pb-0 sm:pt-40" style={{ backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 grid-fade pointer-events-none" />

       <div className="container-babit relative z-10">
        <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-14 lg:gap-20 items-center">
          {/* Message */}
          <div className="max-w-xl">
            <p className="type-eyebrow mb-6">Chain of custody for AI agents</p>


            <h1 className="type-display" style={{ color: "var(--fg)" }}>
                Proof for autonomous action.
            </h1>
            <p className="type-lead mt-6">
                Every action an agent takes, bound to the person who allowed it and sealed as
                evidence anyone can verify, without trusting babit.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/signup")}
                className="px-5 py-2.5 text-[15px] font-medium rounded-babit transition-opacity cursor-pointer hover:opacity-90"
                style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
              >
                Start recording actions
              </button>
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-[15px] font-medium rounded-babit transition-colors cursor-pointer inline-flex items-center gap-1.5"
                style={{ color: "var(--fg)", border: "1px solid var(--border)" }}
              >
                <span>Read the docs</span>
                <span style={{ color: "var(--muted)" }}>↗</span>
              </a>
            </div>
          </div>

          {/* Product surface: a receipt computed in the browser */}
          <div
            className="rounded-babit-lg overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 32px 64px -32px rgba(0,0,0,0.45)",
            }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}
            >
              <span className="type-eyebrow">Evidence receipt</span>
              <span className="font-mono text-[11px]" style={{ color: "var(--muted)" }}>
                {SCENARIO.grantId}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="type-eyebrow">Action</span>
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
                  <span className="type-eyebrow block">Agent</span>
                  <span className="text-sm font-mono" style={{ color: "var(--fg)" }}>
                    {SCENARIO.agent}
                  </span>

                </div>
                  <div className="space-y-1">
                  <span className="type-eyebrow block">Authorized by</span>
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {SCENARIO.principal}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="type-eyebrow block">Resource</span>
                  <span className="text-sm font-mono" style={{ color: "var(--fg)" }}>
                    {SCENARIO.resource}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="type-eyebrow block">Value</span>
                  <span className="text-sm font-mono tnum" style={{ color: "var(--fg)" }}>
                    ${SCENARIO.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

               {liveEvent && (
                <div
                  className="rounded-babit divide-y animate-fade-in"
                  style={{ border: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}
                >
                  {[
                    { label: "digest", value: liveEvent.eventHash },
                    { label: "signature", value: liveEvent.notarySignature },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-3 px-3.5 py-2.5 font-mono text-[11px]"
                      style={{ borderColor: "var(--border-subtle)" }}
                    >
                      <span style={{ color: "var(--muted)" }}>{row.label}</span>
                      <span className="truncate" style={{ color: "var(--fg)" }}>
                        {row.value.slice(0, 28)}…
                      </span>
                      <span className="shrink-0" style={{ color: "var(--color-verified)" }}>
                        ✓
                      </span>
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
                    className="px-3 py-1.5 rounded-babit-sm text-[12px] font-medium inline-flex items-center gap-1.5 transition-opacity cursor-pointer hover:opacity-90"
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

        {/* Guarantee strip closes the hero */}
        <dl className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: "var(--border)" }}>
          {GUARANTEES.map((g) => (
            <div key={g.k} className="px-5 py-5" style={{ backgroundColor: "var(--bg)" }}>
              <dt className="type-eyebrow">{g.k}</dt>
              <dd className="mt-2 text-[14px] font-medium" style={{ color: "var(--fg)" }}>
                {g.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
