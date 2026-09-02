import { useState } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";
import { AnchorGlobe } from "@/components/viz/AnchorGlobe";

interface CliOutput {
  sig: string;
  chain: string;
  auth: string;
  duration: string;
}

const RESULT: CliOutput = {
  sig: "signature matches babit's public key",
  chain: "record is unchanged",
  auth: "stayed within what was allowed",
  duration: "0.9ms",
};

export function SectionOfflineEvidence() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<CliOutput | null>(RESULT);

  const runCli = () => {
    setRunning(true);
    setOutput(null);

    setTimeout(() => {
      setRunning(false);
      setOutput(RESULT);
    }, 400);
  };

  return (
    <section className="py-24 sm:py-32 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      {/* Ambient globe: the sealed root is published to a public transparency log / chain,
          so a receipt is verifiable anywhere. Decorative, restrained, never dominant. */}
      <div
        className="absolute pointer-events-none hidden lg:block"
        style={{
          top: "50%",
          right: "-6%",
          transform: "translateY(-50%)",
          opacity: 0.5,
          maskImage: "radial-gradient(circle at center, black 55%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 55%, transparent 78%)",
        }}
      >
        <div className="ambient-glow" style={{ inset: "10%" }} />
        <AnchorGlobe size={560} className="relative" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="max-w-3xl space-y-4 animate-float-up">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
            style={{ color: "var(--muted)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
            <span>Works without us</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Evidence that stands on its own.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            A receipt carries everything needed to check it. Anyone can confirm it's genuine offline, with a
            standard crypto library or our open verifier, without ever calling babit.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-subtle p-6 rounded-babit-lg space-y-2 animate-float-up">
            <span className="text-[10px] font-mono uppercase font-semibold tracking-wider" style={{ color: "var(--muted)" }}>Step 1</span>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--fg)" }}>Save the receipt</h3>
            <p className="leading-relaxed text-sm" style={{ color: "var(--muted)" }}>
              Download the receipt as a plain file from the console or the API.
            </p>
          </div>

          <div className="glass-subtle p-6 rounded-babit-lg space-y-2 animate-float-up" style={{ animationDelay: "90ms" }}>
            <span className="text-[10px] font-mono uppercase font-semibold tracking-wider" style={{ color: "var(--muted)" }}>Step 2</span>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--fg)" }}>Get the public key</h3>
            <p className="leading-relaxed text-sm" style={{ color: "var(--muted)" }}>
              Fetch babit's public key once and keep it wherever you need it, even offline.
            </p>
          </div>

          <div className="glass p-6 pt-7 rounded-babit-lg space-y-2 relative overflow-hidden animate-float-up" style={{ animationDelay: "180ms" }}>
            <div className="h-px accent-hairline absolute inset-x-0 top-0" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-semibold tracking-wider" style={{ color: "var(--color-verified)" }}>Step 3</span>
              <span className="text-[10px] font-mono font-semibold" style={{ color: "var(--color-verified)" }}>Verified</span>
            </div>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--fg)" }}>Check it anywhere</h3>
            <p className="leading-relaxed text-sm" style={{ color: "var(--muted)" }}>
              Confirm the receipt is genuine and unchanged with the open <code className="text-xs font-mono">babit verify</code> tool.
            </p>
          </div>
        </div>

        {/* Live Interactive Terminal Simulator */}
        <div className="relative max-w-2xl mx-auto animate-float-up">
          <div className="ambient-glow animate-glow-pulse" style={{ inset: "-16% 6% 16% 6%" }} />
          <div
            className="relative rounded-babit-lg overflow-hidden shadow-sm font-mono text-xs"
            style={{
              backgroundColor: "#0A0C0C",
              border: "1px solid #222626",
            }}
          >
          {/* Terminal Window Header */}
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{
              backgroundColor: "#111414",
              borderBottom: "1px solid #222626",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
              <span className="ml-2 text-[#929894] text-[11px]">terminal</span>
            </div>

            <button
              onClick={runCli}
              disabled={running}
              className="text-[11px] text-[#A2B0AC] hover:text-[#F5F6F4] flex items-center gap-1 cursor-pointer"
            >
              <IconRefresh className={`w-3 h-3 ${running ? "animate-spin" : ""}`} />
              <span>Run it</span>
            </button>
          </div>

          {/* Terminal Output */}
          <div className="p-5 space-y-2 text-[#F5F6F4]">
            <div className="text-[#8A9490]">$ babit verify rcpt_BAL_778812.json --public-key notary.pub</div>

            {running && <div className="text-amber-400">Checking the receipt offline…</div>}

            {output && (
              <div className="space-y-1.5 pt-1 animate-fade-in">
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{output.sig}</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{output.chain}</span>
                </div>
                <div className="text-emerald-400 flex items-center gap-1.5">
                  <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{output.auth}</span>
                </div>
                <div className="pt-2 text-[11px] text-[#737D79] border-t border-[#1C2020]">
                  Checked offline in {output.duration}. No network calls to babit.
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
