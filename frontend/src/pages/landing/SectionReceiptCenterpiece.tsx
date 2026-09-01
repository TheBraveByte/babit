import { useState } from "react";
import { IconCheck, IconCopy } from "@/lib/icons";

export function SectionReceiptCenterpiece() {
  const [expandedHex, setExpandedHex] = useState(false);
  const [copied, setCopied] = useState(false);

  const receiptData = {
    receipt_id: "rcpt_BAL_778812",
    action: "approve_payout",
    amount_usd: 4200.0,
    claim_id: "CLM-48102",
    agent: "claims-agent",
    principal_authorizer: "usr_alice",
    grant_ticket: "BAL-ROOT-100200",
    execution_surface: "SURFACE_BROWSER",
    event_sha256: "0xd8291a849102c9184a8b7c120934812a849102c9184a8b7c120934812a849102",
    prev_link_sha256: "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102",
    merkle_root: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notary_ed25519: "ed25519:5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b",
    timestamp: "2026-09-01T14:32:08.492Z",
    rfc3161_tsa: "VERIFIED_TIME_STAMP_AUTHORITY_ATTESTED",
  };

  const copyReceipt = () => {
    navigator.clipboard?.writeText(JSON.stringify(receiptData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            STANDARDIZED EVIDENCE RECEIPT
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Every consequential action leaves evidence.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            A Babit receipt combines the clarity of a financial transaction, the precision of a Git commit,
            and the cryptographic rigor of a notary seal.
          </p>
        </div>

        {/* Centerpiece Receipt Card */}
        <div
          className="max-w-3xl mx-auto rounded-babit-lg shadow-sm overflow-hidden font-mono text-xs"
          style={{
            backgroundColor: "var(--surface)",
            border: "1.5px solid var(--fg)",
          }}
        >
          {/* Top Bar */}
          <div
            className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
            style={{
              borderBottom: "1px solid var(--border-subtle)",
              backgroundColor: "var(--secondary)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="font-bold text-sm" style={{ color: "var(--fg)" }}>
                {receiptData.receipt_id}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                VERIFIED SEAL
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpandedHex(!expandedHex)}
                className="px-2.5 py-1 rounded-babit-sm border text-[11px] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                style={{ borderColor: "var(--border)", color: "var(--muted)" }}
              >
                {expandedHex ? "Hide full hex" : "Show full hex"}
              </button>

              <button
                onClick={copyReceipt}
                className="px-2.5 py-1 rounded-babit-sm border text-[11px] hover:bg-[var(--surface)] transition-colors cursor-pointer inline-flex items-center gap-1"
                style={{ borderColor: "var(--border)", color: "var(--fg)" }}
              >
                {copied ? <IconCheck className="w-3 h-3 text-emerald-600" /> : <IconCopy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy JSON"}</span>
              </button>
            </div>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Action and Execution Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Action</span>
                <span className="font-semibold text-sm font-sans" style={{ color: "var(--fg)" }}>{receiptData.action}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Financial Value</span>
                <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>$4,200.00 USD</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Target Claim</span>
                <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>{receiptData.claim_id}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Timestamp</span>
                <span className="text-sm tnum" style={{ color: "var(--fg)" }}>14:32:08 UTC</span>
              </div>
            </div>

            {/* Authority Chain Link */}
            <div
              className="p-4 rounded-babit space-y-2"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold" style={{ color: "var(--fg)" }}>
                  Authority Chain: usr_alice → claims-orchestrator → claims-agent
                </span>
                <span className="text-emerald-700 font-bold">Grant: {receiptData.grant_ticket}</span>
              </div>
              <p className="text-[11px] font-sans" style={{ color: "var(--muted)" }}>
                Verified human supervisor signature on root grant. Action amount is within the $50,000 ceiling.
              </p>
            </div>

            {/* Cryptographic Hashes */}
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
                  Event Payload SHA-256 Digest
                </span>
                <div
                  className="p-2.5 rounded-babit-sm font-mono text-xs break-all"
                  style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  {expandedHex ? receiptData.event_sha256 : `${receiptData.event_sha256.slice(0, 22)}…${receiptData.event_sha256.slice(-16)}`}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
                  Ed25519 Notary Ledger Signature
                </span>
                <div
                  className="p-2.5 rounded-babit-sm font-mono text-xs break-all"
                  style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                    color: "var(--fg)",
                  }}
                >
                  {expandedHex ? receiptData.notary_ed25519 : `${receiptData.notary_ed25519.slice(0, 26)}…${receiptData.notary_ed25519.slice(-16)}`}
                </div>
              </div>
            </div>

            {/* Bottom Proof Status */}
            <div
              className="pt-4 flex flex-wrap items-center justify-between gap-3 text-[11px]"
              style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--muted)" }}
            >
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <IconCheck className="w-4 h-4 text-emerald-600" />
                <span>Included in Merkle Tree Root (RFC 3161 TSA Attested)</span>
              </div>
              <span>Self-contained offline verification</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
