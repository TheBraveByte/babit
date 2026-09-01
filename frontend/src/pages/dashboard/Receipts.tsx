import { useState } from "react";
import { ReceiptDetail, type ReceiptData } from "./ReceiptDetail";
import { StatusPill, EmptyState } from "@/lib/ui";
import { IconSearch, IconFileText } from "@/lib/icons";

const mockReceipts: ReceiptData[] = [
  {
    receiptId: "rcpt_BAL_778812",
    actionId: "act_payout_authorized_491",
    agent: "claims-agent",
    principal: "usr_alice (Risk Supervisor)",
    grantId: "BAL-DEL-8921",
    timestamp: "2026-09-01T14:32:08.492Z",
    status: "VERIFIED",
    actionType: "claims.approve_payout",
    resource: "https://internal.bank.io/claims/48102",
    sessionRef: "slr://session/89231",
    eventHash: "0xd8291a849102c9184a8b7c120934812a849102c9184a8b7c120934812a849102",
    prevHash: "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b",
    anchor: "UTC-20260901-1432-ATTESTED",
    delegationChain: [
      { principal: "usr_alice (Risk Supervisor)", subject: "claims-orchestrator", grantId: "BAL-ROOT-100200", depth: 3 },
      { principal: "claims-orchestrator", subject: "claims-agent", grantId: "BAL-DEL-417849", depth: 2 },
      { principal: "claims-agent", subject: "payout-executor", grantId: "BAL-DEL-8921", depth: 1 },
    ],
  },
  {
    receiptId: "rcpt_BAL_778811",
    actionId: "act_upload_doc_481",
    agent: "browser-worker",
    principal: "claims-agent",
    grantId: "BAL-DEL-4910",
    timestamp: "2026-09-01T14:28:44.104Z",
    status: "VERIFIED",
    actionType: "browser.upload",
    resource: "https://internal.bank.io/docs",
    sessionRef: "slr://session/89230",
    eventHash: "0x12c4e81048b1092a9b71029c481028ab12c4e81048b1092a9b71029c481028ab",
    prevHash: "0x98b155da102847192bc491028471029398b155da102847192bc4910284710293",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:77ca49120934812a849102c9184a8b7c120934812a849102c9184a8b7c1299aa",
    anchor: "UTC-20260901-1428-ATTESTED",
    delegationChain: [
      { principal: "usr_alice", subject: "claims-agent", grantId: "BAL-ROOT-100200", depth: 2 },
      { principal: "claims-agent", subject: "browser-worker", grantId: "BAL-DEL-4910", depth: 1 },
    ],
  },
  {
    receiptId: "rcpt_BAL_778810",
    actionId: "act_metadata_extract_90",
    agent: "triage-agent",
    principal: "usr_alice",
    grantId: "BAL-ROOT-100200",
    timestamp: "2026-09-01T14:19:02.821Z",
    status: "VERIFIED",
    actionType: "document.ocr_extract",
    resource: "https://internal.bank.io/claims/48102",
    sessionRef: "slr://session/89229",
    eventHash: "0x98b155da102847192bc491028471029398b155da102847192bc4910284710293",
    prevHash: "0x3918fbc0192a8b71029c481028ab3918fbc0192a8b71029c481028ab3918fbc0",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:39f1001a0934812a849102c9184a8b7c120934812a849102c9184a8b7c120011",
    anchor: "UTC-20260901-1419-ATTESTED",
    delegationChain: [
      { principal: "usr_alice", subject: "triage-agent", grantId: "BAL-ROOT-100200", depth: 1 },
    ],
  },
];

export function Receipts() {
  const [search, setSearch] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);

  if (activeReceipt) {
    return <ReceiptDetail receipt={activeReceipt} onBack={() => setActiveReceipt(null)} />;
  }

  const filtered = mockReceipts.filter(
    (r) =>
      r.receiptId.toLowerCase().includes(search.toLowerCase()) ||
      r.actionId.toLowerCase().includes(search.toLowerCase()) ||
      r.agent.toLowerCase().includes(search.toLowerCase()) ||
      r.principal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Receipts
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Cryptographically signed receipts containing action hashes, Merkle roots, and delegation authority.
        </p>
      </div>

      {/* Search */}
      <div
        className="p-3 rounded-babit shadow-xs"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipts by ID, agent, or hash…"
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-babit-sm outline-none transition-colors"
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          />
        </div>
      </div>

      {/* Receipts Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No receipts match your search"
          description="Try searching with a different receipt ID, agent name, or hash identifier."
          icon={<IconFileText className="w-5 h-5" />}
        />
      ) : (
        <div
          className="rounded-babit-lg shadow-xs overflow-hidden"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead
                className="text-[11px]"
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "var(--muted)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <tr>
                  <th className="px-5 py-3 font-medium">Receipt</th>
                  <th className="px-5 py-3 font-medium font-sans">Action Event</th>
                  <th className="px-5 py-3 font-medium">Agent</th>
                  <th className="px-5 py-3 font-medium">Principal</th>
                  <th className="px-5 py-3 font-medium">Timestamp (UTC)</th>
                  <th className="px-5 py-3 font-medium">Merkle Status</th>
                  <th className="px-5 py-3 font-medium text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: "var(--border-subtle)" }}>
                {filtered.map((r) => (
                  <tr
                    key={r.receiptId}
                    onClick={() => setActiveReceipt(r)}
                    className="transition-colors cursor-pointer hover:bg-[var(--secondary)]"
                    style={{ color: "var(--fg)" }}
                  >
                    <td className="px-5 py-3.5 font-semibold font-mono">{r.receiptId}</td>
                    <td className="px-5 py-3.5 font-sans font-medium">{r.actionId}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{r.agent}</td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{r.principal}</td>
                    <td className="px-5 py-3.5 tnum" style={{ color: "var(--muted)" }}>
                      {r.timestamp.split("T")[1]?.replace("Z", "")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-babit-sm font-mono"
                        style={{
                          backgroundColor: "var(--secondary)",
                          border: "1px solid var(--border)",
                          color: "var(--fg)",
                        }}
                      >
                        INCLUDED IN ROOT
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <StatusPill status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
