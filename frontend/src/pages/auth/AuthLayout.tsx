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
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 relative overflow-hidden">
      {/* Background subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2.5 text-neutral-900 hover:opacity-80 transition-opacity">
            <BabitLogo className="w-7 h-7" />
            <span className="font-semibold text-lg tracking-tight font-mono">babit</span>
          </Link>
        </div>

        <h1 className="text-center text-xl font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-center text-xs text-neutral-500 max-w-sm mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-7 px-6 sm:px-8 shadow-xs border border-neutral-200/80 rounded-xl">
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-xs text-neutral-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
