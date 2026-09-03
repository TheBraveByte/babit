import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { Link } from "@/lib/router";
import { BabitLogo } from "@/lib/icons";
import spec from "../../openapi.v3.json";


export function ApiReference() {
  return (
    <div id="main-content" tabIndex={-1} className="min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <header
        className="h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 glass-subtle"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <BabitLogo className="w-5 h-5 text-[color:var(--fg)]" />
          <span className="font-semibold text-[15px] tracking-tight font-mono text-[color:var(--fg)]">babit</span>
          <span className="text-[13px] font-mono" style={{ color: "var(--muted)" }}>/ API</span>
        </Link>
        <Link
          to="/"
          className="text-[13px] font-medium px-2.5 py-1 rounded-babit transition-colors hover:bg-[var(--secondary)]"
          style={{ color: "var(--muted)" }}
        >
          Back to babit
        </Link>
      </header>
      <ApiReferenceReact
        configuration={{
          content: spec as unknown as Record<string, unknown>,
          hideModels: false,
        }}
      />
    </div>
  );
}
