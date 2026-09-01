import { useState } from "react";
import { api } from "@/api/client";
import { useCall } from "@/lib/useCall";
import { Button, Card, Copyable, Error, Field, Json, StatusPill, TextInput } from "@/lib/ui";

function csv(v: string): string[] {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

function GrantResult({ data }: { data: unknown }) {
  const id = (data as { grant?: { grant_id?: string } })?.grant?.grant_id;
  return (
    <div className="grid gap-2">
      {id && <Copyable value={id} />}
      <Json data={data} />
    </div>
  );
}

export function Grants() {
  const [principal, setPrincipal] = useState("usr_alice");
  const [rootDepth, setRootDepth] = useState("3");
  const root = useCall();

  const [parent, setParent] = useState("");
  const [subject, setSubject] = useState("agt_shopper");
  const [caps, setCaps] = useState("browser.click");
  const [globs, setGlobs] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const delegate = useCall();

  const [verifyId, setVerifyId] = useState("");
  const verify = useCall();
  const chain = verify.data as
    | { valid?: boolean; reason?: string; chain?: { principal_id?: string; subject_id?: string; grant_id?: string }[] }
    | null;

  const [revokeId, setRevokeId] = useState("");
  const [reason, setReason] = useState("manual");
  const revoke = useCall();

  return (
    <div className="grid gap-6">
      <Card title="Issue root grant">
        <Field label="principal_id">
          <TextInput value={principal} onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="scope.max_depth">
          <TextInput value={rootDepth} onChange={(e) => setRootDepth(e.target.value)} />
        </Field>
        <Button
          disabled={root.loading}
          onClick={() =>
            root.run(
              api.POST("/v1/grants:root", {
                body: { principal_id: principal, scope: { max_depth: Number(rootDepth) || 0 } },
              }),
            )
          }
        >
          {root.loading ? "issuing…" : "Issue"}
        </Button>
        {root.error && <Error message={root.error} />}
        {root.data ? <GrantResult data={root.data} /> : null}
      </Card>

      <Card title="Delegate sub-grant">
        <Field label="parent_grant_id">
          <TextInput value={parent} onChange={(e) => setParent(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Field label="subject_id">
          <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="capabilities (comma-separated)">
          <TextInput value={caps} onChange={(e) => setCaps(e.target.value)} />
        </Field>
        <Field label="scope.resource_globs (comma-separated)">
          <TextInput value={globs} onChange={(e) => setGlobs(e.target.value)} placeholder="https://shop.example.com/*" />
        </Field>
        <Field label="scope.max_value_cents">
          <TextInput value={maxValue} onChange={(e) => setMaxValue(e.target.value)} placeholder="50000" />
        </Field>
        <Button
          disabled={delegate.loading}
          onClick={() =>
            delegate.run(
              api.POST("/v1/grants", {
                body: {
                  parent_grant_id: parent,
                  subject_id: subject,
                  capabilities: csv(caps),
                  scope: {
                    resource_globs: csv(globs),
                    max_value_cents: maxValue || undefined,
                  },
                },
              }),
            )
          }
        >
          {delegate.loading ? "delegating…" : "Delegate"}
        </Button>
        {delegate.error && <Error message={delegate.error} />}
        {delegate.data ? <GrantResult data={delegate.data} /> : null}
      </Card>

      <Card title="Verify chain">
        <Field label="grant_id">
          <TextInput value={verifyId} onChange={(e) => setVerifyId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Button
          disabled={verify.loading}
          onClick={() =>
            verify.run(api.GET("/v1/grants/{grant_id}:verify", { params: { path: { grant_id: verifyId } } }))
          }
        >
          {verify.loading ? "verifying…" : "Verify"}
        </Button>
        {verify.error && <Error message={verify.error} />}
        {chain && (
          <div className="grid gap-3">
            <StatusPill ok={chain.valid === true} label={chain.valid ? "chain valid" : chain.reason || "invalid"} />
            <ol className="grid gap-1 border-l border-neutral-200 pl-4">
              {chain.chain?.map((g, i) => (
                <li key={g.grant_id ?? i} className="text-sm" style={{ marginLeft: i * 16 }}>
                  <span className="text-neutral-500">{g.principal_id}</span>
                  <span className="text-neutral-400"> → </span>
                  <span className="text-neutral-900">{g.subject_id}</span>
                  <span className="ml-2 font-mono text-xs text-neutral-400">{g.grant_id}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Card>

      <Card title="Revoke grant">
        <Field label="grant_id">
          <TextInput value={revokeId} onChange={(e) => setRevokeId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Field label="reason">
          <TextInput value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
        <Button
          disabled={revoke.loading}
          onClick={() =>
            revoke.run(
              api.POST("/v1/grants/{grant_id}/revoke", {
                params: { path: { grant_id: revokeId } },
                body: { reason },
              }),
            )
          }
        >
          {revoke.loading ? "revoking…" : "Revoke"}
        </Button>
        {revoke.error && <Error message={revoke.error} />}
        {revoke.data ? <Json data={revoke.data} /> : null}
      </Card>
    </div>
  );
}
