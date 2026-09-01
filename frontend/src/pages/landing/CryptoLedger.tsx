import { IconDatabase, IconCheck } from "@/lib/icons";

export function CryptoLedger() {
  const events = [
    {
      seq: "#8291",
      time: "10:41:20.104Z",
      actionId: "act_verify_doc_019",
      agentId: "agt_triager",
      authId: "BAL-928103",
      prevHash: "0x7a81...91b2",
      currHash: "0x12c4...e810",
      sig: "ed25519:39f1...001a",
      status: "SEALED",
    },
    {
      seq: "#8292",
      time: "10:41:38.491Z",
      actionId: "act_match_policy_481",
      agentId: "agt_policy_eval",
      authId: "BAL-928103",
      prevHash: "0x12c4...e810",
      currHash: "0x98b1...55da",
      sig: "ed25519:77ca...4912",
      status: "SEALED",
    },
    {
      seq: "#8293",
      time: "10:42:01.810Z",
      actionId: "act_calc_payout_902",
      agentId: "agt_risk_calc",
      authId: "BAL-928103",
      prevHash: "0x98b1...55da",
      currHash: "0x44d0...19ac",
      sig: "ed25519:88aa...6102",
      status: "SEALED",
    },
    {
      seq: "#8294",
      time: "10:42:19.492Z",
      actionId: "act_payout_authorized_491",
      agentId: "agt_claims_01",
      authId: "BAL-DEL-8921",
      prevHash: "0x44d0...19ac",
      currHash: "0xd829...8491",
      sig: "ed25519:92af...e401",
      status: "ANCHORED",
    },
  ];

  return (
    <section id="ledger" className="py-20 sm:py-28 bg-white border-b border-neutral-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            Immutable Sequence
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Logs can be edited. Proof can be verified.
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto">
            Every recorded action is bound by SHA-256 forward-hash linking, committed into a Merkle tree,
            and attested by an asymmetric Notary seal.
          </p>
        </div>

        {/* Realistic Ledger Table */}
        <div className="max-w-5xl mx-auto border border-neutral-200/90 rounded-xl overflow-hidden shadow-xs bg-neutral-950 text-neutral-100">
          <div className="px-5 py-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <IconDatabase className="w-4 h-4 text-neutral-400" />
              <span className="font-semibold text-white">NAL Immutable Event Ledger</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-400 text-[11px]">
              <span>TOTAL LEAVES: 8,294</span>
              <span>•</span>
              <span className="text-emerald-400">MERKLE ROOT: 0x9f83...c712</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-neutral-900/40 text-neutral-400 border-b border-neutral-800/80">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Seq</th>
                  <th className="px-4 py-2.5 font-medium">Timestamp (UTC)</th>
                  <th className="px-4 py-2.5 font-medium">Action Event ID</th>
                  <th className="px-4 py-2.5 font-medium">Agent</th>
                  <th className="px-4 py-2.5 font-medium">Prev Hash</th>
                  <th className="px-4 py-2.5 font-medium">Current Hash</th>
                  <th className="px-4 py-2.5 font-medium">Notary Seal</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-neutral-300">
                {events.map((e) => (
                  <tr key={e.seq} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-emerald-400">{e.seq}</td>
                    <td className="px-4 py-3 text-neutral-400">{e.time}</td>
                    <td className="px-4 py-3 text-white">{e.actionId}</td>
                    <td className="px-4 py-3 text-neutral-300">{e.agentId}</td>
                    <td className="px-4 py-3 text-neutral-500">{e.prevHash}</td>
                    <td className="px-4 py-3 text-neutral-200">{e.currHash}</td>
                    <td className="px-4 py-3 text-neutral-400">{e.sig}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900">
                        <IconCheck className="w-2.5 h-2.5" />
                        {e.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ledger Cryptographic Structure Strip */}
          <div className="p-4 bg-neutral-900 border-t border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-center">
            <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">1. Forward Hash Chain</span>
              <span className="text-neutral-200 font-semibold text-xs">O(1) Sequence Order</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">2. Merkle Tree</span>
              <span className="text-neutral-200 font-semibold text-xs">Binary Leaf Tree</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">3. Tree Root</span>
              <span className="text-emerald-400 font-semibold text-xs">0x9f83...c712</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">4. External Anchor</span>
              <span className="text-neutral-200 font-semibold text-xs">Time Attestation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
