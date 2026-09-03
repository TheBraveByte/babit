import { useRouter } from "@/lib/router";
import { docsUrl } from "@/lib/links";

export function FinalCTA() {
  const { navigate } = useRouter();

  return (
    <section className="section-y-lg border-t" style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)" }}>
      <div className="container-babit">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="type-display" style={{ color: "var(--fg)" }}>
            Know what your agents did, and prove it.
          </h2>

          <p className="type-lead mt-6 max-w-xl mx-auto">
            Record what your agents do, tie it to who allowed it, and let anyone verify it.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2.5 text-[15px] font-medium rounded-babit transition-opacity cursor-pointer hover:opacity-90"
              style={{ backgroundColor: "var(--fg)", color: "var(--bg)" }}
            >
              Start recording actions
            </button>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 text-[15px] font-medium rounded-babit transition-colors cursor-pointer inline-flex items-center gap-1.5"
              style={{ color: "var(--fg)", border: "1px solid var(--border)" }}
            >
              <span>Read the docs</span>
              <span style={{ color: "var(--muted)" }}>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
