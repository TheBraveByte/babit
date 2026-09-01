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
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Background — Variant A: Clean with barely-visible dot grid */}
      <div className="absolute inset-0 bg-dot-subtle opacity-40 pointer-events-none" />
      {/* Subtle gradient fade at top and bottom */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }}
      />

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
      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10">
        <div
          className="py-7 px-6 sm:px-8 rounded-babit-lg shadow-xs"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {children}
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
