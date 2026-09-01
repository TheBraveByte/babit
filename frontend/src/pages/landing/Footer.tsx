import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--bg)",
        color: "var(--muted)",
      }}
      className="text-xs font-sans"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Tagline */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BabitLogo className="w-5 h-5" brandColor="var(--fg)" />
              <span
                className="font-semibold text-base tracking-tight font-mono"
                style={{ color: "var(--fg)" }}
              >
                babit
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--muted)" }}>
              Proof for autonomous actions.
            </p>
            {/* Operational status — no fake percentages */}
            <div
              className="inline-flex items-center gap-2 text-[11px] font-mono px-2.5 py-1 rounded-babit-sm"
              style={{
                color: "#065F46",
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle shrink-0" />
              <span>All systems operational</span>
            </div>
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
              <li><a href="#product" className="hover:text-[var(--fg)] transition-colors">How it works</a></li>
              <li><a href="#product" className="hover:text-[var(--fg)] transition-colors">Authority chain</a></li>
              <li><a href="#security" className="hover:text-[var(--fg)] transition-colors">Offline verification</a></li>
              <li><Link to="/login" className="hover:text-[var(--fg)] transition-colors">Console</Link></li>
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
              <li><a href="#developers" className="hover:text-[var(--fg)] transition-colors">API reference</a></li>
              <li>
                <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)] transition-colors">
                  Documentation ↗
                </a>
              </li>
              <li>
                <a href="/openapi.json" target="_blank" rel="noreferrer" className="hover:text-[var(--fg)] transition-colors">
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
              <li><a href="#security" className="hover:text-[var(--fg)] transition-colors">Ed25519 notary</a></li>
              <li><a href="#security" className="hover:text-[var(--fg)] transition-colors">Merkle proofs</a></li>
              <li><a href="#security" className="hover:text-[var(--fg)] transition-colors">Hash chains</a></li>
              <li><span>RFC 3161 TSA</span></li>
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
          <div>© {new Date().getFullYear()} Babit. Proof for autonomous actions.</div>
          <div className="flex items-center gap-4">
            <span>ed25519</span>
            <span style={{ color: "var(--border)" }}>•</span>
            <span>sha-256</span>
            <span style={{ color: "var(--border)" }}>•</span>
            <span>merkle</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
