import { useState } from "react";
import { IconCheck } from "@/lib/icons";

export function TamperDemo() {
  const [tampered, setTampered] = useState(false);

  const original = {
    event_id: "BAL-778812",
    action_type: "browser.click",
    resource: "https://shop.example.com/cart",
    value_cents: 50000,
    content_hash: "0x12c4e81048b1092a9b71029c481028ab",
    expected_hash: "0x12c4e81048b1092a9b71029c481028ab",
    signature_status: "VALID",
    hash_status: "MATCH",
    verdict: "VERIFIED",
  };

  const modified = {
    event_id: "BAL-778812",
    action_type: "browser.click",
    resource: "https://shop.example.com/cart",
    value_cents: 500000, // Modified from $500.00 to $5000.00
    content_hash: "0xf4019a82bb30281c9a103847291048b1", // Recomputed
    expected_hash: "0x12c4e81048b1092a9b71029c481028ab", // Signed
    signature_status: "INVALID",
    hash_status: "MISMATCH",
    verdict: "INTEGRITY CHECK FAILED",
  };

  const current = tampered ? modified : original;

  return (
    <section className="py-20 sm:py-28 border-t border-neutral-200 bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            TAMPER DETECTION
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            Cryptographic integrity check.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            Modify any field in a sealed record. The SHA-256 hash recalculation and Ed25519 signature
            check immediately identify unauthorized mutation.
          </p>
        </div>

        {/* Interactive Comparison Card */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-neutral-500">RECORD STATE:</span>
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded border ${
                  tampered
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {tampered ? "MODIFIED RECORD (VALUE CHANGED)" : "VALID RECORD (CANONICAL)"}
              </span>
            </div>

            <button
              onClick={() => setTampered(!tampered)}
              className="px-3.5 py-1.5 rounded text-xs font-mono font-medium border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              {tampered ? "Restore Original Value" : "Modify value_cents to 500000"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start font-mono text-xs">
            {/* Record Payload */}
            <div className="space-y-3">
              <span className="text-[11px] text-neutral-400 uppercase block">Record Payload</span>
              <div className="p-4 rounded bg-neutral-50 border border-neutral-200 space-y-2 leading-relaxed">
                <div><span className="text-neutral-500">event_id:</span> <span className="text-neutral-900">{current.event_id}</span></div>
                <div><span className="text-neutral-500">action_type:</span> <span className="text-neutral-900">{current.action_type}</span></div>
                <div><span className="text-neutral-500">resource:</span> <span className="text-neutral-900">{current.resource}</span></div>
                <div className={`p-1 rounded ${tampered ? "bg-red-100 text-red-900 font-bold" : "text-neutral-900 font-semibold"}`}>
                  <span className="text-neutral-500">value_cents:</span> {current.value_cents} (${(current.value_cents / 100).toFixed(2)} USD)
                </div>
              </div>
            </div>

            {/* Cryptographic Verification Engine Result */}
            <div className="space-y-3">
              <span className="text-[11px] text-neutral-400 uppercase block">Verification Status</span>
              <div className="p-4 rounded bg-neutral-50 border border-neutral-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Computed Hash:</span>
                  <span className={tampered ? "text-red-700 font-bold" : "text-neutral-900"}>{current.content_hash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Signed Hash:</span>
                  <span className="text-neutral-900">{current.expected_hash}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
                  <span className="text-neutral-500">Hash Match:</span>
                  <span className={tampered ? "text-red-700 font-bold" : "text-emerald-700 font-bold"}>{current.hash_status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Signature Check:</span>
                  <span className={tampered ? "text-red-700 font-bold" : "text-emerald-700 font-bold"}>{current.signature_status}</span>
                </div>

                <div
                  className={`mt-3 p-2.5 rounded text-center font-bold text-xs border ${
                    tampered
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center justify-center gap-1.5"
                  }`}
                >
                  {!tampered && <IconCheck className="w-3.5 h-3.5 text-emerald-700" />}
                  <span>{current.verdict}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
