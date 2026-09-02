import { Card, StatusPill, MonospaceHash, Button, Json } from "@/lib/ui";
import { IconShieldCheck } from "@/lib/icons";
import type { components } from "@/api/schema";
import type { ReactNode } from "react";

type Proof = components["schemas"]["v1Proof"];

/** Label / value row — Stripe transaction-detail style. Values are mono + tnum. */
function Row({ label, value, mono = true }: { label: string; value?: ReactNode; mono?: boolean }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 py-2.5"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span
        className={`sm:col-span-2 text-xs break-all ${mono ? "font-mono tnum" : ""}`}
        style={{ color: empty ? "var(--muted)" : "var(--fg)" }}
      >
        {empty ? "—" : value}
      </span>
    </div>
  );
}

/** Hash row — full value copyable via MonospaceHash, honest dash when absent. */
function HashRow({ label, value }: { label: string; value?: string }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-3 py-2.5"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <span className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className="sm:col-span-2">
        {value ? (
          <MonospaceHash hash={value} />
        ) : (
          <span className="text-xs font-mono" style={{ color: "var(--muted)" }}>—</span>
        )}
      </span>
    </div>
  );
}

export function ReceiptDetail({
  proof,
  onBack,
}: {
  proof: Proof;
  onBack: () => void;
}) {
  const event = proof.event ?? {};
  const chain = proof.delegation_chain ?? [];
  const merklePath = proof.merkle_path ?? [];

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.event_id || "receipt"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const summary = event.action_type
    ? `${event.action_type}${event.surface ? ` · ${event.surface}` : ""}`
    : "Sealed action event";

  return (
    <div className="space-y-6 font-sans">
      {/* Flagship hero */}
      <div className="relative rounded-babit-lg overflow-hidden glass animate-float-up">
        <div className="h-px accent-hairline" />
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Button>
            <Button variant="secondary" size="sm" onClick={downloadJSON}>
              Download JSON
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <span
                className="text-[11px] font-mono uppercase tracking-[0.14em] block"
                style={{ color: "var(--muted)" }}
              >
                Receipt
              </span>
              <h1
                className="text-2xl font-semibold font-mono tracking-[-0.02em] tnum break-all"
                style={{ color: "var(--fg)" }}
              >
                {event.event_id || "Receipt"}
              </h1>
              <p className="text-sm font-mono" style={{ color: "var(--muted)" }}>
                {summary}
              </p>
            </div>
            <StatusPill status="VERIFIED" label="SEALED" />
          </div>
        </div>
      </div>

      {/* Action */}
      <Card title="Action" subtitle="What the agent did, captured at effect.">
        <div className="-mt-1">
          <Row label="Action type" value={event.action_type} mono={false} />
          <Row label="Surface" value={event.surface} mono={false} />
          <Row label="Session" value={event.session_id} />
          <Row label="Sequence" value={event.sequence} />
          <Row label="Grant" value={event.grant_id} />
          <Row label="Occurred at" value={event.occurred_at} />
          <Row label="Recording reference" value={event.recording_ref} />
        </div>
      </Card>

      {/* Authority & delegation */}
      <Card
        title="Authority & delegation"
        subtitle="The chain of grants that authorized this action."
        action={
          <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
            {chain.length} {chain.length === 1 ? "grant" : "grants"}
          </span>
        }
      >
        {chain.length === 0 ? (
          <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
            No delegation chain included in this proof.
          </p>
        ) : (
          <div className="space-y-2.5">
            {chain.map((link, idx) => (
              <div
                key={link.grant_id || idx}
                className="p-3.5 rounded-babit flex items-center justify-between gap-3"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
              >
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-mono truncate" style={{ color: "var(--fg)" }}>
                    <span className="font-semibold">{link.principal_id || "?"}</span>
                    <span style={{ color: "var(--muted)" }}> → </span>
                    <span>{link.subject_id || "?"}</span>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                    Grant {link.grant_id || "—"}
                  </span>
                </div>
                <span
                  className="shrink-0 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-babit-sm"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
                >
                  Depth {idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Execution state */}
      <Card title="Execution" subtitle="State transition recorded around the action.">
        <div className="-mt-1">
          <HashRow label="Pre-state hash" value={event.pre_state_hash} />
          <HashRow label="Post-state hash" value={event.post_state_hash} />
        </div>
      </Card>

      {/* Evidence & verification */}
      <Card
        title="Evidence & verification"
        subtitle="Cryptographic seal binding this event into the ledger."
        action={
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-mono"
            style={{ color: "var(--color-verified)" }}
          >
            <IconShieldCheck className="w-3.5 h-3.5" /> Sealed
          </span>
        }
      >
        <div className="-mt-1">
          <HashRow label="Content hash" value={event.content_hash} />
          <HashRow label="Previous link hash" value={event.prev_hash} />
          <HashRow label="Merkle root" value={proof.merkle_root} />
          <HashRow label="Notary signature" value={event.notary_signature} />
          <Row
            label="Merkle path"
            value={
              merklePath.length > 0
                ? `${merklePath.length} ${merklePath.length === 1 ? "node" : "nodes"}`
                : undefined
            }
          />
        </div>
      </Card>

      {/* External anchor — only when present */}
      {proof.anchor && (
        <Card title="External anchor" subtitle="Independent timestamp anchoring the ledger root.">
          <div className="-mt-1">
            <Row label="Kind" value={proof.anchor.kind} mono={false} />
            <Row label="Anchored at" value={proof.anchor.anchored_at} />
            <HashRow label="Anchored root" value={proof.anchor.root} />
            <HashRow label="Anchor receipt" value={proof.anchor.anchor_receipt} />
          </div>
        </Card>
      )}

      {/* Technical */}
      <Card title="Technical" subtitle="Complete proof payload as returned by the API.">
        <Json data={proof} />
      </Card>
    </div>
  );
}
