import { StatusPill, Copyable, MonospaceHash, Button } from "@/lib/ui";
import { IconTerminal } from "@/lib/icons";

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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            ← Back to receipts
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold font-mono text-neutral-900 tracking-tight">
              Receipt #{receipt.receiptId}
            </h1>
            <StatusPill status={receipt.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={downloadJSON}>
            Download JSON
          </Button>
          <Button variant="primary" size="sm" onClick={() => alert(`Offline verify command:\nbabit verify ${receipt.receiptId}.json`)}>
            <IconTerminal className="w-3.5 h-3.5" />
            <span>Verify Offline</span>
          </Button>
        </div>
      </div>

      {/* Grid: 2-column evidence breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Action & Cryptographic Proof */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action Execution Box */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-[11px] font-semibold text-neutral-900 uppercase">
              <span>01. Action Execution</span>
              <span className="text-emerald-700">CAPTURED</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Action ID</span>
                <span className="text-neutral-900 font-bold">{receipt.actionId}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Action Type</span>
                <span className="text-neutral-900">{receipt.actionType}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Target Resource</span>
              <span className="text-neutral-800 break-all">{receipt.resource}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Agent Target</span>
                <span className="text-neutral-900 font-semibold">{receipt.agent}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Timestamp</span>
                <span className="text-neutral-600 tnum">{receipt.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof Box */}
          <div className="bg-neutral-950 text-white rounded-lg border border-neutral-800 p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-[11px] font-semibold text-neutral-200 uppercase">
              <span>02. Cryptographic Attestation</span>
              <span className="text-emerald-400">SEALED IN LEDGER</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Action SHA-256 Hash</span>
              <MonospaceHash hash={receipt.eventHash} />
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Previous Hash Link</span>
              <MonospaceHash hash={receipt.prevHash} />
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Merkle Tree Root</span>
              <MonospaceHash hash={receipt.merkleRoot} />
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Notary Ed25519 Seal</span>
              <span className="text-neutral-300 text-[11px] break-all">{receipt.notarySignature}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">External Timestamp Anchor</span>
              <span className="text-emerald-400 text-[11px]">{receipt.anchor}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Delegation Chain & Session Evidence */}
        <div className="lg:col-span-5 space-y-6">
          {/* Delegation Chain Box */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-[11px] font-semibold text-neutral-900 uppercase">
              <span>03. Delegation Authority Chain</span>
              <span className="text-emerald-700">UNBROKEN</span>
            </div>

            <ol className="space-y-3 border-l-2 border-neutral-200 pl-3">
              {receipt.delegationChain.map((step, idx) => (
                <li key={step.grantId} className="space-y-0.5">
                  <div className="text-[10px] text-neutral-400 uppercase">
                    Level {idx === 0 ? "0 (Root Principal)" : `${idx} (Delegation)`}
                  </div>
                  <div className="text-neutral-900 font-semibold text-xs">
                    {step.principal} → {step.subject}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Grant: <Copyable value={step.grantId} />
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Session Replay Evidence */}
          <div className="bg-white rounded-lg border border-neutral-200 p-5 shadow-xs space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-[11px] font-semibold text-neutral-900 uppercase">
              <span>04. Deterministic Session Replay</span>
              <span className="text-neutral-500">SOLARI RECORDING</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Recording URI</span>
              <span className="text-neutral-800 text-[11px]">{receipt.sessionRef}</span>
            </div>

            <div className="p-2 rounded bg-neutral-50 border border-neutral-200 text-[11px] text-neutral-600">
              The DOM execution frames and network calls are cryptographically linked to this receipt's hash.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
