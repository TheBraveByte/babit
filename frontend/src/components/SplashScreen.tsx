import { BabitLogo } from "@/lib/icons";

/**
 * SplashScreen — a minimal branded loading surface shown while the auth
 * session is still being resolved. It appears on protected routes so the
 * landing page can render immediately.
 */
export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="flex flex-col items-center gap-5">
        <BabitLogo className="w-16 h-16" brandColor="var(--brand-accent)" />
        <div className="text-center space-y-1">
          <h1
            className="text-xl font-medium tracking-tight font-mono"
            style={{ color: "var(--fg)" }}
          >
            babit
          </h1>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Proof for autonomous actions
          </p>
        </div>
        <div
          className="w-4 h-4 rounded-full animate-spin"
          style={{
            border: "2px solid var(--border)",
            borderTopColor: "var(--brand-accent)",
          }}
        />
      </div>
    </div>
  );
}
