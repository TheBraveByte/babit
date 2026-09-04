import { type ReactNode, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "@/api/client";
import type { components } from "@/api/schema";
import { useAuth, useRequireAuth } from "@/lib/auth";
import {
  IconActivity,
  IconAlertCircle,
  IconGitBranch,
  IconLayers,
  IconMonitor,
  IconShieldCheck,
} from "@/lib/icons";
import { Card, EmptyState, MetricCard, PageHeader } from "@/lib/ui";

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
const surfaceLabel = (s: string) =>
  SURFACE_LABELS[s] ?? (s ? s[0].toUpperCase() + s.slice(1) : "Unknown");
const shortDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
function ChartTooltip({
  active,
  payload,
  label,
  suffix,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      className="rounded-babit px-3 py-2 text-xs shadow-lg"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        color: "var(--fg)",
      }}
    >
      {label != null && <div className="font-medium mb-0.5">{label}</div>}
      <div className="flex items-center gap-1.5 font-mono">
        <span
          className="w-2 h-2 rounded-sm"
          style={{ backgroundColor: p.color || p.payload?.fill || "var(--brand-accent)" }}
        />
        <span style={{ color: "var(--muted)" }}>{p.name ?? suffix ?? "count"}</span>
        <span className="font-semibold">{fmt(num(p.value))}</span>
      </div>
    </div>
  );
}

function EmptyChart({ height = 220 }: { height?: number }) {
  return (
    <div
      className="rounded-babit flex items-center justify-center text-center px-6"
      style={{ height, backgroundColor: "var(--secondary)", border: "1px dashed var(--border)" }}
    >
      <span className="text-[12px] font-mono" style={{ color: "var(--muted)" }}>
        -
      </span>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  icon,
  flagship,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  flagship?: boolean;
  children: ReactNode;
}) {
  return (
    <Card className="animate-float-up">
      {flagship && <div className="h-px accent-hairline -mx-5 -mt-5 mb-4" />}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && <span style={{ color: "var(--muted)" }}>{icon}</span>}
      </div>
      {children}
    </Card>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span className="font-mono font-semibold ml-auto" style={{ color: "var(--fg)" }}>
        {fmt(value)}
      </span>
    </div>
  );
}
export function Analytics() {
  useRequireAuth();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) return;
    let active = true;
    (async () => {
      setLoading(true);
      const res = await api.GET("/v1/analytics/overview", { params: { query: { days: 14 } } });
      if (!active) return;
      if (res.error) setError("Analytics is unavailable right now.");
      else setData(res.data ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated, authLoading]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const totalEvents = num(data?.total_events);
  const totalSessions = num(data?.total_sessions);
  const totalGrants = num(data?.total_grants);
  const revokedGrants = num(data?.revoked_grants);
  const activeGrants = Math.max(0, totalGrants - revokedGrants);

  const timeSeries = (data?.over_time ?? []).map((d) => ({
    date: d.date ?? "",
    label: shortDate(d.date ?? ""),
    count: num(d.count),
  }));
  const surfaceSeries = (data?.by_surface ?? []).map((s) => ({
    label: surfaceLabel(s.surface ?? ""),
    count: num(s.count),
  }));
  const hasTime = timeSeries.some((d) => d.count > 0);
  const hasSurface = surfaceSeries.some((d) => d.count > 0);
  const hasDelegation = totalGrants > 0;

  const topLinks = (data?.top_links ?? []).map((l) => ({
    url: l.url ?? "",
    count: num(l.count),
  }));
  const isStatic = (url: string) =>
    /\.(png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf|pdf|mp4|webm|ogg)$/i.test(url);
  const linksOnly = topLinks.filter((l) => !isStatic(l.url));
  const staticsOnly = topLinks.filter((l) => isStatic(l.url));
  const hasLinks = linksOnly.length > 0;
  const hasStatics = staticsOnly.length > 0;

  const notes: string[] = [];
  if (hasSurface) {
    const top = [...surfaceSeries].sort((a, b) => b.count - a.count)[0];
    const totalS = surfaceSeries.reduce((a, b) => a + b.count, 0);
    if (top && totalS > 0 && top.count / totalS >= 0.5)
      notes.push(`Most activity is on the ${top.label.toLowerCase()} surface.`);
  }
  if (hasDelegation)
    notes.push(
      `${fmt(activeGrants)} active grant${activeGrants === 1 ? "" : "s"}, ${fmt(revokedGrants)} revoked.`,
    );

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
        <span style={{ color: "var(--brand-accent)" }} className="shrink-0 mt-px">
          <IconAlertCircle className="w-4 h-4" />
        </span>
        <span>
          These figures come straight from the ledger. babit never shows numbers it cannot derive
          from real data.
        </span>
      </div>

      {error ? (
        <Card>
          <EmptyState
            icon={<IconActivity className="w-5 h-5" />}
            title="Analytics unavailable"
            description={error}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total events"
              value={loading ? "..." : fmt(totalEvents)}
              icon={<IconActivity className="w-4 h-4" />}
            />
            <MetricCard
              label="Sessions"
              value={loading ? "..." : fmt(totalSessions)}
              icon={<IconLayers className="w-4 h-4" />}
            />
            <MetricCard
              label="Active grants"
              value={loading ? "..." : fmt(activeGrants)}
              icon={<IconGitBranch className="w-4 h-4" />}
            />
            <MetricCard
              label="Revoked grants"
              value={loading ? "..." : fmt(revokedGrants)}
              icon={<IconShieldCheck className="w-4 h-4" />}
            />
          </div>

          <Panel
            flagship
            title="Actions notarized over time"
            subtitle="Notarized action events per day"
            icon={<IconActivity className="w-4 h-4" />}
          >
            {loading || !hasTime ? (
              <EmptyChart height={240} />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={timeSeries} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="area-events" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 4"
                    stroke="var(--border-subtle)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--muted)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    content={<ChartTooltip suffix="events" />}
                    cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="events"
                    stroke="var(--brand-accent)"
                    strokeWidth={2.5}
                    fill="url(#area-events)"
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: "var(--surface)",
                      stroke: "var(--brand-accent)",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Panel>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel
              title="By surface"
              subtitle="Where agents acted"
              icon={<IconLayers className="w-4 h-4" />}
            >
              {loading || !hasSurface ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={surfaceSeries}
                    margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 4"
                      stroke="var(--border-subtle)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "var(--muted)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      content={<ChartTooltip suffix="events" />}
                      cursor={{ fill: "color-mix(in srgb, var(--fg) 5%, transparent)" }}
                    />
                    <Bar
                      dataKey="count"
                      name="events"
                      fill="var(--brand-accent)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={72}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Panel>

            <Panel
              title="Delegation health"
              subtitle="Active versus revoked grants"
              icon={<IconGitBranch className="w-4 h-4" />}
            >
              {loading || !hasDelegation ? (
                <EmptyChart />
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="55%" height={220}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Active", value: activeGrants },
                          { name: "Revoked", value: revokedGrants },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={82}
                        paddingAngle={2}
                        stroke="var(--surface)"
                        strokeWidth={2}
                      >
                        <Cell fill="var(--brand-accent)" />
                        <Cell fill="var(--color-failed)" />
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    <LegendRow color="var(--brand-accent)" label="Active" value={activeGrants} />
                    <LegendRow color="var(--color-failed)" label="Revoked" value={revokedGrants} />
                    <div
                      className="pt-2 text-xs"
                      style={{ color: "var(--muted)", borderTop: "1px solid var(--border-subtle)" }}
                    >
                      <span className="font-mono font-semibold" style={{ color: "var(--fg)" }}>
                        {fmt(totalGrants)}
                      </span>{" "}
                      total
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel
              title="Top links"
              subtitle="Most recorded URLs and pages"
              icon={<IconActivity className="w-4 h-4" />}
            >
              {loading || !hasLinks ? (
                <EmptyChart />
              ) : (
                <ul className="space-y-2">
                  {linksOnly.slice(0, 10).map((l, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono truncate flex-1" style={{ color: "var(--fg)" }}>
                        {l.url}
                      </span>
                      <span className="font-mono font-semibold" style={{ color: "var(--muted)" }}>
                        {fmt(l.count)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              title="Top statics"
              subtitle="Most accessed images, styles and assets"
              icon={<IconMonitor className="w-4 h-4" />}
            >
              {loading || !hasStatics ? (
                <EmptyChart />
              ) : (
                <ul className="space-y-2">
                  {staticsOnly.slice(0, 10).map((l, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono truncate flex-1" style={{ color: "var(--fg)" }}>
                        {l.url}
                      </span>
                      <span className="font-mono font-semibold" style={{ color: "var(--muted)" }}>
                        {fmt(l.count)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Card>
            <div className="flex items-start gap-2.5">
              <span style={{ color: "var(--brand-accent)" }} className="shrink-0 mt-0.5">
                <IconActivity className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--fg)" }}>
                  What the numbers say
                </h3>
                <ul className="space-y-1 text-sm" style={{ color: "var(--muted)" }}>
                  {notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
