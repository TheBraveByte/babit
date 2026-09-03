import { useState } from "react";
import { IconCheck, IconRefresh, IconArrowRight } from "@/lib/icons";
import { Section, SectionHeader, LandingCard } from "./Section";

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

const ANCHOR_STEPS = [
  { time: "14:32:08", label: "Session sealed", hash: "0x7a3f…b29c" },
  { time: "14:32:09", label: "Merkle root computed", hash: "0x9e1d…c4a0" },
  { time: "14:32:10", label: "Published to transparency log", hash: "0x2b8e…f731" },
  { time: "14:32:11", label: "Anchored independently", hash: "0x4c5a…e892" },
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
    <>
      {/* ── Public anchoring section ──────────────────────────────────── */}
      <section
        id="offline-globe"
        className="dark-section relative overflow-hidden section-y-lg"
      >
        {/* Dot grid + radial glow background */}
        <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(45, 212, 191, 0.06) 0%, transparent 55%)",
          }}
        />

        <div className="relative z-10 container-babit">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left: message */}
            <div>
              <p className="type-eyebrow" style={{ color: "var(--brand-accent)" }}>
                Public anchoring
              </p>
              <h2 className="type-h2 mt-4" style={{ color: "var(--dark-section-fg)" }}>
                Witnessed where babit can't reach.
              </h2>
              <p className="type-lead mt-5" style={{ color: "var(--dark-section-muted)" }}>
                Each session's Merkle root is published to a public transparency log,
                so a receipt can be checked against a record babit does not control.
              </p>

              <div className="mt-8 flex items-center gap-2 text-[12px] font-mono" style={{ color: "var(--dark-section-muted)" }}>
                <span style={{ color: "var(--brand-accent)" }}><IconArrowRight className="w-3.5 h-3.5" /></span>
                <span>No special access required · anyone can audit</span>
              </div>
            </div>

            {/* Right: anchoring timeline */}
            <div
              className="rounded-babit-md overflow-hidden"
              style={{
                backgroundColor: "var(--dark-section-surface)",
                border: "1px solid var(--dark-section-border)",
              }}
            >
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid var(--dark-section-border)" }}
              >
                <span className="type-eyebrow" style={{ color: "var(--dark-section-muted)" }}>
                  Anchoring pipeline
                </span>
                <span className="font-mono text-[11px]" style={{ color: "var(--dark-section-muted)" }}>
                  session · BAL-S-48102
                </span>
              </div>

              <div className="p-5 space-y-0">
                {ANCHOR_STEPS.map((step, i) => (
                  <div
                    key={step.label}
                    className="flex items-center gap-4 py-3"
                    style={i < ANCHOR_STEPS.length - 1 ? { borderBottom: "1px solid var(--dark-section-border)" } : undefined}
                  >
                    <span className="font-mono text-[11px] shrink-0" style={{ color: "var(--dark-section-muted)" }}>
                      {step.time}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium block" style={{ color: "var(--dark-section-fg)" }}>
                        {step.label}
                      </span>
                      <span className="font-mono text-[11px]" style={{ color: "var(--dark-section-muted)" }}>
                        {step.hash}
                      </span>
                    </div>
                    <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-4 h-4 shrink-0" /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Offline verification terminal + points ─────────────────────── */}
      <Section id="offline">
        <SectionHeader
          eyebrow="Offline verification"
          title="Evidence that stands on its own."
          lead="A receipt carries everything needed to check it, offline, without ever calling babit."
        />

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-5">
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
              style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
            >
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#333]" />
                  <span className="ml-2 text-[11px]" style={{ color: "var(--muted)" }}>terminal</span>
                </div>
                <button
                  onClick={runCli}
                  disabled={running}
                  className="text-[11px] flex items-center gap-1 cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  <IconRefresh className={`w-3 h-3 ${running ? "animate-spin" : ""}`} />
                  <span>Run it</span>
                </button>
              </div>

              <div className="p-5 space-y-2" style={{ color: "var(--fg)" }}>
                <div style={{ color: "var(--muted)" }}>$ babit verify rcpt_BAL_778812.json --public-key notary.pub</div>
                {running && <div style={{ color: "var(--color-pending)" }}>Checking the receipt offline…</div>}
                {output && (
                  <div className="space-y-1.5 pt-1 animate-fade-in">
                    {[output.sig, output.chain, output.auth].map((line) => (
                      <div key={line} className="flex items-center gap-1.5" style={{ color: "var(--color-verified)" }}>
                        <IconCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>{line}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-[11px] border-t" style={{ color: "var(--muted)", borderColor: "var(--border)" }}>
                      Checked offline in {output.duration}. No network calls to babit.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </LandingCard>

          {/* The three offline points */}
          <div className="grid grid-cols-1 gap-5">
            {POINTS.map((p) => (
              <LandingCard key={p.title} className="space-y-2">
                <h3 className="text-[15px] font-medium" style={{ color: "var(--fg)" }}>
                  {p.title}
                </h3>
                <p className="type-body">{p.body}</p>
              </LandingCard>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
