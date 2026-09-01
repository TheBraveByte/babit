import { useState } from "react";
import { StatusPill, Copyable, Button, Field, TextInput } from "@/lib/ui";
import { IconUser, IconCpu, IconCheck, IconGitBranch } from "@/lib/icons";

interface DelegationLink {
  id: string;
  from: string;
  to: string;
  grantId: string;
  parentGrantId: string;
  capabilities: string[];
  scope: string;
  maxAmount: string;
  depth: number;
  created: string;
  expiry: string;
  status: "ACTIVE" | "REVOKED";
  signature: string;
}

const initialDelegations: DelegationLink[] = [
  {
    id: "del_1",
    from: "usr_alice (Risk Supervisor)",
    to: "claims-orchestrator",
    grantId: "BAL-417849",
    parentGrantId: "BAL-ROOT-100200",
    capabilities: ["claims.review", "claims.approve", "payout.delegate"],
    scope: "https://internal.bank.io/claims/*",
    maxAmount: "$50,000.00",
    depth: 2,
    created: "2026-09-01T08:00:00Z",
    expiry: "2026-09-02T08:00:00Z",
    status: "ACTIVE",
    signature: "ed25519:12c4e81048b1092a9b71029c481028ab",
  },
  {
    id: "del_2",
    from: "claims-orchestrator",
    to: "payout-executor",
    grantId: "BAL-DEL-8921",
    parentGrantId: "BAL-417849",
    capabilities: ["claims.approve_payout"],
    scope: "https://internal.bank.io/claims/48102",
    maxAmount: "$5,000.00",
    depth: 1,
    created: "2026-09-01T10:00:00Z",
    expiry: "2026-09-01T18:00:00Z",
    status: "ACTIVE",
    signature: "ed25519:5c82a10934812a849102c9184a8b7c12",
  },
  {
    id: "del_3",
    from: "claims-orchestrator",
    to: "browser-worker",
    grantId: "BAL-DEL-4910",
    parentGrantId: "BAL-417849",
    capabilities: ["browser.click", "browser.upload"],
    scope: "https://internal.bank.io/docs/*",
    maxAmount: "$0.00",
    depth: 1,
    created: "2026-09-01T10:05:00Z",
    expiry: "2026-09-01T18:00:00Z",
    status: "ACTIVE",
    signature: "ed25519:77ca49120934812a849102c9184a8b7c",
  },
];

export function Delegations() {
  const [delegations, setDelegations] = useState<DelegationLink[]>(initialDelegations);
  const [selectedLink, setSelectedLink] = useState<DelegationLink | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form state for new grant
  const [fromPrincipal, setFromPrincipal] = useState("usr_alice (Risk Supervisor)");
  const [toSubject, setToSubject] = useState("");
  const [grantScope, setGrantScope] = useState("https://internal.bank.io/claims/*");
  const [grantCap, setGrantCap] = useState("$10,000.00");

  const handleIssueGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toSubject.trim()) return;

    const newGrant: DelegationLink = {
      id: `del_${Date.now()}`,
      from: fromPrincipal,
      to: toSubject.trim(),
      grantId: `BAL-DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      parentGrantId: "BAL-ROOT-100200",
      capabilities: ["action.execute"],
      scope: grantScope.trim() || "*",
      maxAmount: grantCap.trim() || "$0.00",
      depth: 1,
      created: new Date().toISOString(),
      expiry: new Date(Date.now() + 86400000).toISOString(),
      status: "ACTIVE",
      signature: "ed25519:" + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''),
    };

    setDelegations([...delegations, newGrant]);
    setToSubject("");
    setShowIssueModal(false);
  };

  const handleRevokeGrant = (grantId: string) => {
    setDelegations(
      delegations.map((d) => (d.grantId === grantId ? { ...d, status: "REVOKED" } : d))
    );
    if (selectedLink?.grantId === grantId) {
      setSelectedLink({ ...selectedLink, status: "REVOKED" });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
            Delegations
          </h1>
          <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
            Understand how authority moves between principals and agents with monotonic attenuation.
          </p>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          className="px-3.5 py-2 rounded-babit text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-90"
          style={{
            backgroundColor: "var(--fg)",
            color: "var(--surface)",
          }}
        >
          <IconGitBranch className="w-3.5 h-3.5" />
          <span>Issue Delegated Grant</span>
        </button>
      </div>

      {/* Main Relationship Tree */}
      <div
        className="rounded-babit-lg p-6 sm:p-8 space-y-6 shadow-xs font-mono text-xs"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <span className="text-xs uppercase font-semibold" style={{ color: "var(--muted)" }}>
            ACTIVE DELEGATION TREE
          </span>
          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
            <IconCheck className="w-3.5 h-3.5" />
            ATTENUATION ENFORCED
          </span>
        </div>

        {/* Tree Visual Flow */}
        <div className="space-y-4">
          {/* Root node */}
          <div
            className="p-4 rounded-babit flex items-center justify-between"
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-babit-sm"
                style={{ backgroundColor: "var(--fg)", color: "var(--surface)" }}
              >
                <IconUser className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>ROOT HUMAN PRINCIPAL</span>
                <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>usr_alice (Risk Supervisor)</span>
              </div>
            </div>
            <span className="text-xs font-semibold" style={{ color: "var(--muted)" }}>Max Ceiling: $500,000</span>
          </div>

          {/* Children nodes */}
          <div className="pl-6 space-y-3" style={{ borderLeft: "2px solid var(--border)" }}>
            {delegations.map((del) => (
              <div
                key={del.id}
                onClick={() => setSelectedLink(del)}
                className="p-4 rounded-babit transition-all cursor-pointer"
                style={{
                  backgroundColor: selectedLink?.id === del.id ? "var(--secondary)" : "var(--surface)",
                  border: `1.5px solid ${selectedLink?.id === del.id ? "var(--fg)" : "var(--border)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-babit-sm"
                      style={{ backgroundColor: "var(--secondary)", color: "var(--fg)" }}
                    >
                      <IconCpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{del.to}</span>
                        <span className="text-[10px]" style={{ color: "var(--muted)" }}>(from {del.from})</span>
                      </div>
                      <span className="text-[11px] block mt-0.5" style={{ color: "var(--muted)" }}>Scope: {del.scope}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <StatusPill status={del.status} />
                    <span className="text-[11px] font-semibold block mt-1" style={{ color: "var(--fg)" }}>{del.maxAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Issue Grant Modal */}
      {showIssueModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowIssueModal(false)}
        >
          <div
            className="w-full max-w-md rounded-babit-lg p-6 shadow-2xl space-y-4 font-sans"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <div>
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Issue Delegated Grant</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Grant scoped capability ticket with monotonic attenuation.</p>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-sm p-1 rounded hover:bg-[var(--secondary)] cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueGrant} className="space-y-4 text-xs">
              <Field label="Authorizing Principal (Parent)">
                <TextInput
                  value={fromPrincipal}
                  onChange={(e) => setFromPrincipal(e.target.value)}
                  disabled
                />
              </Field>

              <Field label="Delegated Subject Agent">
                <TextInput
                  value={toSubject}
                  onChange={(e) => setToSubject(e.target.value)}
                  placeholder="e.g. payout-executor"
                  required
                />
              </Field>

              <Field label="Resource Pattern Scope Glob">
                <TextInput
                  value={grantScope}
                  onChange={(e) => setGrantScope(e.target.value)}
                  placeholder="https://internal.bank.io/claims/*"
                  required
                />
              </Field>

              <Field label="Financial Ceiling Cap">
                <TextInput
                  value={grantCap}
                  onChange={(e) => setGrantCap(e.target.value)}
                  placeholder="$10,000.00"
                  required
                />
              </Field>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowIssueModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Sign & Issue Grant
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delegation Sheet */}
      {selectedLink && (
        <div
          className="fixed inset-y-0 right-0 w-full sm:w-[480px] shadow-2xl z-50 p-6 overflow-y-auto space-y-6 animate-fade-in"
          style={{
            backgroundColor: "var(--surface)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <span className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>GRANT TICKET</span>
              <h2 className="text-base font-semibold font-mono" style={{ color: "var(--fg)" }}>{selectedLink.grantId}</h2>
            </div>
            <button
              onClick={() => setSelectedLink(null)}
              className="p-1 rounded-babit-sm cursor-pointer hover:bg-[var(--secondary)]"
              style={{ color: "var(--muted)" }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>From (Authorizer)</span>
              <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{selectedLink.from}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>To (Subject)</span>
              <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{selectedLink.to}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Parent Grant Ticket</span>
              <Copyable value={selectedLink.parentGrantId} />
            </div>

            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Permitted Scope Glob</span>
              <span
                className="px-2 py-1 rounded block mt-1"
                style={{
                  backgroundColor: "var(--secondary)",
                  border: "1px solid var(--border)",
                  color: "var(--fg)",
                }}
              >
                {selectedLink.scope}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Financial Cap</span>
                <span className="font-semibold" style={{ color: "var(--fg)" }}>{selectedLink.maxAmount}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Max Depth</span>
                <span style={{ color: "var(--fg)" }}>{selectedLink.depth} level</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Created At</span>
                <span className="tnum" style={{ color: "var(--muted)" }}>{selectedLink.created}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Expires At</span>
                <span className="tnum" style={{ color: "var(--muted)" }}>{selectedLink.expiry}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Parent Signature</span>
              <span className="text-[11px] break-all block" style={{ color: "var(--muted)" }}>{selectedLink.signature}</span>
            </div>

            {selectedLink.status === "ACTIVE" && (
              <div className="pt-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRevokeGrant(selectedLink.grantId)}
                  className="w-full justify-center"
                >
                  Revoke Delegation Grant
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
