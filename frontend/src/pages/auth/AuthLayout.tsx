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
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <main className="relative flex flex-col justify-center overflow-hidden mesh-bg min-h-screen lg:min-h-0 py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 grid-fade pointer-events-none" />
        <div
          className="ambient-glow animate-glow-pulse"
          style={{ top: "14%", left: "50%", width: "420px", height: "420px", transform: "translateX(-50%)" }}
        />

        <div className="relative z-10 w-full sm:mx-auto sm:max-w-[400px]">
          {/* Brand logo + wordmark */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-75"
              style={{ color: "var(--fg)" }}
            >
              <BabitLogo className="w-6 h-6" />
              <span className="font-semibold text-[17px] tracking-tight font-mono">babit</span>
            </Link>
          </div>

          <div className="text-center mb-5 sm:mb-6 space-y-1">
            <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: "var(--fg)" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted)" }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Form card */}
        <div className="mt-2 relative z-10 w-full sm:mx-auto sm:max-w-[400px] animate-float-up">
          <div className="glass rounded-babit-lg overflow-hidden">
            <div className="h-px accent-hairline" />
            <div className="py-6 sm:py-7 px-5 sm:px-8">{children}</div>
          </div>

          {footer && (
            <div className="mt-5 text-center text-xs" style={{ color: "var(--muted)" }}>
              {footer}
            </div>
          )}
        </div>
      </main>

      {/* ── Visual panel (intentionally dark; collapses on mobile) ────── */}
      {visual ?? <AuthVisual />}
    </div>
  );
}

/**
 * AuthVisual — the branded right-hand panel. An intentionally-dark surface built from
 * what babit owns: the mesh gradient, faded grid, an ambient teal glow, the live
 * evidence chain, and a static "Verified" receipt showcasing the product. The `dark`
 * class re-scopes the design tokens so the panel renders dark in both themes.
 */
function AuthVisual() {
  return (
    <aside className="dark relative flex flex-col justify-center overflow-hidden mesh-bg px-5 py-10 sm:px-8 sm:py-12 lg:px-12 xl:px-16 min-h-[380px] sm:min-h-[460px] lg:min-h-screen">
      <div className="absolute inset-0 grid-fade pointer-events-none" />
      <div
        className="ambient-glow animate-glow-pulse"
        style={{ top: "18%", left: "58%", width: "480px", height: "480px" }}
      />

      {/* The append-only evidence chain, drifting quietly along the base */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 sm:h-32 opacity-30 sm:opacity-40 pointer-events-none"
        style={{
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <EvidenceLedger className="w-full h-full" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto space-y-5 sm:space-y-8">
        <div className="space-y-3 sm:space-y-4">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
            style={{ color: "var(--muted)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
            <span>Evidence for what agents do</span>
          </div>

          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-[-0.02em] leading-[1.1]" style={{ color: "var(--fg)" }}>
            Proof for what your agents do.
          </h2>

          <p className="text-[14px] sm:text-[15px] leading-relaxed" style={{ color: "var(--muted)" }}>
            babit binds every action an agent takes to the authority that permitted it, then seals
            it as evidence anyone can verify.
          </p>
        </div>

        <div className="hidden sm:block">
          <ReceiptShowcase />
        </div>

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
    <div className="glass rounded-babit-lg overflow-hidden relative animate-float-up" style={{ animationDelay: "120ms" }}>
      <div className="h-px accent-hairline" />
      <div
        className="px-5 py-3.5 flex items-center justify-between gap-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
          Evidence receipt
        </span>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
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
