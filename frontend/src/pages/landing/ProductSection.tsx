export function ProductSection() {
  const stages = [
    {
      step: "01",
      name: "Call",
      desc: "Agent runtime initiates an execution session with target resource endpoints and session parameters.",
    },
    {
      step: "02",
      name: "Authorization",
      desc: "Checks the active cryptographic grant for resource glob match, depth ceiling, and non-expired TTL.",
    },
    {
      step: "03",
      name: "Action Capture",
      desc: "Captures the action payload, DOM state hash, timestamp, and recording reference at the point of effect.",
    },
    {
      step: "04",
      name: "Record & Seal",
      desc: "Generates SHA-256 forward-linked event hash and notary Ed25519 signature into the Merkle tree.",
    },
    {
      step: "05",
      name: "Verification",
      desc: "Self-contained receipt proof can be independently verified online or offline with zero vendor trust.",
    },
  ];

  return (
    <section id="product" className="py-20 sm:py-28 border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            EXECUTION PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            Record what actually happened.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            The core Babit operation notarizes autonomous agent execution in five deterministic stages,
            ensuring mathematical proof for every consequence.
          </p>
        </div>

        {/* 5-Stage Sequential Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((st) => (
            <div
              key={st.step}
              className="bg-white rounded-lg border border-neutral-200 p-5 space-y-2 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono font-semibold text-neutral-400 block mb-1">
                  {st.step}
                </span>
                <h3 className="text-base font-semibold text-neutral-900">{st.name}</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed pt-2 border-t border-neutral-100">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
