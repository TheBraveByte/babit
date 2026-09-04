import { useState } from "react";
import { BabitLogo, IconXCircle } from "@/lib/icons";
import { docsUrl } from "@/lib/links";
import { Link } from "@/lib/router";
import { Card } from "@/lib/ui";

export function Footer() {
  const [creditOpen, setCreditOpen] = useState(false);

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
          <div className="flex items-center gap-2">
            <span>Inspired by</span>
            <button
              onClick={() => setCreditOpen(true)}
              className="hover:text-[var(--fg)] transition-colors cursor-pointer"
              style={{ color: "var(--brand-accent)" }}
            >
              Solari and Pinetree Research
            </button>
          </div>
        </div>
      </div>

      {/* Credit modal */}
      {creditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: "color-mix(in srgb, var(--fg) 40%, transparent)" }}
          onClick={() => setCreditOpen(false)}
        >
          <Card
            title="Why this exists"
            className="w-full max-w-md"
            action={
              <button
                onClick={() => setCreditOpen(false)}
                className="p-1 rounded-babit-sm hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <IconXCircle className="w-4 h-4 text-[var(--muted)]" />
              </button>
            }
          >
            <div className="space-y-4 text-sm" style={{ color: "var(--muted)" }}>
              <p style={{ color: "var(--fg)" }}>
                Babit was inspired by a challenge from Harry Chow and the Solari team at Pinetree
                Research.
              </p>
              <p>
                The challenge was simple. Fork Solari, build a real use case, and ship. Use AI if it
                helps. We did exactly that.
              </p>
              <p style={{ color: "var(--fg)" }}>
                Babit is our proof: signed receipts for autonomous actions. No resumes. Just code.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="https://github.com/solari-sdk/solari-cookbook/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium hover:opacity-80"
                  style={{ color: "var(--brand-accent)" }}
                >
                  View the Solari cookbook ↗
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
    </footer>
  );
}
