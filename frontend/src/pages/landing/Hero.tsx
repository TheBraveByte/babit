import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { IconCheck } from "@/lib/icons";

export function Hero() {
  const { navigate } = useRouter();
  const [pipelineStep, setPipelineStep] = useState<1 | 2 | 3 | 4>(4);

  // Subtle cyclic transition demonstrating the 4 stages
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep((prev) => (prev % 4 + 1) as 1 | 2 | 3 | 4);
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-32 pb-24 sm:pt-40 sm:pb-32 bg-[#FCFCFB] relative overflow-hidden">
      {/* Background Variant B: Technical Grid with Dots */}
      <div className="absolute inset-0 bg-dot-subtle opacity-70 pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#FCFCFB] via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-babit-sm bg-[#F7F7F5] border border-[#E8E8E5] text-xs font-mono font-medium text-[#111111] uppercase tracking-wider">
            <span>AGENT ACCOUNTABILITY</span>
          </div>

          {/* Headline (64–76px desktop) */}
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-semibold tracking-tight text-[#111111] leading-[1.05]">
            Proof for autonomous actions.
          </h1>

          {/* Subheadline (18–20px) */}
          <p className="text-lg sm:text-[20px] text-[#6B6B6B] leading-relaxed max-w-2xl mx-auto font-normal">
            Babit connects autonomous actions to the authority behind them and preserves verifiable evidence of what happened.
          </p>

          {/* Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 text-[15px] font-medium bg-[#111111] text-white rounded-babit hover:bg-[#222222] transition-all cursor-pointer shadow-2xs"
            >
              Get started
            </button>

            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 text-[15px] font-medium bg-[#FFFFFF] text-[#111111] border border-[#E8E8E5] rounded-babit hover:bg-[#F7F7F5] transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>Read the docs</span>
              <span className="text-[#6B6B6B]">↗</span>
            </a>
          </div>
        </div>

        {/* Hero Evidence Interface Visual */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#FFFFFF] rounded-babit-lg border border-[#E8E8E5] shadow-xs p-6 sm:p-8 space-y-6 font-sans">
            {/* Top Bar with Real Sequence Progression */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0F0ED]">
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#6B6B6B]">
                <span>EVIDENCE PIPELINE</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
                <span className="text-emerald-700 font-medium">LIVE ATTESTATION</span>
              </div>
            </div>

            {/* Sequence Stage Pills */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <button
                onClick={() => setPipelineStep(1)}
                className={`py-1.5 px-2 rounded-babit-sm border transition-all cursor-pointer ${
                  pipelineStep >= 1
                    ? "bg-[#F7F7F5] border-[#111111] text-[#111111] font-semibold"
                    : "bg-[#FFFFFF] border-[#E8E8E5] text-[#6B6B6B]"
                }`}
              >
                1. Authority
              </button>
              <button
                onClick={() => setPipelineStep(2)}
                className={`py-1.5 px-2 rounded-babit-sm border transition-all cursor-pointer ${
                  pipelineStep >= 2
                    ? "bg-[#F7F7F5] border-[#111111] text-[#111111] font-semibold"
                    : "bg-[#FFFFFF] border-[#E8E8E5] text-[#6B6B6B]"
                }`}
              >
                2. Action
              </button>
              <button
                onClick={() => setPipelineStep(3)}
                className={`py-1.5 px-2 rounded-babit-sm border transition-all cursor-pointer ${
                  pipelineStep >= 3
                    ? "bg-[#F7F7F5] border-[#111111] text-[#111111] font-semibold"
                    : "bg-[#FFFFFF] border-[#E8E8E5] text-[#6B6B6B]"
                }`}
              >
                3. Record
              </button>
              <button
                onClick={() => setPipelineStep(4)}
                className={`py-1.5 px-2 rounded-babit-sm border transition-all cursor-pointer ${
                  pipelineStep >= 4
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                    : "bg-[#FFFFFF] border-[#E8E8E5] text-[#6B6B6B]"
                }`}
              >
                4. Verified
              </button>
            </div>

            {/* Core Action Record Details */}
            <div className="p-5 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block mb-0.5">Action</span>
                  <span className="font-semibold text-[#111111] text-sm">approve_claim</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block mb-0.5">Agent</span>
                  <span className="text-[#111111] text-sm font-semibold">claims-agent</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block mb-0.5">Authorized</span>
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" />
                    Verified (usr_alice)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block mb-0.5">Timestamp</span>
                  <span className="text-[#111111] tnum">14:32:08 UTC</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E8E5] grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block mb-0.5">Signature</span>
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" />
                    Verified (Ed25519)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#6B6B6B] uppercase block mb-0.5">Integrity</span>
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                    <IconCheck className="w-3.5 h-3.5" />
                    Verified (Hash-chain)
                  </span>
                </div>
              </div>
            </div>

            {/* Final Verdict Banner */}
            <div className="p-3 rounded-babit bg-emerald-50 border border-emerald-200 text-center font-mono text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
              <IconCheck className="w-4 h-4 text-emerald-700" />
              <span>STATUS: VERIFIED RECEIPT</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
