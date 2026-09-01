import { IconPlay, IconCheck } from "@/lib/icons";

export function SessionReplay() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Execution & Evidence
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Evidence you can replay.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Pair cryptographic receipts with deterministic browser and sandbox session recordings
            for undeniable visual and cryptographic verification.
          </p>
        </div>

        {/* Split Panel Replay & Receipt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Left: Session Replay Mockup */}
          <div className="lg:col-span-7 bg-neutral-900 text-white rounded-xl border border-neutral-800 shadow-md overflow-hidden flex flex-col justify-between">
            {/* Mock browser chrome */}
            <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                <span className="ml-2 px-2 py-0.5 bg-neutral-900 rounded text-[11px] text-neutral-300">
                  https://underwriting.internal.corp/claims/48102
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SOLARI RECORDING</span>
              </div>
            </div>

            {/* Replay Canvas */}
            <div className="p-6 bg-neutral-900/60 space-y-5">
              <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>DOM ACTION TIMELINE</span>
                  <span className="text-neutral-500">SESSION #89231</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-neutral-300">
                    <span className="font-mono text-neutral-500">00:01.2</span>
                    <span>Navigate to /claims/48102</span>
                    <span className="text-emerald-400 font-mono text-[10px]">OK</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-between text-neutral-300">
                    <span className="font-mono text-neutral-500">00:03.4</span>
                    <span>Extract damage photo hash: 0x4a18...c01</span>
                    <span className="text-emerald-400 font-mono text-[10px]">OK</span>
                  </div>
                  <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-between text-emerald-200 font-medium">
                    <span className="font-mono text-emerald-400">00:05.1</span>
                    <span>Click 'Approve Payout: $4,200'</span>
                    <span className="text-emerald-400 font-mono text-[10px] bg-emerald-900 px-1.5 py-0.5 rounded">CAPTURED</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 pt-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-neutral-800 text-white"><IconPlay className="w-3 h-3" /></span>
                  <span>Frame 340 / 340 [Sealed]</span>
                </div>
                <span className="text-neutral-500">Hash: sha256:88fa01...391a</span>
              </div>
            </div>
          </div>

          {/* Right: Cryptographic Action Receipt */}
          <div className="lg:col-span-5 bg-neutral-50 rounded-xl border border-neutral-200/90 p-6 space-y-4 shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <span className="text-xs font-mono font-semibold text-neutral-900">Receipt #act_01928</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300 font-bold">
                  <IconCheck className="w-3 h-3" />
                  VALID
                </span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Authorized by</span>
                  <span className="text-neutral-900 font-semibold">human_182 (Risk Lead)</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Delegated to</span>
                  <span className="text-neutral-900 font-semibold">claims-agent</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Action</span>
                  <span className="text-neutral-900 font-semibold">approve_claim</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Recording Reference</span>
                  <span className="text-neutral-700 text-[11px]">slr://session/89231</span>
                </div>

                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Notary Signature</span>
                  <span className="text-neutral-600 text-[11px] truncate block">ed25519:5c82a1...982f1b</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-500">
              The execution recording hash is permanently signed into the action event receipt.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
