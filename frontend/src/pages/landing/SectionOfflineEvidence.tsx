import { useState } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";

export function SectionOfflineEvidence() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{
    stage: string;
    sig: string;
    chain: string;
    auth: string;
    duration: string;
  } | null>({
    stage: "Verified offline against local public key notary.pub",
    sig: "Ed25519 signature valid (fingerprint: 0x9f81a829)",
    chain: "Hash chain sequence #8294 unbroken",
    auth: "Authority grant BAL-ROOT-100200 intact",
    duration: "1.1ms",
  });

  const runCli = () => {
    setRunning(true);
    setOutput(null);

    setTimeout(() => {
      setRunning(false);
      setOutput({
        stage: "Verified offline against local public key notary.pub",
        sig: "Ed25519 signature valid (fingerprint: 0x9f81a829)",
        chain: "Hash chain sequence #8294 unbroken",
        auth: "Authority grant BAL-ROOT-100200 intact",
        duration: "0.9ms",
      });
    }, 400);
  };

  return (
    <section className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            ZERO VENDOR LOCK-IN
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Evidence that stands on its own.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Receipts and inclusion proofs are completely self-contained. Anyone can verify evidence offline using standard
            cryptographic libraries or our open-source CLI without making network calls to Babit servers.
          </p>
        </div>

        {/* 3 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          <div
            className="p-6 rounded-babit space-y-2 shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="text-[10px] uppercase font-bold" style={{ color: "var(--muted)" }}>STEP 01</span>
            <h3 className="text-sm font-semibold font-sans" style={{ color: "var(--fg)" }}>Export Receipt</h3>
            <p className="font-sans leading-relaxed text-xs" style={{ color: "var(--muted)" }}>
              Download portable JSON receipt from console, API, or automated webhook ingestion.
            </p>
          </div>

          <div
            className="p-6 rounded-babit space-y-2 shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <span className="text-[10px] uppercase font-bold" style={{ color: "var(--muted)" }}>STEP 02</span>
            <h3 className="text-sm font-semibold font-sans" style={{ color: "var(--fg)" }}>Fetch Notary PubKey</h3>
            <p className="font-sans leading-relaxed text-xs" style={{ color: "var(--muted)" }}>
              Cache the notary public key offline in your CI/CD pipeline, audit environment, or air-gapped vault.
            </p>
          </div>

          <div
            className="p-6 rounded-babit space-y-2 shadow-xs"
            style={{
              backgroundColor: "var(--surface)",
              border: "1.5px solid var(--fg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-700">STEP 03</span>
              <span className="text-[10px] text-emerald-700 font-bold">VERIFIED</span>
            </div>
            <h3 className="text-sm font-semibold font-sans" style={{ color: "var(--fg)" }}>Verify Deterministically</h3>
            <p className="font-sans leading-relaxed text-xs" style={{ color: "var(--muted)" }}>
              Run standalone verification in Go, Python, Rust, or via the <code className="text-xs font-mono">babit verify</code> CLI.
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
              <span>Run CLI command</span>
            </button>
          </div>

          {/* Terminal Output */}
          <div className="p-5 space-y-2 text-[#F5F6F4]">
            <div className="text-[#8A9490]">$ babit verify receipt_BAL_778812.json --public-key notary.pub</div>

            {running && <div className="text-amber-400">Executing offline cryptographic verification...</div>}

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
                  ✓ Verified offline in {output.duration}. Zero outbound network connections.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
