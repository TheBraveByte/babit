import { useState } from "react";
import { StatusPill, Copyable } from "@/lib/ui";
import { IconCpu, IconSearch } from "@/lib/icons";

interface AgentRecord {
  id: string;
  name: string;
  status: "ACTIVE" | "REVOKED";
  owner: string;
  capabilities: string[];
  actionsCount: number;
  lastActive: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  publicKey: string;
}

const initialAgents: AgentRecord[] = [
  {
    id: "agt_claims_orchestrator",
    name: "Claims Triager & Assessor",
    status: "ACTIVE",
    owner: "yusuf@enterprise.com",
    capabilities: ["claims.review", "claims.approve", "document.verify"],
    actionsCount: 4892,
    lastActive: "10:42:19 UTC",
    riskLevel: "MEDIUM",
    publicKey: "ed25519:9f81a82910bc491028a",
  },
  {
    id: "agt_worker_browser_09",
    name: "Browser DOM Automation Worker",
    status: "ACTIVE",
    owner: "claims-agent",
    capabilities: ["browser.click", "dom.type", "page.navigate"],
    actionsCount: 3109,
    lastActive: "10:41:45 UTC",
    riskLevel: "LOW",
    publicKey: "ed25519:1d82fec094b1920ac34",
  },
  {
    id: "agt_fx_hedging_bot",
    name: "Treasury Hedging Agent",
    status: "ACTIVE",
    owner: "treasury-lead@bank.io",
    capabilities: ["swap.execute", "limit.check"],
    actionsCount: 1849,
    lastActive: "09:30:11 UTC",
    riskLevel: "HIGH",
    publicKey: "ed25519:7b91ac42109281a0b12",
  },
  {
    id: "agt_deprecated_worker",
    name: "Legacy Scraping Worker",
    status: "REVOKED",
    owner: "dev-ops@enterprise.com",
    capabilities: ["legacy.scrape"],
    actionsCount: 42,
    lastActive: "3 days ago",
    riskLevel: "LOW",
    publicKey: "ed25519:001a481920ac1928374",
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
      a.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Agent Inventory</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Registered autonomous agents, cryptographic public keys, and active capability scopes.
          </p>
        </div>

        <button
          onClick={() => {
            const name = prompt("Enter Agent Identifier:");
            if (name) {
              const newAg: AgentRecord = {
                id: `agt_${name.toLowerCase().replace(/\s+/g, "_")}`,
                name: name,
                status: "ACTIVE",
                owner: "admin@enterprise.com",
                capabilities: ["action.execute"],
                actionsCount: 0,
                lastActive: "Just now",
                riskLevel: "LOW",
                publicKey: "ed25519:" + Math.random().toString(36).substring(2, 15),
              };
              setAgents([newAg, ...agents]);
            }
          }}
          className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <IconCpu className="w-3.5 h-3.5" />
          <span>Register Agent</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-xs">
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by ID, name, or owner…"
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 bg-neutral-50/50 outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium">Capabilities</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
                <th className="px-4 py-2.5 font-medium">Last Active</th>
                <th className="px-4 py-2.5 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => setSelectedAgent(a)}
                  className="hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-neutral-900">{a.name}</div>
                    <div className="text-[10px] text-neutral-400">{a.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{a.owner}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {a.capabilities.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-neutral-900 tnum">{a.actionsCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-neutral-500">{a.lastActive}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        a.riskLevel === "HIGH"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : a.riskLevel === "MEDIUM"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {a.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Agent Peek View */}
      {selectedAgent && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white border-l border-neutral-200 shadow-2xl z-50 p-6 overflow-y-auto space-y-5 animate-slide-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Agent Profile</span>
              <h2 className="text-sm font-semibold font-mono text-neutral-900">{selectedAgent.name}</h2>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Agent Identifier</span>
              <Copyable value={selectedAgent.id} />
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Ed25519 Public Key</span>
              <Copyable value={selectedAgent.publicKey} />
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Owner & Principal Supervisor</span>
              <span className="text-neutral-900">{selectedAgent.owner}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Total Executed Actions</span>
              <span className="text-base font-bold text-neutral-900">{selectedAgent.actionsCount.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Assigned Capabilities</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedAgent.capabilities.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
