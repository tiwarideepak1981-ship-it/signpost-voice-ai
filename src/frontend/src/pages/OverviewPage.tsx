import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart2,
  Clock,
  CreditCard,
  Phone,
  Plus,
  TrendingUp,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  analyticsData,
  billingOverview,
  callRecords,
  campaigns,
  overviewStats,
} from "../data/sampleData";
import type { CallRecord, Campaign } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}

// ─── Key Metric Card ──────────────────────────────────────────────────────────
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  sub?: React.ReactNode;
}
function MetricCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  sub,
}: MetricCardProps) {
  return (
    <div className="bg-card border border-border border-l-2 border-l-primary rounded-md p-4 flex flex-col gap-2 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded px-1.5 py-0.5 ${
              trendUp
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight size={10} />
            ) : (
              <ArrowDownRight size={10} />
            )}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-foreground leading-none">
          {value}
        </p>
      </div>
      {sub && <div className="mt-1">{sub}</div>}
    </div>
  );
}

// ─── Minutes Progress Bar ─────────────────────────────────────────────────────
function MinutesProgress({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, Math.round((used / total) * 100));
  const color =
    pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-accent" : "bg-primary";
  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatNum(used)} / {formatNum(total)} min ({pct}%)
      </p>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CallRecord["status"] }) {
  const map: Record<CallRecord["status"], string> = {
    success: "status-success",
    failure: "status-error",
    pending: "status-warning",
    missed:
      "inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-muted-foreground text-xs font-semibold rounded",
    inprogress: "status-info",
  };
  return (
    <span className={map[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Direction Badge ──────────────────────────────────────────────────────────
function DirectionBadge({ dir }: { dir: CallRecord["direction"] }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold rounded px-2 py-0.5 ${
        dir === "inbound"
          ? "bg-primary/10 text-primary"
          : "bg-accent/10 text-accent"
      }`}
    >
      {dir === "inbound" ? "↙ In" : "↗ Out"}
    </span>
  );
}

// ─── 7-day bar data ───────────────────────────────────────────────────────────
const last7 = analyticsData.dailyTrends.slice(-7).map((d, i) => ({
  date: d.date,
  inbound: Math.round(d.calls * (0.3 + (i % 3) * 0.05)),
  outbound: Math.round(d.calls * (0.7 - (i % 3) * 0.05)),
}));

// ─── Pie data ─────────────────────────────────────────────────────────────────
const recentCalls = callRecords.slice(0, 100);
const statusCounts = {
  Success: recentCalls.filter((c) => c.status === "success").length,
  Missed: recentCalls.filter((c) => c.status === "missed").length,
  Failed: recentCalls.filter((c) => c.status === "failure").length,
  Pending: recentCalls.filter((c) => c.status === "pending").length,
};
const pieData = Object.entries(statusCounts).map(([name, value]) => ({
  name,
  value,
}));
const PIE_COLORS = ["#2dd4bf", "#f59e0b", "#ef4444", "#6366f1"];

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  {
    label: "New Campaign",
    desc: "Launch a new outreach campaign",
    icon: <Plus size={18} />,
    path: "/campaigns",
  },
  {
    label: "Import Leads",
    desc: "Bulk upload lead list",
    icon: <Upload size={18} />,
    path: "/leads",
  },
  {
    label: "View Analytics",
    desc: "Explore call & conversion data",
    icon: <BarChart2 size={18} />,
    path: "/analytics",
  },
  {
    label: "Billing Overview",
    desc: "Manage your plan & invoices",
    icon: <CreditCard size={18} />,
    path: "/billing",
  },
];

// ─── Active Campaigns ─────────────────────────────────────────────────────────
const activeCampaigns: Campaign[] = campaigns.filter(
  (c) => c.status === "active",
);

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────
interface BarTooltipPayload {
  name: string;
  value: number;
  color: string;
}
function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: BarTooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-md p-2 text-xs shadow-lg">
      <p className="text-muted-foreground mb-1 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OverviewPage() {
  const navigate = useNavigate();
  const recentTen = callRecords.slice(0, 10);
  const { currentMinutesUsed, currentMinutesAllocated } = billingOverview;

  return (
    <div className="flex flex-col gap-5 p-5 min-h-0" data-ocid="overview-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Overview
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Month-to-date · Live data as of today
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
          <Activity size={12} className="animate-pulse" />
          {overviewStats.activeCampaigns} Active Campaigns
        </span>
      </div>

      {/* ── Row 1: Key Metrics ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <MetricCard
          icon={<Phone size={15} />}
          label="Total Calls (MTD)"
          value={formatNum(overviewStats.totalCallsToday)}
          trend={`+${overviewStats.callsChangePercent}%`}
          trendUp
        />
        <MetricCard
          icon={<Clock size={15} />}
          label="Minutes Used"
          value={`${formatNum(currentMinutesUsed)} / ${formatNum(currentMinutesAllocated)}`}
          sub={
            <MinutesProgress
              used={currentMinutesUsed}
              total={currentMinutesAllocated}
            />
          }
        />
        <MetricCard
          icon={<TrendingUp size={15} />}
          label="Leads Generated"
          value={formatNum(overviewStats.totalLeads)}
          trend="+8.3%"
          trendUp
        />
        <MetricCard
          icon={<BarChart2 size={15} />}
          label="Conversion Rate"
          value={`${overviewStats.conversionRate}%`}
          trend="+1.2%"
          trendUp
        />
      </motion.div>

      {/* ── Row 2: Charts ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Bar Chart */}
        <div className="surface-chart p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            7-Day Call Volume
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={last7} barSize={10} barGap={2}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="inbound"
                name="Inbound"
                fill="#2dd4bf"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="outbound"
                name="Outbound"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {[
              { c: "#2dd4bf", l: "Inbound" },
              { c: "#6366f1", l: "Outbound" },
            ].map((item) => (
              <span
                key={item.l}
                className="flex items-center gap-1 text-xs text-muted-foreground"
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ background: item.c }}
                />
                {item.l}
              </span>
            ))}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="surface-chart p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Call Status Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                iconType="square"
                iconSize={9}
                formatter={(value: string) => (
                  <span style={{ fontSize: 11 }}>{value}</span>
                )}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} (${Math.round((value / recentCalls.length) * 100)}%)`,
                  name,
                ]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Row 3: Recent Calls + Active Campaigns ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3"
      >
        {/* Recent Calls Table */}
        <div className="surface-chart p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Recent Calls
            </h2>
            <button
              type="button"
              data-ocid="recent-calls-view-all"
              onClick={() => navigate({ to: "/calls" })}
              className="text-xs text-primary hover:underline flex items-center gap-0.5 transition-smooth"
            >
              View All <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  {[
                    "Time",
                    "Dir",
                    "Caller ID",
                    "Duration",
                    "Intent",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTen.map((call, i) => (
                  <tr
                    key={call.id}
                    data-ocid={`recent-call-row-${i}`}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate({ to: "/calls" })}
                    onKeyDown={(e) =>
                      e.key === "Enter" && navigate({ to: "/calls" })
                    }
                    tabIndex={0}
                  >
                    <td className="data-cell text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                      {call.timestamp.split(" ")[1]}
                    </td>
                    <td className="data-cell">
                      <DirectionBadge dir={call.direction} />
                    </td>
                    <td className="data-cell font-mono text-[10px] text-foreground">
                      {call.callerId}
                    </td>
                    <td className="data-cell font-mono text-[10px] text-muted-foreground">
                      {call.duration}
                    </td>
                    <td className="data-cell max-w-[100px]">
                      <span className="truncate block text-[11px] text-foreground">
                        {call.intent}
                      </span>
                    </td>
                    <td className="data-cell">
                      <StatusBadge status={call.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Campaigns Summary */}
        <div className="surface-chart p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Active Campaigns
            </h2>
            <button
              type="button"
              data-ocid="campaigns-view-all"
              onClick={() => navigate({ to: "/campaigns" })}
              className="text-xs text-primary hover:underline flex items-center gap-0.5 transition-smooth"
            >
              All <ArrowUpRight size={11} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {activeCampaigns.map((c) => {
              const pct = Math.min(
                100,
                Math.round((c.completedCalls / c.targetCount) * 100),
              );
              return (
                <div
                  key={c.id}
                  data-ocid={`campaign-row-${c.id}`}
                  className="space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground leading-tight truncate">
                      {c.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold shrink-0 rounded px-1.5 py-0.5 ${
                        c.successRate >= 80
                          ? "bg-emerald-500/10 text-emerald-400"
                          : c.successRate >= 70
                            ? "bg-amber-500/10 text-accent"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {c.successRate}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {formatNum(c.completedCalls)} / {formatNum(c.targetCount)}{" "}
                    calls · {pct}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Row 4: Quick Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {quickActions.map((a, i) => (
          <button
            type="button"
            key={a.label}
            data-ocid={`quick-action-${i}`}
            onClick={() => navigate({ to: a.path as "/" })}
            className="surface-chart p-4 flex flex-col gap-2 items-start hover:border-primary/50 hover:bg-primary/5 transition-smooth text-left group"
          >
            <span className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-smooth">
              {a.icon}
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground font-display">
                {a.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                {a.desc}
              </p>
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
}
