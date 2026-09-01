import { useState } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";

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
    <section className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            Works without us
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
          <div
            className="p-6 rounded-babit-lg space-y-2 shadow-xs"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="text-[10px] font-mono uppercase font-semibold tracking-wider" style={{ color: "var(--muted)" }}>Step 1</span>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--fg)" }}>Save the receipt</h3>
            <p className="leading-relaxed text-sm" style={{ color: "var(--muted)" }}>
              Download the receipt as a plain file from the console or the API.
            </p>
          </div>

          <div
            className="p-6 rounded-babit-lg space-y-2 shadow-xs"
            style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <span className="text-[10px] font-mono uppercase font-semibold tracking-wider" style={{ color: "var(--muted)" }}>Step 2</span>
            <h3 className="text-[15px] font-semibold" style={{ color: "var(--fg)" }}>Get the public key</h3>
            <p className="leading-relaxed text-sm" style={{ color: "var(--muted)" }}>
              Fetch babit's public key once and keep it wherever you need it, even offline.
            </p>
          </div>

          <div
            className="p-6 rounded-babit-lg space-y-2 shadow-xs"
            style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--fg)" }}
          >
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
        <div
          className="max-w-2xl mx-auto rounded-babit-lg overflow-hidden shadow-sm font-mono text-xs"
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
    </section>
  );
}
