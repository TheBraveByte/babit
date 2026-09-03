import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";

export function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6 font-sans"
      style={{ backgroundColor: "var(--bg)", color: "var(--fg)" }}
    >
      <div
        className="max-w-md w-full rounded-babit-md p-8 text-center space-y-5"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 24px 60px -20px color-mix(in srgb, var(--fg) 10%, transparent)",
        }}
      >
        <div className="flex justify-center">
          <BabitLogo className="w-10 h-10" brandColor="var(--brand-accent)" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-semibold" style={{ color: "var(--fg)" }}>
            404 — Page not found
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            That page does not exist. It may have moved or never been part of the ledger.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-pill px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: "var(--brand-accent)", color: "var(--surface)" }}
          >
            Go home
          </Link>
          <Link
            to="/dashboard"
            className="rounded-pill px-5 py-2.5 text-sm font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: "var(--secondary)",
              color: "var(--fg)",
              border: "1px solid var(--border)",
            }}
          >
            Open console
          </Link>
        </div>
      </div>
    </main>
  );
}
