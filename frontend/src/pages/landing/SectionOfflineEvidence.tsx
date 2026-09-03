import { useState, lazy, Suspense } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";
import { Section, SectionHeader, LandingCard } from "./Section";

const AnchorGlobe = lazy(() =>
  import("@/components/viz/AnchorGlobe").then((m) => ({ default: m.AnchorGlobe })),
);

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

const POINTS = [
  {
    title: "Save the receipt",
    body: "Download the receipt as a plain file from the console or the API.",
  },
  {
    title: "Get the public key",
    body: "Fetch babit's public key once and keep it wherever you need it, even offline.",
  },
  {
    title: "Check it anywhere",
    body: "Confirm the receipt is genuine and unchanged with the open babit verify tool.",
  },
];

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
    <Section id="offline">
      <SectionHeader
        eyebrow="Offline verification"
        title="Evidence that stands on its own."
        lead="A receipt carries everything needed to check it, offline, without ever calling babit."
      />

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Public anchoring: the globe is the subject of its own panel, not a backdrop */}
        <LandingCard padding="none" className="overflow-hidden flex flex-col">
          <div className="px-6 pt-6">
            <span className="type-eyebrow block" style={{ color: "var(--brand-accent)" }}>
              Public anchoring
            </span>
            <h3 className="type-h3 mt-2" style={{ color: "var(--fg)" }}>
              The sealed root is published where anyone can see it.
            </h3>
            <p className="type-body mt-2">
              Each session's Merkle root is witnessed publicly, so a receipt can be checked against
              a record babit does not control.
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center px-6 pt-4 pb-2">
            <Suspense fallback={<div style={{ width: 340, height: 340 }} />}>
              <div style={{ width: 340, height: 340, flexShrink: 0 }}>
                <AnchorGlobe size={340} />
              </div>
            </Suspense>
          </div>
        </LandingCard>

        {/* Live verification terminal */}
        <LandingCard emphasis="raised" className="flex flex-col">
          <div className="space-y-2 mb-5">
            <span className="type-eyebrow block" style={{ color: "var(--brand-accent)" }}>
              Check it yourself
            </span>
            <h3 className="type-h3" style={{ color: "var(--fg)" }}>
              Run the check and watch it pass.
            </h3>
            <p className="type-body">
              The verifier reads the receipt and the public key, then confirms it offline. No call
              reaches babit.
            </p>
          </div>

          <div
            className="mt-auto rounded-babit overflow-hidden font-mono text-xs"
            style={{ backgroundColor: "#0A0C0C", border: "1px solid #222626" }}
          >
            {/* Terminal window header */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ backgroundColor: "#111414", borderBottom: "1px solid #222626" }}
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

            {/* Terminal output */}
            <div className="p-5 space-y-2 text-[#F5F6F4]">
              <div className="text-[#8A9490]">$ babit verify rcpt_BAL_778812.json --public-key notary.pub</div>

              {running && <div className="text-amber-400">Checking the receipt offline…</div>}

              {output && (
                <div className="space-y-1.5 pt-1 animate-fade-in">
                  {[output.sig, output.chain, output.auth].map((line) => (
                    <div key={line} className="text-emerald-400 flex items-center gap-1.5">
                      <IconCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{line}</span>
                    </div>
                  ))}
                  <div className="pt-2 text-[11px] text-[#737D79] border-t border-[#1C2020]">
                    Checked offline in {output.duration}. No network calls to babit.
                  </div>
                </div>
              )}
            </div>
          </div>
        </LandingCard>
      </div>

      {/* The offline points */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        {POINTS.map((p) => (
          <LandingCard key={p.title} className="space-y-2">
            <h3 className="text-[15px] font-medium" style={{ color: "var(--fg)" }}>
              {p.title}
            </h3>
            <p className="type-body">{p.body}</p>
          </LandingCard>
        ))}
      </div>
    </Section>
  );
}
