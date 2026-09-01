import { useState } from "react";
import { IconUser, IconCpu, IconGitBranch, IconCheck } from "@/lib/icons";

interface DelegationNode {
  id: string;
  role: "Human Principal" | "Orchestration Agent" | "Execution Agent";
  entityId: string;
  grantId: string;
  parentGrantId: string;
  capabilities: string[];
  scope: {
    resourceGlobs: string[];
    maxValueCents: number;
    maxDepth: number;
  };
  expiresAt: string;
  parentSignature: string;
}

const delegationChain: DelegationNode[] = [
  {
    id: "node_1",
    role: "Human Principal",
    entityId: "usr_alice",
    grantId: "BAL-ROOT-100200",
    parentGrantId: "ROOT (Self-Issued)",
    capabilities: ["browser.*", "api.*", "claims.*"],
    scope: {
      resourceGlobs: ["https://shop.example.com/*", "https://bank.example.com/*"],
      maxValueCents: 500000,
      maxDepth: 3,
    },
    expiresAt: "2026-09-02T00:00:00Z",
    parentSignature: "ed25519:8b190a48...91a0c4",
  },
  {
    id: "node_2",
    role: "Orchestration Agent",
    entityId: "agt_orchestrator",
    grantId: "BAL-417849",
    parentGrantId: "BAL-ROOT-100200",
    capabilities: ["browser.click", "browser.type", "browser.navigate"],
    scope: {
      resourceGlobs: ["https://shop.example.com/*"],
      maxValueCents: 50000,
      maxDepth: 2,
    },
    expiresAt: "2026-09-01T18:00:00Z",
    parentSignature: "ed25519:12c4e810...a9b710",
  },
  {
    id: "node_3",
    role: "Execution Agent",
    entityId: "agt_shopper",
    grantId: "BAL-778812-GRANT",
    parentGrantId: "BAL-417849",
    capabilities: ["browser.click"],
    scope: {
      resourceGlobs: ["https://shop.example.com/cart"],
      maxValueCents: 15000,
      maxDepth: 1,
    },
    expiresAt: "2026-09-01T14:00:00Z",
    parentSignature: "ed25519:9f83dc71...094812",
  },
];

export function DelegationSection() {
  const [selectedNode, setSelectedNode] = useState<DelegationNode>(delegationChain[1]);

  return (
    <section className="py-20 sm:py-28 border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            DELEGATION HIERARCHY
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            Preserve the chain of responsibility.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            Authority flows down the delegation tree with strict monotonic attenuation.
            An agent can never grant more authority than it holds.
          </p>
        </div>

        {/* 2-Column Split: Visual Chain on Left, Real Stored Grant on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Chain nodes */}
          <div className="lg:col-span-6 space-y-3">
            {delegationChain.map((node, idx) => {
              const isSelected = selectedNode.id === node.id;
              return (
                <div key={node.id} className="space-y-3">
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`p-5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-neutral-900 shadow-sm ring-1 ring-neutral-900"
                        : "bg-white border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}>
                          {idx === 0 ? <IconUser className="w-4 h-4" /> : <IconCpu className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[11px] font-mono text-neutral-400 block uppercase">
                            {node.role}
                          </span>
                          <span className="font-mono text-sm font-semibold text-neutral-900">
                            {node.entityId}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <IconCheck className="w-3 h-3" />
                        VALID
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-neutral-400 text-[10px] block">Grant ID</span>
                        <span className="text-neutral-800">{node.grantId}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 text-[10px] block">Max Depth / Value</span>
                        <span className="text-neutral-800">
                          {node.scope.maxDepth} levels / ${(node.scope.maxValueCents / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {idx < delegationChain.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500 bg-white px-3 py-1 rounded border border-neutral-200 shadow-2xs">
                        <IconGitBranch className="w-3.5 h-3.5" />
                        <span>Sub-delegates to</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Selected Stored Grant Inspector */}
          <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-xs font-mono font-semibold uppercase text-neutral-500">
                STORED GRANT RECORD
              </span>
              <span className="font-mono text-xs text-neutral-900 font-semibold">{selectedNode.grantId}</span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Principal</span>
                  <span className="text-neutral-900 font-semibold">{selectedNode.entityId}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Parent Grant</span>
                  <span className="text-neutral-700">{selectedNode.parentGrantId}</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block mb-1">Allowed Capabilities</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.capabilities.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-neutral-400 text-[10px] uppercase block">Resource Scope Glob</span>
                <span className="text-neutral-800">{selectedNode.scope.resourceGlobs.join(", ")}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Financial Ceiling</span>
                  <span className="text-neutral-900">${(selectedNode.scope.maxValueCents / 100).toFixed(2)} USD</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[10px] uppercase block">Expires At</span>
                  <span className="text-neutral-600 tnum">{selectedNode.expiresAt}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <span className="text-neutral-400 text-[10px] uppercase block">Parent Cryptographic Signature</span>
                <span className="text-neutral-700 text-[11px] break-all">{selectedNode.parentSignature}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
