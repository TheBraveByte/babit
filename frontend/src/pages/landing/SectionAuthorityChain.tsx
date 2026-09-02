import type { Node, Edge } from "@xyflow/react";
import { AuthorityGraph, type GrantNodeData } from "../../components/viz/AuthorityGraph";

// Curated, truthful example of babit's signed delegation DAG (Grant model):
// a human principal issues a root grant, delegates scoped authority to an agent,
// which sub-delegates to two sub-agents — one live, one revoked (greyed subtree).
const NODES: Node<GrantNodeData>[] = [
  {
    id: "principal",
    type: "grant",
    position: { x: 150, y: 0 },
    data: {
      role: "principal",
      subject: "Alice, Risk Supervisor",
      scope: "claims/* · ≤ $5,000",
    },
  },
  {
    id: "agent",
    type: "grant",
    position: { x: 150, y: 150 },
    data: {
      role: "agent",
      subject: "claims-agent",
      capabilities: ["approve.payout", "read.claim"],
      scope: "claims/48102 · ≤ $4,200",
    },
  },
  {
    id: "doc-fetcher",
    type: "grant",
    position: { x: -40, y: 320 },
    data: {
      role: "subagent",
      subject: "doc-fetcher",
      capabilities: ["read.claim"],
      scope: "claims/48102",
    },
  },
  {
    id: "batch-exporter",
    type: "grant",
    position: { x: 320, y: 320 },
    data: {
      role: "subagent",
      subject: "batch-exporter",
      capabilities: ["read.claim"],
      scope: "claims/48102",
      revoked: true,
    },
  },
];

const EDGES: Edge[] = [
  { id: "e-root", source: "principal", target: "agent" },
  { id: "e-doc", source: "agent", target: "doc-fetcher" },
  { id: "e-exp", source: "agent", target: "batch-exporter", data: { revoked: true } },
];

export function SectionAuthorityChain() {
  return (
    <section className="py-24 sm:py-32 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 grid-fade pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — Heading + description */}
          <div className="space-y-5 animate-float-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
              style={{ color: "var(--muted)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
              <span>Chain of authority</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
              style={{ color: "var(--fg)" }}
            >
              Every action traces back to a person.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
              A person authorizes an agent, which can hand a narrower slice of the job to a sub-agent.
              babit keeps the whole signed chain, so you can always see who allowed what — and revoking
              a grant instantly greys out everything below it.
            </p>

            <div className="glass rounded-babit-lg overflow-hidden">
              <div className="h-px accent-hairline" />
              <div className="p-5 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "var(--muted)" }}>
                    How to read it
                  </span>
                  <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>
                    signed delegation
                  </span>
                </div>
                <ul className="space-y-2" style={{ color: "var(--muted)" }}>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--brand-accent)" }} />
                    <span>Each node is a <span style={{ color: "var(--fg)" }}>grant</span>: a subject, its capabilities, and its scope (resources and value limit).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--brand-accent)" }} />
                    <span>Each edge carries a <span style={{ color: "var(--fg)" }}>parent signature</span> — proof the grant above authorized the one below.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: "var(--color-failed)" }} />
                    <span>A hand-off can only narrow authority, never widen it. Revoke a grant and its whole subtree goes dark.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right — Real interactive delegation DAG */}
          <div className="relative animate-float-up" style={{ animationDelay: "120ms" }}>
            <div className="ambient-glow" style={{ inset: "8% 6% 8% 6%", opacity: 0.28 }} />
            <div className="glass rounded-babit-lg overflow-hidden relative z-10">
              <AuthorityGraph nodes={NODES} edges={EDGES} height={420} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
