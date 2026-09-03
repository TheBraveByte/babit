import type { RecentEntry } from "@/lib/useRecentLookups";

/**
 * RecentTable — a clickable table of recently looked-up record IDs.
 * Clicking a row calls onSelect with the ID, which auto-fills and runs
 * the lookup form. This replaces the bare "enter an ID" empty state
 * with something users can actually interact with.
 */
export function RecentTable({
  entries,
  onSelect,
  emptyLabel = "No records yet",
}: {
  entries: RecentEntry[];
  onSelect: (id: string) => void;
  emptyLabel?: string;
}) {
  if (entries.length === 0) {
    return (
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-babit" style={{ border: "1px solid var(--border-subtle)" }}>
      <table className="w-full text-left">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}>
            <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
              ID
            </th>
            <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--muted)" }}>
              Description
            </th>
            <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right" style={{ color: "var(--muted)" }}>
              Open
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr
              key={entry.id}
              onClick={() => onSelect(entry.id)}
              className="cursor-pointer transition-colors hover:bg-[var(--secondary)]"
              style={{ borderBottom: i < entries.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
            >
              <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--fg)" }}>
                {entry.id}
              </td>
              <td className="px-3 py-2.5 text-xs hidden sm:table-cell" style={{ color: "var(--muted)" }}>
                {entry.label}
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="text-xs font-medium" style={{ color: "var(--brand-accent)" }}>→</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
