import { MetricCard, StatusPill, Copyable } from "@/lib/ui";
import { IconShieldCheck, IconCpu, IconGitBranch, IconFileText, IconArrowRight } from "@/lib/icons";
import type { DashboardTab } from "./DashboardLayout";

export function Overview({ onNavigate }: { onNavigate: (tab: DashboardTab) => void }) {
  const recentActions = [
    {
      time: "14:32:08 UTC",
      agent: "claims-agent",
      action: "approve_payout ($4,200.00)",
      principal: "usr_alice",
      status: "VERIFIED" as const,
      receipt: "rcpt_BAL_778812",
    },
    {
      time: "14:28:44 UTC",
      agent: "browser-worker",
      action: "upload_document (repair_est.pdf)",
      principal: "claims-agent",
      status: "VERIFIED" as const,
      receipt: "rcpt_BAL_778811",
    },
    {
      time: "14:19:02 UTC",
      agent: "triage-agent",
      action: "extract_metadata (CLM-48102)",
      principal: "usr_alice",
      status: "VERIFIED" as const,
      receipt: "rcpt_BAL_778810",
    },
    {
      time: "13:55:18 UTC",
      agent: "fraud-scanner",
      action: "flag_anomaly (score: 0.12)",
      principal: "usr_alice",
      status: "VERIFIED" as const,
      receipt: "rcpt_BAL_778809",
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[32px] font-semibold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
            Overview
          </h1>
          <p className="text-sm sm:text-[15px] mt-1" style={{ color: "var(--muted)" }}>
            Understand what is happening across your agent activity and cryptographic seals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("verify")}
            className="px-3.5 py-2 rounded-babit text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer hover:bg-[var(--secondary)]"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            <IconShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verify Evidence</span>
          </button>
          <button
            onClick={() => onNavigate("delegations")}
            className="px-3.5 py-2 rounded-babit text-xs font-medium shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-90"
            style={{
              backgroundColor: "var(--fg)",
              color: "var(--surface)",
            }}
          >
            <IconGitBranch className="w-3.5 h-3.5" />
            <span>Issue Grant</span>
          </button>
        </div>
      </div>

      {/* 4 Real Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Actions"
          value="12,482"
          change="+18%"
          sublabel="Sealed in immutable ledger"
          icon={<IconFileText className="w-4 h-4" />}
        />
        <MetricCard
          label="Verified"
          value="12,391"
          change="99.2%"
          sublabel="Valid cryptographic receipts"
          icon={<IconShieldCheck className="w-4 h-4 text-emerald-700" />}
        />
        <MetricCard
          label="Agents"
          value="42"
          sublabel="Active autonomous subjects"
          icon={<IconCpu className="w-4 h-4" />}
        />
        <MetricCard
          label="Delegations"
          value="284"
          sublabel="Average depth: 2.3 levels"
          icon={<IconGitBranch className="w-4 h-4" />}
        />
      </div>

      {/* Recent Action Activity Table */}
      <div
        className="rounded-babit-lg shadow-xs overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          className="p-4 sm:p-5 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Recent Activity
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              Latest captured agent actions and cryptographic notary seals
            </p>
          </div>
          <button
            onClick={() => onNavigate("activity")}
            className="text-xs font-medium flex items-center gap-1 cursor-pointer hover:underline"
            style={{ color: "var(--fg)" }}
          >
            <span>View all activity</span>
            <IconArrowRight className="w-3 h-3" />
          </button>
        </div>

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
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium font-sans">Action</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Authorizer</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs" style={{ borderColor: "var(--border-subtle)" }}>
              {recentActions.map((row) => (
                <tr
                  key={row.receipt}
                  onClick={() => onNavigate("receipts")}
                  className="transition-colors cursor-pointer hover:bg-[var(--secondary)]"
                  style={{ color: "var(--fg)" }}
                >
                  <td className="px-5 py-3.5 tnum" style={{ color: "var(--muted)" }}>{row.time}</td>
                  <td className="px-5 py-3.5 font-semibold font-sans">{row.action}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{row.agent}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{row.principal}</td>
                  <td className="px-5 py-3.5">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Copyable value={row.receipt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
