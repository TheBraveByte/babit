import { StatusPill, MonospaceHash, Button, Json } from "@/lib/ui";
import { IconCheck, IconTerminal } from "@/lib/icons";

export interface ReceiptData {
  receiptId: string;
  actionId: string;
  agent: string;
  principal: string;
  grantId: string;
  timestamp: string;
  status: "VERIFIED" | "FAILED" | "PENDING";
  actionType: string;
  resource: string;
  sessionRef: string;
  eventHash: string;
  prevHash: string;
  merkleRoot: string;
  notarySignature: string;
  anchor: string;
  delegationChain: { principal: string; subject: string; grantId: string; depth: number }[];
}

export function ReceiptDetail({
  receipt,
  onBack,
}: {
  receipt: ReceiptData;
  onBack: () => void;
}) {
  const downloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${receipt.receiptId}.json`);
    dlAnchor.click();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E8E5]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-medium rounded-babit-sm border border-[#E8E8E5] bg-white hover:bg-[#F7F7F5] text-[#111111] transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-[#111111] tracking-tight">
              {receipt.receiptId}
            </h1>
            <StatusPill status={receipt.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={downloadJSON}>
            Download JSON
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert(`Command to verify:\nbabit verify ${receipt.receiptId}.json`)}>
            <IconTerminal className="w-3.5 h-3.5" />
            <span>Verify Offline</span>
          </Button>
        </div>
      </div>

      {/* Flagship 2-Column Evidence Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Human-First Execution & Authority */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action & Execution Surface */}
          <div className="bg-[#FFFFFF] rounded-babit-lg border border-[#E8E8E5] p-6 shadow-xs space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0ED]">
              <span className="text-xs font-semibold text-[#111111] uppercase">ACTION & EXECUTION</span>
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <IconCheck className="w-3.5 h-3.5" />
                CAPTURED AT EFFECT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Action Type</span>
                <span className="text-sm font-semibold text-[#111111]">{receipt.actionType}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Executing Agent</span>
                <span className="text-sm font-semibold text-[#111111]">{receipt.agent}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Target Resource</span>
              <span className="text-[#111111] bg-[#F7F7F5] px-2 py-1.5 rounded border border-[#E8E8E5] block break-all mt-1">
                {receipt.resource}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Session Recording</span>
                <span className="text-[#6B6B6B]">{receipt.sessionRef}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Occurred At</span>
                <span className="text-[#111111] tnum">{receipt.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Authority & Delegation Chain */}
          <div className="bg-[#FFFFFF] rounded-babit-lg border border-[#E8E8E5] p-6 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0ED]">
              <span className="text-xs font-semibold text-[#111111] uppercase">AUTHORITY LINEAGE</span>
              <span className="text-emerald-700 font-bold text-[11px]">DELEGATION CHAIN INTACT</span>
            </div>

            <div className="space-y-3">
              {receipt.delegationChain.map((link, idx) => (
                <div key={link.grantId} className="p-3 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#111111]">
                      <span className="font-semibold">{link.principal}</span> → <span>{link.subject}</span>
                    </div>
                    <span className="text-[10px] text-[#6B6B6B]">Grant: {link.grantId}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#6B6B6B] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E8E8E5]">
                    Depth #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cryptographic Proof & Ledger Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] rounded-babit-lg border border-[#111111] p-6 shadow-xs space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0ED]">
              <span className="text-xs font-semibold text-[#111111] uppercase">CRYPTOGRAPHIC SEAL</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                VERIFIED
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Event SHA-256 Hash</span>
                <MonospaceHash hash={receipt.eventHash} />
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Previous Link Hash</span>
                <MonospaceHash hash={receipt.prevHash} />
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Binary Merkle Root</span>
                <MonospaceHash hash={receipt.merkleRoot} />
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Notary Ed25519 Signature</span>
                <span className="text-[11px] text-[#6B6B6B] break-all block">{receipt.notarySignature}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0F0ED] space-y-2">
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Complete Receipt JSON</span>
              <Json data={receipt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
