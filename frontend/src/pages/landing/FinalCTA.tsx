import { useRouter } from "@/lib/router";
import { docsUrl } from "@/lib/links";

export function FinalCTA() {
  const { navigate } = useRouter();

  return (
    <section
      className="dark-section relative overflow-hidden section-y-lg"
    >
      {/* Layered background */}
      <div className="absolute inset-0 bg-dot-subtle pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--brand-accent) 8%, transparent), transparent 70%)",
        }}
      />

      <div className="container-babit relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="type-eyebrow mb-6" style={{ color: "var(--brand-accent)" }}>
            Start now
          </p>
          <h2 className="type-display" style={{ color: "var(--dark-section-fg)" }}>
            Know what your agents did, and prove it.
          </h2>

          <p className="type-lead mt-6 max-w-xl mx-auto" style={{ color: "var(--dark-section-muted)" }}>
            Record what your agents do, tie it to who allowed it, and let anyone verify it.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-pill px-5 py-2.5 text-[15px] font-medium transition-opacity cursor-pointer hover:opacity-90"
              style={{ backgroundColor: "var(--dark-section-fg)", color: "var(--dark-section-bg)" }}
            >
              Start recording actions
            </button>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-pill px-5 py-2.5 text-[15px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              style={{ color: "var(--dark-section-fg)", border: "1px solid var(--dark-section-border)" }}
            >
              <span>Read the docs</span>
              <span style={{ color: "var(--dark-section-muted)" }}>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
