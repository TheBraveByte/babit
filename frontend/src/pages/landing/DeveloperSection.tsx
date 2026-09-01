import { useState } from "react";
import { IconCopy, IconCheck } from "@/lib/icons";

export function DeveloperSection() {
  const [tab, setTab] = useState<"request" | "response" | "receipt">("request");
  const [copied, setCopied] = useState(false);

  const snippets = {
    request: `POST /v1/sessions/BAL-4a1055/actions HTTP/1.1
Host: api.babit.dev
Authorization: Bearer babit_token_...
Content-Type: application/json

{
  "grant_id": "BAL-417849",
  "action_type": "browser.click",
  "resource": "https://shop.example.com/cart",
  "value_cents": 50000,
  "recording_ref": "slr://session/demo"
}`,

    response: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "event": {
    "event_id": "BAL-778812",
    "session_id": "BAL-4a1055",
    "sequence": 7,
    "surface": "SURFACE_BROWSER",
    "action_type": "browser.click",
    "grant_id": "BAL-417849",
    "occurred_at": "2026-09-01T12:03:11Z",
    "content_hash": "0x12c4e81048b1092a9b71029c481028ab",
    "prev_hash": "0x3918fbc0192a8b71029c481028ab3918",
    "notary_signature": "ed25519:5c82a10934812a849102c9184a8b7c12"
  }
}`,

    receipt: `{
  "receipt_id": "BAL-778812",
  "verification": {
    "valid": true,
    "chain_intact": true,
    "signature_valid": true,
    "authority_valid": true,
    "anchored": true
  },
  "merkle_root": "0x9f83dc712094812a9b71029c481028ab",
  "notary_seal": "ed25519:5c82a10934812a849102c9184a8b7c12"
}`,
  };

  const handleCopy = () => {
    void navigator.clipboard?.writeText(snippets[tab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <section id="developers" className="py-20 sm:py-28 border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            API CONTRACT
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            One call. Verifiable evidence.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            Integrate the accountability layer into any autonomous agent runtime in minutes using standard HTTP/JSON or gRPC.
          </p>
        </div>

        {/* API Code Box */}
        <div className="max-w-3xl bg-neutral-900 text-white rounded-lg border border-neutral-800 shadow-sm overflow-hidden font-mono text-xs">
          {/* Header tabs */}
          <div className="px-4 py-2.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(["request", "response", "receipt"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded text-xs font-mono capitalize transition-colors cursor-pointer ${
                    tab === t ? "bg-neutral-800 text-white font-semibold" : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-1 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied ? <IconCheck className="w-3.5 h-3.5 text-emerald-400" /> : <IconCopy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          <pre className="p-6 text-xs text-neutral-200 overflow-x-auto leading-relaxed bg-neutral-950">
            {snippets[tab]}
          </pre>
        </div>
      </div>
    </section>
  );
}
