import type { ReactNode } from "react";
import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden mesh-bg">
      {/* Faded engineering grid + a single ambient glow behind the card */}
      <div className="absolute inset-0 grid-fade pointer-events-none" />
      <div className="ambient-glow animate-glow-pulse" style={{ inset: "auto", top: "18%", left: "50%", width: "440px", height: "440px", transform: "translateX(-50%)" }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10">
        {/* Brand logo + wordmark */}
        <div className="flex justify-center mb-8">
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-75"
            style={{ color: "var(--fg)" }}
          >
            <BabitLogo className="w-6 h-6" />
            <span className="font-semibold text-[17px] tracking-tight font-mono">babit</span>
          </Link>
        </div>

        <div className="text-center mb-6 space-y-1">
          <h1
            className="text-[22px] font-semibold tracking-tight"
            style={{ color: "var(--fg)" }}
          >
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
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10 animate-float-up">
        <div className="glass rounded-babit-lg overflow-hidden">
          <div className="h-px accent-hairline" />
          <div className="py-7 px-6 sm:px-8">{children}</div>
        </div>

        {footer && (
          <div
            className="mt-5 text-center text-xs"
            style={{ color: "var(--muted)" }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
