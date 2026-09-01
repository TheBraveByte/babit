import { useState } from "react";
import { MetricCard } from "@/lib/ui";
import { IconActivity, IconShieldCheck, IconAlertCircle, IconGitBranch } from "@/lib/icons";

export function Analytics() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "90d">("7d");

  const byAgent = [
    { name: "claims-agent", actions: 5820, percent: "46.6%", verified: "99.8%", color: "bg-neutral-900" },
    { name: "browser-agent", actions: 3410, percent: "27.3%", verified: "100.0%", color: "bg-neutral-700" },
    { name: "triage-agent", actions: 2190, percent: "17.5%", verified: "100.0%", color: "bg-neutral-500" },
    { name: "fraud-scanner", actions: 890, percent: "7.1%", verified: "98.4%", color: "bg-neutral-400" },
    { name: "other-workers", actions: 172, percent: "1.5%", verified: "94.2%", color: "bg-neutral-300" },
  ];

  const byCapability = [
    { cap: "claims.approve", count: 4890, pct: "39.2%" },
    { cap: "browser.click", count: 3200, pct: "25.6%" },
    { cap: "document.ocr_extract", count: 2100, pct: "16.8%" },
    { cap: "dom.type", count: 1400, pct: "11.2%" },
    { cap: "payout.direct", count: 892, pct: "7.2%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">Analytics & Compliance</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Audit-grade performance metrics, verification rates, and delegation depth distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs font-mono">
            {(["24h", "7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  timeRange === t ? "bg-white text-neutral-900 font-bold shadow-2xs" : "text-neutral-500 hover:text-neutral-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          label="Verification Success"
          value="99.86%"
          change="+0.04%"
          sublabel="17 failed out of 12,482"
          icon={<IconShieldCheck className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          label="Avg Notary Latency"
          value="1.84ms"
          change="-0.12ms"
          sublabel="Ed25519 asymmetric seal"
          icon={<IconActivity className="w-4 h-4" />}
        />
        <MetricCard
          label="Avg Delegation Depth"
          value="2.3 levels"
          sublabel="Max constraint: 3"
          icon={<IconGitBranch className="w-4 h-4" />}
        />
        <MetricCard
          label="Tamper Detection"
          value="100.0%"
          sublabel="Zero false negatives"
          icon={<IconAlertCircle className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Actions By Agent */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-xs font-mono">
            <span className="font-semibold text-neutral-900 uppercase">Actions by Agent</span>
            <span className="text-neutral-400">TOTAL: 12,482</span>
          </div>

          <div className="space-y-3">
            {byAgent.map((a) => (
              <div key={a.name} className="space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-900 font-semibold">{a.name}</span>
                  <div className="flex items-center gap-3 text-neutral-500">
                    <span className="tnum">{a.actions.toLocaleString()}</span>
                    <span className="text-emerald-700 font-bold">{a.verified} valid</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${a.color}`} style={{ width: a.percent }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions By Capability */}
        <div className="lg:col-span-6 bg-white border border-neutral-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-xs font-mono">
            <span className="font-semibold text-neutral-900 uppercase">Actions by Capability</span>
            <span className="text-neutral-400">DISTRIBUTION</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {byCapability.map((c) => (
              <div key={c.cap} className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-800 font-medium text-[11px]">{c.cap}</span>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500 text-[11px] tnum">{c.count.toLocaleString()}</span>
                  <span className="text-neutral-400 text-[10px]">({c.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
