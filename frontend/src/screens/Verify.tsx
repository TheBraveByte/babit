import { useState } from "react";
import { api, errText } from "@/api/client";
import type { components } from "@/api/schema";
import {
  IconCheck,
  IconChevronDown,
  IconFileText,
  IconShieldAlert,
  IconShieldCheck,
} from "@/lib/icons";
import { Button, Card, Error, Field, PageHeader, StatusPill, TextArea, TextInput } from "@/lib/ui";

type Proof = components["schemas"]["v1Proof"];
type VResp = components["schemas"]["v1VerifyProofResponse"];

const checks: { key: keyof VResp; label: string; desc: string }[] = [
  {
    key: "signature_valid",
    label: "Notary signature",
    desc: "Signature matches the notary's public key",
  },
  {
    key: "chain_intact",
    label: "Hash chain",
    desc: "Each entry links to the one before it with an unbroken SHA-256 chain",
  },
  {
    key: "authority_valid",
    label: "Delegation authority",
    desc: "The action stays within the granted resource scope and depth limits",
  },
  {
    key: "anchored",
    label: "External anchor",
    desc: "An independent timestamp confirms when the receipt was recorded",
  },
];

export function Verify() {
  const [eventId, setEventId] = useState("");
  const [receipt, setReceipt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VResp | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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
    const res = await api.GET("/v1/events/{event_id}:proof", {
      params: { path: { event_id: eventId } },
    });
    if (res.error || !res.data?.proof) {
      setError(errText(res.error) || "No inclusion proof found for that event ID.");
      return;
    }
    await verifyProof(res.data.proof);
  }

  function verifyPasted(text: string = receipt) {
    setError(null);
    try {
      const parsed = JSON.parse(text) as { proof?: Proof };
      const proof = (parsed.proof ?? parsed) as Proof;
      void verifyProof(proof);
    } catch {
      setError("Provided receipt is not valid JSON.");
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setReceipt(content);
      setFileName(file.name);
      verifyPasted(content);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verify a receipt"
        description="Verify it yourself. Recompute a receipt's cryptographic proofs against the notary's public key and its external anchor, right here in your browser."
      />

      {/* Primary: verify by event ID */}
      <Card className="animate-float-up">
        <div className="space-y-5">
          <div className="h-px accent-hairline -mx-5 -mt-5" />

          <div className="space-y-1">
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Verify by event ID
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Enter an event ID and we'll pull its proof from the ledger and check it for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1">
              <Field label="Event ID">
                <TextInput
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && eventId.trim()) void fetchAndVerify();
                  }}
                  placeholder="e.g. BAL-778812"
                />
              </Field>
            </div>
            <Button
              variant="primary"
              size="md"
              loading={loading}
              disabled={!eventId.trim()}
              onClick={() => void fetchAndVerify()}
              className="justify-center sm:w-auto"
            >
              <IconShieldCheck className="w-4 h-4" />
              <span>Verify</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Secondary: upload a receipt file */}
      <Card>
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Upload a receipt file
            </h2>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Have a receipt saved as a file? Drop it here to verify it locally.
            </p>
          </div>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className="block cursor-pointer border-2 border-dashed rounded-babit-lg px-6 py-10 text-center transition-colors"
            style={{
              borderColor: dragActive ? "var(--brand-accent)" : "var(--border)",
              backgroundColor: dragActive
                ? "color-mix(in srgb, var(--brand-accent) 8%, transparent)"
                : "var(--secondary)",
            }}
          >
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div
              className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: "var(--border)", color: "var(--muted)" }}
            >
              <IconFileText className="w-5 h-5" />
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--fg)" }}>
              {fileName ? fileName : "Drop a .json receipt here"}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              or click to choose a file
            </div>
          </label>
        </div>
      </Card>

      {/* Advanced: paste receipt JSON */}
      <Card>
        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
        >
          <div className="space-y-0.5">
            <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Paste receipt JSON
            </span>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              For advanced use. Paste the raw receipt or proof JSON directly.
            </p>
          </div>
          <span
            className="shrink-0 transition-transform"
            style={{
              color: "var(--muted)",
              transform: showPaste ? "rotate(180deg)" : "none",
              display: "inline-flex",
            }}
          >
            <IconChevronDown className="w-4 h-4" />
          </span>
        </button>

        {showPaste && (
          <div className="mt-4 space-y-4">
            <TextArea
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder='Paste receipt or proof JSON here: {"event": { ... }, "merkle_root": "..."}'
              className="h-32 text-xs"
            />
            <Button
              variant="secondary"
              size="md"
              loading={loading}
              disabled={!receipt.trim()}
              onClick={() => verifyPasted()}
              className="w-full justify-center"
            >
              <IconShieldCheck className="w-4 h-4" />
              <span>Verify pasted receipt</span>
            </Button>
          </div>
        )}
      </Card>

      {error && <Error message={error} />}

      {/* Verification Report */}
      {result && <VerificationReport result={result} />}
    </div>
  );
}

function VerificationReport({ result }: { result: VResp }) {
  const verdictColor = result.valid ? "var(--color-verified)" : "var(--color-failed)";

  return (
    <Card
      title="Verification report"
      subtitle="Recomputed independently, so no trust in Babit is required."
    >
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
          {result.valid ? (
            <IconShieldCheck className="w-5 h-5 shrink-0" />
          ) : (
            <IconShieldAlert className="w-5 h-5 shrink-0" />
          )}
          <div>
            <div className="text-sm font-semibold">
              {result.valid ? "Verified. All checks passed." : "Verification failed"}
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
                  <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>
                    {c.label}
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {c.desc}
                  </p>
                </div>
                <StatusPill ok={ok} label={ok ? "VALID" : "FAILED"} />
              </div>
            );
          })}
        </div>

        {result.reason && <Error message={`Failure reason: ${result.reason}`} />}

        <div
          className="pt-3 flex items-center justify-end gap-1.5 text-[11px]"
          style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--muted)" }}
        >
          <span style={{ color: "var(--color-verified)" }}>
            <IconCheck className="w-3.5 h-3.5" />
          </span>
          <span>Independent verification complete</span>
        </div>
      </div>
    </Card>
  );
}
