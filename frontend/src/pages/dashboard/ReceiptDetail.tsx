import { StatusPill, MonospaceHash, Button, Json } from "@/lib/ui";
import { IconCheck, IconShieldCheck } from "@/lib/icons";
import type { components } from "@/api/schema";

type Proof = components["schemas"]["v1Proof"];

/** Truncate a base64/byte string for display; full value copyable via MonospaceHash. */
function ByteRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      {value ? (
        <MonospaceHash hash={value} />
      ) : (
        <span className="text-[11px]" style={{ color: "var(--muted)" }}>—</span>
      )}
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

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-medium rounded-babit-sm transition-colors cursor-pointer"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--fg)" }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-tight tnum" style={{ color: "var(--fg)" }}>
              {event.event_id || "Receipt"}
            </h1>
            <StatusPill status="VERIFIED" label="SEALED" />
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={downloadJSON}>
          Download JSON
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: action + authority */}
        <div className="lg:col-span-7 space-y-6">
          <div
            className="rounded-babit-lg p-6 shadow-xs space-y-5 font-mono text-xs"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>Action &amp; Execution</span>
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <IconCheck className="w-3.5 h-3.5" /> Captured at effect
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Action Type</span>
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{event.action_type || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Surface</span>
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{event.surface || "—"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Session</span>
                <span style={{ color: "var(--fg)" }}>{event.session_id || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Sequence</span>
                <span className="tnum" style={{ color: "var(--fg)" }}>{event.sequence ?? "—"}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Recording Reference</span>
              <span
                className="px-2 py-1.5 rounded-babit-sm block break-all font-mono"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--fg)" }}
              >
                {event.recording_ref || "—"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Grant</span>
                <span style={{ color: "var(--fg)" }}>{event.grant_id || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Occurred At</span>
                <span className="tnum font-semibold" style={{ color: "var(--fg)" }}>{event.occurred_at || "—"}</span>
              </div>
            </div>
          </div>

          {/* Authority lineage */}
          <div
            className="rounded-babit-lg p-6 shadow-xs space-y-4 font-mono text-xs"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>Authority Lineage</span>
              <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                {chain.length} {chain.length === 1 ? "grant" : "grants"}
              </span>
            </div>

            {chain.length === 0 ? (
              <p className="text-[11px]" style={{ color: "var(--muted)" }}>
                No delegation chain included in this proof.
              </p>
            ) : (
              <div className="space-y-3">
                {chain.map((link, idx) => (
                  <div
                    key={link.grant_id || idx}
                    className="p-3 rounded-babit flex items-center justify-between"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
                  >
                    <div>
                      <div className="text-[11px]" style={{ color: "var(--fg)" }}>
                        <span className="font-semibold">{link.principal_id || "?"}</span> → <span>{link.subject_id || "?"}</span>
                      </div>
                      <span className="text-[10px]" style={{ color: "var(--muted)" }}>Grant: {link.grant_id || "—"}</span>
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-babit-sm"
                      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
                    >
                      Depth #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: cryptographic seal */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className="rounded-babit-lg p-6 shadow-xs space-y-5 font-mono text-xs"
            style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--fg)" }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <span className="text-xs font-semibold uppercase flex items-center gap-1.5" style={{ color: "var(--fg)" }}>
                <IconShieldCheck className="w-3.5 h-3.5" /> Cryptographic Seal
              </span>
            </div>

            <div className="space-y-3">
              <ByteRow label="Content Hash" value={event.content_hash} />
              <ByteRow label="Previous Link Hash" value={event.prev_hash} />
              <ByteRow label="Pre-state Hash" value={event.pre_state_hash} />
              <ByteRow label="Post-state Hash" value={event.post_state_hash} />
              <ByteRow label="Merkle Root" value={proof.merkle_root} />
              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Notary Signature</span>
                {event.notary_signature ? (
                  <span className="text-[11px] break-all block font-mono" style={{ color: "var(--muted)" }}>
                    {event.notary_signature}
                  </span>
                ) : (
                  <span className="text-[11px]" style={{ color: "var(--muted)" }}>—</span>
                )}
              </div>
            </div>

            {proof.anchor && (
              <div className="pt-3 space-y-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>External Anchor</span>
                <div className="text-[11px]" style={{ color: "var(--fg)" }}>{proof.anchor.kind || "—"}</div>
                {proof.anchor.anchored_at && (
                  <div className="text-[11px] tnum" style={{ color: "var(--muted)" }}>{proof.anchor.anchored_at}</div>
                )}
              </div>
            )}

            <div className="pt-3 space-y-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Complete Proof JSON</span>
              <Json data={proof} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
