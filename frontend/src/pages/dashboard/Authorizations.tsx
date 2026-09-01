import { useState } from "react";
import { StatusPill, Button } from "@/lib/ui";
import { IconSearch } from "@/lib/icons";

interface AuthGrant {
  grantId: string;
  principal: string;
  agent: string;
  capabilities: string[];
  resourceScope: string;
  maxAmount: string;
  created: string;
  expires: string;
  status: "ACTIVE" | "REVOKED";
}

const initialGrants: AuthGrant[] = [
  {
    grantId: "BAL-ROOT-0091",
    principal: "usr_yusuf (Risk Lead)",
    agent: "agt_claims_orchestrator",
    capabilities: ["claims.review", "claims.approve", "payout.authorize"],
    resourceScope: "https://underwriting.internal.corp/*",
    maxAmount: "$100,000",
    created: "2026-09-01 08:00 UTC",
    expires: "2026-09-02 08:00 UTC",
    status: "ACTIVE",
  },
  {
    grantId: "BAL-DEL-4910",
    principal: "agt_claims_orchestrator",
    agent: "agt_worker_browser_09",
    capabilities: ["browser.click", "dom.type"],
    resourceScope: "https://underwriting.internal.corp/claims/*",
    maxAmount: "$10,000",
    created: "2026-09-01 09:12 UTC",
    expires: "2026-09-01 18:00 UTC",
    status: "ACTIVE",
  },
  {
    grantId: "BAL-DEL-8921",
    principal: "agt_worker_browser_09",
    agent: "action_payout_executor",
    capabilities: ["browser.click"],
    resourceScope: "https://underwriting.internal.corp/claims/48102",
    maxAmount: "$5,000",
    created: "2026-09-01 10:41 UTC",
    expires: "2026-09-01 11:41 UTC",
    status: "ACTIVE",
  },
  {
    grantId: "BAL-DEL-1092",
    principal: "usr_alex (Ops)",
    agent: "agt_external_bot",
    capabilities: ["payout.direct"],
    resourceScope: "https://bank.io/payouts/*",
    maxAmount: "$10,000",
    created: "2026-08-30 14:00 UTC",
    expires: "2026-08-31 14:00 UTC",
    status: "REVOKED",
  },
];

export function Authorizations() {
  const [grants, setGrants] = useState<AuthGrant[]>(initialGrants);
  const [search, setSearch] = useState("");
  const [selectedGrant, setSelectedGrant] = useState<AuthGrant | null>(null);

  const handleRevoke = (id: string) => {
    if (confirm(`Revoke grant ${id} and all its child delegations?`)) {
      setGrants((prev) =>
        prev.map((g) => (g.grantId === id ? { ...g, status: "REVOKED" } : g))
      );
      if (selectedGrant?.grantId === id) {
        setSelectedGrant((prev) => (prev ? { ...prev, status: "REVOKED" } : null));
      }
    }
  };

  const filtered = grants.filter(
    (g) =>
      g.grantId.toLowerCase().includes(search.toLowerCase()) ||
      g.principal.toLowerCase().includes(search.toLowerCase()) ||
      g.agent.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Authorizations</h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Active and revoked authorization tickets, resource constraints, and capability boundaries.
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
            placeholder="Search authorizations by ID, agent, or principal…"
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-md border border-neutral-200 bg-neutral-50/50 outline-none focus:border-neutral-900 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Authorizations Table */}
      <div className="bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5 font-medium">Grant ID</th>
                <th className="px-4 py-2.5 font-medium">Principal</th>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                <th className="px-4 py-2.5 font-medium">Capabilities</th>
                <th className="px-4 py-2.5 font-medium">Resource Constraint</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filtered.map((g) => (
                <tr
                  key={g.grantId}
                  onClick={() => setSelectedGrant(g)}
                  className="hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-semibold text-neutral-900">{g.grantId}</td>
                  <td className="px-4 py-3 text-neutral-600">{g.principal}</td>
                  <td className="px-4 py-3 text-neutral-900 font-medium">{g.agent}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {g.capabilities.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 text-neutral-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 truncate max-w-xs">{g.resourceScope}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={g.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {g.status === "ACTIVE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRevoke(g.grantId);
                        }}
                        className="text-red-600 hover:text-red-800 text-[11px] font-medium font-sans cursor-pointer hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Grant Peek Panel */}
      {selectedGrant && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white border-l border-neutral-200 shadow-2xl z-50 p-6 overflow-y-auto space-y-5 animate-slide-in">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <div>
              <span className="text-[10px] font-mono text-neutral-400 uppercase">Grant Inspector</span>
              <h2 className="text-sm font-semibold font-mono text-neutral-900">{selectedGrant.grantId}</h2>
            </div>
            <button
              onClick={() => setSelectedGrant(null)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Status</span>
              <div className="mt-1">
                <StatusPill status={selectedGrant.status} />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Principal Authority</span>
              <span className="text-neutral-900 font-semibold">{selectedGrant.principal}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Subject Agent</span>
              <span className="text-neutral-900 font-semibold">{selectedGrant.agent}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Resource Scope Glob</span>
              <span className="text-neutral-800 break-all">{selectedGrant.resourceScope}</span>
            </div>

            <div>
              <span className="text-[10px] text-neutral-400 uppercase block">Financial Ceiling</span>
              <span className="text-neutral-900 font-semibold">{selectedGrant.maxAmount}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Created At</span>
                <span className="text-neutral-600 text-[11px]">{selectedGrant.created}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">Expires At</span>
                <span className="text-neutral-600 text-[11px]">{selectedGrant.expires}</span>
              </div>
            </div>

            {selectedGrant.status === "ACTIVE" && (
              <div className="pt-4">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRevoke(selectedGrant.grantId)}
                  className="w-full justify-center"
                >
                  Revoke Authorization Immediately
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
