import type { ReactNode } from "react";
import { PageHeader, Card } from "@/lib/ui";
import { IconActivity, IconLayers, IconGitBranch, IconShieldCheck, IconAlertCircle, IconMonitor } from "@/lib/icons";

/* Analytics is per signed-in account. There is no analytics API yet, so every panel
   renders an honest empty state. No fabricated numbers, ever. */

function EmptyChart({ height = 120, label = "No data yet. This fills in once the analytics API is live." }: { height?: number; label?: string }) {
  return (
    <div
      className="relative rounded-babit overflow-hidden"
      style={{ height, backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
    >
      {/* baseline grid, no data */}
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--border)" strokeWidth="0.4" strokeDasharray="2 2" />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <span className="text-[11px] text-center" style={{ color: "var(--muted)" }}>{label}</span>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, icon, flagship = false, children }: { title: string; subtitle?: string; icon?: ReactNode; flagship?: boolean; children: ReactNode }) {
  return (
    <Card className={flagship ? "animate-float-up" : ""}>
      {flagship && <div className="h-px accent-hairline -mx-5 -mt-5 mb-4" />}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{subtitle}</p>}
        </div>
        {icon && <span style={{ color: "var(--muted)" }}>{icon}</span>}
      </div>
      {children}
    </Card>
  );
}

function RoadmapTile({ title, note, icon }: { title: string; note: string; icon: ReactNode }) {
  return (
    <div
      className="rounded-babit-lg p-5 flex flex-col gap-2"
      style={{ border: "1px dashed var(--border)", backgroundColor: "color-mix(in srgb, var(--secondary) 50%, transparent)" }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: "var(--muted)" }}>{icon}</span>
        <span
          className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
          style={{ color: "var(--brand-accent)", backgroundColor: "color-mix(in srgb, var(--brand-accent) 10%, transparent)" }}
        >
          Planned
        </span>
      </div>
      <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>{title}</h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{note}</p>
    </div>
  );
}

export function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Activity across your notarized actions, delegations, and verifications."
      />

      <div
        className="glass-subtle rounded-babit p-3 flex items-start gap-2.5 text-xs"
        style={{ color: "var(--muted)", border: "1px solid var(--border-subtle)" }}
      >
        <span style={{ color: "var(--brand-accent)" }} className="shrink-0 mt-px"><IconAlertCircle className="w-4 h-4" /></span>
        <span>These charts are scoped to your account and stay empty until the analytics API is live. babit never shows numbers it cannot derive from real ledger data.</span>
      </div>

      {/* Flagship: actions over time */}
      <Panel flagship title="Actions notarized over time" subtitle="Sealed action events per day" icon={<IconActivity className="w-4 h-4" />}>
        <EmptyChart height={180} />
      </Panel>

      {/* Bento of secondary metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="By surface" subtitle="Browser, sandbox, and desktop" icon={<IconLayers className="w-4 h-4" />}>
          <EmptyChart />
        </Panel>
        <Panel title="Delegation health" subtitle="Grants issued versus revoked" icon={<IconGitBranch className="w-4 h-4" />}>
          <EmptyChart />
        </Panel>
        <Panel title="Verification outcomes" subtitle="Proofs checked, and the pass rate" icon={<IconShieldCheck className="w-4 h-4" />}>
          <EmptyChart />
        </Panel>
        <Panel title="Top domains acted on" subtitle="Derived from grant resource scopes">
          <EmptyChart label="No data yet. Ranked domains appear once actions are recorded." />
        </Panel>
      </div>

      {/* Roadmap: needs richer capture we do not collect yet */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--fg)" }}>Planned breakdowns</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <RoadmapTile
            title="By browser"
            note="Which browser an agent used. Needs the browser to be captured on each action, which is on the roadmap."
            icon={<IconMonitor className="w-4 h-4" />}
          />
          <RoadmapTile
            title="By country"
            note="Where actions originate. Needs location capture at record time, which is on the roadmap."
            icon={<IconActivity className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
}
