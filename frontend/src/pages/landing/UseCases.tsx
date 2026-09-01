import { IconBuilding, IconActivity, IconShieldCheck, IconCpu } from "@/lib/icons";

export function UseCases() {
  const cases = [
    {
      sector: "Financial Services",
      headline: "Prove every consequential agent action.",
      desc: "Ensure autonomous trading bots, fraud detection systems, and payment approval workflows operate strictly within human-granted risk thresholds.",
      icon: <IconBuilding className="w-5 h-5 text-neutral-800" />,
      tag: "FINTECH & BANKING",
      metric: "$500M+ Attested Payouts",
      example: {
        agent: "agt_fx_hedging_bot",
        action: "execute_swap(USD/EUR)",
        limit: "max_slippage: 0.02%",
        verdict: "VERIFIED IN-BOUNDS",
      },
    },
    {
      sector: "Healthcare & Biotech",
      headline: "Preserve accountability without exposing sensitive evidence.",
      desc: "Provide cryptographic proofs of clinical trial decisions and patient data transfers without leaking protected health information (PHI).",
      icon: <IconActivity className="w-5 h-5 text-neutral-800" />,
      tag: "HIPAA & LIFE SCIENCES",
      metric: "Zero-Knowledge Hashes",
      example: {
        agent: "agt_clinical_triage",
        action: "route_patient_record",
        limit: "anonymized_hash_match",
        verdict: "COMPLIANT & SEALED",
      },
    },
    {
      sector: "Insurance & Underwriting",
      headline: "Trace automated decisions from authorization to outcome.",
      desc: "Defend against claims disputes and regulatory audits with full deterministic delegation trees linking policyholders, adjusters, and automated payout agents.",
      icon: <IconShieldCheck className="w-5 h-5 text-neutral-800" />,
      tag: "UNDERWRITING AUDIT",
      metric: "100% Chain Reconstruction",
      example: {
        agent: "agt_claims_assessor",
        action: "authorize_payout($4,200)",
        limit: "human_supervisor_grant",
        verdict: "DELEGATION VALID",
      },
    },
    {
      sector: "Enterprise Software & AI",
      headline: "Give autonomous systems an auditable chain of responsibility.",
      desc: "Deploy autonomous software engineers, customer success agents, and DevOps automation with hard cryptographic boundaries and instant revocation.",
      icon: <IconCpu className="w-5 h-5 text-neutral-800" />,
      tag: "AUTONOMOUS INFRA",
      metric: "<2ms Notary Latency",
      example: {
        agent: "agt_infrastructure_scaler",
        action: "restart_production_pod",
        limit: "signed_runbook_v4",
        verdict: "PROOF CERTIFIED",
      },
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Enterprise Deployment
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Engineered for high-stakes autonomy.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Where agent mistakes carry financial, legal, or regulatory liability,
            Babit guarantees undeniable cryptographic evidence.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {cases.map((c) => (
            <div
              key={c.sector}
              className="bg-white rounded-xl border border-neutral-200/90 p-6 sm:p-7 space-y-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-neutral-100">{c.icon}</div>
                    <span className="text-xs font-mono font-semibold text-neutral-900 uppercase">
                      {c.sector}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                    {c.tag}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
                  {c.headline}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              {/* Realistic mini proof widget */}
              <div className="p-3.5 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] space-y-1.5 border border-neutral-800">
                <div className="flex items-center justify-between text-neutral-400 text-[10px]">
                  <span>EVIDENCE SPEC</span>
                  <span className="text-emerald-400">{c.metric}</span>
                </div>
                <div className="truncate"><span className="text-neutral-500">agent:</span> {c.example.agent}</div>
                <div className="truncate"><span className="text-neutral-500">action:</span> {c.example.action}</div>
                <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-[10px]">
                  <span className="text-neutral-400">{c.example.limit}</span>
                  <span className="text-emerald-400 font-semibold">{c.example.verdict}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
