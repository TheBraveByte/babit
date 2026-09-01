import { IconCheck } from "@/lib/icons";

export function SectionOfflineEvidence() {
  return (
    <section id="security" className="py-24 sm:py-32 border-t border-[#E8E8E5] bg-[#FCFCFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
            ZERO VENDOR LOCK-IN
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#111111] leading-tight">
            Evidence that stands on its own.
          </h2>
          <p className="text-[18px] sm:text-[19px] text-[#6B6B6B] leading-relaxed">
            Receipts and inclusion proofs are self-contained. Anyone can verify evidence offline using standard
            cryptographic libraries without relying on Babit's servers.
          </p>
        </div>

        {/* 3-Stage Workflow Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div className="p-6 rounded-babit bg-[#FFFFFF] border border-[#E8E8E5] space-y-3 shadow-2xs">
            <span className="text-[10px] text-[#6B6B6B] uppercase font-bold">STAGE 01</span>
            <h3 className="text-sm font-semibold text-[#111111] font-sans">Babit Dashboard</h3>
            <p className="text-[#6B6B6B] font-sans text-xs leading-relaxed">
              Export sealed action receipts directly from the dashboard or download via the automated audit API.
            </p>
          </div>

          <div className="p-6 rounded-babit bg-[#FFFFFF] border border-[#E8E8E5] space-y-3 shadow-2xs">
            <span className="text-[10px] text-[#6B6B6B] uppercase font-bold">STAGE 02</span>
            <h3 className="text-sm font-semibold text-[#111111] font-sans">Portable JSON Receipt</h3>
            <p className="text-[#6B6B6B] font-sans text-xs leading-relaxed">
              Contains the complete Merkle path, root, parent delegation signatures, and SHA-256 payload hashes.
            </p>
          </div>

          <div className="p-6 rounded-babit bg-[#FFFFFF] border border-[#111111] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-700 uppercase font-bold">STAGE 03</span>
              <span className="text-emerald-700 font-bold">VERIFIED</span>
            </div>
            <h3 className="text-sm font-semibold text-[#111111] font-sans">Independent Verification</h3>
            <p className="text-[#6B6B6B] font-sans text-xs leading-relaxed">
              Run verification locally using the open-source CLI or standard Go/Python/Rust crypto libraries.
            </p>
          </div>
        </div>

        {/* Mini Terminal Demonstration */}
        <div className="max-w-2xl mx-auto rounded-babit-lg border border-[#E8E8E5] bg-[#FFFFFF] shadow-xs overflow-hidden font-mono text-xs">
          <div className="px-4 py-2.5 bg-[#F7F7F5] border-b border-[#E8E8E5] flex items-center justify-between text-[#6B6B6B]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E8E5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E8E5]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8E8E5]" />
              <span className="ml-2 text-[#111111] text-[11px]">terminal</span>
            </div>
            <span className="text-[11px]">babit verify</span>
          </div>

          <div className="p-5 space-y-2 text-[#111111]">
            <div className="text-[#6B6B6B]">$ babit verify receipt_BAL_778812.json --public-key notary.pub</div>
            <div className="text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Signature: Ed25519 valid (notary: 0x9f81a829)</span>
            </div>
            <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Chain: Sequence #8294 hash-linked</span>
            </div>
            <div className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Authority: Valid grant BAL-417849</span>
            </div>
            <div className="pt-2 text-[11px] text-[#6B6B6B] border-t border-[#F0F0ED]">
              Verification concluded in 1.4ms without outbound network calls.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
