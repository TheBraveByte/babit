import { useState } from "react";
import { Grants as LiveGrantsScreen } from "@/screens/Grants";
import { IconGitBranch, IconKey } from "@/lib/icons";

export function Delegations() {
  const [activeSubTab, setActiveSubTab] = useState<"tree" | "actions">("tree");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Delegations & Grants</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Trace the mathematical authority flow from human supervisors down to autonomous agents.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
          <button
            onClick={() => setActiveSubTab("tree")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === "tree"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Visual Delegation Tree
          </button>
          <button
            onClick={() => setActiveSubTab("actions")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeSubTab === "actions"
                ? "bg-white text-neutral-900 shadow-2xs font-semibold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Issue / Verify Grants
          </button>
        </div>
      </div>

      {activeSubTab === "tree" ? (
        <div className="space-y-6">
          {/* Visual Delegation Tree View */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs font-mono">
              <span className="font-semibold text-neutral-900 uppercase">Active Enterprise Authority Tree</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                ROOT: usr_yusuf [Depth Max 3]
              </span>
            </div>

            {/* Tree Nodes List */}
            <div className="space-y-4 font-mono text-xs">
              {/* Level 0: Root */}
              <div className="p-4 rounded-lg bg-neutral-900 text-white border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-neutral-800 text-emerald-400"><IconKey className="w-3.5 h-3.5" /></span>
                    <span className="font-bold text-white">ROOT GRANT — BAL-ROOT-0091</span>
                  </div>
                  <span className="text-[10px] text-emerald-400">UNRESTRICTED PRINCIPAL</span>
                </div>
                <div className="text-[11px] text-neutral-300">
                  Principal: <strong className="text-white">usr_yusuf (Risk Lead)</strong> → Target: <span className="text-neutral-400">agt_claims_orchestrator</span>
                </div>
                <div className="text-[10px] text-neutral-500">
                  Scope: https://underwriting.internal.corp/* | Max Value: $100,000 | Depth: 3
                </div>
              </div>

              {/* Level 1: Delegation */}
              <div className="ml-6 sm:ml-10 border-l-2 border-neutral-200 pl-4 space-y-3">
                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-neutral-200 text-neutral-700"><IconGitBranch className="w-3.5 h-3.5" /></span>
                      <span className="font-bold text-neutral-900">DELEGATED SUB-GRANT — BAL-DEL-4910</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ATTENUATED
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-700">
                    Granted by: <span className="text-neutral-900 font-semibold">agt_claims_orchestrator</span> → Subject: <strong className="text-neutral-900">agt_worker_browser_09</strong>
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Capabilities: ["browser.click", "dom.type"] | Scope: https://underwriting.internal.corp/claims/* | Max Value: $10,000
                  </div>
                </div>

                {/* Level 2: Sub-delegation */}
                <div className="ml-6 sm:ml-10 border-l-2 border-neutral-200 pl-4">
                  <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded bg-neutral-200 text-neutral-700"><IconGitBranch className="w-3.5 h-3.5" /></span>
                        <span className="font-bold text-neutral-900">POINT EXECUTION GRANT — BAL-DEL-8921</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        LEAF DEPTH: 1
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-700">
                      Granted by: <span className="text-neutral-900 font-semibold">agt_worker_browser_09</span> → Subject: <strong className="text-neutral-900">action_payout_executor</strong>
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Capabilities: ["browser.click on #approve-claim"] | Bound to Session #89231
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs">
          <LiveGrantsScreen />
        </div>
      )}
    </div>
  );
}
