import { useCallback, useEffect, useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import { IconFileText, IconShieldCheck } from "@/lib/icons";
import { Card, EmptyState, Error as ErrorBox, PageHeader, TableSkeleton } from "@/lib/ui";
import { useProject } from "@/lib/project";
import { usePagination } from "@/lib/usePagination";
import { useRequireAuth } from "@/lib/auth";
import { ReceiptDetail } from "./ReceiptDetail";

type Proof = components["schemas"]["v1Proof"];
type ActionEvent = components["schemas"]["v1ActionEvent"];

const PAGE_SIZE = 50;

export function Receipts() {
  useRequireAuth();
  const [proof, setProof] = useState<Proof | null>(null);
  const [fetchingProof, setFetchingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const { selected: project } = useProject();
  const {
    items: events,
    loading,
    error,
    hasMore,
    hasInitialLoaded,
    refresh,
    loadMore,
  } = usePagination<ActionEvent>();

  const fetcher = useCallback(
    async (params: { page_size: number; page_token: string }) => {
      const res = await api.GET("/v1/events", {
        params: { query: { ...params, project_id: project?.id ?? "" } },
      });
      if (res.error) throw new Error(errText(res.error));
      return { items: res.data?.events ?? [], next_page_token: res.data?.next_page_token };
    },
    [project?.id],
  );

  useEffect(() => {
    refresh(fetcher, PAGE_SIZE);
  }, [refresh, fetcher]);

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
        description="Retrieve the cryptographic inclusion proof for any recorded action. Click Fetch Proof to get the signed receipt."
      />

      {error && <ErrorBox message={error} />}
      {proofError && <ErrorBox message={proofError} />}

      <Card>
        <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
        {loading && !hasInitialLoaded ? (
          <TableSkeleton rows={8} cols={4} />
        ) : error ? (
          <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
            Couldn't load events. Try refreshing.
          </p>
        ) : events.length === 0 ? (
          <EmptyState
            icon={<IconFileText className="w-5 h-5" />}
            title="No events recorded yet"
            description="Record an agent action to generate a cryptographic inclusion proof you can verify offline."
          />
        ) : (
          <>
            <div
              className="overflow-hidden rounded-babit"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <table className="w-full text-left">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      backgroundColor: "var(--secondary)",
                    }}
                  >
                    <th
                      className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider"
                      style={{ color: "var(--muted)" }}
                    >
                      Event ID
                    </th>
                    <th
                      className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                      style={{ color: "var(--muted)" }}
                    >
                      Action
                    </th>
                    <th
                      className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                      style={{ color: "var(--muted)" }}
                    >
                      Session
                    </th>
                    <th
                      className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right"
                      style={{ color: "var(--muted)" }}
                    >
                      Proof
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev, i) => (
                    <tr
                      key={ev.event_id || i}
                      className="transition-colors hover:bg-[var(--secondary)]"
                      style={{
                        borderBottom:
                          i < events.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                      }}
                    >
                      <td className="px-3 py-2.5 font-mono text-xs" style={{ color: "var(--fg)" }}>
                        {ev.event_id}
                      </td>
                      <td
                        className="px-3 py-2.5 text-xs hidden sm:table-cell"
                        style={{ color: "var(--muted)" }}
                      >
                        {ev.action_type}
                      </td>
                      <td
                        className="px-3 py-2.5 font-mono text-xs hidden sm:table-cell"
                        style={{ color: "var(--muted)" }}
                      >
                        {ev.session_id}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <button
                          onClick={() => ev.event_id && fetchProof(ev.event_id)}
                          disabled={fetchingProof}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-babit-sm transition-colors cursor-pointer disabled:opacity-40"
                          style={{
                            color: "var(--brand-accent)",
                            border: "1px solid var(--brand-accent-border)",
                            backgroundColor: "var(--brand-accent-subtle)",
                          }}
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
            <LoadMoreButton
              onClick={() => loadMore(fetcher, PAGE_SIZE)}
              loading={loading}
              disabled={!hasMore}
            />
          </>
        )}
      </Card>
    </div>
  );
}
