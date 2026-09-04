import { useCallback, useEffect, useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { LoadMoreButton } from "@/components/LoadMoreButton";
import { useRequireAuth } from "@/lib/auth";
import { IconLayers, IconPlay } from "@/lib/icons";
import { useProject } from "@/lib/project";
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
import { usePagination } from "@/lib/usePagination";
import { ReplayModal } from "./ReplayModal";

type Anchor = components["schemas"]["v1Anchor"];
type Session = components["schemas"]["v1Session"];

const PAGE_SIZE = 50;

const ANCHOR_KIND_LABEL: Record<string, string> = {
  KIND_UNSPECIFIED: "Unspecified",
  KIND_RFC3161_TSA: "RFC 3161 TSA",
  KIND_TRANSPARENCY_LOG: "Transparency Log",
  KIND_PUBLIC_CHAIN: "Public Chain",
};

function Meta({
  label,
  children,
  mono = true,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <span
        className="text-[10px] font-mono uppercase tracking-wider block mb-1"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
      <div className={mono ? "font-mono text-xs tnum" : "text-xs"} style={{ color: "var(--fg)" }}>
        {children}
      </div>
    </div>
  );
}

export function Sessions() {
  useRequireAuth();
  const [selected, setSelected] = useState<Session | null>(null);
  const [replaySession, setReplaySession] = useState<Session | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [anchorLoading, setAnchorLoading] = useState(false);
  const [anchorError, setAnchorError] = useState<string | null>(null);
  const { selected: project } = useProject();
  const {
    items: sessions,
    loading,
    error,
    hasMore,
    hasInitialLoaded,
    refresh,
    loadMore,
  } = usePagination<Session>();

  const fetcher = useCallback(
    async (params: { page_size: number; page_token: string }) => {
      const res = await api.GET("/v1/sessions", {
        params: { query: { ...params, project_id: project?.id ?? "" } },
      });
      if (res.error) throw new Error(errText(res.error));
      return { items: res.data?.sessions ?? [], next_page_token: res.data?.next_page_token };
    },
    [project?.id],
  );

  useEffect(() => {
    refresh(fetcher, PAGE_SIZE);
  }, [refresh, fetcher]);

  // Fetch anchor when a session is selected
  useEffect(() => {
    if (!selected) return;
    let active = true;
    setAnchor(null);
    setAnchorError(null);
    setAnchorLoading(true);
    (async () => {
      const res = await api.GET("/v1/sessions/{session_id}/anchor", {
        params: { path: { session_id: selected.session_id! } },
      });
      if (!active) return;
      if (res.error) setAnchorError(errText(res.error) || "No anchor for this session.");
      else setAnchor(res.data?.anchor ?? null);
      setAnchorLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [selected]);

  const hasAnchor =
    anchor && (anchor.kind || anchor.root || anchor.anchor_receipt || anchor.anchored_at);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        description="Capture sessions bind executed actions to a root grant and seal them under an external anchor. Click a session to inspect its anchor."
      />

      {error && <ErrorBox message={error} />}

      {selected ? (
        <Card
          title={selected.session_id}
          subtitle={`Surface: ${selected.surface || "-"}`}
          action={
            <div className="flex items-center gap-2">
              <Button variant="brand" size="sm" onClick={() => setReplaySession(selected)}>
                <IconPlay className="w-3 h-3" /> Replay
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
                Back
              </Button>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="h-px accent-hairline -mx-5 -mt-5" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Meta label="Session ID">
                <Copyable value={selected.session_id || "-"} />
              </Meta>
              <Meta label="Root Grant">
                <Copyable value={selected.root_grant_id || "-"} />
              </Meta>
              <Meta label="Started At">{selected.started_at || "-"}</Meta>
              <Meta label="Ended At">{selected.ended_at || "open"}</Meta>
              <Meta label="Event Count">{selected.event_count ?? 0}</Meta>
              <Meta label="Surface" mono={false}>
                {selected.surface || "-"}
              </Meta>
            </div>

            <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center justify-between pb-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "var(--fg)" }}
                >
                  External Anchor
                </span>
                {anchorLoading ? (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    Loading…
                  </span>
                ) : hasAnchor ? (
                  <StatusPill ok label="ANCHORED" />
                ) : (
                  <StatusPill status="PENDING" label="NO ANCHOR" />
                )}
              </div>
              {!hasAnchor && !anchorLoading && (
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {anchorError || "No anchor for this session yet."}
                </p>
              )}
              {hasAnchor && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Meta label="Kind" mono={false}>
                    <span className="font-medium">
                      {ANCHOR_KIND_LABEL[anchor!.kind ?? ""] ?? anchor!.kind ?? "-"}
                    </span>
                  </Meta>
                  {anchor!.anchored_at && <Meta label="Anchored At">{anchor!.anchored_at}</Meta>}
                  {anchor!.root && (
                    <Meta label="Root">
                      <MonospaceHash hash={anchor!.root} />
                    </Meta>
                  )}
                  {anchor!.anchor_receipt && (
                    <Meta label="Anchor Receipt">
                      <MonospaceHash hash={anchor!.anchor_receipt} />
                    </Meta>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
          {loading && !hasInitialLoaded ? (
            <TableSkeleton rows={8} cols={5} />
          ) : error ? (
            <p className="text-sm py-8 text-center" style={{ color: "var(--muted)" }}>
              Couldn't load sessions. Try refreshing.
            </p>
          ) : sessions.length === 0 ? (
            <EmptyState
              icon={<IconLayers className="w-5 h-5" />}
              title="No sessions recorded yet"
              description="Open a capture session to bind agent actions to a root grant and seal them under an external anchor."
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
                        Session ID
                      </th>
                      <th
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                        style={{ color: "var(--muted)" }}
                      >
                        Root Grant
                      </th>
                      <th
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                        style={{ color: "var(--muted)" }}
                      >
                        Events
                      </th>
                      <th
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell"
                        style={{ color: "var(--muted)" }}
                      >
                        Status
                      </th>
                      <th
                        className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-right"
                        style={{ color: "var(--muted)" }}
                      >
                        Inspect
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr
                        key={s.session_id || i}
                        onClick={() => setSelected(s)}
                        className="cursor-pointer transition-colors hover:bg-[var(--secondary)]"
                        style={{
                          borderBottom:
                            i < sessions.length - 1 ? "1px solid var(--border-subtle)" : undefined,
                        }}
                      >
                        <td
                          className="px-3 py-2.5 font-mono text-xs"
                          style={{ color: "var(--fg)" }}
                        >
                          {s.session_id}
                        </td>
                        <td
                          className="px-3 py-2.5 font-mono text-xs hidden sm:table-cell"
                          style={{ color: "var(--muted)" }}
                        >
                          {s.root_grant_id}
                        </td>
                        <td
                          className="px-3 py-2.5 text-xs hidden sm:table-cell"
                          style={{ color: "var(--muted)" }}
                        >
                          {s.event_count ?? 0}
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <StatusPill
                            status={s.ended_at ? "REVOKED" : "ACTIVE"}
                            label={s.ended_at ? "CLOSED" : "OPEN"}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className="text-xs font-medium inline-flex items-center gap-1"
                            style={{ color: "var(--brand-accent)" }}
                          >
                            <IconLayers className="w-3 h-3" /> Inspect
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                Showing {sessions.length} session{sessions.length !== 1 ? "s" : ""}.
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
      {replaySession && (
        <ReplayModal sessionId={replaySession.session_id!} onClose={() => setReplaySession(null)} />
      )}
    </div>
  );
}
