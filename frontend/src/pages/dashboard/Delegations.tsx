import { useState } from "react";
import { StatusPill, Copyable } from "@/lib/ui";
import { IconUser, IconCpu, IconCheck } from "@/lib/icons";

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
  const [delegations] = useState<DelegationLink[]>(initialDelegations);
  const [selectedLink, setSelectedLink] = useState<DelegationLink | null>(null);

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#111111] tracking-tight leading-tight">
          Delegations
        </h1>
        <p className="text-sm sm:text-[15px] text-[#6B6B6B] mt-1">
          Understand how authority moves between principals and agents.
        </p>
      </div>

      {/* Main Relationship Tree */}
      <div className="bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg p-6 sm:p-8 space-y-6 shadow-xs font-mono text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F0ED]">
          <span className="text-xs uppercase text-[#6B6B6B] font-semibold">
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
          <div className="p-4 rounded-babit bg-[#F7F7F5] border border-[#E8E8E5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-babit-sm bg-[#111111] text-white">
                <IconUser className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">ROOT HUMAN PRINCIPAL</span>
                <span className="text-sm font-semibold text-[#111111]">usr_alice (Risk Supervisor)</span>
              </div>
            </div>
            <span className="text-xs text-[#6B6B6B]">Max Ceiling: $500,000</span>
          </div>

          {/* Children nodes */}
          <div className="pl-6 border-l-2 border-[#E8E8E5] space-y-3">
            {delegations.map((del) => (
              <div
                key={del.id}
                onClick={() => setSelectedLink(del)}
                className={`p-4 rounded-babit border transition-all cursor-pointer ${
                  selectedLink?.id === del.id
                    ? "bg-[#FFFFFF] border-[#111111] shadow-xs"
                    : "bg-[#FFFFFF] border-[#E8E8E5] hover:border-[#CCCCCC]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-babit-sm bg-[#F7F7F5] text-[#111111]">
                      <IconCpu className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#111111]">{del.to}</span>
                        <span className="text-[10px] text-[#6B6B6B]">(from {del.from})</span>
                      </div>
                      <span className="text-[11px] text-[#6B6B6B] block mt-0.5">Scope: {del.scope}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <StatusPill status={del.status} />
                    <span className="text-[11px] text-[#111111] font-semibold block mt-1">{del.maxAmount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delegation Sheet */}
      {selectedLink && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#FFFFFF] border-l border-[#E8E8E5] shadow-2xl z-50 p-6 overflow-y-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E5]">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#6B6B6B]">GRANT TICKET</span>
              <h2 className="text-base font-semibold font-mono text-[#111111]">{selectedLink.grantId}</h2>
            </div>
            <button
              onClick={() => setSelectedLink(null)}
              className="p-1 rounded-babit-sm text-[#6B6B6B] hover:text-[#111111] hover:bg-[#F7F7F5] cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">From (Authorizer)</span>
              <span className="text-sm font-semibold text-[#111111]">{selectedLink.from}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">To (Subject)</span>
              <span className="text-sm font-semibold text-[#111111]">{selectedLink.to}</span>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Parent Grant Ticket</span>
              <Copyable value={selectedLink.parentGrantId} />
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Permitted Scope Glob</span>
              <span className="text-[#111111] bg-[#F7F7F5] px-2 py-1 rounded border border-[#E8E8E5] block mt-1">
                {selectedLink.scope}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Financial Cap</span>
                <span className="text-[#111111] font-semibold">{selectedLink.maxAmount}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Max Depth</span>
                <span className="text-[#111111]">{selectedLink.depth} level</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Created At</span>
                <span className="text-[#6B6B6B] tnum">{selectedLink.created}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#6B6B6B] uppercase block">Expires At</span>
                <span className="text-[#6B6B6B] tnum">{selectedLink.expiry}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#6B6B6B] uppercase block">Parent Signature</span>
              <span className="text-[#6B6B6B] text-[11px] break-all block">{selectedLink.signature}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
