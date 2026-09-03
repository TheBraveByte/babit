import { useEffect, useState } from "react";
import { PageHeader, Card, Copyable, MetricCard } from "@/lib/ui";
import { IconShieldCheck, IconGitBranch, IconFileText, IconArrowRight, IconFolder, IconActivity, IconLayers } from "@/lib/icons";
import type { DashboardTab } from "./DashboardLayout";
import { useAuth } from "@/lib/auth";
import { api } from "@/api/client";
import type { components } from "@/api/schema";

type Overview = components["schemas"]["v1GetOverviewResponse"];
const n = (v: unknown) => { const x = Number(v ?? 0); return Number.isFinite(x) ? x : 0; };

export function Overview({ onNavigate }: { onNavigate: (tab: DashboardTab) => void }) {
  const { user, branding, isAuthenticated } = useAuth();
  const [keyId, setKeyId] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState(false);
  const [stats, setStats] = useState<Overview | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      const res = await api.GET("/v1/analytics/overview", { params: { query: { days: 14 } } });
      if (active && !res.error) setStats(res.data ?? null);
    })();
    return () => { active = false; };
  }, [isAuthenticated]);

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
  const workspace = branding?.company_name || user?.org_name || "your workspace";

  const quickActions: { tab: DashboardTab; title: string; desc: string; icon: React.ReactNode }[] = [
    { tab: "verify", title: "Verify evidence", desc: "Validate receipts and proofs.", icon: <IconShieldCheck className="w-4 h-4 text-emerald-700" /> },
    { tab: "receipts", title: "Receipts", desc: "Fetch sealed proof by action ID.", icon: <IconFileText className="w-4 h-4" /> },
    { tab: "projects", title: "Projects", desc: "Track work tied to ledger actions.", icon: <IconFolder className="w-4 h-4" /> },
    { tab: "settings", title: "Settings", desc: "Edit account and workspace details.", icon: <IconGitBranch className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome to ${workspace}`}
        description="Proof for autonomous actions. Everything here is retrieved directly from the Babit ledger."
      />

      {/* Account summary, full details live in Settings */}
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        Signed in as{" "}
        <span style={{ color: "var(--fg)" }}>{user?.email || "your account"}</span>
        {" · "}{accountType}.{" "}
        <button
          onClick={() => onNavigate("settings")}
          className="underline underline-offset-2 cursor-pointer"
          style={{ color: "var(--fg)" }}
        >
          Manage in Settings
        </button>
      </p>

      {/* At a glance — real per-account activity */}
      {isAuthenticated && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Actions notarized" value={n(stats?.total_events).toLocaleString()} icon={<IconActivity className="w-4 h-4" />} />
          <MetricCard label="Sessions" value={n(stats?.total_sessions).toLocaleString()} icon={<IconLayers className="w-4 h-4" />} />
          <MetricCard label="Active grants" value={Math.max(0, n(stats?.total_grants) - n(stats?.revoked_grants)).toLocaleString()} icon={<IconGitBranch className="w-4 h-4" />} />
          <button
            onClick={() => onNavigate("analytics")}
            className="text-left rounded-babit-md p-5 transition-colors cursor-pointer hover:bg-[var(--secondary)] flex flex-col justify-between"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--muted)" }}>Analytics</span>
            <span className="mt-3 text-sm font-semibold inline-flex items-center gap-1.5" style={{ color: "var(--brand-accent)" }}>
              View charts <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      )}

      {/* Notary key — real data, flagship card */}
      <Card
        className="animate-float-up"
        title="Notary public key"
        subtitle="The public key every receipt signature is checked against."
      >
        <div className="h-px accent-hairline -mx-5 -mt-5 mb-5" />
        <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
          Use this key to verify evidence offline. Signatures on every sealed receipt trace back to it.
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
            {keyError ? "Notary key unavailable, the ledger service may be unreachable." : "Loading notary key…"}
          </p>
        )}
      </Card>

      {/* Quick actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>Get started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <button
              key={a.tab}
              onClick={() => onNavigate(a.tab)}
              className="text-left rounded-babit-md p-5 transition-colors cursor-pointer hover:bg-[var(--secondary)]"
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

      <p className="text-[11px]" style={{ color: "var(--muted)" }}>
        Need profile changes? Use Settings. Need grants? Open the Delegations tab.
      </p>
    </div>
  );
}
