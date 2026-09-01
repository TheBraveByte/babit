import { IconCheck, IconXCircle } from "@/lib/icons";

export function SectionLogsVsEvidence() {
  return (
    <section id="product" className="py-24 sm:py-32 border-t border-[#E8E8E5] bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Block */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
            AUTHENTIC EVIDENCE VS PASSIVE LOGS
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#111111] leading-tight">
            Autonomous software needs more than logs.
          </h2>
          <p className="text-[18px] sm:text-[19px] text-[#6B6B6B] leading-relaxed">
            Traditional logs tell you what a system recorded. Babit connects the action to its authority and evidence.
          </p>
        </div>

        {/* Side-by-side comparison: Left Ordinary Log vs Right Babit Evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch font-mono text-xs">
          {/* Left: Ordinary Application Log */}
          <div className="bg-[#F7F7F5] border border-[#E8E8E5] rounded-babit-lg p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E8E5]">
                <span className="font-semibold text-[#111111] uppercase tracking-wider">
                  Traditional Application Log
                </span>
                <span className="text-[#6B6B6B] text-[11px] inline-flex items-center gap-1">
                  <IconXCircle className="w-3.5 h-3.5 text-[#6B6B6B]" />
                  MUTABLE / UNBOUND
                </span>
              </div>

              <div className="p-4 rounded-babit bg-[#FFFFFF] border border-[#E8E8E5] text-[#6B6B6B] space-y-1.5 leading-relaxed overflow-x-auto">
                <div>[2026-09-01T14:32:08Z] INFO claims-service:</div>
                <div>  worker_id="worker_09"</div>
                <div>  msg="payout approved: $4,200.00"</div>
                <div>  claim_id="CLM-48102"</div>
                <div className="text-neutral-400">  // No proof of who authorized worker_09</div>
                <div className="text-neutral-400">  // Log can be edited or deleted in database</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E8E5] text-[11px] text-[#6B6B6B]">
              Passive text logs lack cryptographic signatures, grant delegation chains, and tamper protection.
            </div>
          </div>

          {/* Right: Babit Cryptographic Evidence */}
          <div className="bg-[#FFFFFF] border border-[#111111] rounded-babit-lg p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F0ED]">
                <span className="font-semibold text-[#111111] uppercase tracking-wider">
                  Babit Cryptographic Record
                </span>
                <span className="text-emerald-700 text-[11px] font-bold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                  SEALED & BOUND
                </span>
              </div>

              <div className="p-4 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] text-[#111111] space-y-2 leading-relaxed font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Grant Authority:</span>
                  <span className="font-semibold">BAL-417849 (usr_alice)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Subject Agent:</span>
                  <span className="font-semibold">claims-agent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Action Payload Hash:</span>
                  <span className="text-[#111111]">0x12c4e8...028ab</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Notary Signature:</span>
                  <span className="text-emerald-700 font-semibold">ed25519:5c82a1...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B6B6B]">Merkle Root:</span>
                  <span>0x9f83dc...c712</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0F0ED] text-[11px] text-[#111111] font-medium flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Mathematically bound to the authorizing human with non-repudiation.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
