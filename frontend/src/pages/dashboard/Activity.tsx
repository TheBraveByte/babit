import { useEffect, useState } from "react";
import { PageHeader, Card, Button, Error, Copyable, MonospaceHash, StatusPill, TableSkeleton, EmptyState } from "@/lib/ui";
import { IconSearch, IconActivity } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";

type ActionEvent = components["schemas"]["v1ActionEvent"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
      <span className="sm:col-span-3 text-[10px] uppercase tracking-wide font-mono" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <div className="sm:col-span-9 font-mono text-xs" style={{ color: "var(--fg)" }}>{children}</div>
    </div>
  );
}

export function Activity() {
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ActionEvent | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const res = await api.GET("/v1/events", { params: { query: { limit: 50 } } });
      if (!active) return;
      if (res.error) setError(errText(res.error));
      else setEvents(res.data?.events ?? []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Every recorded action event, newest first. Click any row to inspect its full record."
      />

      {error && <Error message={error} />}

      {selected ? (
        <Card
          title={selected.event_id}
          subtitle={selected.action_type}
          action={
            <div className="flex items-center gap-2">
              <StatusPill ok={!!selected.notary_signature} label={selected.notary_signature ? "SIGNED" : "UNSIGNED"} />
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Back</Button>
            </div>
          }
        >
          <Row label="Session"><Copyable value={selected.session_id || "—"} /></Row>
          <Row label="Sequence"><span className="tnum">{selected.sequence ?? "—"}</span></Row>
          <Row label="Surface">{selected.surface || "—"}</Row>
          <Row label="Grant"><Copyable value={selected.grant_id || "—"} /></Row>
          <Row label="Recording">{selected.recording_ref || "—"}</Row>
          <Row label="Occurred At"><span className="tnum">{selected.occurred_at || "—"}</span></Row>
          <Row label="Content Hash">{selected.content_hash ? <MonospaceHash hash={selected.content_hash} /> : "—"}</Row>
          <Row label="Prev Hash">{selected.prev_hash ? <MonospaceHash hash={selected.prev_hash} /> : "—"}</Row>
          <Row label="Notary Signature">
            {selected.notary_signature ? (
              <span className="break-all text-[11px]" style={{ color: "var(--muted)" }}>{selected.notary_signature}</span>
            ) : "—"}
          </Row>
        </Card>
      ) : (
        <Card>
          <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
          {loading ? (
            <TableSkeleton rows={8} cols={5} />
          ) : events.length === 0 ? (
            <EmptyState
              icon={<IconActivity className="w-5 h-5" />}
              title="No events recorded yet"
              description="Start a capture session and record an agent action to see it appear here."
            />
          ) : (
            <>
              <div className="overflow-hidden rounded-babit" style={{ border: "1px solid var(--border-subtle)" }}>
                <table className="w-full text-left">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}>
                      <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>Event ID</th>
                      <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>Action</th>
                      <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--muted)" }}>Session</th>
                      <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--muted)" }}>When</th>
                      <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right" style={{ color: "var(--muted)" }}>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev, i) => (
                      <tr
                        key={ev.event_id || i}
                        onClick={() => setSelected(ev)}
                        className="cursor-pointer transition-colors hover:bg-[var(--secondary)]"
                        style={{ borderBottom: i < events.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
                      >
                        <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--fg)" }}>{ev.event_id}</td>
                        <td className="px-3 py-2.5 text-xs" style={{ color: "var(--muted)" }}>{ev.action_type}</td>
                        <td className="px-3 py-2.5 font-mono text-xs hidden sm:table-cell" style={{ color: "var(--muted)" }}>{ev.session_id}</td>
                        <td className="px-3 py-2.5 text-xs hidden sm:table-cell" style={{ color: "var(--muted)" }}>{ev.occurred_at?.slice(0, 19).replace("T", " ") || "—"}</td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-xs font-medium inline-flex items-center gap-1" style={{ color: "var(--brand-accent)" }}>
                            <IconSearch className="w-3 h-3" /> View
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                Showing {events.length} event{events.length !== 1 ? "s" : ""}.
              </p>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
