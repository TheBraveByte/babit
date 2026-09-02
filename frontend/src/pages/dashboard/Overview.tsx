import { useEffect, useState } from "react";
import { PageHeader, Card, MetricCard, StatusPill, Copyable } from "@/lib/ui";
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
  const notaryStatus = publicKey ? "ACTIVE" : keyError ? "FAILED" : "PENDING";

  const quickActions: { tab: DashboardTab; title: string; desc: string; icon: React.ReactNode }[] = [
    { tab: "verify", title: "Verify evidence", desc: "Check a receipt or proof independently.", icon: <IconShieldCheck className="w-4 h-4 text-emerald-700" /> },
    { tab: "delegations", title: "Grants", desc: "Issue, delegate, verify and revoke authority.", icon: <IconGitBranch className="w-4 h-4" /> },
    { tab: "receipts", title: "Receipts", desc: "Fetch the sealed proof for an action.", icon: <IconFileText className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Console"
        title="Overview"
        description="Proof for autonomous actions. Everything here is retrieved directly from the Babit ledger."
        action={<StatusPill status={notaryStatus} label={`NOTARY ${notaryStatus}`} />}
      />

      {/* Workspace summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Workspace" value={workspace} sublabel="Signed-in workspace" />
        <MetricCard label="Account type" value={accountType} sublabel="From your Babit profile" />
        <MetricCard label="Signed in as" value={user?.email || "—"} sublabel="Authenticated identity" />
      </div>

      {/* Notary key — real data, flagship card */}
      <Card
        className="animate-float-up"
        title="Notary public key"
        subtitle="The Ed25519 key every receipt signature is verified against."
        action={<StatusPill status={notaryStatus} />}
      >
        <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          Use this key to verify evidence offline — signatures on every sealed receipt trace back to it.
        </p>
        {publicKey ? (
          <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
            {keyId && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-wide font-mono block" style={{ color: "var(--muted)" }}>Key ID</span>
                <span className="font-mono tnum text-xs" style={{ color: "var(--fg)" }}>{keyId}</span>
              </div>
            )}
            <div className="space-y-1.5 min-w-0">
              <span className="text-[10px] uppercase tracking-wide font-mono block" style={{ color: "var(--muted)" }}>Public key</span>
              <Copyable value={publicKey} truncate />
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
            {keyError ? "Notary key unavailable — the ledger service may be offline." : "Loading notary key…"}
          </p>
        )}
      </Card>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Get started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((a) => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className="text-left rounded-babit-lg p-5 shadow-xs transition-colors cursor-pointer hover:bg-[var(--secondary)]"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--fg)" }}>{a.icon}</span>
                <span style={{ color: "var(--muted)" }}><IconArrowRight className="w-3.5 h-3.5" /></span>
              </div>
              <p className="mt-3 text-sm font-semibold" style={{ color: "var(--fg)" }}>{a.title}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-babit-lg px-4 py-3 flex items-start gap-2.5"
        style={{ border: "1px solid var(--border-subtle)", backgroundColor: "var(--secondary)" }}
      >
        <span className="mt-0.5 shrink-0" style={{ color: "var(--muted)" }}><IconKey className="w-3.5 h-3.5" /></span>
        <p className="text-xs" style={{ color: "var(--muted)" }}>
          Babit does not yet expose aggregate metrics or a listing API, so this console retrieves ledger records individually by ID.
        </p>
      </div>
    </div>
  );
}
