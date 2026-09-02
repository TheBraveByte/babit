import { useEffect, useState, type ReactNode } from "react";
import { PageHeader, Card, MetricCard, EmptyState } from "@/lib/ui";
import {
  IconActivity,
  IconLayers,
  IconGitBranch,
  IconShieldCheck,
  IconAlertCircle,
  IconMonitor,
  IconBarChart,
} from "@/lib/icons";
import { useAuth } from "@/lib/auth";
import { api } from "@/api/client";
import type { components } from "@/api/schema";

/* Analytics is scoped to the signed-in account and driven entirely by real ledger
   aggregates from GET /v1/analytics/overview. Counts arrive as int64 strings, so
   everything is coerced through num(). Nothing is fabricated: a chart with no data
   renders an honest empty state instead of an invented axis. */

type Overview = components["schemas"]["v1GetOverviewResponse"];

const num = (v: unknown): number => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const fmt = (n: number): string => n.toLocaleString();

const SURFACE_LABELS: Record<string, string> = {
  browser: "Browser",
  sandbox: "Sandbox",
  desktop: "Desktop",
  unspecified: "Unspecified",
};

function surfaceLabel(s: string): string {
  return SURFACE_LABELS[s] ?? (s ? s[0].toUpperCase() + s.slice(1) : "Unknown");
}

function formatDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/* ─── Chart primitives ──────────────────────────────────────────────────────── */

function EmptyChart({ height = 140 }: { height?: number }) {
  return (
    <div
      className="relative rounded-babit overflow-hidden flex items-center justify-center"
      style={{ height, backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0">
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--border)" strokeWidth="0.4" strokeDasharray="2 2" />
        ))}
      </svg>
      <span className="relative text-[11px] text-center px-4" style={{ color: "var(--muted)" }}>
        No data yet. This fills in as actions are recorded.
      </span>
    </div>
  );
}

/* Catmull-Rom spline expressed as cubic beziers for a smooth, premium curve. */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

function AreaChart({ series }: { series: { date: string; count: number }[] }) {
  const W = 720;
  const H = 220;
  const padL = 14;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const baseline = H - padB;

  const n = series.length;
  const max = Math.max(1, ...series.map((d) => d.count));

  const xAt = (i: number) => (n <= 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW);
  const yAt = (c: number) => baseline - (c / max) * innerH;

  const pts = series.map((d, i) => ({ x: xAt(i), y: yAt(d.count) }));
  const line = smoothPath(pts);
  const area =
    pts.length > 0
      ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${baseline} L ${pts[0].x.toFixed(1)} ${baseline} Z`
      : "";

  // Show a handful of x labels so a 14-day window never crowds.
  const labelStep = Math.max(1, Math.ceil(n / 6));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Actions notarized over time">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--brand-accent)", stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: "var(--brand-accent)", stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* baseline grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padT + t * innerH;
        return (
          <line
            key={t}
            x1={padL}
            y1={y}
            x2={W - padR}
            y2={y}
            stroke="var(--border-subtle)"
            strokeWidth="1"
            strokeDasharray={t === 1 ? undefined : "3 4"}
          />
        );
      })}

      {/* y range hints */}
      <text x={padL} y={padT - 4} fontSize="11" style={{ fill: "var(--muted)" }} fontFamily="ui-monospace, monospace">
        {fmt(max)}
      </text>

      {area && <path d={area} fill="url(#area-fill)" />}
      {line && <path d={line} fill="none" stroke="var(--brand-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

      {/* end markers */}
      {pts.map((p, i) =>
        series[i].count > 0 && (i === pts.length - 1 || series[i].count === max) ? (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--surface)" stroke="var(--brand-accent)" strokeWidth="2" />
        ) : null,
      )}

      {/* x labels */}
      {series.map((d, i) =>
        i % labelStep === 0 || i === n - 1 ? (
          <text
            key={d.date}
            x={xAt(i)}
            y={H - 8}
            fontSize="11"
            textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"}
            style={{ fill: "var(--muted)" }}
            fontFamily="ui-monospace, monospace"
          >
            {formatDay(d.date)}
          </text>
        ) : null,
      )}
    </svg>
  );
}

function SurfaceBars({ rows }: { rows: { surface: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="flex flex-col gap-3.5 py-1">
      {rows.map((r) => {
        const pct = (r.count / max) * 100;
        return (
          <div key={r.surface} className="flex items-center gap-3">
            <span className="w-20 shrink-0 text-xs font-medium" style={{ color: "var(--fg)" }}>
              {surfaceLabel(r.surface)}
            </span>
            <div
              className="relative flex-1 h-7 rounded-babit-sm overflow-hidden"
              style={{ backgroundColor: "var(--secondary)", border: "1px solid var(--border-subtle)" }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-babit-sm"
                style={{
                  width: `${Math.max(pct, r.count > 0 ? 2 : 0)}%`,
                  backgroundColor: "var(--brand-accent)",
                  transition: "width 640ms cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs font-mono tnum" style={{ color: "var(--muted)" }}>
              {fmt(r.count)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DelegationBar({ active, revoked }: { active: number; revoked: number }) {
  const total = active + revoked;
  const activePct = total > 0 ? (active / total) * 100 : 0;
  const revokedPct = total > 0 ? (revoked / total) * 100 : 0;
  return (
    <div className="flex flex-col gap-4 py-1">
      <div className="flex h-8 w-full rounded-babit-sm overflow-hidden" style={{ backgroundColor: "var(--secondary)" }}>
        {active > 0 && (
          <div style={{ width: `${activePct}%`, backgroundColor: "var(--brand-accent)", transition: "width 640ms cubic-bezier(0.16,1,0.3,1)" }} />
        )}
        {revoked > 0 && (
          <div
            style={{
              width: `${revokedPct}%`,
              backgroundColor: "var(--color-failed)",
              marginLeft: active > 0 ? 2 : 0,
              transition: "width 640ms cubic-bezier(0.16,1,0.3,1)",
            }}
          />
        )}
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "var(--brand-accent)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>Active</span>
          <span className="text-xs font-mono tnum" style={{ color: "var(--fg)" }}>{fmt(active)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "var(--color-failed)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>Revoked</span>
          <span className="text-xs font-mono tnum" style={{ color: "var(--fg)" }}>{fmt(revoked)}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Layout primitives ─────────────────────────────────────────────────────── */

function Panel({ title, subtitle, icon, flagship = false, children }: { title: string; subtitle?: string; icon?: ReactNode; flagship?: boolean; children: ReactNode }) {
  return (
    <Card className="animate-float-up">
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

function CardSkeleton({ height = 140 }: { height?: number }) {
  return (
    <Card>
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-32 rounded" style={{ backgroundColor: "var(--secondary)" }} />
        <div className="rounded-babit" style={{ height, backgroundColor: "var(--secondary)" }} />
      </div>
    </Card>
  );
}

/* ─── Notes ─────────────────────────────────────────────────────────────────── */

function buildNotes(data: Overview): string[] {
  const notes: string[] = [];
  const events = num(data.total_events);
  const grants = num(data.total_grants);
  const revoked = num(data.revoked_grants);
  const active = Math.max(0, grants - revoked);

  if (events === 0 && grants === 0) {
    return ["No activity has been recorded yet. These takeaways appear once your agents start notarizing actions."];
  }

  // Leading surface, only when the data clearly supports a single leader.
  const surfaces = (data.by_surface ?? [])
    .map((s) => ({ surface: s.surface ?? "unspecified", count: num(s.count) }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
  if (surfaces.length > 0) {
    const top = surfaces[0];
    const total = surfaces.reduce((acc, s) => acc + s.count, 0);
    if (surfaces.length === 1) {
      notes.push(`All recorded activity is on the ${surfaceLabel(top.surface).toLowerCase()} surface.`);
    } else if (top.count / total >= 0.5) {
      notes.push(`Most activity is on the ${surfaceLabel(top.surface).toLowerCase()} surface.`);
    } else {
      notes.push(`Activity is spread across ${surfaces.length} surfaces, led by ${surfaceLabel(top.surface).toLowerCase()}.`);
    }
  }

  // Delegation health.
  if (grants > 0) {
    if (revoked === 0) {
      notes.push(`All ${fmt(grants)} grants issued remain active.`);
    } else {
      notes.push(`${fmt(revoked)} of ${fmt(grants)} grants have been revoked, leaving ${fmt(active)} active.`);
    }
  }

  if (notes.length === 0) {
    notes.push("Activity is being recorded. Surface and delegation breakdowns appear as more actions are notarized.");
  }
  return notes.slice(0, 2);
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */

export function Analytics() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let active = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await api.GET("/v1/analytics/overview", { params: { query: { days: 14 } } });
        if (!active) return;
        if (res.data) {
          setData(res.data);
        } else {
          setError("Could not load analytics right now.");
        }
      } catch {
        if (active) setError("Could not load analytics right now.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated]);

  const header = (
    <PageHeader
      title="Analytics"
      description="Activity across your notarized actions, delegations, and verifications. Every number is derived from real ledger data."
    />
  );

  // Not signed in.
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={<IconShieldCheck className="w-5 h-5" />}
          title="Sign in to view analytics"
          description="These charts are scoped to your account. Sign in to see your notarized activity."
        />
      </div>
    );
  }

  // Loading (auth resolving or fetch in flight).
  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        {header}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-3">
                <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--secondary)" }} />
                <div className="h-6 w-14 rounded" style={{ backgroundColor: "var(--secondary)" }} />
              </div>
            </Card>
          ))}
        </div>
        <CardSkeleton height={180} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  // Error.
  if (error || !data) {
    return (
      <div className="space-y-6">
        {header}
        <EmptyState
          icon={<IconAlertCircle className="w-5 h-5" />}
          title="Analytics unavailable"
          description={error ?? "Could not load analytics right now. Try again in a moment."}
        />
      </div>
    );
  }

  // Populated.
  const totalEvents = num(data.total_events);
  const totalSessions = num(data.total_sessions);
  const totalGrants = num(data.total_grants);
  const revokedGrants = num(data.revoked_grants);
  const activeGrants = Math.max(0, totalGrants - revokedGrants);

  const overTime = (data.over_time ?? []).map((d) => ({ date: d.date ?? "", count: num(d.count) }));
  const hasTimeData = overTime.some((d) => d.count > 0);

  // Canonical comparison order, plus any extra surfaces the ledger reports.
  const surfaceMap = new Map<string, number>();
  for (const s of data.by_surface ?? []) surfaceMap.set(s.surface ?? "unspecified", num(s.count));
  const canonical = ["browser", "sandbox", "desktop"];
  const surfaceRows = [
    ...canonical.map((s) => ({ surface: s, count: surfaceMap.get(s) ?? 0 })),
    ...[...surfaceMap.entries()]
      .filter(([s, c]) => !canonical.includes(s) && c > 0)
      .map(([surface, count]) => ({ surface, count })),
  ];
  const hasSurfaceData = surfaceRows.some((r) => r.count > 0);

  const notes = buildNotes(data);

  return (
    <div className="space-y-6">
      {header}

      {/* Headline metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total events" value={fmt(totalEvents)} sublabel="Sealed action events" icon={<IconActivity className="w-4 h-4" />} />
        <MetricCard label="Sessions" value={fmt(totalSessions)} sublabel="Agent sessions" icon={<IconBarChart className="w-4 h-4" />} />
        <MetricCard label="Active grants" value={fmt(activeGrants)} sublabel="Issued minus revoked" icon={<IconShieldCheck className="w-4 h-4" />} />
        <MetricCard label="Revoked grants" value={fmt(revokedGrants)} sublabel="Authority withdrawn" icon={<IconAlertCircle className="w-4 h-4" />} />
      </div>

      {/* Flagship: actions over time */}
      <Panel flagship title="Actions notarized over time" subtitle="Sealed action events per day, last 14 days" icon={<IconActivity className="w-4 h-4" />}>
        {hasTimeData ? <AreaChart series={overTime} /> : <EmptyChart height={180} />}
      </Panel>

      {/* Comparison grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="By surface" subtitle="Browser, sandbox, and desktop" icon={<IconLayers className="w-4 h-4" />}>
          {hasSurfaceData ? <SurfaceBars rows={surfaceRows} /> : <EmptyChart />}
        </Panel>
        <Panel title="Delegation health" subtitle="Active grants versus revoked" icon={<IconGitBranch className="w-4 h-4" />}>
          {totalGrants > 0 ? <DelegationBar active={activeGrants} revoked={revokedGrants} /> : <EmptyChart />}
        </Panel>
      </div>

      {/* Plain-language takeaways, derived only from real numbers */}
      <Card>
        <div className="flex items-start gap-2.5 mb-3">
          <span style={{ color: "var(--brand-accent)" }} className="shrink-0 mt-px"><IconBarChart className="w-4 h-4" /></span>
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>What the numbers say</h3>
        </div>
        <ul className="space-y-1.5">
          {notes.map((note, i) => (
            <li key={i} className="text-xs leading-relaxed flex gap-2" style={{ color: "var(--muted)" }}>
              <span style={{ color: "var(--brand-accent)" }}>-</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Roadmap: breakdowns that need capture we do not collect yet */}
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
