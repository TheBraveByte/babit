import { useRouter } from "@/lib/router";
import { IconCheck } from "@/lib/icons";

export function Hero() {
  const { navigate } = useRouter();

  return (
    <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-mono font-medium text-neutral-800 tracking-wide uppercase">
            <span>AGENT ACCOUNTABILITY</span>
          </div>

          {/* Headline (56–72px desktop) */}
          <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-semibold tracking-tight text-neutral-900 leading-[1.08]">
            Every consequential agent action should be verifiable.
          </h1>

          {/* Supporting Copy (17–19px) */}
          <p className="text-lg sm:text-[19px] text-neutral-600 leading-relaxed max-w-2xl mx-auto font-normal">
            Babit records agent actions, connects them to their authorization and delegation chain,
            and produces cryptographically verifiable evidence.
          </p>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2.5 text-[15px] font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-all cursor-pointer shadow-2xs"
            >
              Get started
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 text-[15px] font-medium bg-white text-neutral-800 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>View documentation</span>
              <span className="text-neutral-400">↗</span>
            </a>
          </div>
        </div>

        {/* Hero Product Visual: Real Babit Action Record & Sealing Pipeline */}
        <div className="mt-16 sm:mt-20 max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500">
                ACTION RECORDED
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <IconCheck className="w-3.5 h-3.5" />
                <span>VERIFIED</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans">
              <div>
                <span className="text-xs text-neutral-500 block mb-1">Call / Event ID</span>
                <span className="font-mono text-neutral-900 font-semibold text-sm">BAL-778812</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 block mb-1">Agent Subject</span>
                <span className="font-mono text-neutral-900 text-sm">agt_shopper</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 block mb-1">Authorized by Principal</span>
                <span className="font-mono text-neutral-900 text-sm">usr_alice</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 block mb-1">Timestamp (UTC)</span>
                <span className="font-mono text-neutral-600 text-sm tnum">2026-09-01T12:03:11Z</span>
              </div>
            </div>

            {/* Sealing Pipeline: Action -> Hash -> Signature -> Ledger */}
            <div className="pt-4 border-t border-neutral-100">
              <div className="text-xs font-mono uppercase text-neutral-400 mb-3">
                Cryptographic Sealing Pipeline
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px] uppercase">1. Action</span>
                  <span className="text-neutral-900 font-semibold">browser.click</span>
                </div>
                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px] uppercase">2. SHA-256 Hash</span>
                  <span className="text-neutral-900 font-semibold">0x4a18...c01</span>
                </div>
                <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                  <span className="text-neutral-500 block text-[10px] uppercase">3. Ed25519 Sig</span>
                  <span className="text-neutral-900 font-semibold">notary_signed</span>
                </div>
                <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <span className="text-emerald-600 block text-[10px] uppercase">4. Ledger</span>
                  <span className="font-bold">Seq #8294</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
