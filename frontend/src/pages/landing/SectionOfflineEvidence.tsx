import { useState, lazy, Suspense } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";

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
    <section className="py-24 sm:py-32 border-t relative overflow-hidden" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14 relative z-10">
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

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Dominant tile: the sealed root anchored to a public log, verified in a live terminal */}
          <div className="relative rounded-babit-lg p-6 glass animate-float-up overflow-hidden flex flex-col lg:col-span-2 lg:row-span-3">
            <div className="h-px accent-hairline absolute inset-x-0 top-0" />

            {/* Ambient globe: the sealed root is published to a public transparency log,
                so a receipt is verifiable anywhere. Decorative, never dominant. */}
            <div
              className="absolute pointer-events-none hidden lg:block"
              style={{
                top: "42%",
                right: "-16%",
                transform: "translateY(-50%)",
                opacity: 0.7,
                maskImage: "radial-gradient(circle at center, black 55%, transparent 78%)",
                WebkitMaskImage: "radial-gradient(circle at center, black 55%, transparent 78%)",
              }}
            >
              <div className="ambient-glow" style={{ inset: "8%" }} />
              <Suspense fallback={null}>
                <AnchorGlobe size={440} className="relative" />
              </Suspense>
            </div>

            <div className="relative space-y-1.5 mb-5">
              <span className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--brand-accent)" }}>
                Check it yourself
              </span>
              <h3 className="text-xl font-semibold leading-snug tracking-tight" style={{ color: "var(--fg)" }}>
                Run the check and watch it pass.
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                The verifier reads the receipt and the public key, then confirms it offline. No call reaches babit.
              </p>
            </div>

            {/* Live interactive terminal simulator */}
            <div className="relative mt-auto">
              <div className="ambient-glow animate-glow-pulse" style={{ inset: "-10% 4% 10% 4%" }} />
              <div
                className="relative rounded-babit overflow-hidden shadow-sm font-mono text-xs"
                style={{
                  backgroundColor: "#0A0C0C",
                  border: "1px solid #222626",
                }}
              >
                {/* Terminal window header */}
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

                {/* Terminal output */}
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

          {/* Supporting tiles: the offline points */}
          {POINTS.map((p, idx) => (
            <div
              key={p.title}
              className="rounded-babit-lg p-6 space-y-2 h-full glass-subtle animate-float-up"
              style={{ animationDelay: `${(idx + 1) * 80}ms` }}
            >
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--fg)" }}>{p.title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: "var(--muted)" }}>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
