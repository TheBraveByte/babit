import { useState } from "react";
import { StatusPill, Copyable, EmptyState, Button, Field, TextInput } from "@/lib/ui";
import { IconCpu, IconSearch, IconCheck } from "@/lib/icons";

interface AgentRecord {
  id: string;
  name: string;
  status: "ACTIVE" | "REVOKED";
  supervisor: string;
  capabilities: string[];
  actionsCount: number;
  lastActive: string;
  publicKey: string;
}

const initialAgents: AgentRecord[] = [
  {
    id: "agt_claims_01",
    name: "claims-agent",
    status: "ACTIVE",
    supervisor: "usr_alice",
    capabilities: ["claims.review", "claims.approve_payout", "document.verify"],
    actionsCount: 5820,
    lastActive: "14:32:08 UTC",
    publicKey: "ed25519:9f81a82910bc491028a01928471029c",
  },
  {
    id: "agt_browser_worker",
    name: "browser-worker",
    status: "ACTIVE",
    supervisor: "claims-agent",
    capabilities: ["browser.click", "browser.type", "page.navigate"],
    actionsCount: 3410,
    lastActive: "14:28:44 UTC",
    publicKey: "ed25519:1d82fec094b1920ac34102948192ba4",
  },
  {
    id: "agt_triage_bot",
    name: "triage-agent",
    status: "ACTIVE",
    supervisor: "usr_alice",
    capabilities: ["document.ocr_extract", "metadata.parse"],
    actionsCount: 2190,
    lastActive: "14:19:02 UTC",
    publicKey: "ed25519:7b91ac42109281a0b12903847192bc4",
  },
  {
    id: "agt_fraud_scanner",
    name: "fraud-scanner",
    status: "ACTIVE",
    supervisor: "usr_alice",
    capabilities: ["risk.calculate_score", "anomaly.flag"],
    actionsCount: 890,
    lastActive: "13:55:18 UTC",
    publicKey: "ed25519:44d019ac77102948192ba4810294810",
  },
];

export function Agents() {
  const [agents, setAgents] = useState<AgentRecord[]>(initialAgents);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Form state for agent registration
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentSupervisor, setNewAgentSupervisor] = useState("usr_alice");
  const [newAgentCapabilities, setNewAgentCapabilities] = useState("claims.execute, browser.interact");

  const filtered = agents.filter(
    (a) =>
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.supervisor.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegisterAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const rawCaps = newAgentCapabilities
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const newAg: AgentRecord = {
      id: `agt_${newAgentName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: newAgentName.trim(),
      status: "ACTIVE",
      supervisor: newAgentSupervisor.trim() || "usr_alice",
      capabilities: rawCaps.length > 0 ? rawCaps : ["action.execute"],
      actionsCount: 0,
      lastActive: "Just now",
      publicKey: "ed25519:" + Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join(''),
    };

    setAgents([newAg, ...agents]);
    setNewAgentName("");
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
            Agents
          </h1>
          <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
            Registered autonomous subjects, cryptographic identities, and capability boundaries.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-3.5 py-2 rounded-babit text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-90"
          style={{
            backgroundColor: "var(--fg)",
            color: "var(--surface)",
          }}
        >
          <IconCpu className="w-3.5 h-3.5" />
          <span>Register Agent</span>
        </button>
      </div>

      {/* Search Bar */}
      <div
        className="p-3 rounded-babit shadow-xs"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="w-full sm:w-80 relative">
          <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by name, ID, or supervisor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-babit-sm outline-none transition-colors"
            style={{
              backgroundColor: "var(--secondary)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          />
        </div>
      </div>

      {/* Agents Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No agents found"
          description="Try a different search query or register a new agent subject."
          icon={<IconCpu className="w-5 h-5" />}
        />
      ) : (
        <div
          className="rounded-babit-lg shadow-xs overflow-hidden"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead
                className="text-[11px]"
                style={{
                  backgroundColor: "var(--secondary)",
                  color: "var(--muted)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <tr>
                  <th className="px-5 py-3 font-medium">Agent Subject</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Supervisor</th>
                  <th className="px-5 py-3 font-medium font-sans">Permitted Capabilities</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                  <th className="px-5 py-3 font-medium text-right">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: "var(--border-subtle)" }}>
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAgent(a)}
                    className="transition-colors cursor-pointer hover:bg-[var(--secondary)]"
                    style={{ color: "var(--fg)" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{a.name}</div>
                      <div className="text-[10px]" style={{ color: "var(--muted)" }}>{a.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={a.status} />
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{a.supervisor}</td>
                    <td className="px-5 py-3.5 font-sans">
                      <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                        {a.capabilities.map((c) => (
                          <span
                            key={c}
                            className="px-1.5 py-0.5 rounded-babit-sm"
                            style={{
                              backgroundColor: "var(--secondary)",
                              border: "1px solid var(--border)",
                              color: "var(--fg)",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold tnum">{a.actionsCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right" style={{ color: "var(--muted)" }}>{a.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Agent Modal Dialog */}
      {showRegisterModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowRegisterModal(false)}
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
                <h2 className="text-base font-semibold" style={{ color: "var(--fg)" }}>Register Autonomous Agent</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>Generate a cryptographic subject identity and define scopes.</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-sm p-1 rounded hover:bg-[var(--secondary)] cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterAgent} className="space-y-4 text-xs">
              <Field label="Agent Identifier Name">
                <TextInput
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. payout-executor"
                  required
                />
              </Field>

              <Field label="Authorizing Supervisor Principal">
                <TextInput
                  value={newAgentSupervisor}
                  onChange={(e) => setNewAgentSupervisor(e.target.value)}
                  placeholder="usr_alice"
                  required
                />
              </Field>

              <Field label="Permitted Capabilities (comma separated)">
                <TextInput
                  value={newAgentCapabilities}
                  onChange={(e) => setNewAgentCapabilities(e.target.value)}
                  placeholder="claims.review, payout.execute"
                />
              </Field>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowRegisterModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Generate Key & Register
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Detail Sheet */}
      {selectedAgent && (
        <div
          className="fixed inset-y-0 right-0 w-full sm:w-[480px] shadow-2xl z-50 p-6 overflow-y-auto space-y-6 animate-fade-in"
          style={{
            backgroundColor: "var(--surface)",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div>
              <span className="text-[10px] font-mono uppercase" style={{ color: "var(--muted)" }}>AGENT PROFILE</span>
              <h2 className="text-base font-semibold font-mono" style={{ color: "var(--fg)" }}>{selectedAgent.name}</h2>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="p-1 rounded-babit-sm cursor-pointer hover:bg-[var(--secondary)]"
              style={{ color: "var(--muted)" }}
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Identifier</span>
              <span className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{selectedAgent.id}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase block mb-1" style={{ color: "var(--muted)" }}>Ed25519 Public Key</span>
              <Copyable value={selectedAgent.publicKey} />
            </div>

            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Authorizing Supervisor</span>
              <span style={{ color: "var(--fg)" }}>{selectedAgent.supervisor}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Total Notarized Actions</span>
              <span className="text-lg font-bold" style={{ color: "var(--fg)" }}>{selectedAgent.actionsCount.toLocaleString()}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase block mb-1.5" style={{ color: "var(--muted)" }}>Permitted Capabilities</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAgent.capabilities.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-1 rounded-babit-sm"
                    style={{
                      backgroundColor: "var(--secondary)",
                      border: "1px solid var(--border)",
                      color: "var(--fg)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-babit bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5 font-sans">
              <IconCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Identity active. Subject public key registered with ledger notary.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
