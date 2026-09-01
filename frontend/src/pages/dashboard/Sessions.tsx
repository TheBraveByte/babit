import { useState } from "react";
import { StatusPill, Copyable, MonospaceHash, Button, Field, TextInput, Select, Error, EmptyState } from "@/lib/ui";
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
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Sessions
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Capture sessions bind executed actions to a root grant and seal them under an external anchor. Inspect a session by ID or drive its lifecycle.
        </p>
      </div>

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

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-babit-lg p-6 shadow-xs space-y-5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {children}
    </div>
  );
}

const ANCHOR_KIND_LABEL: Record<string, string> = {
  KIND_UNSPECIFIED: "Unspecified",
  KIND_RFC3161_TSA: "RFC 3161 TSA",
  KIND_TRANSPARENCY_LOG: "Transparency Log",
  KIND_PUBLIC_CHAIN: "Public Chain",
};

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
    <Panel>
      <form onSubmit={run} className="space-y-3">
        <label className="text-xs font-medium" style={{ color: "var(--fg)" }}>Fetch the external anchor sealing a capture session</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <TextInput value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="e.g. BAL-4a1055" className="flex-1" />
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!sessionId.trim()}>
            <IconLayers className="w-4 h-4" />
            <span>Fetch Anchor</span>
          </Button>
        </div>
      </form>

      {error && <Error message={error} />}

      {searched && !error && hasAnchor && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>External Anchor</span>
            <StatusPill ok label="ANCHORED" />
          </div>
          <div className="font-mono text-xs space-y-3">
            <div>
              <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Kind</span>
              <span style={{ color: "var(--fg)" }}>{ANCHOR_KIND_LABEL[anchor!.kind ?? ""] ?? anchor!.kind ?? "—"}</span>
            </div>
            {anchor!.anchored_at && (
              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Anchored At</span>
                <span className="tnum" style={{ color: "var(--fg)" }}>{anchor!.anchored_at}</span>
              </div>
            )}
            {anchor!.root && (
              <div>
                <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Root</span>
                <MonospaceHash hash={anchor!.root} />
              </div>
            )}
            {anchor!.anchor_receipt && (
              <div>
                <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Anchor Receipt</span>
                <MonospaceHash hash={anchor!.anchor_receipt} />
              </div>
            )}
          </div>
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
    </Panel>
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
      <Panel>
        <form onSubmit={begin} className="space-y-4">
          <div className="pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Begin Session</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Open a capture session bound to a root grant and surface.</p>
          </div>
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
          <div className="space-y-3 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-semibold" style={{ color: "var(--fg)" }}>Session {ended ? "closed" : "open"}</span>
              </div>
              <StatusPill status={ended ? "REVOKED" : "ACTIVE"} label={ended ? "CLOSED" : "OPEN"} />
            </div>
            <div className="font-mono text-xs">
              <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Session ID</span>
              <Copyable value={session.session_id || "—"} />
            </div>
          </div>
        )}
      </Panel>

      {session && !ended && (
        <Panel>
          <form onSubmit={recordAction} className="space-y-4">
            <div className="pb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Record Action</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Notarize one executed action within this session.</p>
            </div>
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
            <div className="space-y-2 pt-2 font-mono text-xs" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-semibold" style={{ color: "var(--fg)" }}>Action recorded</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Event ID</span>
                <Copyable value={lastEvent.event_id || "—"} />
              </div>
              {lastEvent.sequence !== undefined && (
                <div>
                  <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Sequence</span>
                  <span className="tnum" style={{ color: "var(--fg)" }}>{lastEvent.sequence}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <Button type="button" variant="danger" size="md" loading={endLoading} onClick={end}>
              End Session
            </Button>
            {endError && <div className="mt-3"><Error message={endError} /></div>}
          </div>
        </Panel>
      )}
    </div>
  );
}
