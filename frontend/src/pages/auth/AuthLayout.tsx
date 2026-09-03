import type { ReactNode } from "react";
import { BabitLogo, IconCheck, IconShieldCheck, IconGitBranch, IconFileText } from "@/lib/icons";
import { Link } from "@/lib/router";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  visual,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <main
        className="relative flex flex-col min-h-screen lg:min-h-0 px-6 py-8 sm:px-10 lg:px-16"
        style={{ backgroundColor: "var(--bg)" }}
      >
        {/* Brand, anchored top-left like the console it leads to */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 self-start transition-opacity hover:opacity-70"
          style={{ color: "var(--fg)" }}
        >
          <BabitLogo className="w-[22px] h-[22px]" />
          <span className="font-medium text-[16px] tracking-tight">babit</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center py-12">
          <div className="w-full max-w-[380px] mx-auto lg:mx-0">
            <h1 className="text-[26px] font-medium tracking-[-0.025em]" style={{ color: "var(--fg)" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {subtitle}
              </p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-8 text-[13px]" style={{ color: "var(--muted)" }}>
                {footer}
              </div>
            )}
          </div>
        </div>
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>
          Receipts stay verifiable without an account.
        </p>
      </main>

      {/* ── Visual panel: evidence principles ──────────────────────── */}
      {visual ?? <AuthVisual />}
    </div>
  );
}

/**
 * AuthVisual — the right-hand panel. A clean, static panel showing
 * the three pillars of evidence: record, seal, verify.
 * No canvas animation — just type, monospace, and hairline borders.
 */
function AuthVisual() {
  const pillars = [
    {
      icon: <IconFileText className="w-4 h-4" />,
      label: "Record",
      desc: "Every agent action is captured with who authorized it.",
      meta: "POST /v1/sessions/{id}/actions",
    },
    {
      icon: <IconShieldCheck className="w-4 h-4" />,
      label: "Seal",
      desc: "Actions are notary-signed and Merkle-sealed into a ledger.",
      meta: "SHA-256 · Ed25519 · append-only",
    },
    {
      icon: <IconGitBranch className="w-4 h-4" />,
      label: "Verify",
      desc: "Anyone can check the receipt offline, without trusting babit.",
      meta: "babit verify receipt.json",
    },
  ];

  return (
    <aside
      className="relative overflow-hidden hidden lg:flex flex-col justify-center min-h-screen px-12 py-16"
      style={{ backgroundColor: "var(--secondary)", borderLeft: "1px solid var(--border)" }}
    >
      {/* Subtle dot grid */}
      <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, var(--brand-accent-subtle), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-md">
        <p className="type-eyebrow mb-6" style={{ color: "var(--brand-accent)" }}>
          How it works
        </p>

        <h2
          className="text-[24px] font-medium tracking-[-0.025em] leading-tight"
          style={{ color: "var(--fg)" }}
        >
          Three steps from action to evidence.
        </h2>

        <div className="mt-10 space-y-6">
          {pillars.map((p, i) => (
            <div key={p.label} className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-babit-sm flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--brand-accent)",
                }}
              >
                {p.icon}
              </div>
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>
                    0{i + 1}
                  </span>
                  <span className="text-[15px] font-medium" style={{ color: "var(--fg)" }}>
                    {p.label}
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                  {p.desc}
                </p>
                <p className="text-[11px] font-mono" style={{ color: "var(--muted)" }}>
                  {p.meta}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Verified badge */}
        <div
          className="mt-10 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: "var(--color-verified-bg)",
            color: "var(--color-verified)",
            border: "1px solid var(--color-verified-border)",
          }}
        >
          <IconCheck className="w-3.5 h-3.5" />
          <span>Cryptographically verifiable</span>
        </div>
      </div>
    </aside>
  );
}
