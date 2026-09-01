import { useState } from "react";

interface Node {
  id: string;
  label: string;
  sublabel: string;
  type: "human" | "agent" | "action";
}

const NODES: Node[] = [
  { id: "human",    label: "Alice, Risk Supervisor", sublabel: "A person, the authority",           type: "human" },
  { id: "orchestr", label: "claims-agent",           sublabel: "The agent she gave permission to",   type: "agent" },
  { id: "executor", label: "payout-agent",           sublabel: "A second agent it handed part of the job to", type: "agent" },
  { id: "action",   label: "Approved a $4,200 payout", sublabel: "What actually happened",           type: "action" },
];

const GRANT_IDS = [
  "BAL-ROOT-100200",
  "BAL-DEL-417849",
  "BAL-DEL-8921",
];

const DETAIL_MAP: Record<string, { from: string; to: string; grantId: string; scope: string; cap: string }> = {
  human: {
    from: "Nobody above her",
    to: "claims-agent",
    grantId: "BAL-ROOT-100200",
    scope: "Handle claims",
    cap: "Up to $50,000",
  },
  orchestr: {
    from: "Alice",
    to: "payout-agent",
    grantId: "BAL-DEL-417849",
    scope: "Approve payouts only",
    cap: "Up to $5,000",
  },
  executor: {
    from: "claims-agent",
    to: "This payout",
    grantId: "BAL-DEL-8921",
    scope: "Approve payout on claim CLM-48102",
    cap: "$4,200 (within the limit)",
  },
  action: {
    from: "payout-agent",
    to: "The claims system",
    grantId: "BAL-DEL-8921",
    scope: "Recorded the moment it happened",
    cap: "Sealed as receipt rcpt_BAL_778812",
  },
};

export function SectionAuthorityChain() {
  const [activeNode, setActiveNode] = useState<string>("human");

  const detail = DETAIL_MAP[activeNode];

  return (
    <section className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — Heading + description */}
          <div className="space-y-5">
            <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              Chain of authority
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
              style={{ color: "var(--fg)" }}
            >
              Every action traces back to a person.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
              A person authorized an agent, which handed part of the job to another agent. babit keeps the
              whole chain, so you can always see who allowed what. Select any step to see the exact permission.
            </p>

            {/* Detail inspector panel */}
            <div
              className="rounded-babit-lg p-5 space-y-3 text-xs transition-all"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                  Permission
                </span>
                <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>
                  {detail.grantId}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Who allowed it</span>
                  <span style={{ color: "var(--fg)" }}>{detail.from}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Allowed to act on</span>
                  <span style={{ color: "var(--fg)" }}>{detail.to}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>What they can do</span>
                  <span style={{ color: "var(--fg)" }}>{detail.scope}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Limit</span>
                  <span style={{ color: "var(--fg)" }}>{detail.cap}</span>
                </div>
              </div>
              <div className="pt-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                Each hand-off can only narrow what's allowed, never widen it.
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
                      {/* Node type label */}
                      <div
                        className="w-9 h-9 rounded-babit-sm flex items-center justify-center text-[10px] font-semibold uppercase shrink-0"
                        style={{
                          backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "var(--secondary)",
                          color: isActive ? "var(--surface)" : "var(--muted)",
                        }}
                      >
                        {node.type === "human" ? "Person" : node.type === "action" ? "Act" : "Agent"}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{node.label}</div>
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

                      {/* "authorized" label on connector */}
                      {idx < GRANT_IDS.length && (
                        <span
                          className="absolute right-0 text-[10px] font-mono px-1.5 py-0.5 rounded-babit-sm top-2"
                          style={{
                            color: isActive || isAboveActive ? "var(--brand-accent)" : "var(--muted)",
                            backgroundColor: "var(--secondary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          authorized
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
