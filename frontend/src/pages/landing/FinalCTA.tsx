import { useRouter } from "@/lib/router";
import { docsUrl } from "@/lib/links";

export function FinalCTA() {
  const { navigate } = useRouter();

  return (
    <section className="mesh-bg py-28 sm:py-36 relative overflow-hidden border-t" style={{ borderColor: "var(--border)" }}>
      <div className="absolute inset-0 grid-fade pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative">
          <div className="ambient-glow animate-glow-pulse" style={{ inset: "-20% 12% 24% 12%" }} />

          <div className="glass rounded-babit-lg overflow-hidden relative animate-float-up">
            <div className="h-px accent-hairline" />

            <div className="px-6 py-14 sm:px-14 sm:py-20 text-center space-y-6">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-medium uppercase tracking-[0.14em] glass-subtle"
                style={{ color: "var(--muted)" }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
                <span>Get started</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-[-0.03em] leading-[1.1]" style={{ color: "var(--fg)" }}>
                Know what your agents did, and prove it.
              </h2>

              <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--muted)" }}>
                Record what your agents do, tie it to who allowed it, and let anyone verify it.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-3 text-[15px] font-semibold rounded-babit transition-all cursor-pointer hover:opacity-90 active:scale-[0.99]"
                  style={{ backgroundColor: "var(--brand-accent)", color: "#fff", boxShadow: "0 10px 30px -12px var(--brand-accent)" }}
                >
                  Get started
                </button>

                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all cursor-pointer inline-flex items-center gap-1.5 glass-subtle hover:opacity-90"
                  style={{ color: "var(--fg)" }}
                >
                  <span>Read the docs</span>
                  <span style={{ color: "var(--muted)" }}>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
