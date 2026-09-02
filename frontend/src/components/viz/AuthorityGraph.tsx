import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

/**
 * AuthorityGraph — renders babit's real signed delegation DAG (Grant model):
 * a human principal issues a root grant, then delegates scoped authority down to agents
 * and sub-agents (parent_signature on every edge). Used as a curated example on the
 * landing and fed by GET /v1/grants/{id}:verify (the real chain) in the dashboard.
 */

export type GrantRole = "principal" | "agent" | "subagent";

export interface GrantNodeData extends Record<string, unknown> {
  role: GrantRole;
  /** subject_id for agents, principal_id for the root */
  subject: string;
  capabilities?: string[];
  scope?: string;
  revoked?: boolean;
}

const roleLabel: Record<GrantRole, string> = {
  principal: "Human principal",
  agent: "Agent",
  subagent: "Sub-agent",
};

function GrantNode({ data }: NodeProps<Node<GrantNodeData>>) {
  const revoked = data.revoked;
  return (
    <div
      className="rounded-babit px-3.5 py-2.5 min-w-[200px]"
      style={{
        background: "color-mix(in srgb, var(--surface) 78%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: `1px solid ${
          data.role === "principal"
            ? "color-mix(in srgb, var(--brand-accent) 45%, transparent)"
            : "var(--border)"
        }`,
        boxShadow: "0 10px 30px -18px color-mix(in srgb, var(--fg) 40%, transparent)",
        opacity: revoked ? 0.45 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: "none" }} />
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{
            backgroundColor: revoked
              ? "var(--color-failed)"
              : data.role === "principal"
                ? "var(--brand-accent)"
                : "var(--muted)",
          }}
        />
        <span
          className="text-[10px] font-mono uppercase tracking-[0.12em]"
          style={{ color: "var(--muted)" }}
        >
          {revoked ? "Revoked" : roleLabel[data.role]}
        </span>
      </div>
      <div className="text-[13px] font-mono font-medium truncate" style={{ color: "var(--fg)" }}>
        {data.subject}
      </div>
      {data.capabilities && data.capabilities.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {data.capabilities.slice(0, 3).map((c) => (
            <span
              key={c}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                color: "var(--muted)",
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}
      {data.scope && (
        <div className="mt-1 text-[10px] font-mono truncate" style={{ color: "var(--muted)" }}>
          {data.scope}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: "none" }} />
    </div>
  );
}

const nodeTypes = { grant: GrantNode };

function useIsDark(): boolean {
  const [dark, setDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function AuthorityGraph({
  nodes,
  edges,
  height = 380,
  interactive = false,
}: {
  nodes: Node<GrantNodeData>[];
  edges: Edge[];
  height?: number;
  interactive?: boolean;
}) {
  const dark = useIsDark();
  const styledEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        type: "smoothstep",
        animated: !e.data?.revoked,
        ...e,
        style: {
          stroke: e.data?.revoked
            ? "var(--color-failed)"
            : "color-mix(in srgb, var(--brand-accent) 55%, transparent)",
          strokeWidth: 1.5,
          ...(e.style || {}),
        },
      })),
    [edges],
  );

  return (
    <div style={{ height }} className="w-full">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        colorMode={dark ? "dark" : "light"}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={interactive}
        nodesConnectable={false}
        elementsSelectable={interactive}
        panOnDrag={interactive}
        zoomOnScroll={false}
        zoomOnPinch={interactive}
        preventScrolling={false}
      >
        <Background gap={22} size={1} color="color-mix(in srgb, var(--fg) 8%, transparent)" />
      </ReactFlow>
    </div>
  );
}

/** Build a vertical delegation tree layout from a linear chain of grants (root -> leaf),
 *  as returned by GET /v1/grants/{id}:verify. */
export function chainToGraph(
  chain: { subject: string; role: GrantRole; capabilities?: string[]; scope?: string; revoked?: boolean }[],
): { nodes: Node<GrantNodeData>[]; edges: Edge[] } {
  const nodes: Node<GrantNodeData>[] = chain.map((g, i) => ({
    id: `g${i}`,
    type: "grant",
    position: { x: 0, y: i * 130 },
    data: { role: g.role, subject: g.subject, capabilities: g.capabilities, scope: g.scope, revoked: g.revoked },
  }));
  const edges: Edge[] = chain.slice(1).map((g, i) => ({
    id: `e${i}`,
    source: `g${i}`,
    target: `g${i + 1}`,
    data: { revoked: g.revoked },
  }));
  return { nodes, edges };
}
