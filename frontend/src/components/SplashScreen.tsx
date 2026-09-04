import { BabitLogo } from "@/lib/icons";
import { EvidencePipeline } from "@/components/viz/EvidencePipeline";

/**
 * SplashScreen — a full-bleed animated intro for the first app load.
 * The network canvas runs behind the centered logo and wordmark, then
 * the app fades in once auth and routes are ready.
 */
export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Animated network field */}
      <div className="absolute inset-0 opacity-[0.22]">
        <EvidencePipeline className="w-full h-full" />
      </div>

      {/* Centered brand lockup */}
      <div className="relative z-10 flex flex-col items-center gap-5 animate-float-up">
        <BabitLogo className="w-16 h-16 animate-glow-pulse" brandColor="var(--brand-accent)" />
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
