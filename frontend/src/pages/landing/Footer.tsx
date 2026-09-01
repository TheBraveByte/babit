import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 text-neutral-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Positioning */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BabitLogo className="w-5 h-5 text-neutral-900" />
              <span className="font-semibold text-base tracking-tight font-mono text-neutral-900">
                babit
              </span>
            </div>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              The evidence and accountability layer for autonomous AI agents.
              Cryptographically verified delegation, action capture, and immutable receipts.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Notary System Operational (100.0% SLA)</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 block font-mono">
              Product
            </span>
            <ul className="space-y-2">
              <li><a href="#product" className="hover:text-neutral-900 transition-colors">Architecture</a></li>
              <li><a href="#ledger" className="hover:text-neutral-900 transition-colors">Immutable Ledger</a></li>
              <li><a href="#tamper-demo" className="hover:text-neutral-900 transition-colors">Tamper Detection</a></li>
              <li><a href="#security" className="hover:text-neutral-900 transition-colors">Cryptography</a></li>
              <li><Link to="/login" className="hover:text-neutral-900 transition-colors">Console</Link></li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 block font-mono">
              Developers
            </span>
            <ul className="space-y-2">
              <li><a href="#developers" className="hover:text-neutral-900 transition-colors">Go SDK</a></li>
              <li><a href="#developers" className="hover:text-neutral-900 transition-colors">TypeScript Client</a></li>
              <li><a href="#developers" className="hover:text-neutral-900 transition-colors">Python Bindings</a></li>
              <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-neutral-900 transition-colors">Scalar API Docs ↗</a></li>
              <li><a href="/openapi.json" target="_blank" rel="noreferrer" className="hover:text-neutral-900 transition-colors">OpenAPI Spec ↗</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-900 block font-mono">
              Governance
            </span>
            <ul className="space-y-2">
              <li><span className="text-neutral-400">Security Disclosures</span></li>
              <li><span className="text-neutral-400">SOC2 Type II Ready</span></li>
              <li><span className="text-neutral-400">HIPAA BAA Ready</span></li>
              <li><span className="text-neutral-400">Privacy Policy</span></li>
              <li><span className="text-neutral-400">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
          <div>© {new Date().getFullYear()} Babit Technologies Inc. Proof for autonomous actions.</div>
          <div className="flex items-center gap-4">
            <span>ed25519 notary</span>
            <span>•</span>
            <span>sha256 merkle</span>
            <span>•</span>
            <span>solari capture</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
