import { useState } from "react";
import { StatusPill, Copyable } from "@/lib/ui";
import { IconCpu, IconSearch, IconCheck } from "@/lib/icons";

interface AgentRecord {
  id: string;
  name: string;
  status: "ACTIVE" | "REVOKED";
  supervisor: string;
  capabilities: string[];
  actionsCount: number;
  lastActive: string;
  publicKey: string;
}

const initialAgents: AgentRecord[] = [
  {
    id: "agt_claims_01",
    name: "claims-agent",
    status: "ACTIVE",
    supervisor: "usr_alice",
    capabilities: ["claims.review", "claims.approve_payout", "document.verify"],
    actionsCount: 5820,
    lastActive: "14:32:08 UTC",
    publicKey: "ed25519:9f81a82910bc491028a01928471029c",
  },
  {
    id: "agt_browser_worker",
    name: "browser-worker",
    status: "ACTIVE",
    supervisor: "claims-agent",
    capabilities: ["browser.click", "browser.type", "page.navigate"],
    actionsCount: 3410,
    lastActive: "14:28:44 UTC",
    publicKey: "ed25519:1d82fec094b1920ac34102948192ba4",
  },
  {
    id: "agt_triage_bot",
    name: "triage-agent",
    status: "ACTIVE",
    supervisor: "usr_alice",
    capabilities: ["document.ocr_extract", "metadata.parse"],
    actionsCount: 2190,
    lastActive: "14:19:02 UTC",
    publicKey: "ed25519:7b91ac42109281a0b12903847192bc4",
  },
  {
    id: "agt_fraud_scanner",
    name: "fraud-scanner",
    status: "ACTIVE",
    supervisor: "usr_alice",
    capabilities: ["risk.calculate_score", "anomaly.flag"],
    actionsCount: 890,
    lastActive: "13:55:18 UTC",
    publicKey: "ed25519:44d019ac77102948192ba4810294810",
  },
];

export function Agents() {
  const [agents, setAgents] = useState<AgentRecord[]>(initialAgents);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);

  const filtered = agents.filter(
    (a) =>
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.supervisor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold text-[#111111] tracking-tight leading-tight">
            Agents
          </h1>
          <p className="text-sm sm:text-[15px] text-[#6B6B6B] mt-1">
            Registered autonomous subjects, cryptographic identities, and capability boundaries.
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter agent identifier (e.g. trading-bot):");
            if (name) {
              const newAg: AgentRecord = {
                id: `agt_${name.toLowerCase().replace(/\s+/g, "_")}`,
                name: name,
                status: "ACTIVE",
                supervisor: "usr_alice",
                capabilities: ["action.execute"],
                actionsCount: 0,
                lastActive: "Just now",
                publicKey: "ed25519:" + Math.random().toString(36).substring(2, 18),
              };
              setAgents([newAg, ...agents]);
            }
          }}
          className="px-3.5 py-2 rounded-babit bg-[#111111] hover:bg-[#222222] text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <IconCpu className="w-3.5 h-3.5" />
          <span>Register Agent</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#FFFFFF] p-3 rounded-babit border border-[#E8E8E5] shadow-xs">
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 text-[#6B6B6B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by name, ID, or supervisor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-babit-sm border border-[#E8E8E5] bg-[#F7F7F5] outline-none focus:border-[#111111] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F7F7F5] text-[#6B6B6B] border-b border-[#E8E8E5] text-[11px]">
              <tr>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Supervisor</th>
                <th className="px-5 py-3 font-medium font-sans">Capabilities</th>
                <th className="px-5 py-3 font-medium">Actions</th>
                <th className="px-5 py-3 font-medium text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0ED] text-[#111111]">
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedAgent(a)}
                  className="hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-[#111111]">{a.name}</div>
                    <div className="text-[10px] text-[#6B6B6B]">{a.id}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-5 py-3.5 text-[#6B6B6B]">{a.supervisor}</td>
                  <td className="px-5 py-3.5 font-sans">
                    <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                      {a.capabilities.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-[#F7F7F5] text-[#111111] border border-[#E8E8E5]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-[#111111] tnum">{a.actionsCount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-right text-[#6B6B6B]">{a.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Detail Sheet */}
      {selectedAgent && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#FFFFFF] border-l border-[#E8E8E5] shadow-2xl z-50 p-6 overflow-y-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E5]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6B6B6B]">AGENT PROFILE</span>
              <h2 className="text-base font-semibold font-mono text-[#111111]">{selectedAgent.name}</h2>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-1 rounded-babit-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5] cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Identifier</span>
              <span className="text-sm font-semibold text-[#111111]">{selectedAgent.id}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Ed25519 Public Key</span>
              <Copyable value={selectedAgent.publicKey} />
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Authorizing Supervisor</span>
              <span className="text-[#111111]">{selectedAgent.supervisor}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Total Notarized Actions</span>
              <span className="text-lg font-bold text-[#111111]">{selectedAgent.actionsCount.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block mb-1">Permitted Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {selectedAgent.capabilities.map((c) => (
                  <span key={c} className="px-2 py-1 rounded bg-[#F7F7F5] text-[#111111] border border-[#E8E8E5]">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-babit bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Identity verified. Public key registered with ledger notary.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
