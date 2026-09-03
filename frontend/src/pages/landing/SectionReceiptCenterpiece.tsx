import { useState } from "react";
import { IconCheck, IconCopy } from "@/lib/icons";
import { Section, SectionHeader, LandingCard } from "./Section";

export function SectionReceiptCenterpiece() {
  const [expandedHex, setExpandedHex] = useState(false);
  const [copied, setCopied] = useState(false);

  const receiptData = {
    receipt_id: "rcpt_BAL_778812",
    action: "approve_payout",
    amount_usd: 4200.0,
    claim_id: "CLM-48102",
    agent: "claims-agent",
    principal_authorizer: "Alice, Risk Supervisor",
    grant_ticket: "BAL-ROOT-100200",
    event_sha256: "0xd8291a849102c9184a8b7c120934812a849102c9184a8b7c120934812a849102",
    signature: "5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b",
    timestamp: "2026-09-01T14:32:08.492Z",
  };

  const copyReceipt = () => {
    navigator.clipboard?.writeText(JSON.stringify(receiptData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Section id="receipt" tone="raised">
      <SectionHeader
        eyebrow="The receipt"
        align="center"
        title="Every action leaves a receipt you can read."
        lead="What happened, who did it, who allowed it, and when. The proof sits quietly underneath."
      />

      <div className="mt-14">
        <div className="max-w-3xl mx-auto">
          <LandingCard padding="none" emphasis="raised" className="overflow-hidden">
            {/* Top bar */}
            <div
              className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-semibold text-sm" style={{ color: "var(--fg)" }}>
                  {receiptData.receipt_id}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-babit-sm"
                  style={{ color: "var(--color-verified)", backgroundColor: "var(--color-verified-bg)", border: "1px solid var(--color-verified-border)" }}
                >
                  <IconCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedHex(!expandedHex)}
                  className="px-2.5 py-1 rounded-babit-sm border text-[11px] font-mono hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  {expandedHex ? "Hide the proof" : "Show the proof"}
                </button>

                <button
                  onClick={copyReceipt}
                  className="px-2.5 py-1 rounded-babit-sm border text-[11px] font-mono hover:bg-[var(--secondary)] transition-colors cursor-pointer inline-flex items-center gap-1"
                  style={{ borderColor: "var(--border)", color: "var(--fg)" }}
                >
                  {copied ? <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3 h-3" /></span> : <IconCopy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Receipt body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Plain-language summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2">
                  <span className="type-eyebrow block mb-1">What happened</span>
                  <span className="font-medium text-[15px]" style={{ color: "var(--fg)" }}>Approved a $4,200 payout</span>
                </div>
                <div>
                  <span className="type-eyebrow block mb-1">On</span>
                  <span className="font-medium text-sm" style={{ color: "var(--fg)" }}>Claim {receiptData.claim_id}</span>
                </div>
                <div>
                  <span className="type-eyebrow block mb-1">When</span>
                  <span className="text-sm tnum" style={{ color: "var(--fg)" }}>Sep 1, 14:32 UTC</span>
                </div>
                <div>
                  <span className="type-eyebrow block mb-1">Who did it</span>
                  <span className="font-medium text-sm" style={{ color: "var(--fg)" }}>{receiptData.agent}</span>
                </div>
                <div className="col-span-2">
                  <span className="type-eyebrow block mb-1">Who allowed it</span>
                  <span className="font-medium text-sm" style={{ color: "var(--fg)" }}>{receiptData.principal_authorizer}</span>
                </div>
              </div>

              {/* Authority note */}
              <div
                className="p-4 rounded-babit space-y-1"
                style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
                  <span className="font-medium" style={{ color: "var(--fg)" }}>
                    Alice authorized claims-agent, which authorized this payout.
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: "var(--color-verified)" }}>
                    permission {receiptData.grant_ticket}
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: "var(--muted)" }}>
                  The payout of $4,200 was within Alice's $50,000 limit.
                </p>
              </div>

              {/* The proof, secondary and muted */}
              <div className="space-y-3 pt-1">
                <span className="type-eyebrow block">The proof</span>
                <div>
                  <span className="text-[11px] block mb-0.5" style={{ color: "var(--muted)" }}>
                    Fingerprint of the record
                  </span>
                  <div
                    className="p-2.5 rounded-babit-sm font-mono text-xs break-all"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    {expandedHex ? receiptData.event_sha256 : `${receiptData.event_sha256.slice(0, 22)}…${receiptData.event_sha256.slice(-16)}`}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] block mb-0.5" style={{ color: "var(--muted)" }}>
                    babit's signature on it
                  </span>
                  <div
                    className="p-2.5 rounded-babit-sm font-mono text-xs break-all"
                    style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)", color: "var(--muted)" }}
                  >
                    {expandedHex ? receiptData.signature : `${receiptData.signature.slice(0, 26)}…${receiptData.signature.slice(-16)}`}
                  </div>
                </div>
              </div>

              {/* Bottom status */}
              <div
                className="pt-4 flex flex-wrap items-center justify-between gap-3 text-[12px]"
                style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--muted)" }}
              >
                <div className="flex items-center gap-1.5 font-medium" style={{ color: "var(--color-verified)" }}>
                  <IconCheck className="w-4 h-4" />
                  <span>Sealed and time-stamped</span>
                </div>
                <span>Anyone can check it, no account needed</span>
              </div>
            </div>
          </LandingCard>
        </div>
      </div>
    </Section>
  );
}
