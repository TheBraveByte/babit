import { useState } from "react";
import { IconCheck, IconRefresh } from "@/lib/icons";

export function SectionVerifyRecord() {
  const [tampered, setTampered] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<{
    valid: boolean;
    sig: boolean;
    chain: boolean;
    auth: boolean;
    error?: string;
  } | null>({ valid: true, sig: true, chain: true, auth: true });

  const runVerification = () => {
    setVerifying(true);
    setVerifiedResult(null);

    setTimeout(() => {
      setVerifying(false);
      if (tampered) {
        setVerifiedResult({
          valid: false,
          sig: false,
          chain: false,
          auth: true,
          error: "Payload hash mismatch: Expected 0xd8291a... but calculated 0x9f83dc... Signature rejected.",
        });
      } else {
        setVerifiedResult({
          valid: true,
          sig: true,
          chain: true,
          auth: true,
        });
      }
    }, 450);
  };

  return (
    <section id="security" className="py-24 sm:py-32 border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            INDEPENDENT VERIFICATION ENGINE
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Verify the record.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            Deterministic mathematical verification. Check Ed25519 signature authenticity, Merkle root inclusion,
            and sequential hash continuity offline without trusting any server.
          </p>
        </div>

        {/* Verification Interactive Box */}
        <div
          className="max-w-2xl mx-auto rounded-babit-lg p-6 sm:p-8 space-y-6 shadow-xs font-mono text-xs"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>TARGET RECEIPT</span>
              <span className="font-semibold text-sm" style={{ color: "var(--fg)" }}>rcpt_BAL_778812.json</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextState = !tampered;
                  setTampered(nextState);
                  setVerifiedResult(null);
                }}
                className="px-3 py-1.5 rounded-babit-sm border text-xs font-mono transition-all cursor-pointer"
                style={{
                  backgroundColor: tampered ? "#FEF2F2" : "var(--secondary)",
                  color: tampered ? "#991B1B" : "var(--fg)",
                  borderColor: tampered ? "#FECACA" : "var(--border)",
                }}
              >
                {tampered ? "Tampered payload (Amount: $94,200)" : "Simulate Tamper"}
              </button>

              <button
                onClick={runVerification}
                disabled={verifying}
                className="px-4 py-1.5 rounded-babit-sm text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-90"
                style={{
                  backgroundColor: "var(--fg)",
                  color: "var(--surface)",
                }}
              >
                <IconRefresh className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
                <span>{verifying ? "Verifying..." : "Verify Proof"}</span>
              </button>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="space-y-3">
            <div
              className="p-3 rounded-babit flex items-center justify-between"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>Ed25519 Notary Signature</span>
                <span className="text-[11px] ml-2" style={{ color: "var(--muted)" }}>(Public key: 0x9f81a829)</span>
              </div>
              {verifiedResult && (
                <span className={`font-bold inline-flex items-center gap-1 ${verifiedResult.sig ? "text-emerald-700" : "text-red-700"}`}>
                  {verifiedResult.sig ? <><IconCheck className="w-3.5 h-3.5" /> VALID</> : "REJECTED"}
                </span>
              )}
            </div>

            <div
              className="p-3 rounded-babit flex items-center justify-between"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>Hash-Chain Integrity</span>
                <span className="text-[11px] ml-2" style={{ color: "var(--muted)" }}>(SHA-256 forward pointer)</span>
              </div>
              {verifiedResult && (
                <span className={`font-bold inline-flex items-center gap-1 ${verifiedResult.chain ? "text-emerald-700" : "text-red-700"}`}>
                  {verifiedResult.chain ? <><IconCheck className="w-3.5 h-3.5" /> INTACT</> : "BROKEN CHAIN"}
                </span>
              )}
            </div>

            <div
              className="p-3 rounded-babit flex items-center justify-between"
              style={{
                backgroundColor: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>Authority Bounds</span>
                <span className="text-[11px] ml-2" style={{ color: "var(--muted)" }}>(Grant: BAL-ROOT-100200)</span>
              </div>
              {verifiedResult && (
                <span className={`font-bold inline-flex items-center gap-1 ${verifiedResult.auth ? "text-emerald-700" : "text-red-700"}`}>
                  {verifiedResult.auth ? <><IconCheck className="w-3.5 h-3.5" /> AUTHORIZED</> : "OUT OF SCOPE"}
                </span>
              )}
            </div>
          </div>

          {/* Result Banner */}
          {verifiedResult && (
            <div className="pt-1 animate-fade-in">
              {verifiedResult.valid ? (
                <div
                  className="p-3.5 rounded-babit flex items-center justify-between font-mono text-xs font-bold"
                  style={{
                    backgroundColor: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    color: "#065F46",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>VERIFICATION SUCCEEDED: 100% CRYPTOGRAPHICALLY AUTHENTIC</span>
                  </div>
                  <span className="text-[10px] font-normal">1.2ms</span>
                </div>
              ) : (
                <div
                  className="p-3.5 rounded-babit space-y-1 font-mono text-xs"
                  style={{
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    color: "#991B1B",
                  }}
                >
                  <div className="font-bold flex items-center gap-2">
                    <span>VERIFICATION FAILED: TAMPER DETECTED</span>
                  </div>
                  <p className="text-[11px] opacity-90">{verifiedResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
