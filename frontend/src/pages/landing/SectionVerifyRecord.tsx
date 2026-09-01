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
          error: "The amount was changed, so the fingerprint no longer matches and babit's signature no longer fits. The receipt is rejected.",
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
            Verify it yourself
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-tight leading-tight"
            style={{ color: "var(--fg)" }}
          >
            Don't trust us. Verify it yourself.
          </h2>
          <p className="text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
            You don't have to take babit's word for it. Anyone can check a receipt is genuine and unchanged,
            on their own. Try changing this one and run the check.
          </p>
        </div>

        {/* Verification Interactive Box */}
        <div
          className="max-w-2xl mx-auto rounded-babit-lg p-6 sm:p-8 space-y-6 shadow-xs"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Top Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider block" style={{ color: "var(--muted)" }}>The receipt</span>
              <span className="font-mono font-semibold text-sm" style={{ color: "var(--fg)" }}>rcpt_BAL_778812</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextState = !tampered;
                  setTampered(nextState);
                  setVerifiedResult(null);
                }}
                className="px-3 py-1.5 rounded-babit-sm border text-xs font-medium transition-all cursor-pointer"
                style={{
                  backgroundColor: tampered ? "var(--color-failed-bg)" : "var(--secondary)",
                  color: tampered ? "var(--color-failed)" : "var(--fg)",
                  borderColor: tampered ? "var(--color-failed-border)" : "var(--border)",
                }}
              >
                {tampered ? "Changed the amount to $94,200" : "Change the amount"}
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
                <span>{verifying ? "Checking…" : "Check it"}</span>
              </button>
            </div>
          </div>

          {/* Verification Checks */}
          <div className="space-y-3 text-sm">
            {[
              { title: "babit's signature", note: "matches babit's public key", ok: verifiedResult?.sig, okLabel: "Valid", badLabel: "Doesn't match" },
              { title: "The record is unchanged", note: "nothing added or edited", ok: verifiedResult?.chain, okLabel: "Intact", badLabel: "Changed" },
              { title: "Stayed within permission", note: "inside what Alice allowed", ok: verifiedResult?.auth, okLabel: "In bounds", badLabel: "Out of bounds" },
            ].map((check) => (
              <div
                key={check.title}
                className="p-3 rounded-babit flex items-center justify-between gap-3"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <span className="font-medium" style={{ color: "var(--fg)" }}>{check.title}</span>
                  <span className="text-[12px] ml-2" style={{ color: "var(--muted)" }}>({check.note})</span>
                </div>
                {verifiedResult && (
                  <span
                    className="font-semibold text-[13px] inline-flex items-center gap-1 shrink-0"
                    style={{ color: check.ok ? "var(--color-verified)" : "var(--color-failed)" }}
                  >
                    {check.ok ? <><IconCheck className="w-3.5 h-3.5" /> {check.okLabel}</> : check.badLabel}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Result Banner */}
          {verifiedResult && (
            <div className="pt-1 animate-fade-in">
              {verifiedResult.valid ? (
                <div
                  className="p-3.5 rounded-babit flex items-center gap-2 text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--color-verified-bg)",
                    border: "1px solid var(--color-verified-border)",
                    color: "var(--color-verified)",
                  }}
                >
                  <IconCheck className="w-4 h-4 shrink-0" />
                  <span>This receipt is genuine and unchanged.</span>
                </div>
              ) : (
                <div
                  className="p-3.5 rounded-babit space-y-1 text-sm"
                  style={{
                    backgroundColor: "var(--color-failed-bg)",
                    border: "1px solid var(--color-failed-border)",
                    color: "var(--color-failed)",
                  }}
                >
                  <div className="font-semibold">This receipt was changed. babit rejects it.</div>
                  <p className="text-[13px] opacity-90">{verifiedResult.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
