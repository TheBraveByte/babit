import type { components } from "@/api/schema";
import { IconCheck } from "@/lib/icons";

type Grant = components["schemas"]["v1Grant"];

export interface GrantTreeProps {
  grants: Grant[];
  rootId?: string;
  selectedId?: string;
  onSelect?: (g: Grant) => void;
}

export function GrantTree({ grants, rootId, selectedId, onSelect }: GrantTreeProps) {
  const byId = new Map<string, Grant>(
    grants
      .filter((g): g is Grant & { grant_id: string } => Boolean(g.grant_id))
      .map((g) => [g.grant_id, g]),
  );
  const children = new Map<string, Grant[]>();
  const roots: Grant[] = [];

  for (const g of grants) {
    const pid = g.parent_grant_id;
    const gid = g.grant_id;
    if (!gid) continue;
    if (!pid) {
      roots.push(g);
    } else {
      const list = children.get(pid) ?? [];
      list.push(g);
      children.set(pid, list);
    }
  }

  const root = rootId ? byId.get(rootId) : roots[0];
  if (!root) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
        No root grant to display.
      </p>
    );
  }

  function NodeBox({ grant }: { grant: Grant }) {
    const isSelected = selectedId ? selectedId === grant.grant_id : false;
    const kids = children.get(grant.grant_id ?? "") ?? [];
    const hasChildren = kids.length > 0;
    const role = !grant.parent_grant_id ? "Root" : hasChildren ? "Agent" : "Leaf";

    return (
      <li className="grant-tree-node">
        <div
          className={`grant-tree-box rounded-babit p-3 min-w-[180px] max-w-[260px] ${isSelected ? "ring-1 ring-[var(--brand-accent)]" : ""}`}
          onClick={() => onSelect?.(grant)}
          onKeyDown={(e) => e.key === "Enter" && onSelect?.(grant)}
          role="button"
          tabIndex={0}
          style={{
            backgroundColor: "var(--surface)",
            border: `1px solid ${isSelected ? "var(--brand-accent)" : "var(--border-subtle)"}`,
            boxShadow: "0 10px 30px -18px color-mix(in srgb, var(--fg) 40%, transparent)",
            cursor: onSelect ? "pointer" : "default",
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: hasChildren ? "var(--brand-accent)" : "var(--muted)",
              }}
            />
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              {role}
            </span>
          </div>
          <div
            className="text-[13px] font-mono font-medium truncate"
            style={{ color: "var(--fg)" }}
          >
            {grant.subject_id}
          </div>
          <div className="text-[11px] truncate" style={{ color: "var(--muted)" }}>
            {grant.grant_id}
          </div>
          {grant.capabilities && grant.capabilities.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {grant.capabilities.slice(0, 3).map((c) => (
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
          <div
            className="mt-1.5 flex items-center gap-1 text-[10px]"
            style={{ color: "var(--color-verified)" }}
          >
            <IconCheck className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>

        {hasChildren && (
          <ul className="grant-tree-children">
            {kids.map((kid, i) => (
              <NodeBox key={kid.grant_id ?? i} grant={kid} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <div className="grant-tree overflow-x-auto py-6">
      <ul className="grant-tree-root">
        <NodeBox grant={root} />
      </ul>
    </div>
  );
}
