import { useEffect, useState } from "react";
import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";

export function ApiReference() {
  const [Scalar, setScalar] = useState<React.ComponentType<any> | null>(null);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    import("@scalar/api-reference-react").then((m) => {
      setScalar(() => m.ApiReferenceReact);
      import("@scalar/api-reference-react/style.css");
    });
    fetch("/openapi.v3.json")
      .then((r) => r.json())
      .then(setSpec)
      .catch(() => {
        import("../../openapi.v3.json").then((m) => setSpec(m.default as Record<string, unknown>));
      });
  }, []);

  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <header
        className="h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 glass-subtle"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <BabitLogo className="w-5 h-5 text-[color:var(--fg)]" />
          <span className="font-semibold text-[15px] tracking-tight font-mono text-[color:var(--fg)]">
            babit
          </span>
          <span className="text-[13px] font-mono" style={{ color: "var(--muted)" }}>
            / API
          </span>
        </Link>
        <Link
          to="/"
          className="text-[13px] font-medium px-2.5 py-1 rounded-babit transition-colors hover:bg-[var(--secondary)]"
          style={{ color: "var(--muted)" }}
        >
          Back to babit
        </Link>
      </header>
      {Scalar && spec ? (
        <Scalar configuration={{ content: spec, hideModels: false }} />
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div
            className="w-5 h-5 rounded-full animate-spin"
            style={{ border: "2px solid var(--border)", borderTopColor: "var(--brand-accent)" }}
          />
        </div>
      )}
    </div>
  );
}
