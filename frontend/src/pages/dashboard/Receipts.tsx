import { useEffect, useState } from "react";
import { ReceiptDetail } from "./ReceiptDetail";
import { PageHeader, Card, Error, TableSkeleton, EmptyState } from "@/lib/ui";
import { IconShieldCheck, IconFileText } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";

type Proof = components["schemas"]["v1Proof"];
type ActionEvent = components["schemas"]["v1ActionEvent"];

export function Receipts() {
  const [events, setEvents] = useState<ActionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [fetchingProof, setFetchingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

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

  async function fetchProof(eventId: string) {
    setFetchingProof(true);
    setProofError(null);
    setProof(null);
    const res = await api.GET("/v1/events/{event_id}:proof", {
      params: { path: { event_id: eventId } },
    });
    if (res.error || !res.data?.proof) {
      setProofError(errText(res.error) || "No inclusion proof found for that event ID.");
    } else {
      setProof(res.data.proof);
    }
    setFetchingProof(false);
  }

  if (proof) {
    return <ReceiptDetail proof={proof} onBack={() => setProof(null)} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Retrieve the sealed inclusion proof for any recorded action. Click Fetch Proof to get the cryptographic receipt."
      />

      {error && <Error message={error} />}
      {proofError && <Error message={proofError} />}

      <Card>
        <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
        {loading ? (
          <TableSkeleton rows={8} cols={4} />
        ) : events.length === 0 ? (
          <EmptyState
            icon={<IconFileText className="w-5 h-5" />}
            title="No events recorded yet"
            description="Record an agent action to generate a sealed inclusion proof you can verify offline."
          />
        ) : (
          <>
          <div className="overflow-hidden rounded-babit" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}>
                  <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>Event ID</th>
                  <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--muted)" }}>Action</th>
                  <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell" style={{ color: "var(--muted)" }}>Session</th>
                  <th className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right" style={{ color: "var(--muted)" }}>Proof</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <tr
                    key={ev.event_id || i}
                    className="transition-colors hover:bg-[var(--secondary)]"
                    style={{ borderBottom: i < events.length - 1 ? "1px solid var(--border-subtle)" : undefined }}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--fg)" }}>{ev.event_id}</td>
                    <td className="px-3 py-2.5 text-xs hidden sm:table-cell" style={{ color: "var(--muted)" }}>{ev.action_type}</td>
                    <td className="px-3 py-2.5 font-mono text-xs hidden sm:table-cell" style={{ color: "var(--muted)" }}>{ev.session_id}</td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        onClick={() => ev.event_id && fetchProof(ev.event_id)}
                        disabled={fetchingProof}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-babit-sm transition-colors cursor-pointer disabled:opacity-40"
                        style={{ color: "var(--brand-accent)", border: "1px solid var(--brand-accent-border)", backgroundColor: "var(--brand-accent-subtle)" }}
                      >
                        <IconShieldCheck className="w-3.5 h-3.5" />
                        <span>Proof</span>
                      </button>
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
    </div>
  );
}
