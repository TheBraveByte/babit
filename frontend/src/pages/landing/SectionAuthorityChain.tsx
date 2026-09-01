import { useState } from "react";

interface Node {
  id: string;
  label: string;
  sublabel: string;
  type: "human" | "agent" | "action";
}

const NODES: Node[] = [
  { id: "human",     label: "usr_alice",        sublabel: "Risk Supervisor (Human Principal)", type: "human" },
  { id: "orchestr",  label: "claims-orchestrator", sublabel: "Claims pipeline agent",         type: "agent" },
  { id: "executor",  label: "payout-executor",  sublabel: "Downstream sub-agent",             type: "agent" },
  { id: "action",    label: "approve_payout",   sublabel: "Consequential action captured",    type: "action" },
];

const GRANT_IDS = [
  "BAL-ROOT-100200",
  "BAL-DEL-417849",
  "BAL-DEL-8921",
];

const DETAIL_MAP: Record<string, { from: string; to: string; grantId: string; scope: string; cap: string }> = {
  human: {
    from: "—",
    to: "claims-orchestrator",
    grantId: "BAL-ROOT-100200",
    scope: "claims.*",
    cap: "$50,000 ceiling",
  },
  orchestr: {
    from: "usr_alice",
    to: "payout-executor",
    grantId: "BAL-DEL-417849",
    scope: "claims.approve_payout",
    cap: "$5,000 ceiling (attenuated)",
  },
  executor: {
    from: "claims-orchestrator",
    to: "approve_payout action",
    grantId: "BAL-DEL-8921",
    scope: "claims.approve_payout (CLM-48102)",
    cap: "$4,200 (within cap)",
  },
  action: {
    from: "payout-executor",
    to: "underwriting.internal.corp",
    grantId: "BAL-DEL-8921",
    scope: "CAPTURED AT EXECUTION SURFACE",
    cap: "Sealed receipt: rcpt_BAL_778812",
  },
};

export function SectionAuthorityChain() {
  const [activeNode, setActiveNode] = useState<string>("human");

  const detail = DETAIL_MAP[activeNode];

  return (
    <section id="product" className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — Heading + description */}
          <div className="space-y-5">
            <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              DELEGATION & AUTHORITY
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
              style={{ color: "var(--fg)" }}
            >
              Follow the authority.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Every authorized action in Babit traces back to a human principal. Click any node to inspect the grant that permitted that delegation.
            </p>

            {/* Detail inspector panel */}
            <div
              className="rounded-babit-lg p-5 space-y-3 font-mono text-xs transition-all"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "var(--muted)" }}>
                  GRANT TICKET
                </span>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>
                  {detail.grantId}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>FROM</span>
                  <span style={{ color: "var(--fg)" }}>{detail.from}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>TO</span>
                  <span style={{ color: "var(--fg)" }}>{detail.to}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>SCOPE</span>
                  <span style={{ color: "var(--fg)" }}>{detail.scope}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>CAPABILITY</span>
                  <span style={{ color: "var(--fg)" }}>{detail.cap}</span>
                </div>
              </div>
              <div className="pt-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                Monotonic attenuation enforced — sub-agents can never exceed parent scope.
              </div>
            </div>
          </div>

          {/* Right — Chain visualization */}
          <div className="flex flex-col items-center gap-0 relative">
            {NODES.map((node, idx) => {
              const isActive = activeNode === node.id;
              const isAboveActive = NODES.findIndex((n) => n.id === activeNode) > idx;

              return (
                <div key={node.id} className="flex flex-col items-center w-full max-w-xs">
                  {/* Node button */}
                  <button
                    onClick={() => setActiveNode(node.id)}
                    className="w-full p-4 rounded-babit-md transition-all cursor-pointer text-left"
                    style={{
                      backgroundColor: isActive ? "var(--fg)" : "var(--surface)",
                      border: `1.5px solid ${isActive ? "var(--fg)" : "var(--border)"}`,
                      color: isActive ? "var(--surface)" : "var(--fg)",
                      boxShadow: isActive ? "0 4px 12px rgba(0,0,0,0.12)" : "none",
                      transform: isActive ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Node type icon */}
                      <div
                        className="w-8 h-8 rounded-babit-sm flex items-center justify-center font-mono text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "var(--secondary)",
                          color: isActive ? "var(--surface)" : "var(--muted)",
                        }}
                      >
                        {node.type === "human" ? "USR" : node.type === "action" ? "ACT" : "AGT"}
                      </div>
                      <div>
                        <div className="font-mono text-sm font-semibold">{node.label}</div>
                        <div
                          className="text-[11px] mt-0.5"
                          style={{ color: isActive ? "rgba(255,255,255,0.6)" : "var(--muted)" }}
                        >
                          {node.sublabel}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* SVG Connector line between nodes */}
                  {idx < NODES.length - 1 && (
                    <div className="flex flex-col items-center py-1 w-full relative" style={{ height: "40px" }}>
                      <svg width="2" height="40" className="overflow-visible">
                        {/* Base static line */}
                        <line
                          x1="1" y1="0" x2="1" y2="40"
                          stroke="var(--border)"
                          strokeWidth="1.5"
                        />
                        {/* Animated active line */}
                        {(isActive || isAboveActive) && (
                          <line
                            x1="1" y1="0" x2="1" y2="40"
                            stroke="var(--brand-accent)"
                            strokeWidth="2"
                            strokeDasharray="40"
                            className="animate-stroke-draw"
                          />
                        )}
                      </svg>

                      {/* Grant ID label on connector */}
                      {idx < GRANT_IDS.length && (
                        <span
                          className="absolute right-0 text-[10px] font-mono px-1.5 py-0.5 rounded-babit-sm top-2"
                          style={{
                            color: isActive || isAboveActive ? "var(--brand-accent)" : "var(--muted)",
                            backgroundColor: "var(--secondary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {GRANT_IDS[idx]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
