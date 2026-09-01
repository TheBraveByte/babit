import { IconXCircle, IconCheckCircle } from "@/lib/icons";

export function ProblemSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-neutral-50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            The Accountability Gap
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            AI agents can act. <br className="hidden sm:inline" />
            <span className="text-neutral-500">Organizations need to prove what happened.</span>
          </h2>
          <p className="text-sm text-neutral-600 leading-relaxed max-w-xl mx-auto">
            Conventional logging answers: <em className="text-neutral-800 font-medium">"What happened according to our internal system?"</em><br />
            Babit answers: <strong className="text-neutral-900 font-medium">"Can the action and its root authority be independently verified?"</strong>
          </p>
        </div>

        {/* Before vs After Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Without Babit */}
          <div className="rounded-xl border border-red-200/80 bg-white p-6 sm:p-8 space-y-6 shadow-xs relative">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <IconXCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-semibold text-neutral-900">Without Babit</span>
              </div>
              <span className="text-[11px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                MUTABLE / UNVERIFIABLE
              </span>
            </div>

            {/* Pipeline flowchart */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between">
                <span className="text-neutral-700">Autonomous Agent</span>
                <span className="text-neutral-400">Autonomous prompt</span>
              </div>
              <div className="flex justify-center text-neutral-400 text-xs">↓ tool trigger</div>
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 flex items-center justify-between">
                <span className="text-neutral-700">API Tool Execution</span>
                <span className="text-neutral-400">External side effect</span>
              </div>
              <div className="flex justify-center text-neutral-400 text-xs">↓ flat text write</div>
              <div className="p-3 bg-red-50/60 rounded border border-red-200 flex items-center justify-between">
                <span className="text-red-800 font-semibold">Standard Cloud Logs</span>
                <span className="text-red-600 font-mono">"Trust us"</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-neutral-600 space-y-1.5 leading-relaxed">
              <p>• Logs can be edited, backdated, or truncated by anyone with DB access.</p>
              <p>• No cryptographic link between who authorized the agent and what executed.</p>
              <p>• Zero offline audit capability for regulatory compliance or dispute resolution.</p>
            </div>
          </div>

          {/* With Babit */}
          <div className="rounded-xl border border-emerald-300 bg-white p-6 sm:p-8 space-y-6 shadow-sm relative ring-1 ring-emerald-500/20">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <IconCheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-neutral-900">With Babit</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                CRYPTOGRAPHIC PROOF
              </span>
            </div>

            {/* Pipeline flowchart */}
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-900 text-white rounded border border-neutral-800 flex items-center justify-between">
                <span>Human Authorization</span>
                <span className="text-emerald-400 text-[11px]">Root Ed25519 Grant</span>
              </div>
              <div className="flex justify-center text-neutral-400 text-xs">↓ delegated authority</div>
              <div className="p-3 bg-neutral-900 text-white rounded border border-neutral-800 flex items-center justify-between">
                <span>Agent-to-Agent Delegation</span>
                <span className="text-neutral-400 text-[11px]">Scoped boundaries</span>
              </div>
              <div className="flex justify-center text-neutral-400 text-xs">↓ notarized capture</div>
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded border border-emerald-300 flex items-center justify-between font-semibold">
                <span>Signed Evidence + Merkle Proof</span>
                <span className="text-emerald-700 font-mono">100% Verifiable</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-neutral-600 space-y-1.5 leading-relaxed">
              <p>• Tamper-evident: any modified byte invalidates the Merkle hash chain.</p>
              <p>• Unbroken chain of responsibility from human principal to autonomous agent.</p>
              <p>• Offline verifiability via independent CLI or external auditor tool.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
