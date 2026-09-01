import { useState } from "react";
import { api } from "@/api/client";
import { useCall } from "@/lib/useCall";
import { Button, Card, Error, Field, Json, TextInput } from "@/lib/ui";

export function Events() {
  const [eventId, setEventId] = useState("");
  const event = useCall();

  const [proofId, setProofId] = useState("");
  const proof = useCall();
  const chain =
    (proof.data as { proof?: { delegation_chain?: { principal_id?: string; subject_id?: string; grant_id?: string }[] } })
      ?.proof?.delegation_chain ?? [];

  return (
    <div className="grid gap-6">
      <Card title="Read event">
        <Field label="event_id">
          <TextInput value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Button
          disabled={event.loading}
          onClick={() => event.run(api.GET("/v1/events/{event_id}", { params: { path: { event_id: eventId } } }))}
        >
          {event.loading ? "fetching…" : "Fetch event"}
        </Button>
        {event.error && <Error message={event.error} />}
        {event.data ? <Json data={event.data} /> : null}
      </Card>

      <Card title="Inclusion proof">
        <Field label="event_id">
          <TextInput value={proofId} onChange={(e) => setProofId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Button
          disabled={proof.loading}
          onClick={() =>
            proof.run(api.GET("/v1/events/{event_id}:proof", { params: { path: { event_id: proofId } } }))
          }
        >
          {proof.loading ? "building…" : "Build proof"}
        </Button>
        {proof.error && <Error message={proof.error} />}
        {chain.length > 0 && (
          <div className="grid gap-1 border-l border-neutral-200 pl-4">
            <span className="text-xs font-medium text-neutral-500">delegation chain</span>
            {chain.map((g, i) => (
              <div key={g.grant_id ?? i} className="text-sm" style={{ marginLeft: i * 16 }}>
                <span className="text-neutral-500">{g.principal_id}</span>
                <span className="text-neutral-400"> → </span>
                <span className="text-neutral-900">{g.subject_id}</span>
                <span className="ml-2 font-mono text-xs text-neutral-400">{g.grant_id}</span>
              </div>
            ))}
          </div>
        )}
        {proof.data ? <Json data={proof.data} /> : null}
      </Card>
    </div>
  );
}
