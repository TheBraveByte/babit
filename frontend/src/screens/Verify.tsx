import { useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import { PageHeader, Card, Button, Error, StatusPill, TextArea, TextInput, Field } from "@/lib/ui";
import { IconCheck, IconShieldCheck, IconShieldAlert } from "@/lib/icons";

type Proof = components["schemas"]["v1Proof"];
type VResp = components["schemas"]["v1VerifyProofResponse"];

const checks: { key: keyof VResp; label: string; desc: string }[] = [
  { key: "signature_valid", label: "Notary Signature", desc: "Ed25519 signature verified against notary public key" },
  { key: "chain_intact", label: "Hash Chain", desc: "Sequential SHA-256 forward pointers are unbroken" },
  { key: "authority_valid", label: "Delegation Authority", desc: "Action within granted resource scope and depth limits" },
  { key: "anchored", label: "External Anchor", desc: "RFC 3161 timestamp attestation verified" },
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
      setError(errText(res.error) || "No inclusion proof found for that event ID.");
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
      setError("Provided receipt is not valid JSON.");
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setReceipt(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Independent Verification"
        title="Verify Evidence"
        description="Don't trust us. Verify it yourself. Recompute a Babit receipt's cryptographic proofs locally against the notary key and external anchor."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Option A: Drop / Paste Receipt */}
        <Card className="animate-float-up">
          <div className="space-y-4">
            <div className="h-px accent-hairline -mx-5 -mt-5" />

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: "var(--fg)" }}>
                1 · Verify Raw Receipt JSON
              </span>
              <label className="text-[11px] cursor-pointer underline underline-offset-2 transition-colors" style={{ color: "var(--muted)" }}>
                Upload JSON file
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <TextArea
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder='Paste receipt or proof JSON here: {"event": { ... }, "merkle_root": "..."}'
              className="h-32 text-xs"
            />

            <Button
              variant="primary"
              size="md"
              loading={loading}
              disabled={!receipt.trim()}
              onClick={verifyPasted}
              className="w-full justify-center"
            >
              <IconShieldCheck className="w-4 h-4" />
              <span>Verify Receipt</span>
            </Button>
          </div>
        </Card>

        {/* Option B: Verify by Event ID */}
        <Card>
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: "var(--fg)" }}>
                  2 · Verify by Event ID
                </span>
                <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>Query ledger</span>
              </div>

              <Field label="Event ID">
                <TextInput
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  placeholder="e.g. BAL-778812"
                />
              </Field>
            </div>

            <Button
              variant="secondary"
              size="md"
              loading={loading}
              disabled={!eventId.trim()}
              onClick={() => void fetchAndVerify()}
              className="w-full justify-center"
            >
              <span>Fetch Proof &amp; Verify</span>
            </Button>
          </div>
        </Card>
      </div>

      {error && <Error message={error} />}

      {/* Verification Report */}
      {result && <VerificationReport result={result} />}
    </div>
  );
}

function VerificationReport({ result }: { result: VResp }) {
  const verdictColor = result.valid ? "var(--color-verified)" : "var(--color-failed)";

  return (
    <Card title="Verification Report" subtitle="Recomputed independently — no trust in Babit required.">
      <div className="space-y-5">
        {/* Verdict banner */}
        <div
          className="rounded-babit p-4 flex items-center gap-3"
          style={{
            color: verdictColor,
            backgroundColor: `color-mix(in srgb, ${verdictColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${verdictColor} 30%, transparent)`,
          }}
        >
          {result.valid ? <IconShieldCheck className="w-5 h-5 shrink-0" /> : <IconShieldAlert className="w-5 h-5 shrink-0" />}
          <div>
            <div className="text-sm font-semibold">
              {result.valid ? "Verified — all checks passed" : "Verification failed"}
            </div>
            <div className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
              {result.valid
                ? "This receipt is cryptographically sound."
                : "One or more cryptographic checks did not pass."}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-2.5">
          {checks.map((c) => {
            const ok = result[c.key] === true;
            return (
              <div
                key={c.key}
                className="p-3.5 rounded-babit flex items-center justify-between gap-4"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>{c.label}</span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{c.desc}</p>
                </div>
                <StatusPill ok={ok} label={ok ? "VALID" : "FAILED"} />
              </div>
            );
          })}
        </div>

        {result.reason && <Error message={`Failure reason: ${result.reason}`} />}

        <div className="pt-3 flex items-center justify-end gap-1.5 text-[11px]" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--muted)" }}>
          <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3.5 h-3.5" /></span>
          <span>Independent verification complete</span>
        </div>
      </div>
    </Card>
  );
}
