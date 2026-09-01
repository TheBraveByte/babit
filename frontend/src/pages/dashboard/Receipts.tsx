import { useState } from "react";
import { ReceiptDetail, type ReceiptData } from "./ReceiptDetail";
import { StatusPill } from "@/lib/ui";
import { IconSearch } from "@/lib/icons";

const mockReceipts: ReceiptData[] = [
  {
    receiptId: "act_01982",
    actionId: "act_payout_authorized_491",
    agent: "claims-agent",
    principal: "usr_yusuf (Risk Lead)",
    grantId: "BAL-DEL-8921",
    timestamp: "2026-09-01T10:42:19.492Z",
    status: "VERIFIED",
    actionType: "claims.approve_payout",
    resource: "https://underwriting.internal.corp/claims/48102",
    sessionRef: "slr://session/89231",
    eventHash: "0xd8291a849102c9184a8b7c120934812a849102c9184a8b7c120934812a849102",
    prevHash: "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b",
    anchor: "UTC-20260901-1042-ATTESTED",
    delegationChain: [
      { principal: "usr_yusuf (Risk Lead)", subject: "claims-agent", grantId: "BAL-ROOT-0091", depth: 3 },
      { principal: "claims-agent", subject: "browser-worker", grantId: "BAL-DEL-4910", depth: 2 },
      { principal: "browser-worker", subject: "action-executor", grantId: "BAL-DEL-8921", depth: 1 },
    ],
  },
  {
    receiptId: "act_01981",
    actionId: "act_upload_doc_481",
    agent: "browser-agent",
    principal: "claims-agent",
    grantId: "BAL-DEL-4910",
    timestamp: "2026-09-01T10:39:12.104Z",
    status: "VERIFIED",
    actionType: "browser.upload",
    resource: "https://underwriting.internal.corp/docs",
    sessionRef: "slr://session/89230",
    eventHash: "0x12c4e81048b1092a9b71029c481028ab12c4e81048b1092a9b71029c481028ab",
    prevHash: "0x98b155da102847192bc491028471029398b155da102847192bc4910284710293",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:77ca49120934812a849102c9184a8b7c120934812a849102c9184a8b7c1299aa",
    anchor: "UTC-20260901-1039-ATTESTED",
    delegationChain: [
      { principal: "usr_yusuf", subject: "claims-agent", grantId: "BAL-ROOT-0091", depth: 3 },
      { principal: "claims-agent", subject: "browser-agent", grantId: "BAL-DEL-4910", depth: 2 },
    ],
  },
  {
    receiptId: "act_01980",
    actionId: "act_metadata_extract_90",
    agent: "triage-agent",
    principal: "usr_yusuf",
    grantId: "BAL-ROOT-0091",
    timestamp: "2026-09-01T10:35:01.821Z",
    status: "VERIFIED",
    actionType: "document.ocr_extract",
    resource: "https://underwriting.internal.corp/claims/48102",
    sessionRef: "slr://session/89229",
    eventHash: "0x98b155da102847192bc491028471029398b155da102847192bc4910284710293",
    prevHash: "0x3918fbc0192a8b71029c481028ab3918fbc0192a8b71029c481028ab3918fbc0",
    merkleRoot: "0x9f83dc712094812a9b71029c481028ab9f83dc712094812a9b71029c481028ab",
    notarySignature: "ed25519:39f1001a0934812a849102c9184a8b7c120934812a849102c9184a8b7c120011",
    anchor: "UTC-20260901-1035-ATTESTED",
    delegationChain: [
      { principal: "usr_yusuf", subject: "triage-agent", grantId: "BAL-ROOT-0091", depth: 3 },
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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Receipts</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Cryptographically signed receipts containing action hashes, Merkle roots, and delegation authority.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs">
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipts by ID, agent, or hash…"
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 bg-neutral-50/50 outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Receipt</th>
                <th className="px-4 py-2.5 font-medium">Action Event</th>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                <th className="px-4 py-2.5 font-medium">Principal</th>
                <th className="px-4 py-2.5 font-medium">Timestamp (UTC)</th>
                <th className="px-4 py-2.5 font-medium">Merkle Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.map((r) => (
                <tr
                  key={r.receiptId}
                  onClick={() => setActiveReceipt(r)}
                  className="hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-semibold text-neutral-900">{r.receiptId}</td>
                  <td className="px-4 py-3 text-neutral-700">{r.actionId}</td>
                  <td className="px-4 py-3 text-neutral-900 font-medium">{r.agent}</td>
                  <td className="px-4 py-3 text-neutral-500">{r.principal}</td>
                  <td className="px-4 py-3 text-neutral-500 tnum">{r.timestamp.split("T")[1]?.replace("Z", "")}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200">
                      INCLUDED IN ROOT
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StatusPill status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
