import { useState } from "react";
import { Button, Error, EmptyState, TextInput, Copyable, MonospaceHash } from "@/lib/ui";
import { IconFileText, IconSearch } from "@/lib/icons";
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
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<ActionEvent | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId.trim()) return;
    setLoading(true);
    setError(null);
    setEvent(null);
    try {
      const res = await api.GET("/v1/events/{event_id}", {
        params: { path: { event_id: eventId.trim() } },
      });
      if (res.error || !res.data?.event) {
        setError(errText(res.error) || "No action event found for that ID.");
      } else {
        setEvent(res.data.event);
      }
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Activity
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Inspect a recorded action event by ID. Babit has no aggregate activity feed endpoint yet, so events are looked up individually.
        </p>
      </div>

      <form
        onSubmit={lookup}
        className="p-4 rounded-babit-lg shadow-xs space-y-3"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <label className="text-xs font-medium" style={{ color: "var(--fg)" }}>Look up an action event by ID</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <TextInput
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="e.g. BAL-778812"
            className="flex-1"
          />
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={!eventId.trim()}>
            <IconSearch className="w-4 h-4" />
            <span>Look up</span>
          </Button>
        </div>
      </form>

      {error && <Error message={error} />}

      {event ? (
        <div
          className="rounded-babit-lg shadow-xs p-6"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 pb-3 mb-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <h2 className="text-sm font-semibold font-mono tnum" style={{ color: "var(--fg)" }}>{event.event_id}</h2>
            <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>{event.action_type}</span>
          </div>
          <div>
            <Row label="Session"><Copyable value={event.session_id || "—"} /></Row>
            <Row label="Sequence"><span className="tnum">{event.sequence ?? "—"}</span></Row>
            <Row label="Surface">{event.surface || "—"}</Row>
            <Row label="Grant"><Copyable value={event.grant_id || "—"} /></Row>
            <Row label="Recording">{event.recording_ref || "—"}</Row>
            <Row label="Occurred At"><span className="tnum">{event.occurred_at || "—"}</span></Row>
            <Row label="Content Hash">{event.content_hash ? <MonospaceHash hash={event.content_hash} /> : "—"}</Row>
            <Row label="Prev Hash">{event.prev_hash ? <MonospaceHash hash={event.prev_hash} /> : "—"}</Row>
            <Row label="Notary Signature">
              {event.notary_signature ? (
                <span className="break-all text-[11px]" style={{ color: "var(--muted)" }}>{event.notary_signature}</span>
              ) : "—"}
            </Row>
          </div>
        </div>
      ) : (
        !error && (
          <EmptyState
            title="No event loaded"
            description="Enter an action event ID above to inspect its recorded fields and cryptographic hashes."
            icon={<IconFileText className="w-5 h-5" />}
          />
        )
      )}
    </div>
  );
}
