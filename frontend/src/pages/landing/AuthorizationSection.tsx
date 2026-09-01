export function AuthorizationSection() {
  const grantFields = [
    { name: "grant_id", type: "string", example: "BAL-417849", desc: "Unique cryptographic ticket identifier" },
    { name: "parent_grant_id", type: "string", example: "BAL-100200", desc: "Parent grant in the delegation hierarchy" },
    { name: "principal_id", type: "string", example: "usr_alice", desc: "Human supervisor or authorizing agent" },
    { name: "subject_id", type: "string", example: "agt_shopper", desc: "Target agent granted scoped capability" },
    { name: "capabilities", type: "string[]", example: '["browser.click", "browser.type"]', desc: "Explicitly allowed execution primitives" },
    { name: "resource_globs", type: "string[]", example: '["https://shop.example.com/*"]', desc: "Target URL/API wildcard pattern match" },
    { name: "max_value_cents", type: "int64", example: "50000 ($500.00)", desc: "Financial transaction ceiling" },
    { name: "max_depth", type: "int32", example: "2", desc: "Maximum sub-delegation depth allowed" },
    { name: "expires_at", type: "Timestamp", example: "2026-09-01T18:00:00Z", desc: "Cryptographic expiration cutoff" },
    { name: "parent_signature", type: "bytes", example: "ed25519:6c81...a98", desc: "Asymmetric signature from grantor" },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 border-t border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-neutral-500">
            AUTHORIZATION MODEL
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-neutral-900 leading-tight">
            Every action starts with authority.
          </h2>
          <p className="text-[17px] text-neutral-600 leading-relaxed">
            Babit grants strictly define what an agent is permitted to execute, bound by resource patterns,
            financial ceilings, sub-delegation limits, and cryptographic expiration.
          </p>
        </div>

        {/* Real Grant Schema Table */}
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-2xs">
          <div className="px-5 py-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between font-mono text-xs">
            <span className="font-semibold text-neutral-900">solari.ledger.v1.Grant</span>
            <span className="text-neutral-500">PROTOBUF SCHEMA & RUNTIME MODEL</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-50/50 text-neutral-500 border-b border-neutral-200 text-[11px]">
                <tr>
                  <th className="px-5 py-2.5 font-medium">Field</th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Runtime Example</th>
                  <th className="px-5 py-2.5 font-medium font-sans">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {grantFields.map((f) => (
                  <tr key={f.name} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-3 font-semibold text-neutral-900">{f.name}</td>
                    <td className="px-5 py-3 text-neutral-500">{f.type}</td>
                    <td className="px-5 py-3 text-neutral-700">{f.example}</td>
                    <td className="px-5 py-3 font-sans text-xs text-neutral-600">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
