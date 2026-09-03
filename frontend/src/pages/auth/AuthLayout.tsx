import type { ReactNode } from "react";
import { BabitLogo, IconCheck } from "@/lib/icons";
import { Link } from "@/lib/router";
import { EvidenceLedger } from "@/components/viz/EvidenceLedger";

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
            <h1 className="text-[26px] font-semibold tracking-[-0.025em]" style={{ color: "var(--fg)" }}>
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

      {/* ── Visual panel (intentionally dark; collapses on mobile) ────── */}
      {visual ?? <AuthVisual />}
    </div>
  );
}

/**
 * * AuthVisual — the branded right-hand panel. An intentionally-dark surface showing the
 *  * artefact the product produces: a sealed, verified receipt, over the append-only
 *  * evidence chain. The `dark` class re-scopes the design tokens so the panel renders
 *  * dark in both themes.
 *  */
function AuthVisual() {
  return (
      <aside
      className="dark relative flex flex-col justify-center overflow-hidden px-6 py-14 sm:px-10 lg:px-16 min-h-[420px] lg:min-h-screen"
      style={{ backgroundColor: "var(--bg)", borderLeft: "1px solid var(--border)" }}
    >

      {/* The append-only evidence chain, drifting quietly along the base */}
      <div
          className="absolute inset-x-0 bottom-0 h-28 sm:h-32 opacity-30 pointer-events-none"        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <EvidenceLedger className="w-full h-full" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
        <div className="space-y-4">
          <p className="type-eyebrow">Evidence for what agents do</p>

   <h2 className="text-[28px] sm:text-[32px] font-semibold tracking-[-0.025em] leading-[1.1]" style={{ color: "var(--fg)" }}>
     Proof for what your agents do.
          </h2>

<p className="text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
    babit binds every action an agent takes to the authority that permitted it, then seals
            it as evidence anyone can verify.
          </p>
        </div>
          <ReceiptShowcase />

        <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--muted)" }}>
          <span style={{ color: "var(--color-verified)" }}><IconCheck className="w-4 h-4" /></span>
          <span>Verify it yourself. No account needed.</span>
        </div>
      </div>
    </aside>
  );
}

/** A static, non-interactive evidence receipt in the Verified state. */
function ReceiptShowcase() {
  return (
    <div
      className="rounded-babit-lg overflow-hidden"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >

      <div
        className="px-5 py-3.5 flex items-center justify-between gap-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
          <span className="type-eyebrow">Evidence receipt</span>

        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
          style={{ backgroundColor: "var(--color-verified-bg)", color: "var(--color-verified)", border: "1px solid var(--color-verified-border)" }}
        >
          <IconCheck className="w-3 h-3" />
          <span>Verified</span>
        </span>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>Action</span>
          <p className="text-[15px] font-medium leading-snug" style={{ color: "var(--fg)" }}>
            Approved a $4,200 insurance payout
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted)" }}>Agent</span>
            <span className="text-sm font-medium font-mono" style={{ color: "var(--fg)" }}>claims-agent</span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] block mb-1" style={{ color: "var(--muted)" }}>Authorized by</span>
            <span className="text-sm font-medium" style={{ color: "var(--fg)" }}>Alice, Risk Supervisor</span>
          </div>
        </div>

        <div className="rounded-babit p-3.5 space-y-2 glass-subtle">
          <span className="text-[11px] font-mono uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>Cryptographic proof</span>
          <div className="grid grid-cols-1 gap-2 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate" style={{ color: "var(--muted)" }}>digest d8291a84…9102</span>
              <span style={{ color: "var(--color-verified)" }} className="font-semibold shrink-0">✓</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate" style={{ color: "var(--muted)" }}>signature 5c82a109…82f1b</span>
              <span style={{ color: "var(--color-verified)" }} className="font-semibold shrink-0">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
