import { lazy, Suspense } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { GrantNodeData } from "../../components/viz/AuthorityGraph";

const AuthorityGraph = lazy(() =>
  import("../../components/viz/AuthorityGraph").then((m) => ({ default: m.AuthorityGraph })),
);

// Curated, truthful example of babit's signed delegation DAG (Grant model):
// a human principal issues a root grant, delegates scoped authority to an agent,
// which sub-delegates to two sub-agents, one live and one revoked (greyed subtree).
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

const HOW_TO_READ = [
  {
    dot: "var(--brand-accent)",
    text: (
      <>
        Each node is a <span style={{ color: "var(--dark-section-fg)" }}>grant</span>: a subject, its
        capabilities, and its scope (resources and value limit).
      </>
    ),
  },
  {
    dot: "var(--brand-accent)",
    text: (
      <>
        Each edge carries a <span style={{ color: "var(--dark-section-fg)" }}>parent signature</span>, proof
        the grant above authorized the one below.
      </>
    ),
  },
  {
    dot: "var(--color-failed)",
    text: (
      <>
        A hand-off can only narrow authority, never widen it. Revoke a grant and its whole
        subtree goes dark.
      </>
    ),
  },
];

export function SectionAuthorityChain() {
  return (
    <section
      id="authority"
      className="dark-section relative overflow-hidden section-y-lg"
    >
      <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(45, 212, 191, 0.06), transparent 70%)",
        }}
      />
      <div className="container-babit relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: heading + how to read it */}
          <div className="space-y-8">
            <div>
              <p className="type-eyebrow mb-4" style={{ color: "var(--brand-accent)" }}>Authority</p>
              <h2 className="type-h2" style={{ color: "var(--dark-section-fg)" }}>
                Every action traces back to a person.
              </h2>
              <p className="type-lead mt-5" style={{ color: "var(--dark-section-muted)" }}>
                A person authorizes an agent, which can hand a narrower slice to a sub-agent.
                Revoke a grant and everything below it greys out.
              </p>
            </div>

            <div
              className="rounded-babit-md p-5 space-y-3 text-xs"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--dark-section-border)" }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="type-eyebrow">How to read it</span>
                <span className="font-mono text-[11px]" style={{ color: "var(--dark-section-fg)" }}>
                  signed delegation
                </span>
              </div>
              <ul className="space-y-2" style={{ color: "var(--dark-section-muted)" }}>
                {HOW_TO_READ.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ backgroundColor: item.dot }}
                    />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: the real interactive delegation DAG */}
          <div
            className="rounded-babit-md overflow-hidden"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--dark-section-border)",
              boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05), 0 32px 64px -32px rgba(0,0,0,0.6)",
            }}
          >
            <Suspense fallback={<div style={{ height: 420 }} />}>
              <AuthorityGraph nodes={NODES} edges={EDGES} height={420} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}
