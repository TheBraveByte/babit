import { useState } from "react";
import { StatusPill, Copyable, Json, MonospaceHash } from "@/lib/ui";
import { IconSearch } from "@/lib/icons";

interface ActivityItem {
  id: string;
  time: string;
  timestamp: string;
  agent: string;
  action: string;
  principal: string;
  grantId: string;
  status: "VERIFIED" | "FAILED" | "PENDING";
  receipt: string;
  sessionRef: string;
  eventHash: string;
  payload: Record<string, unknown>;
}

const mockActivity: ActivityItem[] = [
  {
    id: "act_48102",
    time: "10:42:19",
    timestamp: "2026-09-01T10:42:19.492Z",
    agent: "claims-agent",
    action: "approve_claim",
    principal: "Yusuf (Risk Lead)",
    grantId: "BAL-DEL-8921",
    status: "VERIFIED",
    receipt: "rcpt_9821a084",
    sessionRef: "slr://session/rec_49102",
    eventHash: "0xd8291a849102c9184a8b7c120934812a",
    payload: {
      claim_id: "CLM-48102",
      amount_usd: 4200.0,
      approved_by_agent: "claims-agent",
      underwriter_grant: "BAL-DEL-8921",
    },
  },
  {
    id: "act_48101",
    time: "10:39:12",
    timestamp: "2026-09-01T10:39:12.104Z",
    agent: "browser-agent",
    action: "upload_document",
    principal: "claims-agent",
    grantId: "BAL-DEL-4910",
    status: "VERIFIED",
    receipt: "rcpt_44b19ca2",
    sessionRef: "slr://session/rec_49101",
    eventHash: "0x12c4e81048b1092a9b71029c481028ab",
    payload: {
      document_type: "repair_estimate_pdf",
      target_url: "https://underwriting.internal.corp/docs",
      content_sha256: "0x4a18fbc0192a8b",
    },
  },
  {
    id: "act_48100",
    time: "10:35:01",
    timestamp: "2026-09-01T10:35:01.821Z",
    agent: "triage-agent",
    action: "extract_metadata",
    principal: "Yusuf (Risk Lead)",
    grantId: "BAL-ROOT-0091",
    status: "VERIFIED",
    receipt: "rcpt_1190ca49",
    sessionRef: "slr://session/rec_49100",
    eventHash: "0x98b155da102847192bc4910284710293",
    payload: {
      source_claim: "CLM-48102",
      extracted_entities: ["vehicle_vin", "damage_severity_high", "bodily_injury_none"],
    },
  },
  {
    id: "act_48099",
    time: "10:28:44",
    timestamp: "2026-09-01T10:28:44.912Z",
    agent: "fraud-scanner",
    action: "flag_anomaly",
    principal: "Yusuf (Risk Lead)",
    grantId: "BAL-ROOT-0091",
    status: "PENDING",
    receipt: "rcpt_77ab3102",
    sessionRef: "slr://session/rec_48099",
    eventHash: "0x44d019ac77102948192ba48102948102",
    payload: {
      anomaly_score: 0.14,
      threshold: 0.65,
      verdict: "clear_for_fast_track",
    },
  },
  {
    id: "act_48098",
    time: "10:14:20",
    timestamp: "2026-09-01T10:14:20.301Z",
    agent: "unauthorized-worker",
    action: "execute_payout",
    principal: "Alex (Ops)",
    grantId: "BAL-DEL-1092",
    status: "FAILED",
    receipt: "rcpt_90812e11",
    sessionRef: "slr://session/rec_48098",
    eventHash: "0x55aa27710ea49102847192ba48102938",
    payload: {
      error: "Scope violation: amount $75,000 exceeds maximum allowable grant of $10,000",
      revocation_reason: "UNAUTHORIZED_CAPABILITY",
    },
  },
];

export function Activity() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);

  const filtered = mockActivity.filter((item) => {
    const matchesSearch =
      item.agent.toLowerCase().includes(search.toLowerCase()) ||
      item.action.toLowerCase().includes(search.toLowerCase()) ||
      item.principal.toLowerCase().includes(search.toLowerCase()) ||
      item.grantId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Activity Log</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Dense audit trail of all captured agent actions, delegation references, and sealed receipts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200 shadow-xs">
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agent, action, or grant ID…"
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 bg-neutral-50/50 outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "VERIFIED", "PENDING", "FAILED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/80"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Time</th>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                <th className="px-4 py-2.5 font-medium">Action</th>
                <th className="px-4 py-2.5 font-medium">Principal</th>
                <th className="px-4 py-2.5 font-medium">Grant ID</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelectedItem(row)}
                  className={`hover:bg-neutral-50 transition-colors cursor-pointer ${
                    selectedItem?.id === row.id ? "bg-neutral-100/70" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-neutral-500 tnum">{row.time}</td>
                  <td className="px-4 py-3 font-semibold text-neutral-900">{row.agent}</td>
                  <td className="px-4 py-3 text-neutral-700">{row.action}</td>
                  <td className="px-4 py-3 text-neutral-500">{row.principal}</td>
                  <td className="px-4 py-3 text-neutral-600">{row.grantId}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Copyable value={row.receipt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Modal / Peek Panel */}
      {selectedItem && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white border-l border-neutral-200 shadow-2xl z-50 p-6 overflow-y-auto space-y-6 animate-slide-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Action Evidence Detail</span>
              <h2 className="text-base font-semibold font-mono text-neutral-900">{selectedItem.id}</h2>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Verification Verdict</span>
              <div className="mt-1">
                <StatusPill status={selectedItem.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Occurred At</span>
                <span className="text-neutral-900 text-[11px]">{selectedItem.timestamp}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Agent Target</span>
                <span className="text-neutral-900 font-semibold">{selectedItem.agent}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Authorization Scope Reference</span>
              <span className="text-neutral-900">{selectedItem.grantId}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Event SHA-256 Hash</span>
              <MonospaceHash hash={selectedItem.eventHash} />
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Session Replay Ref</span>
              <span className="text-neutral-700 text-[11px]">{selectedItem.sessionRef}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Action Payload JSON</span>
              <div className="mt-1">
                <Json data={selectedItem.payload} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
