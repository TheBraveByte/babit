import { useState } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";

export function SectionVerifyRecord() {
  const [verifying, setVerifying] = useState(false);

  const runVerification = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
    }, 700);
  };

  return (
    <section className="py-24 sm:py-32 border-t border-[#E8E8E5] bg-[#FCFCFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
            INDEPENDENT VERIFIER
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#111111] leading-tight">
            Verify the record.
          </h2>
          <p className="text-[18px] sm:text-[19px] text-[#6B6B6B] leading-relaxed">
            Verification performs deterministic mathematical checks across the cryptographic signature,
            hash-chain continuity, and grant authority bounds.
          </p>
        </div>

        {/* Verification Card */}
        <div className="max-w-2xl mx-auto bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg p-6 sm:p-8 space-y-6 shadow-xs font-mono text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F0F0ED]">
            <div>
              <span className="text-[11px] text-[#6B6B6B] uppercase block">TARGET RECEIPT</span>
              <span className="font-semibold text-[#111111] text-sm">rcpt_BAL_778812.json</span>
            </div>

            <button
              onClick={runVerification}
              disabled={verifying}
              className="px-3.5 py-1.5 rounded-babit-sm bg-[#111111] text-white hover:bg-[#222222] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <IconRefresh className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
              <span>{verifying ? "Verifying..." : "Re-run Verification"}</span>
            </button>
          </div>

          {/* Verification checklist */}
          <div className="space-y-3">
            <div className="p-3 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#111111]">Signature</span>
                <span className="text-[#6B6B6B] ml-2">(Ed25519 notary certificate)</span>
              </div>
              <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                {verifying ? "Checking..." : <><IconCheck className="w-3.5 h-3.5" /> VALID</>}
              </span>
            </div>

            <div className="p-3 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#111111]">Integrity</span>
                <span className="text-[#6B6B6B] ml-2">(SHA-256 hash-chain intact)</span>
              </div>
              <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                {verifying ? "Checking..." : <><IconCheck className="w-3.5 h-3.5" /> VALID</>}
              </span>
            </div>

            <div className="p-3 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#111111]">Authority</span>
                <span className="text-[#6B6B6B] ml-2">(Within grant scope and limit)</span>
              </div>
              <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                {verifying ? "Checking..." : <><IconCheck className="w-3.5 h-3.5" /> VALID</>}
              </span>
            </div>
          </div>

          {/* Outcome */}
          <div className="pt-2">
            <div className="p-3 rounded-babit bg-emerald-50 border border-emerald-200 text-center font-bold text-xs text-emerald-800 flex items-center justify-center gap-2">
              <IconCheck className="w-4 h-4 text-emerald-700" />
              <span>VERIFIED: 100% CRYPTOGRAPHICALLY AUTHENTIC</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
