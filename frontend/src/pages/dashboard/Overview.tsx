import { useEffect, useState } from "react";
import { Copyable } from "@/lib/ui";
import { IconShieldCheck, IconGitBranch, IconFileText, IconArrowRight, IconKey } from "@/lib/icons";
import type { DashboardTab } from "./DashboardLayout";
import { useAuth } from "@/lib/auth";
import { api } from "@/api/client";

export function Overview({ onNavigate }: { onNavigate: (tab: DashboardTab) => void }) {
  const { user, branding } = useAuth();
  const [keyId, setKeyId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.GET("/v1/notary/public-key", {});
        if (!active) return;
        if (res.data?.public_key) {
          setKeyId(res.data.key_id ?? null);
          setPublicKey(res.data.public_key);
        } else {
          setKeyError(true);
        }
      } catch {
        if (active) setKeyError(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const accountType = user?.account_type === "ACCOUNT_TYPE_ORGANIZATION" ? "Organization" : "Personal";
  const workspace = branding?.company_name || user?.org_name || "Personal workspace";

  const quickActions: { tab: DashboardTab; title: string; desc: string; icon: React.ReactNode }[] = [
    { tab: "verify", title: "Verify evidence", desc: "Check a receipt or proof independently.", icon: <IconShieldCheck className="w-4 h-4 text-emerald-700" /> },
    { tab: "delegations", title: "Grants", desc: "Issue, delegate, verify and revoke authority.", icon: <IconGitBranch className="w-4 h-4" /> },
    { tab: "receipts", title: "Receipts", desc: "Fetch the sealed proof for an action.", icon: <IconFileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
          Overview
        </h1>
        <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
          Proof for autonomous actions. Everything here is retrieved directly from the Babit ledger.
        </p>
      </div>

      {/* Workspace summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-babit-lg p-5 shadow-xs" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Workspace</span>
          <p className="mt-2 text-sm font-semibold truncate" style={{ color: "var(--fg)" }}>{workspace}</p>
        </div>
        <div className="rounded-babit-lg p-5 shadow-xs" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Account type</span>
          <p className="mt-2 text-sm font-semibold" style={{ color: "var(--fg)" }}>{accountType}</p>
        </div>
        <div className="rounded-babit-lg p-5 shadow-xs" style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted)" }}>Signed in as</span>
          <p className="mt-2 text-sm font-semibold truncate font-mono" style={{ color: "var(--fg)" }}>{user?.email || "—"}</p>
        </div>
      </div>

      {/* Notary key — real data */}
      <div
        className="rounded-babit-lg p-6 shadow-xs space-y-3"
        style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: "var(--muted)" }}><IconKey className="w-4 h-4" /></span>
          <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Notary public key</h2>
        </div>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          The Ed25519 key every receipt signature is verified against. Use it to verify evidence offline.
        </p>
        {publicKey ? (
          <div className="space-y-2 font-mono text-xs">
            {keyId && (
              <div>
                <span className="text-[10px] uppercase block" style={{ color: "var(--muted)" }}>Key ID</span>
                <span style={{ color: "var(--fg)" }}>{keyId}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] uppercase block mb-0.5" style={{ color: "var(--muted)" }}>Public key</span>
              <Copyable value={publicKey} truncate />
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
            {keyError ? "Notary key unavailable — the ledger service may be offline." : "Loading notary key…"}
          </p>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--fg)" }}>Get started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className="text-left rounded-babit-lg p-5 shadow-xs transition-colors cursor-pointer hover:bg-[var(--secondary)]"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
            >
              <div className="flex items-center justify-between">
                {a.icon}
                <span style={{ color: "var(--muted)" }}><IconArrowRight className="w-3.5 h-3.5" /></span>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: "var(--fg)" }}>{a.title}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Babit does not yet expose aggregate metrics or a listing API, so this console retrieves ledger records individually by ID.
      </p>
    </div>
  );
}
