import { IconCheck, IconXCircle } from "@/lib/icons";

interface GrantNode {
  id: string;
  role: "principal" | "agent" | "subagent";
  subject: string;
  scope: string;
  capabilities?: string[];
  revoked?: boolean;
}

const TREE: GrantNode[] = [
  {
    id: "principal",
    role: "principal",
    subject: "Alice, Risk Supervisor",
    scope: "claims/* · ≤ $5,000",
  },
  {
    id: "agent",
    role: "agent",
    subject: "claims-agent",
    scope: "claims/48102 · ≤ $4,200",
    capabilities: ["approve.payout", "read.claim"],
  },
  {
    id: "doc-fetcher",
    role: "subagent",
    subject: "doc-fetcher",
    scope: "claims/48102",
    capabilities: ["read.claim"],
  },
  {
    id: "batch-exporter",
    role: "subagent",
    subject: "batch-exporter",
    scope: "claims/48102",
    capabilities: ["read.claim"],
    revoked: true,
  },
];

const ROLE_LABELS: Record<GrantNode["role"], string> = {
  principal: "Principal",
  agent: "Agent",
  subagent: "Sub-agent",
};

const HOW_TO_READ = [
  {
    dot: "var(--brand-accent)" as const,
    text: (
      <>
        Each node is a <span style={{ color: "var(--dark-section-fg)" }}>grant</span>: a subject,
        its capabilities, and its scope (resources and value limit).
      </>
    ),
  },
  {
    dot: "var(--brand-accent)" as const,
    text: (
      <>
        Each edge carries a{" "}
        <span style={{ color: "var(--dark-section-fg)" }}>parent signature</span>, proof the grant
        above authorized the one below.
      </>
    ),
  },
  {
    dot: "var(--color-failed)" as const,
    text: (
      <>
        A hand-off can only narrow authority, never widen it. Revoke a grant and its whole subtree
        goes dark.
      </>
    ),
  },
];

function GrantCard({ node, depth }: { node: GrantNode; depth: number }) {
  return (
    <div
      className="rounded-babit-sm p-4 transition-all"
      style={{
        marginLeft: depth * 24,
        backgroundColor: node.revoked ? "transparent" : "var(--dark-section-surface)",
        border: `1px solid ${node.revoked ? "var(--dark-section-border)" : "var(--brand-accent-border)"}`,
        opacity: node.revoked ? 0.4 : 1,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] font-mono uppercase tracking-wider shrink-0"
            style={{ color: node.revoked ? "var(--dark-section-muted)" : "var(--brand-accent)" }}
          >
            {ROLE_LABELS[node.role]}
          </span>
          <span
            className="text-[13px] font-medium font-mono truncate"
            style={{ color: "var(--dark-section-fg)" }}
          >
            {node.subject}
          </span>
        </div>
        {node.revoked ? (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono shrink-0"
            style={{ color: "var(--color-failed)" }}
          >
            <IconXCircle className="w-3 h-3" />
            revoked
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-mono shrink-0"
            style={{ color: "var(--color-verified)" }}
          >
            <IconCheck className="w-3 h-3" />
            active
          </span>
        )}
      </div>
      <div
        className="mt-2 flex items-center gap-3 text-[11px] font-mono"
        style={{ color: "var(--dark-section-muted)" }}
      >
        <span>{node.scope}</span>
        {node.capabilities && (
          <span className="flex items-center gap-1">
            {node.capabilities.map((c) => (
              <span
                key={c}
                className="px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: "var(--dark-section-bg)",
                  border: "1px solid var(--dark-section-border)",
                }}
              >
                {c}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

export function SectionAuthorityChain() {
  return (
    <section id="authority" className="dark-section relative overflow-hidden section-y-lg">
      <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(45, 212, 191, 0.06), transparent 70%)",
        }}
      />
      <div className="container-babit relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: heading + how to read it */}
          <div className="space-y-8">
            <div>
              <p className="type-eyebrow mb-4" style={{ color: "var(--brand-accent)" }}>
                Authority
              </p>
              <h2 className="type-h2" style={{ color: "var(--dark-section-fg)" }}>
                Every action traces back to a person.
              </h2>
              <p className="type-lead mt-5" style={{ color: "var(--dark-section-muted)" }}>
                A person authorizes an agent, which can hand a narrower slice to a sub-agent. Revoke
                a grant and everything below it greys out.
              </p>
            </div>

            <div
              className="rounded-babit-md p-5 space-y-3 text-xs"
              style={{
                backgroundColor: "var(--dark-section-surface)",
                border: "1px solid var(--dark-section-border)",
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: "1px solid var(--dark-section-border)" }}
              >
                <span className="type-eyebrow" style={{ color: "var(--dark-section-muted)" }}>
                  How to read it
                </span>
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

          {/* Right: static delegation tree */}
          <div
            className="rounded-babit-md overflow-hidden p-6 space-y-3"
            style={{
              backgroundColor: "var(--dark-section-bg)",
              border: "1px solid var(--dark-section-border)",
            }}
          >
            <div
              className="flex items-center justify-between pb-3 mb-2"
              style={{ borderBottom: "1px solid var(--dark-section-border)" }}
            >
              <span className="type-eyebrow" style={{ color: "var(--dark-section-muted)" }}>
                Delegation tree
              </span>
              <span
                className="font-mono text-[11px]"
                style={{ color: "var(--dark-section-muted)" }}
              >
                BAL-DEL-8921
              </span>
            </div>

            {/* Principal → Agent → Sub-agents */}
            <GrantCard node={TREE[0]} depth={0} />

            {/* Connector line */}
            <div className="flex justify-center">
              <div className="w-px h-4" style={{ backgroundColor: "var(--dark-section-border)" }} />
            </div>

            <GrantCard node={TREE[1]} depth={1} />

            {/* Connector to sub-agents */}
            <div className="flex justify-center">
              <div className="w-px h-4" style={{ backgroundColor: "var(--dark-section-border)" }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GrantCard node={TREE[2]} depth={0} />
              <GrantCard node={TREE[3]} depth={0} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
