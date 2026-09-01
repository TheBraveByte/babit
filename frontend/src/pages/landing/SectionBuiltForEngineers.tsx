import { useState } from "react";
import { IconCopy, IconCheck } from "@/lib/icons";

export function SectionBuiltForEngineers() {
  const [tab, setTab] = useState<"request" | "response" | "receipt">("request");
  const [copied, setCopied] = useState(false);

  const snippets = {
    request: `POST /v1/sessions/BAL-4a1055/actions HTTP/1.1
Host: api.babit.dev
Authorization: Bearer babit_live_token_...
Content-Type: application/json

{
  "grant_id": "BAL-417849",
  "action_type": "claims.approve_payout",
  "resource": "https://internal.bank.io/claims/48102",
  "value_cents": 420000,
  "recording_ref": "slr://session/rec_49102"
}`,

    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "event": {
    "event_id": "BAL-778812",
    "session_id": "BAL-4a1055",
    "sequence": 7,
    "surface": "SURFACE_BROWSER",
    "action_type": "claims.approve_payout",
    "grant_id": "BAL-417849",
    "occurred_at": "2026-09-01T14:32:08Z",
    "content_hash": "0xd8291a849102c9184a8b7c120934812a",
    "prev_hash": "0x44d019ac77102948192ba48102948102",
    "notary_signature": "ed25519:5c82a10934812a849102c9184a8b7c12"
  }
}`,

    receipt: `{
  "receipt_id": "rcpt_BAL_778812",
  "verification": {
    "valid": true,
    "chain_intact": true,
    "signature_valid": true,
    "authority_valid": true,
    "anchored": true
  },
  "merkle_root": "0x9f83dc712094812a9b71029c481028ab",
  "notary_signature": "ed25519:5c82a10934812a849102c9184a8b7c12"
}`,
  };

  const handleCopy = () => {
    void navigator.clipboard?.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section id="developers" className="py-24 sm:py-32 border-t border-[#E8E8E5] bg-[#FFFFFF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#6B6B6B]">
            DEVELOPER INTEGRATION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold tracking-tight text-[#111111] leading-tight">
            Built for engineers.
          </h2>
          <p className="text-[18px] sm:text-[19px] text-[#6B6B6B] leading-relaxed">
            Record, notarize, and seal an action with a single HTTP or gRPC call. Babit drops directly into your agent runtime.
          </p>
        </div>

        {/* Code Editor Box */}
        <div className="max-w-3xl mx-auto bg-[#101212] text-[#F5F6F4] rounded-babit-lg border border-[#242826] shadow-sm overflow-hidden font-mono text-xs">
          {/* Header tabs */}
          <div className="px-4 py-3 bg-[#090A0A] border-b border-[#242826] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(["request", "response", "receipt"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-babit-sm text-xs font-mono capitalize transition-colors cursor-pointer ${
                    tab === t ? "bg-[#242826] text-white font-semibold" : "text-[#929894] hover:text-[#F5F6F4]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-[#929894] hover:text-white px-2.5 py-1 rounded hover:bg-[#242826] transition-colors cursor-pointer"
            >
              {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <pre className="p-6 text-xs text-[#F5F6F4] overflow-x-auto leading-relaxed bg-[#101212]">
            {snippets[tab]}
          </pre>
        </div>
      </div>
    </section>
  );
}
