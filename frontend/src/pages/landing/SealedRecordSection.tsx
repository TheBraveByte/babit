import { IconDatabase, IconCheck } from "@/lib/icons";

export function SealedRecordSection() {
  const eventPayload = {
    event_id: "BAL-778812",
    session_id: "BAL-4a1055",
    sequence: 7,
    surface: "SURFACE_BROWSER",
    action_type: "browser.click",
    grant_id: "BAL-417849",
    recording_ref: "slr://session/demo",
    occurred_at: "2026-09-01T12:03:11Z",
    content_hash: "0x12c4e81048b1092a9b71029c481028ab",
    prev_hash: "0x3918fbc0192a8b71029c481028ab3918",
    notary_signature: "ed25519:5c82a10934812a849102c9184a8b7c12",
  };

  return (
    <section className="py-20 sm:py-28 border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            SEALED EVIDENCE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            Turn an action into evidence.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            Every recorded action is converted into an immutable, forward-hashed event structure,
            notarized with an asymmetric signature and anchored into a binary Merkle tree.
          </p>
        </div>

        {/* Real ActionEvent Box */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
              <IconDatabase className="w-4 h-4 text-neutral-400" />
              <span className="font-semibold text-neutral-900">solari.ledger.v1.ActionEvent</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              <IconCheck className="w-3 h-3" />
              SEALED RECORD
            </span>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 font-mono text-xs">
            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">event_id</span>
              <span className="text-neutral-900 font-semibold text-sm">{eventPayload.event_id}</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">session_id</span>
              <span className="text-neutral-800">{eventPayload.session_id}</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">sequence</span>
              <span className="text-neutral-900 font-semibold">#{eventPayload.sequence} (O(1) Forward-Linked)</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">surface</span>
              <span className="text-neutral-800">{eventPayload.surface}</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">action_type</span>
              <span className="text-neutral-900 font-semibold">{eventPayload.action_type}</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">grant_id</span>
              <span className="text-neutral-800">{eventPayload.grant_id}</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">occurred_at</span>
              <span className="text-neutral-700 tnum">{eventPayload.occurred_at}</span>
            </div>

            <div>
              <span className="text-[11px] text-neutral-400 uppercase block mb-1">recording_ref</span>
              <span className="text-neutral-700">{eventPayload.recording_ref}</span>
            </div>

            <div className="md:col-span-2 pt-3 border-t border-neutral-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">content_hash</span>
                <span className="text-neutral-800 text-[11px] truncate block">{eventPayload.content_hash}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">prev_hash</span>
                <span className="text-neutral-800 text-[11px] truncate block">{eventPayload.prev_hash}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase block">notary_signature</span>
                <span className="text-neutral-800 text-[11px] truncate block">{eventPayload.notary_signature}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
