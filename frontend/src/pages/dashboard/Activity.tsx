import { useState } from "react";
import { PageHeader, Card, Button, Error, Field, TextInput, Copyable, MonospaceHash, StatusPill } from "@/lib/ui";
import { IconSearch } from "@/lib/icons";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { useRecentLookups } from "@/lib/useRecentLookups";
import { RecentTable } from "@/components/RecentTable";

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
  const { entries, addLookup } = useRecentLookups("events");

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
        addLookup(eventId.trim(), `${res.data.event.action_type || "event"} · ${res.data.event.session_id || ""}`);
      }
    } catch (err) {
      setError(errText(err));
    } finally {
      setLoading(false);
    }
  }

  // Click a recent row → auto-fill and run the lookup
  const selectRecent = (id: string) => {
    setEventId(id);
    // Trigger lookup programmatically
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) form.requestSubmit();
    }, 50);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity"
        description="Inspect a recorded action event by ID. Babit has no aggregate activity feed endpoint yet, so events are looked up individually."
      />

      <Card className="animate-float-up" title="Event lookup" subtitle="Resolve an action event to its recorded fields and cryptographic hashes.">
        <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
        <form onSubmit={lookup} className="space-y-3">
          <Field label="Action event ID">
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
          </Field>
        </form>
      </Card>

      {error && <Error message={error} />}

      {event ? (
        <Card
          title={event.event_id}
          subtitle={event.action_type}
          action={<StatusPill ok={!!event.notary_signature} label={event.notary_signature ? "SIGNED" : "UNSIGNED"} />}
        >
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
        </Card>
      ) : (
        !error && (
          <Card title="Recent lookups" subtitle="Click a row to inspect that event.">
            <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
            <RecentTable entries={entries} onSelect={selectRecent} emptyLabel="Look up an event ID above to start building history." />
          </Card>
        )
      )}
    </div>
  );
}
