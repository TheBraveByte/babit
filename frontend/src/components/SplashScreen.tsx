import { BabitLogo } from "@/lib/icons";
import { EvidencePipeline } from "@/components/viz/EvidencePipeline";

/**
 * SplashScreen — a full-bleed animated intro for the first app load.
 * A subtle network field moves behind the centered brand lockup and credits.
 */
export function SplashScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="absolute inset-0 opacity-[0.18]">
        <EvidencePipeline className="w-full h-full" />
      </div>
      <div
        className="relative z-10 flex flex-col items-center gap-5 p-8 rounded-babit-lg animate-float-up"
        style={{
          backgroundColor: "color-mix(in srgb, var(--surface) 80%, transparent)",
          border: "1px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <BabitLogo className="w-14 h-14 animate-glow-pulse" brandColor="var(--brand-accent)" />
        <div className="text-center space-y-1">
          <h1
            className="text-xl font-medium tracking-tight font-mono"
            style={{ color: "var(--fg)" }}
          >
            babit
          </h1>
          <p className="text-xs leading-relaxed max-w-[220px]" style={{ color: "var(--muted)" }}>
            Built by TheBraveByte. Inspired by the Solari team.
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
