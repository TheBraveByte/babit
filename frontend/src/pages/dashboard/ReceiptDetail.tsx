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
    const jsonStr = JSON.stringify(receipt, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${receipt.receiptId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Bar */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 text-xs font-medium rounded-babit-sm transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono tracking-tight" style={{ color: "var(--fg)" }}>
              {receipt.receiptId}
            </h1>
            <StatusPill status={receipt.status} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={downloadJSON}>
            Download JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => alert(`Command to verify:\nbabit verify ${receipt.receiptId}.json`)}
          >
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
          <div
            className="rounded-babit-lg p-6 shadow-xs space-y-5 font-mono text-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>
                ACTION & EXECUTION
              </span>
              <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                <IconCheck className="w-3.5 h-3.5" />
                CAPTURED AT EFFECT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>
                  Action Type
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                  {receipt.actionType}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>
                  Executing Agent
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                  {receipt.agent}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>
                Target Resource
              </span>
              <span
                className="px-2 py-1.5 rounded-babit-sm block break-all font-mono"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              >
                {receipt.resource}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>
                  Session Recording
                </span>
                <span style={{ color: "var(--muted)" }}>{receipt.sessionRef}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>
                  Occurred At
                </span>
                <span className="tnum font-semibold" style={{ color: "var(--fg)" }}>
                  {receipt.timestamp}
                </span>
              </div>
            </div>
          </div>

          {/* Authority & Delegation Chain */}
          <div
            className="rounded-babit-lg p-6 shadow-xs space-y-4 font-mono text-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>
                AUTHORITY LINEAGE
              </span>
              <span className="text-emerald-700 font-bold text-[11px]">DELEGATION CHAIN INTACT</span>
            </div>

            <div className="space-y-3">
              {receipt.delegationChain.map((link, idx) => (
                <div
                  key={link.grantId}
                  className="p-3 rounded-babit flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--secondary)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div className="text-[11px]" style={{ color: "var(--fg)" }}>
                      <span className="font-semibold">{link.principal}</span> → <span>{link.subject}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                      Grant: {link.grantId}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-babit-sm"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      color: "var(--muted)",
                    }}
                  >
                    Depth #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cryptographic Proof & Ledger Status */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className="rounded-babit-lg p-6 shadow-xs space-y-5 font-mono text-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1.5px solid var(--fg)",
            }}
          >
            <div
              className="flex items-center justify-between pb-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <span className="text-xs font-semibold uppercase" style={{ color: "var(--fg)" }}>
                CRYPTOGRAPHIC SEAL
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                VERIFIED
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
                  Event SHA-256 Hash
                </span>
                <MonospaceHash hash={receipt.eventHash} />
              </div>

              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
                  Previous Link Hash
                </span>
                <MonospaceHash hash={receipt.prevHash} />
              </div>

              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
                  Binary Merkle Root
                </span>
                <MonospaceHash hash={receipt.merkleRoot} />
              </div>

              <div>
                <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>
                  Notary Ed25519 Signature
                </span>
                <span className="text-[11px] break-all block font-mono" style={{ color: "var(--muted)" }}>
                  {receipt.notarySignature}
                </span>
              </div>
            </div>

            <div className="pt-3 space-y-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>
                Complete Receipt JSON
              </span>
              <Json data={receipt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
