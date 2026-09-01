import { IconCheck } from "@/lib/icons";

export function VerificationSection() {
  const verificationChecks = [
    { name: "signature_valid", label: "Signature", status: "VALID", desc: "Ed25519 notary public key signature is mathematically valid" },
    { name: "chain_intact", label: "Hash chain", status: "VALID", desc: "Sequential SHA-256 forward-hash pointers are intact and untampered" },
    { name: "authority_valid", label: "Authority scope", status: "VALID", desc: "Action is strictly within human-issued grant capabilities and budget limits" },
    { name: "anchored", label: "External anchor", status: "VALID", desc: "RFC 3161 TSA and ledger transparency timestamp attestation matches" },
  ];

  return (
    <section id="security" className="py-20 sm:py-28 border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            OFFLINE VERIFICATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            Verification should not require trust.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            Receipts and inclusion proofs are self-contained. Anyone can verify evidence offline using standard
            cryptographic libraries without sending requests to Babit servers.
          </p>
        </div>

        {/* Verification Result Card */}
        <div className="max-w-3xl bg-white border border-neutral-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs font-mono text-xs">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100 font-sans">
            <div>
              <span className="text-xs text-neutral-500 block uppercase font-mono">Verification Target</span>
              <span className="text-base font-semibold text-neutral-900 font-mono">receipt_BAL_778812.json</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>RECEIPT VERIFIED</span>
            </span>
          </div>

          <div className="space-y-3">
            {verificationChecks.map((c) => (
              <div key={c.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-neutral-50 border border-neutral-100 gap-2">
                <div>
                  <span className="font-semibold text-neutral-900">{c.label}</span>
                  <span className="text-neutral-500 font-sans text-xs block sm:inline sm:ml-2">({c.desc})</span>
                </div>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                  <IconCheck className="w-3 h-3" />
                  {c.status}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-neutral-500 text-[11px]">
            <span>solari.ledger.v1.VerifyProofResponse</span>
            <span>Deterministic verification runtime: &lt;2ms</span>
          </div>
        </div>
      </div>
    </section>
  );
}
