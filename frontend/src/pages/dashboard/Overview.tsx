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
          <h1 className="text-2xl sm:text-[32px] font-semibold text-[#111111] tracking-tight leading-tight">
            Overview
          </h1>
          <p className="text-sm sm:text-[15px] text-[#6B6B6B] mt-1">
            Understand what is happening across your agent activity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("verify")}
            className="px-3.5 py-2 rounded-babit bg-[#FFFFFF] border border-[#E8E8E5] hover:bg-[#F7F7F5] text-[#111111] text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <IconShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Verify Evidence</span>
          </button>
          <button
            onClick={() => onNavigate("delegations")}
            className="px-3.5 py-2 rounded-babit bg-[#111111] hover:bg-[#222222] text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
      <div className="bg-[#FFFFFF] border border-[#E8E8E5] rounded-babit-lg shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E8E8E5] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111111]">
              Recent Activity
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              Latest captured agent actions and cryptographic notary seals
            </p>
          </div>
          <button
            onClick={() => onNavigate("activity")}
            className="text-xs text-[#111111] font-medium flex items-center gap-1 cursor-pointer hover:underline"
          >
            <span>View all activity</span>
            <IconArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#F7F7F5] text-[#6B6B6B] border-b border-[#E8E8E5] text-[11px]">
              <tr>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium font-sans">Action</th>
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-5 py-3 font-medium">Authorizer</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F0ED] text-[#111111]">
              {recentActions.map((row) => (
                <tr
                  key={row.receipt}
                  onClick={() => onNavigate("receipts")}
                  className="hover:bg-[#F7F7F5] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 text-[#6B6B6B] tnum">{row.time}</td>
                  <td className="px-5 py-3.5 font-semibold text-[#111111] font-sans">{row.action}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B]">{row.agent}</td>
                  <td className="px-5 py-3.5 text-[#6B6B6B]">{row.principal}</td>
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
