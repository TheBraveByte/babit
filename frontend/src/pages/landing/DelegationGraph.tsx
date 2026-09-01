import { useState } from "react";
import { IconUser, IconCpu, IconGitBranch, IconCheck, IconActivity } from "@/lib/icons";

interface NodeData {
  id: string;
  type: string;
  name: string;
  identity: string;
  authority: string;
  scope: string;
  timestamp: string;
  status: "VERIFIED" | "VALID";
  details: {
    grantId: string;
    capabilities: string[];
    resourceConstraints: string;
    maxDepth: number;
    signature: string;
  };
}

export function DelegationGraph() {
  const nodes: NodeData[] = [
    {
      id: "node_1",
      type: "Human Principal",
      name: "Yusuf (Risk Lead)",
      identity: "usr_yusuf_8192",
      authority: "Full Underwriting Delegation",
      scope: "claims.financial/* [max $100k]",
      timestamp: "10:38:00 UTC",
      status: "VERIFIED",
      details: {
        grantId: "BAL-ROOT-0091",
        capabilities: ["claims.review", "claims.approve", "payout.authorize"],
        resourceConstraints: "https://underwriting.internal.corp/*",
        maxDepth: 3,
        signature: "ed25519:6c810...a9821f",
      },
    },
    {
      id: "node_2",
      type: "Primary Agent",
      name: "Claims Triager Agent",
      identity: "agt_claims_orchestrator",
      authority: "Sub-delegated Approval",
      scope: "claims.approve [max $10k]",
      timestamp: "10:39:12 UTC",
      status: "VERIFIED",
      details: {
        grantId: "BAL-DEL-4910",
        capabilities: ["claims.approve", "document.verify"],
        resourceConstraints: "https://underwriting.internal.corp/auto/*",
        maxDepth: 2,
        signature: "ed25519:9f81a...33a01c",
      },
    },
    {
      id: "node_3",
      type: "Execution Agent",
      name: "Browser Automation Worker",
      identity: "agt_worker_browser_09",
      authority: "Point Execution Scope",
      scope: "browser.click on #approve-btn",
      timestamp: "10:41:45 UTC",
      status: "VERIFIED",
      details: {
        grantId: "BAL-DEL-8921",
        capabilities: ["browser.click"],
        resourceConstraints: "https://underwriting.internal.corp/auto/claim_48102",
        maxDepth: 1,
        signature: "ed25519:1d82f...ec094b",
      },
    },
    {
      id: "node_4",
      type: "Side Effect",
      name: "Claim #48102 Approved",
      identity: "act_payout_authorized_491",
      authority: "Execution Complete",
      scope: "Payout: $4,200 (Within $10k limit)",
      timestamp: "10:42:19 UTC",
      status: "VERIFIED",
      details: {
        grantId: "RECEIPT-849102",
        capabilities: ["action.sealed"],
        resourceConstraints: "Bank Ledger Transaction #TX-9012",
        maxDepth: 0,
        signature: "ed25519:55aa2...7710ea",
      },
    },
  ];

  const [selectedNode, setSelectedNode] = useState<NodeData>(nodes[0]);

  return (
    <section className="py-20 sm:py-28 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Cryptographic Authority Chain
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Know who authorized the action.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Select any node in the delegation graph to inspect its mathematical authority,
            attenuated capabilities, and signature proof.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-start">
          {/* Graph Column */}
          <div className="lg:col-span-7 space-y-3">
            {nodes.map((n, idx) => {
              const isSelected = selectedNode.id === n.id;
              return (
                <div key={n.id} className="space-y-3">
                  <div
                    onClick={() => setSelectedNode(n)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-neutral-900 shadow-sm ring-1 ring-neutral-900"
                        : "bg-white/70 border-neutral-200 hover:border-neutral-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-md ${isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                          {idx === 0 ? <IconUser className="w-3.5 h-3.5" /> : idx === 3 ? <IconActivity className="w-3.5 h-3.5" /> : <IconCpu className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase text-neutral-400 block">
                            {n.type}
                          </span>
                          <span className="text-xs font-semibold text-neutral-900">
                            {n.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <IconCheck className="w-3 h-3 text-emerald-600" />
                        <span>{n.status}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-neutral-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">ID:</span>
                        <span className="text-neutral-700 truncate block">{n.identity}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Scope constraint:</span>
                        <span className="text-neutral-700 truncate block">{n.scope}</span>
                      </div>
                    </div>
                  </div>

                  {idx < nodes.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                        <IconGitBranch className="w-3 h-3 text-neutral-400" />
                        <span>Attenuated Delegation</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Node Inspector Detail Panel */}
          <div className="lg:col-span-5 bg-neutral-900 text-white rounded-xl border border-neutral-800 p-5 sm:p-6 shadow-md space-y-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <span className="text-[11px] font-mono text-neutral-400 uppercase">Delegation Inspector</span>
              <span className="text-xs font-mono text-emerald-400">UNBROKEN CHAIN ✓</span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Selected Entity</span>
                <span className="text-sm font-semibold text-white">{selectedNode.name}</span>
                <span className="text-neutral-400 text-[11px] block">{selectedNode.identity}</span>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Grant ID / Ticket</span>
                <span className="text-emerald-400 font-semibold">{selectedNode.details.grantId}</span>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Allowed Capabilities</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedNode.details.capabilities.map((c) => (
                    <span key={c} className="bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Resource Boundaries</span>
                <span className="text-neutral-300 text-[11px] break-all block">
                  {selectedNode.details.resourceConstraints}
                </span>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Ed25519 Notary Signature</span>
                <span className="text-neutral-300 text-[11px] font-mono block">
                  {selectedNode.details.signature}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
              Every level strictly reduces or maintains capability scopes. An agent can never grant more authority than it holds.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
