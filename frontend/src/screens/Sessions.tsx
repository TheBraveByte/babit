import { useState } from "react";
import { api } from "@/api/client";
import type { components } from "@/api/schema";
import { useCall } from "@/lib/useCall";
import { Button, Card, Copyable, Error, Field, Json, Select, TextInput } from "@/lib/ui";

type Surface = components["schemas"]["v1Surface"];
const surfaces: Surface[] = ["SURFACE_BROWSER", "SURFACE_SANDBOX", "SURFACE_DESKTOP"];

export function Sessions() {
  const [rootGrant, setRootGrant] = useState("");
  const [surface, setSurface] = useState<Surface>("SURFACE_BROWSER");
  const begin = useCall();
  const beganId = (begin.data as { session?: { session_id?: string } })?.session?.session_id;

  const [sid, setSid] = useState("");
  const [grantId, setGrantId] = useState("");
  const [actionType, setActionType] = useState("browser.click");
  const [resource, setResource] = useState("https://shop.example.com/cart");
  const [recordingRef, setRecordingRef] = useState("slr://session/demo");
  const record = useCall();
  const eventId = (record.data as { event?: { event_id?: string } })?.event?.event_id;

  const [endId, setEndId] = useState("");
  const end = useCall();

  const [anchorId, setAnchorId] = useState("");
  const anchor = useCall();

  return (
    <div className="grid gap-6">
      <Card title="Begin session">
        <Field label="root_grant_id">
          <TextInput value={rootGrant} onChange={(e) => setRootGrant(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Field label="surface">
          <Select value={surface} onChange={(e) => setSurface(e.target.value as Surface)}>
            {surfaces.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Button
          disabled={begin.loading}
          onClick={() => begin.run(api.POST("/v1/sessions", { body: { root_grant_id: rootGrant, surface } }))}
        >
          {begin.loading ? "starting…" : "Begin"}
        </Button>
        {begin.error && <Error message={begin.error} />}
        {beganId && <Copyable value={beganId} />}
        {begin.data ? <Json data={begin.data} /> : null}
      </Card>

      <Card title="Record action">
        <Field label="session_id">
          <TextInput value={sid} onChange={(e) => setSid(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Field label="grant_id">
          <TextInput value={grantId} onChange={(e) => setGrantId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Field label="action_type">
          <TextInput value={actionType} onChange={(e) => setActionType(e.target.value)} />
        </Field>
        <Field label="resource">
          <TextInput value={resource} onChange={(e) => setResource(e.target.value)} />
        </Field>
        <Field label="recording_ref">
          <TextInput value={recordingRef} onChange={(e) => setRecordingRef(e.target.value)} />
        </Field>
        <Button
          disabled={record.loading}
          onClick={() =>
            record.run(
              api.POST("/v1/sessions/{session_id}/actions", {
                params: { path: { session_id: sid } },
                body: { grant_id: grantId, action_type: actionType, resource, recording_ref: recordingRef },
              }),
            )
          }
        >
          {record.loading ? "recording…" : "Record"}
        </Button>
        {record.error && <Error message={record.error} />}
        {eventId && <Copyable value={eventId} />}
        {record.data ? <Json data={record.data} /> : null}
      </Card>

      <Card title="End session">
        <Field label="session_id">
          <TextInput value={endId} onChange={(e) => setEndId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Button
          disabled={end.loading}
          onClick={() =>
            end.run(api.POST("/v1/sessions/{session_id}/end", { params: { path: { session_id: endId } }, body: {} }))
          }
        >
          {end.loading ? "ending…" : "End"}
        </Button>
        {end.error && <Error message={end.error} />}
        {end.data ? <Json data={end.data} /> : null}
      </Card>

      <Card title="Session anchor">
        <Field label="session_id">
          <TextInput value={anchorId} onChange={(e) => setAnchorId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Button
          disabled={anchor.loading}
          onClick={() =>
            anchor.run(api.GET("/v1/sessions/{session_id}/anchor", { params: { path: { session_id: anchorId } } }))
          }
        >
          {anchor.loading ? "fetching…" : "Fetch anchor"}
        </Button>
        {anchor.error && <Error message={anchor.error} />}
        {anchor.data ? <Json data={anchor.data} /> : null}
      </Card>
    </div>
  );
}
