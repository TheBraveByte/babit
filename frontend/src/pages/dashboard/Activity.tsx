import { useCallback, useEffect, useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import { IconActivity, IconSearch } from "@/lib/icons";
import {
  Button,
  Card,
  Copyable,
  EmptyState,
  Error as ErrorBox,
  MonospaceHash,
  PageHeader,
  StatusPill,
  TableSkeleton,
} from "@/lib/ui";
import { useProject } from "@/lib/project";
import { usePagination } from "@/lib/usePagination";
import { useRequireAuth } from "@/lib/auth";

type ActionEvent = components["schemas"]["v1ActionEvent"];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-12 gap-2 py-3"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <span
        className="sm:col-span-3 text-[10px] uppercase tracking-wide font-mono"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
      <div className="sm:col-span-9 font-mono text-xs" style={{ color: "var(--fg)" }}>
        {children}
      </div>
    </div>
  );
}

const PAGE_SIZE = 50;

export function Activity() {
  useRequireAuth();
  const [selected, setSelected] = useState<ActionEvent | null>(null);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit log"
        description="Every recorded action, notarized and auditable. Each row is signed and bound to a grant."
      />

      {error && <ErrorBox message={error} />}

      {selected ? (
        <Card
          title={selected.event_id}
          subtitle={selected.action_type}
          action={
            <div className="flex items-center gap-2">
              <StatusPill
                ok={!!selected.notary_signature}
                label={selected.notary_signature ? "SIGNED" : "UNSIGNED"}
              />
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
                Back
              </Button>
            </div>
          }
        >
          <Row label="Session">
            <Copyable value={selected.session_id || "-"} />
          </Row>
          <Row label="Sequence">
            <span className="tnum">{selected.sequence ?? "-"}</span>
          </Row>
          <Row label="Surface">{selected.surface || "-"}</Row>
          <Row label="Grant">
            <Copyable value={selected.grant_id || "-"} />
          </Row>
          <Row label="Recording">{selected.recording_ref || "-"}</Row>
          <Row label="Occurred At">
            <span className="tnum">{selected.occurred_at || "-"}</span>
          </Row>
          <Row label="Content Hash">
            {selected.content_hash ? <MonospaceHash hash={selected.content_hash} /> : "-"}
          </Row>
          <Row label="Prev Hash">
            {selected.prev_hash ? <MonospaceHash hash={selected.prev_hash} /> : "-"}
          </Row>
          <Row label="Notary Signature">
            {selected.notary_signature ? (
              <span className="break-all text-[11px]" style={{ color: "var(--muted)" }}>
                {selected.notary_signature}
              </span>
            ) : (
              "-"
            )}
          </Row>
        </Card>
      ) : (
        <Card>
          <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
          {loading && !hasInitialLoaded ? (
            <TableSkeleton rows={8} cols={5} />
          ) : error ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
              Couldn't load events. Try refreshing.
            </p>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<IconActivity className="w-5 h-5" />}
              title="No events recorded yet"
              description="Start a capture session and record an agent action to see it appear here."
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
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider"
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
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                        style={{ color: "var(--muted)" }}
                      >
                        When
                      </th>
                      <th
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right"
                        style={{ color: "var(--muted)" }}
                      >
                        View
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
                        <td
                          className="px-3 py-2.5 font-mono text-xs"
                          style={{ color: "var(--fg)" }}
                        >
                          {ev.event_id}
                        </td>
                        <td className="px-3 py-2.5 text-xs" style={{ color: "var(--muted)" }}>
                          {ev.action_type}
                        </td>
                        <td
                          className="px-3 py-2.5 font-mono text-xs hidden sm:table-cell"
                          style={{ color: "var(--muted)" }}
                        >
                          {ev.session_id}
                        </td>
                        <td
                          className="px-3 py-2.5 text-xs hidden sm:table-cell"
                          style={{ color: "var(--muted)" }}
                        >
                          {ev.occurred_at?.slice(0, 19).replace("T", " ") || "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelected(ev)}
                            className="text-xs font-medium inline-flex items-center gap-1 transition-colors hover:opacity-80 cursor-pointer"
                            style={{ color: "var(--brand-accent)" }}
                            aria-label={`View event ${ev.event_id ?? i + 1}`}
                          >
                            <IconSearch className="w-3 h-3" /> View
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
      )}
    </div>
  );
}
