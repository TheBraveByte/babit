import { useState } from "react";
import { IconUser, IconCpu, IconCheck, IconGitBranch } from "@/lib/icons";

interface ChainNode {
  id: string;
  level: string;
  name: string;
  role: string;
  grantId: string;
  scope: string;
  limit: string;
  status: "ACTIVE" | "VERIFIED";
}

const chainNodes: ChainNode[] = [
  {
    id: "node-1",
    level: "HUMAN PRINCIPAL",
    name: "usr_alice",
    role: "Risk Lead & Operations Supervisor",
    grantId: "BAL-ROOT-100200",
    scope: "https://internal.bank.io/*",
    limit: "Max $500,000 / Depth 3",
    status: "ACTIVE",
  },
  {
    id: "node-2",
    level: "PRIMARY AGENT",
    name: "claims-orchestrator",
    role: "Autonomous Claims Assessor",
    grantId: "BAL-417849",
    scope: "https://internal.bank.io/claims/*",
    limit: "Max $50,000 / Depth 2",
    status: "ACTIVE",
  },
  {
    id: "node-3",
    level: "SUB-AGENT",
    name: "payout-executor",
    role: "Automated Disbursement Worker",
    grantId: "BAL-DEL-8921",
    scope: "https://internal.bank.io/payouts/*",
    limit: "Max $5,000 / Depth 1",
    status: "ACTIVE",
  },
  {
    id: "node-4",
    level: "EXECUTED ACTION",
    name: "approve_payout($4,200)",
    role: "Target Action Execution",
    grantId: "RECEIPT_BAL_778812",
    scope: "/payouts/claim_48102",
    limit: "Within Authorized Boundaries",
    status: "VERIFIED",
  },
];

export function SectionAuthorityChain() {
  const [activeNode, setActiveNode] = useState<ChainNode>(chainNodes[1]);

  return (
    <section className="py-24 sm:py-32 border-t border-[#E8E8E5] bg-[#FCFCFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
            DELEGATION LINEAGE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#111111] leading-tight">
            Follow the authority.
          </h2>
          <p className="text-[18px] sm:text-[19px] text-[#6B6B6B] leading-relaxed">
            Every action links backward through each sub-agent delegation to the human supervisor who granted the initial scope.
          </p>
        </div>

        {/* Chain Visualization & Node Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Sequential Node Graph */}
          <div className="lg:col-span-7 space-y-3 font-mono text-xs">
            {chainNodes.map((node, idx) => {
              const isSelected = activeNode.id === node.id;
              return (
                <div key={node.id} className="space-y-3">
                  <div
                    onClick={() => setActiveNode(node)}
                    className={`p-4 sm:p-5 rounded-babit border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FFFFFF] border-[#111111] shadow-xs"
                        : "bg-[#FFFFFF] border-[#E8E8E5] hover:border-[#CCCCCC]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-babit-sm ${isSelected ? "bg-[#111111] text-white" : "bg-[#F7F7F5] text-[#111111]"}`}>
                          {idx === 0 ? <IconUser className="w-4 h-4" /> : idx === 3 ? <IconCheck className="w-4 h-4" /> : <IconCpu className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[10px] text-[#6B6B6B] uppercase block">
                            {node.level}
                          </span>
                          <span className="text-sm font-semibold text-[#111111]">
                            {node.name}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {node.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#F0F0ED] flex items-center justify-between text-[#6B6B6B] text-[11px]">
                      <span>Scope: {node.scope}</span>
                      <span className="text-[#111111] font-semibold">{node.limit}</span>
                    </div>
                  </div>

                  {idx < chainNodes.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6B6B6B] bg-[#F7F7F5] px-2.5 py-0.5 rounded border border-[#E8E8E5]">
                        <IconGitBranch className="w-3 h-3" />
                        <span>delegates authority to</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Selected Node Authority Inspector */}
          <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg p-6 sm:p-7 space-y-5 shadow-xs font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0ED]">
              <span className="text-xs uppercase text-[#6B6B6B] font-semibold">
                DELEGATION INSPECTOR
              </span>
              <span className="text-emerald-700 font-bold text-[11px]">CRYPTOGRAPHICALLY ANCHORED</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Node Identifier</span>
                <span className="text-sm font-semibold text-[#111111]">{activeNode.name}</span>
                <span className="text-xs text-[#6B6B6B] font-sans block mt-0.5">{activeNode.role}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Grant Ticket</span>
                <span className="text-[#111111] font-semibold">{activeNode.grantId}</span>
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Resource Authority Pattern</span>
                <span className="text-[#111111] bg-[#F7F7F5] px-2 py-1 rounded border border-[#E8E8E5] block mt-1">
                  {activeNode.scope}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Attenuated Constraint</span>
                <span className="text-[#111111]">{activeNode.limit}</span>
              </div>

              <div className="pt-3 border-t border-[#F0F0ED] text-[11px] text-[#6B6B6B] font-sans leading-relaxed">
                Authority strictly attenuates downstream. Sub-agents are mathematically forbidden from exceeding the parent grant's scope or financial cap.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
