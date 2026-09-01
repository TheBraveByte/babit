import { MetricCard, StatusPill, Copyable } from "@/lib/ui";
import { LiveStream } from "./LiveStream";
import { IconShieldCheck, IconCpu, IconGitBranch, IconFileText, IconAlertCircle, IconArrowRight } from "@/lib/icons";
import type { DashboardTab } from "./DashboardLayout";

export function Overview({ onNavigate }: { onNavigate: (tab: DashboardTab) => void }) {
  const recentActions = [
    {
      time: "10:42:19",
      agent: "agt_claims_01",
      action: "approve_claim",
      principal: "usr_yusuf",
      auth: "BAL-DEL-8921",
      status: "VERIFIED" as const,
      receipt: "rcpt_9821a0",
    },
    {
      time: "10:39:12",
      agent: "agt_browser_exec",
      action: "upload_document",
      principal: "agt_claims_01",
      auth: "BAL-DEL-4910",
      status: "VERIFIED" as const,
      receipt: "rcpt_44b19c",
    },
    {
      time: "10:35:01",
      agent: "agt_triager",
      action: "extract_metadata",
      principal: "usr_yusuf",
      auth: "BAL-ROOT-0091",
      status: "VERIFIED" as const,
      receipt: "rcpt_1190ca",
    },
    {
      time: "10:28:44",
      agent: "agt_fraud_scan",
      action: "flag_anomaly",
      principal: "usr_yusuf",
      auth: "BAL-ROOT-0091",
      status: "PENDING" as const,
      receipt: "rcpt_77ab31",
    },
    {
      time: "10:14:20",
      agent: "agt_external_bot",
      action: "execute_payout",
      principal: "usr_alex",
      auth: "BAL-DEL-1092",
      status: "FAILED" as const,
      receipt: "rcpt_90812e",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Overview</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Your agent accountability activity, notary seals, and verification status at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("verify")}
            className="px-3 py-1.5 rounded-md bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <IconShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verify Receipt</span>
          </button>
          <button
            onClick={() => onNavigate("delegations")}
            className="px-3 py-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <IconGitBranch className="w-3.5 h-3.5 text-neutral-300" />
            <span>Issue Grant</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Actions recorded"
          value="12,482"
          change="+18.4%"
          sublabel="100% sealed in ledger"
          icon={<IconFileText className="w-4 h-4" />}
        />
        <MetricCard
          label="Verified proofs"
          value="12,391"
          change="99.2%"
          sublabel="Cryptographically valid"
          icon={<IconShieldCheck className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          label="Verification failures"
          value="17"
          change="-4"
          sublabel="Tamper/scope breaches"
          icon={<IconAlertCircle className="w-4 h-4 text-red-500" />}
        />
        <MetricCard
          label="Active agents"
          value="42"
          sublabel="Across 6 environments"
          icon={<IconCpu className="w-4 h-4" />}
        />
        <MetricCard
          label="Delegation chains"
          value="284"
          sublabel="Avg depth: 2.3 levels"
          icon={<IconGitBranch className="w-4 h-4" />}
        />
      </div>

      {/* Main Grid: Activity Summary + Real-time stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Activity Table */}
        <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 font-mono">
                Recent Action Activity
              </h2>
              <span className="text-[11px] text-neutral-500">
                Latest notarized actions and delegation proofs
              </span>
            </div>
            <button
              onClick={() => onNavigate("actions")}
              className="text-xs text-neutral-600 hover:text-neutral-900 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View full log</span>
              <IconArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-50/80 text-neutral-500 border-b border-neutral-200 text-[11px]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-4 py-2.5 font-medium">Agent</th>
                  <th className="px-4 py-2.5 font-medium">Action</th>
                  <th className="px-4 py-2.5 font-medium">Principal</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {recentActions.map((row) => (
                  <tr key={row.receipt} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-4 py-3 text-neutral-500 tnum">{row.time}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-900">{row.agent}</td>
                    <td className="px-4 py-3 text-neutral-800">{row.action}</td>
                    <td className="px-4 py-3 text-neutral-500">{row.principal}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Copyable value={row.receipt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Stream Panel */}
        <div className="lg:col-span-4">
          <LiveStream />
        </div>
      </div>
    </div>
  );
}
