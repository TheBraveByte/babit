import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";
import { docsUrl } from "@/lib/links";

export function Footer() {
  return (
    <footer
      style={{ backgroundColor: "var(--bg)", color: "var(--muted)" }}
      className="text-xs font-sans relative"
    >
      <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
      <div className="container-babit py-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BabitLogo className="w-5 h-5" brandColor="var(--fg)" />
              <span
                className="font-medium text-base tracking-tight font-mono"
                style={{ color: "var(--fg)" }}
              >
                babit
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--muted)" }}>
              A signed receipt for what your agents do. Independently auditable.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider block font-mono"
              style={{ color: "var(--fg)" }}
            >
              Product
            </span>
            <ul className="space-y-2" style={{ color: "var(--muted)" }}>
              <li>
                <a href="/#how" className="hover:text-[var(--fg)] transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#authority" className="hover:text-[var(--fg)] transition-colors">
                  Chain of authority
                </a>
              </li>
              <li>
                <a href="/#receipt" className="hover:text-[var(--fg)] transition-colors">
                  The receipt
                </a>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-[var(--fg)] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[var(--fg)] transition-colors">
                  Console
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider block font-mono"
              style={{ color: "var(--fg)" }}
            >
              Developers
            </span>
            <ul className="space-y-2" style={{ color: "var(--muted)" }}>
              <li>
                <Link to="/api" className="hover:text-[var(--fg)] transition-colors">
                  API reference
                </Link>
              </li>
              <li>
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--fg)] transition-colors"
                >
                  Documentation ↗
                </a>
              </li>
              <li>
                <a
                  href="/openapi.json"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[var(--fg)] transition-colors"
                >
                  OpenAPI spec ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div className="space-y-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider block font-mono"
              style={{ color: "var(--fg)" }}
            >
              Security
            </span>
            <ul className="space-y-2" style={{ color: "var(--muted)" }}>
              <li>
                <Link to="/security" className="hover:text-[var(--fg)] transition-colors">
                  Security & compliance
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[var(--fg)] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono"
          style={{
            borderTop: "1px solid var(--border)",
            color: "var(--muted)",
          }}
        >
          <div>© {new Date().getFullYear()} babit. Proof for autonomous actions.</div>
          <div>Verifiable by design.</div>
        </div>
      </div>
    </footer>
  );
}
