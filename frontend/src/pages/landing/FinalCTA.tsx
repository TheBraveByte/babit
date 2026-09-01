import { useRouter } from "@/lib/router";
import { docsUrl } from "@/lib/links";

export function FinalCTA() {
  const { navigate } = useRouter();

  return (
    <section
      className="py-28 sm:py-36 relative overflow-hidden border-t"
      style={{ backgroundColor: "var(--fg)", color: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-babit-sm text-xs font-mono uppercase tracking-wider"
          style={{
            backgroundColor: "color-mix(in srgb, var(--surface) 12%, transparent)",
            border: "1px solid color-mix(in srgb, var(--surface) 22%, transparent)",
          }}
        >
          <span>Get started</span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight leading-[1.1]">
          Know what your agents did, and prove it.
        </h2>

        <p className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed opacity-75">
          Record what your agents do, tie it to who allowed it, and let anyone verify it.
        </p>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all shadow-2xs cursor-pointer hover:opacity-90"
            style={{ backgroundColor: "var(--surface)", color: "var(--fg)" }}
          >
            Get started
          </button>

          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 text-[15px] font-medium rounded-babit transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            style={{
              backgroundColor: "transparent",
              color: "var(--surface)",
              border: "1px solid color-mix(in srgb, var(--surface) 22%, transparent)",
            }}
          >
            <span>Read the docs</span>
            <span className="opacity-70">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
