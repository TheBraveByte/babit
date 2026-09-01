import { BabitLogo } from "@/lib/icons";
import { Link } from "@/lib/router";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E8E5] bg-[#FCFCFB] text-[#6B6B6B] text-xs font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Logo & Headline */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BabitLogo className="w-5 h-5 text-[#111111]" />
              <span className="font-semibold text-base tracking-tight font-mono text-[#111111]">
                babit
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] max-w-sm leading-relaxed">
              Proof for autonomous actions.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
              <span>Notary System Operational (100.0% SLA)</span>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block font-mono">
              Product
            </span>
            <ul className="space-y-2">
              <li><a href="#product" className="hover:text-[#111111] transition-colors">Logs vs Evidence</a></li>
              <li><a href="#product" className="hover:text-[#111111] transition-colors">Authority Chain</a></li>
              <li><a href="#developers" className="hover:text-[#111111] transition-colors">Receipt Spec</a></li>
              <li><Link to="/login" className="hover:text-[#111111] transition-colors">Console</Link></li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block font-mono">
              Developers
            </span>
            <ul className="space-y-2">
              <li><a href="#developers" className="hover:text-[#111111] transition-colors">API Reference</a></li>
              <li><a href="/docs" target="_blank" rel="noreferrer" className="hover:text-[#111111] transition-colors">Documentation ↗</a></li>
              <li><a href="/openapi.json" target="_blank" rel="noreferrer" className="hover:text-[#111111] transition-colors">OpenAPI Spec ↗</a></li>
              <li><a href="#security" className="hover:text-[#111111] transition-colors">Offline Verifier</a></li>
            </ul>
          </div>

          {/* Security & Governance */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#111111] block font-mono">
              Security
            </span>
            <ul className="space-y-2">
              <li><a href="#security" className="hover:text-[#111111] transition-colors">Ed25519 Notary</a></li>
              <li><a href="#security" className="hover:text-[#111111] transition-colors">Merkle Proofs</a></li>
              <li><span className="text-[#6B6B6B]">RFC 3161 TSA</span></li>
              <li><span className="text-[#6B6B6B]">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E8E8E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B6B] font-mono">
          <div>© {new Date().getFullYear()} Babit. Proof for autonomous actions.</div>
          <div className="flex items-center gap-4">
            <span>ed25519</span>
            <span>•</span>
            <span>sha256</span>
            <span>•</span>
            <span>merkle</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
