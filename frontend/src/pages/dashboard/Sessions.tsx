import { useState } from "react";
import { PageHeader, Card, StatusPill, Copyable, MonospaceHash, Button, Field, TextInput, Select, Error, EmptyState } from "@/lib/ui";
import { IconLayers, IconCheck, IconPlay } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";

type Anchor = components["schemas"]["v1Anchor"];
type Session = components["schemas"]["v1Session"];
type ActionEvent = components["schemas"]["v1ActionEvent"];
type Surface = components["schemas"]["v1Surface"];

type Mode = "anchor" | "lifecycle";

export function Sessions() {
  const [mode, setMode] = useState<Mode>("anchor");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions"
        description="Capture sessions bind executed actions to a root grant and seal them under an external anchor. Inspect a session by ID or drive its lifecycle."
      />

      <div
        className="inline-flex items-center gap-1 p-1 rounded-babit"
        style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
      >
        {([
          ["anchor", "Anchor Inspector"],
          ["lifecycle", "Session Lifecycle"],
        ] as [Mode, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="px-3 py-1.5 rounded-babit-sm text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: mode === key ? "var(--fg)" : "transparent",
              color: mode === key ? "var(--surface)" : "var(--muted)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "anchor" && <AnchorPanel />}
      {mode === "lifecycle" && <LifecyclePanel />}
    </div>
  );
}

const ANCHOR_KIND_LABEL: Record<string, string> = {
  KIND_UNSPECIFIED: "Unspecified",
  KIND_RFC3161_TSA: "RFC 3161 TSA",
  KIND_TRANSPARENCY_LOG: "Transparency Log",
  KIND_PUBLIC_CHAIN: "Public Chain",
};

/** Label + value pair for mono metadata rows. */
function Meta({ label, children, mono = true }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-mono uppercase tracking-wider block mb-1" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <div className={mono ? "font-mono text-xs tnum" : "text-xs"} style={{ color: "var(--fg)" }}>
        {children}
      </div>
    </div>
  );
}

function AnchorPanel() {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [searched, setSearched] = useState(false);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId.trim()) return;
    setLoading(true);
    setError(null);
    setAnchor(null);
    setSearched(false);
    try {
      const res = await api.GET("/v1/sessions/{session_id}/anchor", {
        params: { path: { session_id: sessionId.trim() } },
      });
      if (res.error) setError(errText(res.error) || "Session anchor not found.");
      else setAnchor(res.data?.anchor ?? null);
    } catch (err) {
      setError(errText(err));
    } finally {
      setSearched(true);
      setLoading(false);
    }
  }

  const hasAnchor = anchor && (anchor.kind || anchor.root || anchor.anchor_receipt || anchor.anchored_at);

  return (
    <Card className="animate-float-up">
      <div className="space-y-5">
        <div className="h-px accent-hairline -mx-5 -mt-5" />

        <form onSubmit={run} className="space-y-3">
          <Field label="Session ID" hint="inspected individually, no listing endpoint">
            <div className="flex flex-col sm:flex-row gap-2">
              <TextInput value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="e.g. BAL-4a1055" className="flex-1" />
              <Button type="submit" variant="primary" size="md" loading={loading} disabled={!sessionId.trim()}>
                <IconLayers className="w-4 h-4" />
                <span>Fetch Anchor</span>
              </Button>
            </div>
          </Field>
        </form>

        {error && <Error message={error} />}

        {searched && !error && hasAnchor && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--fg)" }}>External Anchor</span>
              <StatusPill ok label="ANCHORED" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Meta label="Kind" mono={false}>
                <span className="font-medium">{ANCHOR_KIND_LABEL[anchor!.kind ?? ""] ?? anchor!.kind ?? "—"}</span>
              </Meta>
              {anchor!.anchored_at && <Meta label="Anchored At">{anchor!.anchored_at}</Meta>}
            </div>
            {anchor!.root && <Meta label="Root"><MonospaceHash hash={anchor!.root} /></Meta>}
            {anchor!.anchor_receipt && <Meta label="Anchor Receipt"><MonospaceHash hash={anchor!.anchor_receipt} /></Meta>}
          </div>
        )}

        {searched && !error && !hasAnchor && (
          <EmptyState
            title="No anchor yet"
            description="This session has no external anchor. Anchors are sealed after a session is closed and its actions are batched, so an open or empty session returns nothing."
            icon={<IconLayers className="w-5 h-5" />}
          />
        )}

        {!searched && !error && (
          <EmptyState
            title="No session loaded"
            description="Enter a session ID to fetch its external anchor. There is no session listing endpoint, so sessions are inspected individually by ID."
            icon={<IconLayers className="w-5 h-5" />}
          />
        )}
      </div>
    </Card>
  );
}

const SURFACES: [Surface, string][] = [
  ["SURFACE_BROWSER", "Browser"],
  ["SURFACE_SANDBOX", "Sandbox"],
  ["SURFACE_DESKTOP", "Desktop"],
];

function LifecyclePanel() {
  const [rootGrantId, setRootGrantId] = useState("");
  const [surface, setSurface] = useState<Surface>("SURFACE_BROWSER");
  const [session, setSession] = useState<Session | null>(null);
  const [beginLoading, setBeginLoading] = useState(false);
  const [beginError, setBeginError] = useState<string | null>(null);

  const [actionType, setActionType] = useState("");
  const [resource, setResource] = useState("");
  const [grantId, setGrantId] = useState("");
  const [lastEvent, setLastEvent] = useState<ActionEvent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [ended, setEnded] = useState(false);
  const [endLoading, setEndLoading] = useState(false);
  const [endError, setEndError] = useState<string | null>(null);

  const sessionId = session?.session_id;

  async function begin(e: React.FormEvent) {
    e.preventDefault();
    if (!rootGrantId.trim()) return;
    setBeginLoading(true);
    setBeginError(null);
    setSession(null);
    setLastEvent(null);
    setEnded(false);
    try {
      const res = await api.POST("/v1/sessions", {
        body: { root_grant_id: rootGrantId.trim(), surface },
      });
      if (res.error || !res.data?.session) setBeginError(errText(res.error) || "Failed to begin session.");
      else setSession(res.data.session);
    } catch (err) {
      setBeginError(errText(err));
    } finally {
      setBeginLoading(false);
    }
  }

  async function recordAction(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId || !actionType.trim()) return;
    setActionLoading(true);
    setActionError(null);
    setLastEvent(null);
    try {
      const res = await api.POST("/v1/sessions/{session_id}/actions", {
        params: { path: { session_id: sessionId } },
        body: {
          action_type: actionType.trim(),
          ...(resource.trim() ? { resource: resource.trim() } : {}),
          ...(grantId.trim() ? { grant_id: grantId.trim() } : {}),
        },
      });
      if (res.error || !res.data?.event) setActionError(errText(res.error) || "Failed to record action.");
      else setLastEvent(res.data.event);
    } catch (err) {
      setActionError(errText(err));
    } finally {
      setActionLoading(false);
    }
  }

  async function end() {
    if (!sessionId) return;
    setEndLoading(true);
    setEndError(null);
    try {
      const res = await api.POST("/v1/sessions/{session_id}/end", {
        params: { path: { session_id: sessionId } },
        body: {},
      });
      if (res.error || !res.data?.session) setEndError(errText(res.error) || "Failed to end session.");
      else {
        setSession(res.data.session);
        setEnded(true);
      }
    } catch (err) {
      setEndError(errText(err));
    } finally {
      setEndLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="animate-float-up">
        <div className="space-y-5">
          <div className="h-px accent-hairline -mx-5 -mt-5" />

          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Begin Session</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Open a capture session bound to a root grant and surface.</p>
          </div>

          <form onSubmit={begin} className="space-y-4">
            <Field label="Root Grant ID">
              <TextInput value={rootGrantId} onChange={(e) => setRootGrantId(e.target.value)} placeholder="e.g. BAL-417849" required />
            </Field>
            <Field label="Surface">
              <Select value={surface} onChange={(e) => setSurface(e.target.value as Surface)}>
                {SURFACES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Button type="submit" variant="primary" size="md" loading={beginLoading} disabled={!rootGrantId.trim()}>
              <IconPlay className="w-4 h-4" />
              <span>Begin Session</span>
            </Button>
          </form>

          {beginError && <Error message={beginError} />}

          {session && (
            <div className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3.5 h-3.5" /></span>
                  <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>Session {ended ? "closed" : "open"}</span>
                </div>
                <StatusPill status={ended ? "REVOKED" : "ACTIVE"} label={ended ? "CLOSED" : "OPEN"} />
              </div>
              <Meta label="Session ID"><Copyable value={session.session_id || "—"} /></Meta>
            </div>
          )}
        </div>
      </Card>

      {session && !ended && (
        <Card title="Record Action" subtitle="Notarize one executed action within this session.">
          <div className="space-y-5">
            <form onSubmit={recordAction} className="space-y-4">
              <Field label="Action Type">
                <TextInput value={actionType} onChange={(e) => setActionType(e.target.value)} placeholder="e.g. browser.click" required />
              </Field>
              <Field label="Resource" hint="optional">
                <TextInput value={resource} onChange={(e) => setResource(e.target.value)} placeholder="https://shop.example.com/cart" />
              </Field>
              <Field label="Grant ID" hint="optional">
                <TextInput value={grantId} onChange={(e) => setGrantId(e.target.value)} placeholder="e.g. BAL-417849" />
              </Field>
              <Button type="submit" variant="primary" size="md" loading={actionLoading} disabled={!actionType.trim()}>
                Record &amp; Notarize
              </Button>
            </form>

            {actionError && <Error message={actionError} />}

            {lastEvent && (
              <div className="space-y-3 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3.5 h-3.5" /></span>
                  <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>Action recorded</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Meta label="Event ID"><Copyable value={lastEvent.event_id || "—"} /></Meta>
                  {lastEvent.sequence !== undefined && <Meta label="Sequence">{lastEvent.sequence}</Meta>}
                </div>
              </div>
            )}

            <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <Button type="button" variant="danger" size="md" loading={endLoading} onClick={end}>
                End Session
              </Button>
              {endError && <div className="mt-3"><Error message={endError} /></div>}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
