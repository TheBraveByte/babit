import type { ReactNode } from "react";
import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";
import { SealingStream } from "@/components/viz/SealingStream";

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

      {/* ── Visual panel: live sealing stream ──────────────────────── */}
      {visual ?? <AuthVisual />}
    </div>
  );
}

/**
 * AuthVisual — the right-hand panel. A dark surface with a live canvas
 * showing agent actions being hashed, notary-sealed, and appended to the
 * evidence chain in real time. This is the product's core loop, visualized.
 */
function AuthVisual() {
  return (
    <aside
      className="dark relative overflow-hidden min-h-[420px] lg:min-h-screen"
      style={{ backgroundColor: "var(--bg)", borderLeft: "1px solid var(--border)" }}
    >
      {/* Canvas starts below the overlay text area */}
      <div className="absolute inset-0 pt-28">
        <SealingStream className="w-full h-full" />
      </div>

      {/* Top-left label overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 lg:p-10 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, var(--bg) 0%, color-mix(in srgb, var(--bg) 80%, transparent) 70%, transparent 100%)" }}
      >
        <p className="type-eyebrow" style={{ color: "var(--muted)" }}>
          Live · evidence pipeline
        </p>
        <h2
          className="mt-3 text-[20px] sm:text-[22px] font-semibold tracking-[-0.02em] leading-tight max-w-[280px]"
          style={{ color: "var(--fg)" }}
        >
          Every agent action, sealed as it happens.
        </h2>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--bg) 0%, transparent 100%)" }}
      />
    </aside>
  );
}
