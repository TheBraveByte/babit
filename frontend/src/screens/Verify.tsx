import { useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { Button, Card, Error, Field, StatusPill, TextArea, TextInput } from "@/lib/ui";

type Proof = components["schemas"]["v1Proof"];
type VResp = components["schemas"]["v1VerifyProofResponse"];

const checks: { key: keyof VResp; label: string }[] = [
  { key: "signature_valid", label: "Notary signature" },
  { key: "chain_intact", label: "Hash chain intact" },
  { key: "anchored", label: "External anchor" },
  { key: "authority_valid", label: "Delegation authority" },
];

export function Verify() {
  const [eventId, setEventId] = useState("");
  const [receipt, setReceipt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VResp | null>(null);

  async function verifyProof(proof: Proof) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.POST("/v1/proofs:verify", { body: { proof } });
      if (res.error || !res.data) setError(errText(res.error));
      else setResult(res.data);
    } catch (e) {
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }

  async function fetchAndVerify() {
    setError(null);
    const res = await api.GET("/v1/events/{event_id}:proof", { params: { path: { event_id: eventId } } });
    if (res.error || !res.data?.proof) {
      setError(errText(res.error) || "no proof for that event");
      return;
    }
    await verifyProof(res.data.proof);
  }

  function verifyPasted() {
    setError(null);
    try {
      const parsed = JSON.parse(receipt) as { proof?: Proof };
      const proof = (parsed.proof ?? parsed) as Proof;
      void verifyProof(proof);
    } catch {
      setError("receipt is not valid JSON");
    }
  }

  return (
    <div className="grid gap-6">
      <Card title="Verify by event id">
        <Field label="event_id">
          <TextInput value={eventId} onChange={(e) => setEventId(e.target.value)} placeholder="BAL-…" />
        </Field>
        <Button disabled={loading || !eventId} onClick={() => void fetchAndVerify()}>
          {loading ? "verifying…" : "Fetch proof & verify"}
        </Button>
      </Card>

      <Card title="Verify a receipt">
        <Field label="receipt JSON (a Proof, or an object with a proof field)">
          <TextArea value={receipt} onChange={(e) => setReceipt(e.target.value)} placeholder='{"proof": { … }}' />
        </Field>
        <Button disabled={loading || !receipt} onClick={verifyPasted}>
          {loading ? "verifying…" : "Verify receipt"}
        </Button>
      </Card>

      {error && <Error message={error} />}

      {result && (
        <Card title="Result">
          <div className="grid gap-2">
            {checks.map((c) => (
              <div key={c.key} className="flex items-center justify-between border-b border-neutral-100 pb-2 last:border-0">
                <span className="text-sm text-neutral-700">{c.label}</span>
                <StatusPill ok={result[c.key] === true} label={result[c.key] ? "pass" : "fail"} />
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                result.valid ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {result.valid ? "VERIFIED" : "NOT VERIFIED"}
            </span>
            {result.reason ? <span className="font-mono text-xs text-neutral-500">{result.reason}</span> : null}
          </div>
        </Card>
      )}
    </div>
  );
}
