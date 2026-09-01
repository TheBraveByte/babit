import { useState } from "react";
import { IconKey, IconGitBranch, IconCpu, IconLock, IconShieldCheck } from "@/lib/icons";

export function ProductVisualization() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: "01",
      title: "Authorization",
      icon: <IconKey className="w-4 h-4" />,
      desc: "A human grants an agent scoped authority with resource bounds, capability whitelist, and depth constraints.",
      code: `{
  "grant_type": "ROOT_GRANT",
  "principal_id": "usr_yusuf",
  "subject_id": "agt_orchestrator",
  "scope": {
    "max_depth": 3,
    "resource_globs": ["https://internal.bank.io/*"],
    "max_value_cents": 500000
  },
  "notary_signature": "ed25519:7b91a...c421"
}`,
    },
    {
      id: "02",
      title: "Delegation",
      icon: <IconGitBranch className="w-4 h-4" />,
      desc: "Authority flows from one agent to another while strictly attenuating scopes and preserving the unbroken chain.",
      code: `{
  "grant_type": "DELEGATED_GRANT",
  "parent_grant_id": "BAL-829103",
  "principal_id": "agt_orchestrator",
  "subject_id": "agt_browser_executor",
  "capabilities": ["browser.click", "dom.type"],
  "attenuated_scope": {
    "resource_globs": ["https://internal.bank.io/claims/491"]
  }
}`,
    },
    {
      id: "03",
      title: "Execution",
      icon: <IconCpu className="w-4 h-4" />,
      desc: "Agent actions and session states are captured at the exact point of execution with nonces and timestamps.",
      code: `{
  "event_id": "act_829102",
  "session_id": "ses_live_49102",
  "action_type": "browser.click",
  "target_resource": "button#approve-claim-491",
  "occurred_at": "2026-09-01T17:42:10.829Z",
  "recording_ref": "slr://session/rec_49102"
}`,
    },
    {
      id: "04",
      title: "Sealing",
      icon: <IconLock className="w-4 h-4" />,
      desc: "Actions are cryptographically hashed, linked into the immutable ledger, and sealed in the Merkle tree.",
      code: `{
  "sequence": 8294,
  "action_event_hash": "sha256:d8291a...8491",
  "previous_hash": "sha256:4a029c...19a2",
  "merkle_leaf": "0x3918f...bc01",
  "tree_root": "0x9f83d...c712",
  "notary_seal": "ed25519:92af1...e401"
}`,
    },
    {
      id: "05",
      title: "Verification",
      icon: <IconShieldCheck className="w-4 h-4" />,
      desc: "Auditors, regulators, or internal compliance teams independently verify the evidence offline without trusting Babit.",
      code: `{
  "verification_verdict": "VERIFIED",
  "signature_valid": true,
  "chain_intact": true,
  "authority_valid": true,
  "merkle_inclusion": true,
  "external_anchor_match": true,
  "tamper_detected": false
}`,
    },
  ];

  return (
    <section id="product" className="py-20 sm:py-28 bg-white border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            End-to-End Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            From authorization to evidence.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            A 5-stage cryptographic lifecycle connecting human authority to autonomous agent execution.
          </p>
        </div>

        {/* 5-step Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                activeStep === idx
                  ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                  : "bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-semibold ${activeStep === idx ? "text-neutral-400" : "text-neutral-400"}`}>
                  Step {step.id}
                </span>
                <span className={activeStep === idx ? "text-emerald-400" : "text-neutral-500"}>
                  {step.icon}
                </span>
              </div>
              <div className="text-xs font-semibold tracking-tight">{step.title}</div>
            </button>
          ))}
        </div>

        {/* Active Step Showcase */}
        <div className="max-w-5xl mx-auto bg-neutral-950 text-neutral-100 rounded-xl border border-neutral-800 p-6 sm:p-8 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/60">
                <span>Stage {steps[activeStep].id}</span>
                <span>•</span>
                <span>{steps[activeStep].title}</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white">
                {steps[activeStep].title}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {steps[activeStep].desc}
              </p>

              <div className="pt-2 text-[11px] font-mono text-neutral-500 space-y-1">
                <div>✓ Cryptographically attested</div>
                <div>✓ Audited by Notary core</div>
              </div>
            </div>

            {/* Right: Real Code / JSON Spec */}
            <div className="lg:col-span-7">
              <div className="rounded-lg border border-neutral-800 bg-black/80 overflow-hidden font-mono text-xs">
                <div className="px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>payload_spec.json</span>
                  <span className="text-emerald-400 text-[10px]">ED25519 // SHA-256</span>
                </div>
                <pre className="p-4 text-[11px] sm:text-xs text-neutral-200 overflow-x-auto leading-relaxed">
                  {steps[activeStep].code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
