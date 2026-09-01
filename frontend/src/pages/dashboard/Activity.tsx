import { useState } from "react";
import { StatusPill, Copyable, MonospaceHash, Json } from "@/lib/ui";
import { IconSearch, IconCheck } from "@/lib/icons";

interface ActivityItem {
  id: string;
  actionName: string;
  agent: string;
  principal: string;
  grantId: string;
  time: string;
  timestamp: string;
  status: "VERIFIED" | "FAILED" | "PENDING";
  receipt: string;
  surface: string;
  resource: string;
  eventHash: string;
  prevHash: string;
  notarySig: string;
  payload: Record<string, unknown>;
}

const mockActivity: ActivityItem[] = [
  {
    id: "act_48102",
    actionName: "approve_payout",
    agent: "claims-agent",
    principal: "usr_alice",
    grantId: "BAL-DEL-8921",
    time: "14:32:08 UTC",
    timestamp: "2026-09-01T14:32:08.492Z",
    status: "VERIFIED",
    receipt: "rcpt_BAL_778812",
    surface: "SURFACE_BROWSER",
    resource: "https://internal.bank.io/claims/48102",
    eventHash: "0xd8291a849102c9184a8b7c120934812a849102c9184a8b7c120934812a849102",
    prevHash: "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102",
    notarySig: "ed25519:5c82a10934812a849102c9184a8b7c120934812a849102c9184a8b7c12982f1b",
    payload: {
      claim_id: "CLM-48102",
      amount_usd: 4200.0,
      approved_by_agent: "claims-agent",
      underwriter_grant: "BAL-DEL-8921",
    },
  },
  {
    id: "act_48101",
    actionName: "upload_document",
    agent: "browser-worker",
    principal: "claims-agent",
    grantId: "BAL-DEL-4910",
    time: "14:28:44 UTC",
    timestamp: "2026-09-01T14:28:44.104Z",
    status: "VERIFIED",
    receipt: "rcpt_BAL_778811",
    surface: "SURFACE_BROWSER",
    resource: "https://internal.bank.io/docs",
    eventHash: "0x12c4e81048b1092a9b71029c481028ab12c4e81048b1092a9b71029c481028ab",
    prevHash: "0x98b155da102847192bc491028471029398b155da102847192bc4910284710293",
    notarySig: "ed25519:77ca49120934812a849102c9184a8b7c120934812a849102c9184a8b7c1299aa",
    payload: {
      document_type: "repair_estimate_pdf",
      target_url: "https://internal.bank.io/docs",
      sha256: "0x4a18fbc0192a8b",
    },
  },
  {
    id: "act_48100",
    actionName: "extract_metadata",
    agent: "triage-agent",
    principal: "usr_alice",
    grantId: "BAL-ROOT-100200",
    time: "14:19:02 UTC",
    timestamp: "2026-09-01T14:19:02.821Z",
    status: "VERIFIED",
    receipt: "rcpt_BAL_778810",
    surface: "SURFACE_SANDBOX",
    resource: "https://internal.bank.io/claims/48102",
    eventHash: "0x98b155da102847192bc491028471029398b155da102847192bc4910284710293",
    prevHash: "0x3918fbc0192a8b71029c481028ab3918fbc0192a8b71029c481028ab3918fbc0",
    notarySig: "ed25519:39f1001a0934812a849102c9184a8b7c120934812a849102c9184a8b7c120011",
    payload: {
      source_claim: "CLM-48102",
      extracted_entities: ["vehicle_vin", "damage_severity_high"],
    },
  },
  {
    id: "act_48099",
    actionName: "flag_anomaly",
    agent: "fraud-scanner",
    principal: "usr_alice",
    grantId: "BAL-ROOT-100200",
    time: "13:55:18 UTC",
    timestamp: "2026-09-01T13:55:18.912Z",
    status: "VERIFIED",
    receipt: "rcpt_BAL_778809",
    surface: "SURFACE_SANDBOX",
    resource: "https://internal.bank.io/risk",
    eventHash: "0x44d019ac77102948192ba4810294810244d019ac77102948192ba48102948102",
    prevHash: "0x12c4e81048b1092a9b71029c481028ab12c4e81048b1092a9b71029c481028ab",
    notarySig: "ed25519:9f83dc710934812a849102c9184a8b7c120934812a849102c9184a8b7c124810",
    payload: {
      anomaly_score: 0.12,
      risk_threshold: 0.65,
      verdict: "passed",
    },
  },
];

export function Activity() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);
  const [detailTab, setDetailTab] = useState<"overview" | "authority" | "evidence" | "technical">("overview");

  const filtered = mockActivity.filter((item) => {
    const matchesSearch =
      item.actionName.toLowerCase().includes(search.toLowerCase()) ||
      item.agent.toLowerCase().includes(search.toLowerCase()) ||
      item.principal.toLowerCase().includes(search.toLowerCase()) ||
      item.grantId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#111111] tracking-tight leading-tight">
          Activity
        </h1>
        <p className="text-sm sm:text-[15px] text-[#6B6B6B] mt-1">
          Complete audit trail of all captured agent actions, delegation references, and sealed receipts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFFFF] p-3 rounded-babit border border-[#E8E8E5] shadow-xs">
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, agent, or authorizer..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-babit-sm border border-[#E8E8E5] bg-[#F7F7F5] outline-none focus:border-[#111111] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "VERIFIED", "PENDING", "FAILED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-babit-sm text-xs font-mono font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-[#111111] text-white"
                  : "bg-[#F7F7F5] text-[#6B6B6B] hover:bg-[#E8E8E5]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Data Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F7F7F5] text-[#6B6B6B] border-b border-[#E8E8E5] text-[11px]">
              <tr>
                <th className="px-5 py-3 font-medium font-sans">Action</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Authorizer</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0ED] text-[#111111]">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedItem(row)}
                  className={`hover:bg-[#F7F7F5] transition-colors cursor-pointer ${
                    selectedItem?.id === row.id ? "bg-[#F7F7F5]" : ""
                  }`}
                >
                  <td className="px-5 py-3.5 font-semibold text-[#111111] font-sans">{row.actionName}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B]">{row.agent}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B]">{row.principal}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B] tnum">{row.time}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Copyable value={row.receipt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Action Detail Sheet */}
      {selectedItem && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#FFFFFF] border-l border-[#E8E8E5] shadow-2xl z-50 p-6 overflow-y-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E5]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold font-mono text-[#111111]">{selectedItem.actionName}</h2>
                <StatusPill status={selectedItem.status} />
              </div>
              <span className="text-[11px] font-mono text-[#6B6B6B] block mt-0.5">{selectedItem.timestamp}</span>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-babit-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5] cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#E8E8E5] pb-2 font-mono text-xs">
            {(["overview", "authority", "evidence", "technical"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDetailTab(t)}
                className={`px-3 py-1 rounded-babit-sm capitalize transition-colors cursor-pointer ${
                  detailTab === t ? "bg-[#111111] text-white font-semibold" : "text-[#6B6B6B] hover:text-[#111111]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-4 font-mono text-xs">
            {detailTab === "overview" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Action ID</span>
                  <span className="text-sm font-semibold text-[#111111]">{selectedItem.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Subject Agent</span>
                  <span className="text-[#111111]">{selectedItem.agent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Target Resource</span>
                  <span className="text-[#111111] break-all">{selectedItem.resource}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Execution Surface</span>
                  <span className="text-[#111111]">{selectedItem.surface}</span>
                </div>
              </div>
            )}

            {detailTab === "authority" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Human Supervisor Principal</span>
                  <span className="text-[#111111] font-semibold">{selectedItem.principal}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Grant Ticket Reference</span>
                  <Copyable value={selectedItem.grantId} />
                </div>
                <div className="p-3 rounded-babit bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Authority validated. Action within resource pattern and budget cap.</span>
                </div>
              </div>
            )}

            {detailTab === "evidence" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Event SHA-256 Hash</span>
                  <MonospaceHash hash={selectedItem.eventHash} />
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Sequential Prev Hash</span>
                  <MonospaceHash hash={selectedItem.prevHash} />
                </div>
                <div>
                  <span className="text-[10px] text-[#6B6B6B] uppercase block">Notary Ed25519 Signature</span>
                  <span className="text-[11px] text-[#6B6B6B] break-all block">{selectedItem.notarySig}</span>
                </div>
              </div>
            )}

            {detailTab === "technical" && (
              <div className="space-y-2">
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Raw Action Payload JSON</span>
                <Json data={selectedItem.payload} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
