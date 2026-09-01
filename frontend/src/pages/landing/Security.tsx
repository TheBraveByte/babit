import { IconLock, IconKey, IconDatabase, IconLayers, IconGitBranch, IconTerminal } from "@/lib/icons";

export function Security() {
  const pillars = [
    {
      title: "Ed25519 Cryptographic Signatures",
      desc: "Every notary seal and delegation grant is signed with high-speed, constant-time Ed25519 asymmetric cryptography.",
      icon: <IconKey className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Hash-Linked Event Chain",
      desc: "Actions are bound by SHA-256 forward hash pointers, preventing any backdating, reordering, or event omission.",
      icon: <IconDatabase className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Merkle Inclusion Proofs",
      desc: "Compact binary tree proofs enable O(log N) verification of any single action without revealing the entire dataset.",
      icon: <IconLayers className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Scoped Principle of Least Privilege",
      desc: "Grants enforce strict resource glob matching, maximum call depth, expiration TTLs, and financial limits.",
      icon: <IconLock className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Attenuated Delegation Chains",
      desc: "Sub-agents can only receive a subset of the authority possessed by their parent agent. Scope expansion is mathematically rejected.",
      icon: <IconGitBranch className="w-4 h-4 text-emerald-600" />,
    },
    {
      title: "Deterministic Offline Verification",
      desc: "Verify any receipt using standalone open-source code without making network requests to Babit servers.",
      icon: <IconTerminal className="w-4 h-4 text-emerald-600" />,
    },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 bg-white border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Security & Cryptography
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Designed for environments where evidence matters.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Zero trust assumptions. Mathematical guarantees replace reliance on cloud provider logs.
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="p-5 sm:p-6 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300 transition-all space-y-3"
            >
              <div className="p-2 rounded-md bg-white border border-neutral-200 w-fit shadow-2xs">
                {p.icon}
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
