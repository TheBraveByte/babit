import { useState } from "react";
import { IconCheck, IconRefresh, IconXCircle } from "@/lib/icons";
import { Section, SectionHeader, LandingCard } from "./Section";

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
    <Section id="security" tone="raised">
      <SectionHeader
        eyebrow="Verification"
        align="center"
        title="Don't trust us. Verify it yourself."
        lead="Try changing this receipt, then run the check."
      />

      <div className="mt-14 space-y-5">
        {/* Merkle inclusion-proof visual: static tree showing how
            content_hash values combine up to a single merkle_root. */}
        <div className="max-w-2xl mx-auto">
          <LandingCard className="!p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="type-eyebrow">Inclusion proof</span>
              <span className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                content_hash → merkle_root → anchor
              </span>
            </div>

            {/* Static Merkle tree */}
            <div className="flex flex-col items-center gap-3 py-2">
              {/* Root */}
              <div
                className="px-3 py-1.5 rounded-babit-sm font-mono text-[11px]"
                style={{
                  backgroundColor: tampered ? "var(--color-failed-bg)" : "var(--color-verified-bg)",
                  border: `1px solid ${tampered ? "var(--color-failed-border)" : "var(--color-verified-border)"}`,
                  color: tampered ? "var(--color-failed)" : "var(--color-verified)",
                }}
              >
                merkle_root · 0x{tampered ? "a4f1…e302" : "9e1d…c4a0"}
              </div>

              {/* Connector */}
              <div className="w-px h-4" style={{ backgroundColor: "var(--border)" }} />

              {/* Mid level */}
              <div className="flex gap-8">
                {["0x7a3f…b29c", "0x3c8e…d150"].map((h, i) => (
                  <div key={h} className="flex flex-col items-center gap-2">
                    <div
                      className="px-2.5 py-1 rounded-babit-sm font-mono text-[10px]"
                      style={{
                        backgroundColor: "var(--secondary)",
                        border: "1px solid var(--border)",
                        color: tampered && i === 0 ? "var(--color-failed)" : "var(--fg)",
                      }}
                    >
                      {h}
                    </div>
                  </div>
                ))}
              </div>

              {/* Connectors */}
              <div className="flex gap-8">
                {[0, 1].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-px h-3" style={{ backgroundColor: "var(--border)" }} />
                  </div>
                ))}
              </div>

              {/* Leaves */}
              <div className="flex gap-4">
                {[
                  { label: "action", hash: "0x1b2c…", tampered: false },
                  { label: "amount", hash: "0x4d5e…", tampered: tampered },
                  { label: "agent", hash: "0x7f8a…", tampered: false },
                  { label: "auth", hash: "0xa1b2…", tampered: false },
                ].map((leaf) => (
                  <div key={leaf.label} className="flex flex-col items-center gap-1">
                    <div
                      className="px-2 py-0.5 rounded-babit-sm font-mono text-[9px]"
                      style={{
                        backgroundColor: leaf.tampered ? "var(--color-failed-bg)" : "var(--secondary)",
                        border: `1px solid ${leaf.tampered ? "var(--color-failed-border)" : "var(--border)"}`,
                        color: leaf.tampered ? "var(--color-failed)" : "var(--muted)",
                      }}
                    >
                      {leaf.hash}
                    </div>
                    <span className="text-[9px] font-mono" style={{ color: "var(--muted)" }}>
                      {leaf.label}
                    </span>
                    {leaf.tampered ? (
                      <span style={{ color: "var(--color-failed)" }}><IconXCircle className="w-3 h-3" /></span>
                    ) : (
                      <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3 h-3" /></span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </LandingCard>
        </div>

        {/* Interactive verifier */}
        <div className="max-w-2xl mx-auto">
          <LandingCard emphasis="raised" className="space-y-6">
            {/* Top controls */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 pb-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div>
                <span className="type-eyebrow block">The receipt</span>
                <span className="font-mono text-sm mt-1 block" style={{ color: "var(--fg)" }}>rcpt_BAL_778812</span>
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
                  className="px-4 py-1.5 rounded-pill text-xs font-medium flex items-center gap-1.5 transition-opacity cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
                >
                  <IconRefresh className={`w-3.5 h-3.5 ${verifying ? "animate-spin" : ""}`} />
                  <span>{verifying ? "Checking…" : "Check it"}</span>
                </button>
              </div>
            </div>

            {/* Verification checks */}
            <div className="space-y-3 text-sm">
              {[
                { title: "babit's signature", note: "matches babit's public key", ok: verifiedResult?.sig, okLabel: "Valid", badLabel: "Doesn't match" },
                { title: "The record is unchanged", note: "nothing added or edited", ok: verifiedResult?.chain, okLabel: "Intact", badLabel: "Changed" },
                { title: "Stayed within permission", note: "inside what Alice allowed", ok: verifiedResult?.auth, okLabel: "In bounds", badLabel: "Out of bounds" },
              ].map((check) => (
                <div
                  key={check.title}
                  className="p-3 rounded-babit flex items-center justify-between gap-3"
                  style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
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

            {/* Result banner */}
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
          </LandingCard>
        </div>
      </div>
    </Section>
  );
}
