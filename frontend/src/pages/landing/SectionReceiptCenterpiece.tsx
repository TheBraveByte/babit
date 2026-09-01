import { useState } from "react";
import { IconCheck, IconCopy } from "@/lib/icons";

export function SectionReceiptCenterpiece() {
  const [copied, setCopied] = useState(false);
  const [expandHashes, setExpandHashes] = useState(false);

  const receiptData = {
    receiptId: "rcpt_BAL_778812_981a",
    action: "claims.approve_payout",
    amount: "$4,200.00 USD",
    resource: "https://internal.bank.io/claims/48102",
    agent: "claims-agent (agt_891024)",
    authorizedBy: "usr_alice (BAL-ROOT-100200)",
    delegationDepth: "Level 2 (via claims-orchestrator)",
    timestamp: "2026-09-01T14:32:08.492Z",
    contentHash: "0xd8291a849102c9184a8b7c120934812a849102c9184a8b7c120934812a849102",
    prevHash: "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b",
    status: "VERIFIED",
  };

  const handleCopy = () => {
    void navigator.clipboard?.writeText(JSON.stringify(receiptData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section className="py-24 sm:py-32 border-t border-[#E8E8E5] bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
            CRYPTO EVIDENCE RECORD
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#111111] leading-tight">
            Every consequential action leaves evidence.
          </h2>
          <p className="text-[18px] sm:text-[19px] text-[#6B6B6B] leading-relaxed">
            The receipt is the permanent, self-contained mathematical proof connecting human authorization,
            agent identity, action execution, and tamper-evident signatures.
          </p>
        </div>

        {/* Centerpiece Large Receipt Box */}
        <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#111111] rounded-babit-lg p-6 sm:p-10 shadow-sm space-y-8 font-mono text-xs">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E8E5]">
            <div>
              <span className="text-[11px] uppercase text-[#6B6B6B] block">OFFICIAL EVIDENCE RECEIPT</span>
              <span className="text-base font-bold text-[#111111]">{receiptData.receiptId}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-babit-sm border border-emerald-200">
                <IconCheck className="w-4 h-4 text-emerald-700" />
                VERIFIED
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-babit-sm border border-[#E8E8E5] text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                title="Copy full receipt JSON"
              >
                {copied ? <IconCheck className="w-4 h-4 text-emerald-700" /> : <IconCopy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 1. Action & 2. Agent */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
            <div>
              <span className="text-xs text-[#6B6B6B] uppercase font-mono block mb-1">1. Action Executed</span>
              <span className="text-base font-semibold text-[#111111] font-mono">{receiptData.action}</span>
              <span className="text-xs text-[#6B6B6B] block mt-0.5 font-mono">{receiptData.amount}</span>
            </div>

            <div>
              <span className="text-xs text-[#6B6B6B] uppercase font-mono block mb-1">2. Acting Agent</span>
              <span className="text-base font-semibold text-[#111111] font-mono">{receiptData.agent}</span>
              <span className="text-xs text-[#6B6B6B] block mt-0.5">Execution surface: SURFACE_BROWSER</span>
            </div>
          </div>

          {/* 3. Authorization & 4. Timestamp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#F0F0ED] font-sans">
            <div>
              <span className="text-xs text-[#6B6B6B] uppercase font-mono block mb-1">3. Authorization Chain</span>
              <span className="text-sm font-semibold text-[#111111] font-mono">{receiptData.authorizedBy}</span>
              <span className="text-xs text-emerald-700 block mt-0.5 font-mono">{receiptData.delegationDepth}</span>
            </div>

            <div>
              <span className="text-xs text-[#6B6B6B] uppercase font-mono block mb-1">4. Timestamp Attestation</span>
              <span className="text-sm font-semibold text-[#111111] font-mono tnum">{receiptData.timestamp}</span>
              <span className="text-xs text-[#6B6B6B] block mt-0.5">Anchored in sequential sequence #8294</span>
            </div>
          </div>

          {/* 5. Verification & 6. Technical Evidence */}
          <div className="pt-6 border-t border-[#F0F0ED] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase text-[#6B6B6B] font-semibold">5 & 6. Cryptographic Hashes & Signatures</span>
              <button
                onClick={() => setExpandHashes(!expandHashes)}
                className="text-[11px] text-[#6B6B6B] hover:text-[#111111] underline cursor-pointer"
              >
                {expandHashes ? "Shorten values" : "Expand full hashes"}
              </button>
            </div>

            <div className="p-4 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] space-y-2 text-[11px] leading-relaxed">
              <div className="flex justify-between gap-4">
                <span className="text-[#6B6B6B] shrink-0">content_hash:</span>
                <span className="text-[#111111] truncate">{expandHashes ? receiptData.contentHash : `${receiptData.contentHash.slice(0, 18)}…${receiptData.contentHash.slice(-10)}`}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6B6B6B] shrink-0">prev_hash:</span>
                <span className="text-[#111111] truncate">{expandHashes ? receiptData.prevHash : `${receiptData.prevHash.slice(0, 18)}…${receiptData.prevHash.slice(-10)}`}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#6B6B6B] shrink-0">merkle_root:</span>
                <span className="text-[#111111] truncate">{expandHashes ? receiptData.merkleRoot : `${receiptData.merkleRoot.slice(0, 18)}…${receiptData.merkleRoot.slice(-10)}`}</span>
              </div>
              <div className="flex justify-between gap-4 pt-1 border-t border-[#E8E8E5]">
                <span className="text-[#6B6B6B] shrink-0">notary_sig:</span>
                <span className="text-emerald-700 font-semibold truncate">{expandHashes ? receiptData.notarySignature : `${receiptData.notarySignature.slice(0, 22)}…`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
