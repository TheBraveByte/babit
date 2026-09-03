import type { ReactNode } from "react";
import { lazy, Suspense } from "react";
import { BabitLogo, IconCheck } from "@/lib/icons";
import { Link } from "@/lib/router";

const SealingStream = lazy(() =>
  import("@/components/viz/SealingStream").then((m) => ({ default: m.SealingStream })),
);

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
        {/* Brand */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 self-start transition-opacity hover:opacity-70"
          style={{ color: "var(--fg)" }}
        >
          <BabitLogo className="w-[22px] h-[22px]" />
          <span className="font-medium text-[16px] tracking-tight">babit</span>
        </Link>

        {/* Centered form */}
        <div className="flex-1 flex flex-col justify-center py-12">
          <div className="w-full max-w-[380px] mx-auto">
            <h1 className="text-[26px] font-medium tracking-[-0.025em] text-center" style={{ color: "var(--fg)" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-[14px] leading-relaxed text-center" style={{ color: "var(--muted)" }}>
                {subtitle}
              </p>
            )}
            <div className="mt-8">{children}</div>
            {footer && (
              <div className="mt-8 text-[13px] text-center" style={{ color: "var(--muted)" }}>
                {footer}
              </div>
            )}
          </div>
        </div>
        <p className="text-[12px] text-center" style={{ color: "var(--muted)" }}>
          Receipts stay verifiable without an account.
        </p>
      </main>

      {/* ── Visual panel: live sealing animation ────────────────────── */}
      {visual ?? <AuthVisual />}
    </div>
  );
}

/**
 * AuthVisual — the right-hand panel with a live sealing animation.
 * Actions flow in, get sealed with a flash, and form a hash chain.
 * Product-relevant, theme-aware, and visually engaging.
 */
function AuthVisual() {
  const benefits = [
    "Every agent action is recorded with proof",
    "Anyone can verify what happened without trusting us",
    "Works with any agent, any language, any platform",
  ];

  return (
    <aside
      className="relative overflow-hidden hidden lg:flex flex-col justify-between min-h-screen px-12 py-16"
      style={{ backgroundColor: "var(--secondary)", borderLeft: "1px solid var(--border)" }}
    >
      {/* Live sealing animation canvas */}
      <div className="absolute inset-0">
        <Suspense fallback={null}>
          <SealingStream className="w-full h-full" />
        </Suspense>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 max-w-md">
        <h2
          className="text-[28px] font-medium tracking-[-0.025em] leading-tight"
          style={{ color: "var(--fg)" }}
        >
          Proof, not promises.
        </h2>

        <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
          Babit gives you cryptographic evidence for every action your AI agents take.
        </p>
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        {benefits.map((b) => (
          <div key={b} className="flex items-start gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{
                backgroundColor: "var(--color-verified-bg)",
                border: "1px solid var(--color-verified-border)",
              }}
            >
              <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-3.5 h-3.5" /></span>
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--fg)" }}>
              {b}
            </p>
          </div>
        ))}

        {/* Verified badge */}
        <div
          className="mt-8 inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
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
