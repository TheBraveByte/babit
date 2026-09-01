import { IconCheck } from "@/lib/icons";

export function OfflineVerify() {
  const checks = [
    "Signature valid (Ed25519 public key matches notary)",
    "Authorization valid (Grant BAL-928103 not expired/revoked)",
    "Delegation chain valid (Depth 2 <= MaxDepth 3)",
    "Session hash matches (DOM replay recording sha256 confirmed)",
    "Hash chain intact (Sequence #8294 forward-linked to #8293)",
    "Merkle proof valid (Root 0x9f83...c712 matches ledger tree)",
    "Anchor verified (Deterministic timestamp attestation verified)",
  ];

  return (
    <section className="py-20 sm:py-28 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-400">
            Zero Vendor Lock-in & Offline Audit
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Verify without trusting Babit.
          </h2>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto">
            All receipts and proofs are self-contained. Use our open-source CLI, Go SDK,
            or write your own verifier with pure standard-library crypto.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="max-w-3xl mx-auto rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Terminal Header */}
          <div className="px-4 py-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neutral-700" />
              <span className="w-3 h-3 rounded-full bg-neutral-700" />
              <span className="w-3 h-3 rounded-full bg-neutral-700" />
              <span className="ml-2 text-neutral-300 text-[11px]">terminal — zsh</span>
            </div>
            <span className="text-[11px] text-neutral-500">babit-cli v1.4.0</span>
          </div>

          {/* Terminal Output */}
          <div className="p-6 space-y-4 leading-relaxed">
            <div className="flex items-center gap-2 text-neutral-200">
              <span className="text-emerald-400 font-bold">$</span>
              <span>babit verify receipt_act_01982.json --public-key pk_ed25519_notary.pub</span>
            </div>

            <div className="text-neutral-500 text-[11px] pt-1">
              [i] Loading self-contained inclusion proof and Ed25519 notary certificate...
            </div>

            <div className="space-y-2 py-2">
              {checks.map((c) => (
                <div key={c} className="flex items-start gap-2.5 text-neutral-300 text-[11px]">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800 font-bold text-xs tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>VERIFIED RECEIPT: 100% UNTAMPERED</span>
              </div>
              <span className="text-neutral-500 text-[11px]">Audit duration: 1.4ms</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
