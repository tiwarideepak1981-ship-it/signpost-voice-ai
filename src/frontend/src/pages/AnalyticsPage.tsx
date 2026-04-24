import {
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  DollarSign,
  Download,
  Phone,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  agents,
  analyticsData,
  callRecords,
  campaigns,
  sampleClosedDeals,
} from "../data/sampleData";
import type { Agent, ClosedDeal } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRange = "7d" | "30d" | "3m";
type SortDir = "asc" | "desc" | null;
type SortKey =
  | "name"
  | "totalCalls"
  | "avgHandle"
  | "transfers"
  | "conversions"
  | "rate";
type DealSortKey = "daysToClose" | "revenueAmount" | "closeDate";
type RevFilter = "all" | "inbound" | "outbound";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNum(n: number) {
  return n.toLocaleString("en-IN");
}
function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
function fmtINR(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

// ─── Revenue Derived Data ─────────────────────────────────────────────────────
const inboundDeals = sampleClosedDeals.filter(
  (d) => d.leadSource === "inbound",
);
const outboundDeals = sampleClosedDeals.filter(
  (d) => d.leadSource === "outbound",
);

const totalRevenue = sampleClosedDeals.reduce((s, d) => s + d.revenueAmount, 0);
const avgDealValue = Math.round(totalRevenue / sampleClosedDeals.length);
const avgDaysToClose = Math.round(
  sampleClosedDeals.reduce((s, d) => s + d.daysToClose, 0) /
    sampleClosedDeals.length,
);

const inboundRevenue = inboundDeals.reduce((s, d) => s + d.revenueAmount, 0);
const outboundRevenue = outboundDeals.reduce((s, d) => s + d.revenueAmount, 0);
const inboundAvgDeal = inboundDeals.length
  ? Math.round(inboundRevenue / inboundDeals.length)
  : 0;
const outboundAvgDeal = outboundDeals.length
  ? Math.round(outboundRevenue / outboundDeals.length)
  : 0;
const inboundAvgDays = inboundDeals.length
  ? Math.round(
      inboundDeals.reduce((s, d) => s + d.daysToClose, 0) / inboundDeals.length,
    )
  : 0;
const outboundAvgDays = outboundDeals.length
  ? Math.round(
      outboundDeals.reduce((s, d) => s + d.daysToClose, 0) /
        outboundDeals.length,
    )
  : 0;

// Revenue trend — last 30 days (distribute deals across fake daily buckets)
const revTrendDates = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-04-13");
  d.setDate(d.getDate() - (29 - i));
  return d;
});

const revTrendData = revTrendDates.map((d, i) => {
  // Synthetic inbound/outbound daily revenue from deal amounts spread across days
  const seed = (i * 37 + 11) % 17;
  const inb =
    inboundDeals.length > 0
      ? Math.round((inboundRevenue / 30) * (0.6 + (seed % 5) * 0.12))
      : 0;
  const out =
    outboundDeals.length > 0
      ? Math.round((outboundRevenue / 30) * (0.5 + (seed % 7) * 0.11))
      : 0;
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    inbound: inb,
    outbound: out,
  };
});

// ─── Static derived data ──────────────────────────────────────────────────────

const weeklyOutcomes = [
  { week: "Wk 1", Completed: 312, Transferred: 78, Missed: 34, Failed: 22 },
  { week: "Wk 2", Completed: 348, Transferred: 91, Missed: 27, Failed: 18 },
  { week: "Wk 3", Completed: 389, Transferred: 102, Missed: 41, Failed: 29 },
  { week: "Wk 4", Completed: 421, Transferred: 118, Missed: 38, Failed: 24 },
];

const hourlyData = analyticsData.hourlyDistribution
  .filter((h) => h.hour >= 9 && h.hour <= 20)
  .map((h) => ({
    label:
      h.hour >= 12 ? `${h.hour === 12 ? 12 : h.hour - 12}pm` : `${h.hour}am`,
    calls: h.calls,
  }));

const campaignPerf = campaigns.slice(0, 6).map((c) => ({
  name: c.name.length > 18 ? `${c.name.slice(0, 18)}…` : c.name,
  successRate: c.successRate,
  transferRate:
    c.completedCalls > 0
      ? Math.round((c.failureCount / c.completedCalls) * 40)
      : 0,
  avgDurationMins:
    c.totalMinutes > 0 && c.completedCalls > 0
      ? Number.parseFloat((c.totalMinutes / c.completedCalls).toFixed(1))
      : 0,
}));

interface AgentPerf {
  key: string;
  name: string;
  totalCalls: number;
  avgHandleSecs: number;
  transfers: number;
  conversions: number;
  successRate: number;
}

const agentPerfData: AgentPerf[] = agents.map((a: Agent) => {
  const agentCalls = callRecords.filter((c) => c.agentId === a.id);
  const transfers = Math.round(agentCalls.length * 0.18);
  const conversions = Math.round(
    agentCalls.length * (a.successRate / 100) * 0.35,
  );
  const avgSecs =
    agentCalls.length > 0
      ? Math.round(
          agentCalls.reduce((acc, c) => acc + c.durationSeconds, 0) /
            agentCalls.length,
        )
      : 0;
  return {
    key: a.id,
    name: a.name,
    totalCalls: agentCalls.length,
    avgHandleSecs: avgSecs,
    transfers,
    conversions,
    successRate: a.successRate,
  };
});

// ─── Tooltip Component ────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-md p-2.5 text-xs shadow-xl min-w-[130px]">
      {label && (
        <p className="text-muted-foreground font-semibold mb-1.5">{label}</p>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm inline-block"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-bold text-foreground">
            {formatNum(Math.round(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Revenue Chart Tooltip ────────────────────────────────────────────────────
function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-md p-2.5 text-xs shadow-xl min-w-[150px]">
      {label && (
        <p className="text-muted-foreground font-semibold mb-1.5">{label}</p>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm inline-block"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </span>
          <span className="font-bold text-foreground">
            {fmtINR(Math.round(p.value))}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  sub?: string;
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
    <div
      className="bg-card border border-border border-l-2 border-l-primary rounded-md p-4 flex flex-col gap-2"
      data-ocid={`metric-card-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground">{icon}</span>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded px-1.5 py-0.5 ${
            trendUp
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold font-display text-foreground leading-none">
          {value}
        </p>
        {sub && <p className="text-[11px] text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Revenue Summary Card ─────────────────────────────────────────────────────
function RevSummaryCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-card border rounded-md p-4 flex flex-col gap-2 ${
        accent
          ? "border-l-2 border-l-accent border-border"
          : "border-l-2 border-l-primary border-border"
      }`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <p className="text-xs font-semibold uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold font-display text-foreground leading-none">
        {value}
      </p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Source Badge ─────────────────────────────────────────────────────────────
function SourceBadge({ source }: { source: "inbound" | "outbound" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
        source === "inbound"
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-accent/15 text-accent border border-accent/30"
      }`}
    >
      {source === "inbound" ? "Inbound" : "Outbound"}
    </span>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ChevronUp size={11} className="text-primary" />;
  if (dir === "desc") return <ChevronDown size={11} className="text-primary" />;
  return <ChevronsUpDown size={11} className="text-muted-foreground/40" />;
}

// ─── Funnel Bar ───────────────────────────────────────────────────────────────
function FunnelBar({
  stage,
  count,
  maxCount,
  pct,
}: {
  stage: string;
  count: number;
  maxCount: number;
  pct: string;
}) {
  const width = Math.round((count / maxCount) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 shrink-0 text-right">
        <span className="text-[11px] font-semibold text-foreground block truncate">
          {stage}
        </span>
      </div>
      <div className="flex-1 h-6 bg-muted/40 rounded overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full bg-primary/80 rounded flex items-center justify-end pr-2"
        >
          <span className="text-[10px] font-bold text-primary-foreground leading-none whitespace-nowrap">
            {formatNum(count)}
          </span>
        </motion.div>
      </div>
      <div className="w-12 shrink-0">
        <span className="text-[11px] font-semibold text-muted-foreground">
          {pct}
        </span>
      </div>
    </div>
  );
}

// ─── Date range buttons ───────────────────────────────────────────────────────
const dateRangeBtns: { label: string; value: DateRange }[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 3 Months", value: "3m" },
];

const colHeaders: { label: string; key: SortKey; align?: string }[] = [
  { label: "Agent Name", key: "name" },
  { label: "Total Calls", key: "totalCalls", align: "text-right" },
  { label: "Avg Handle Time", key: "avgHandle", align: "text-right" },
  { label: "Transfers Recv.", key: "transfers", align: "text-right" },
  { label: "Conversions", key: "conversions", align: "text-right" },
  { label: "Success Rate", key: "rate", align: "text-right" },
];

// ─── Deal Detail Panel ────────────────────────────────────────────────────────
function DealDetailPanel({
  deal,
  onClose,
}: {
  deal: ClosedDeal | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {deal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-[420px] z-50 bg-card border-l border-border shadow-2xl overflow-y-auto"
            data-ocid="deal-detail-panel"
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
                  Deal Details
                </p>
                <h3 className="text-sm font-bold font-display text-foreground leading-tight">
                  {deal.leadName}
                </h3>
                <p className="text-xs text-muted-foreground">{deal.company}</p>
              </div>
              <button
                type="button"
                aria-label="Close deal panel"
                onClick={onClose}
                className="p-2 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-smooth"
                data-ocid="deal-panel-close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Revenue highlight */}
              <div className="bg-primary/10 border border-primary/25 rounded-md p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary/80 font-semibold uppercase tracking-widest mb-1">
                    Deal Revenue
                  </p>
                  <p className="text-2xl font-bold font-display text-primary">
                    ₹{deal.revenueAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <SourceBadge source={deal.leadSource} />
              </div>

              {/* Timeline */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Deal Timeline
                </p>
                {[
                  {
                    label: "Lead Received",
                    date: deal.leadReceivedDate,
                    color: "bg-muted-foreground",
                  },
                  {
                    label: "First Contact",
                    date: deal.firstContactDate,
                    color: "bg-primary",
                  },
                  {
                    label: "Deal Closed",
                    date: deal.closeDate,
                    color: "bg-emerald-500",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${item.color}`}
                    />
                    <span className="text-[11px] text-muted-foreground w-28 shrink-0">
                      {item.label}
                    </span>
                    <span className="text-xs font-semibold text-foreground">
                      {fmtDate(item.date)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Days to Close", value: `${deal.daysToClose} days` },
                  { label: "Assigned Agent", value: deal.assignedAgent },
                  { label: "Industry", value: deal.industry ?? "—" },
                  {
                    label: "Lead Source",
                    value:
                      deal.leadSource === "inbound"
                        ? "📞 Inbound Call"
                        : "🚀 Outbound Call",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-muted/30 rounded-md p-3 border border-border/50"
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                      {item.label}
                    </p>
                    <p className="text-xs font-bold text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Campaign */}
              {deal.campaignName && (
                <div className="bg-muted/20 border border-border/50 rounded-md p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                    Campaign
                  </p>
                  <p className="text-xs font-semibold text-foreground">
                    {deal.campaignName}
                  </p>
                </div>
              )}

              {/* Avg comparison */}
              <div className="border border-border/50 rounded-md p-3 space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                  vs. Source Average
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Days to Close</span>
                  <span
                    className={`font-bold ${
                      deal.daysToClose <=
                      (
                        deal.leadSource === "inbound"
                          ? inboundAvgDays
                          : outboundAvgDays
                      )
                        ? "text-emerald-400"
                        : "text-destructive"
                    }`}
                  >
                    {deal.daysToClose} days{" "}
                    <span className="text-muted-foreground font-normal">
                      (avg{" "}
                      {deal.leadSource === "inbound"
                        ? inboundAvgDays
                        : outboundAvgDays}{" "}
                      days)
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Revenue</span>
                  <span
                    className={`font-bold ${
                      deal.revenueAmount >=
                      (
                        deal.leadSource === "inbound"
                          ? inboundAvgDeal
                          : outboundAvgDeal
                      )
                        ? "text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    ₹{deal.revenueAmount.toLocaleString("en-IN")}{" "}
                    <span className="text-muted-foreground font-normal">
                      (avg ₹
                      {(deal.leadSource === "inbound"
                        ? inboundAvgDeal
                        : outboundAvgDeal
                      ).toLocaleString("en-IN")}
                      )
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [sortKey, setSortKey] = useState<SortKey>("rate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Revenue section state
  const [dealSortKey, setDealSortKey] = useState<DealSortKey>("closeDate");
  const [dealSortDir, setDealSortDir] = useState<SortDir>("desc");
  const [revFilter, setRevFilter] = useState<RevFilter>("all");
  const [selectedDeal, setSelectedDeal] = useState<ClosedDeal | null>(null);

  // ─── Filtered volume trend data ─────────────────────────────────────────
  const trendData = useMemo(() => {
    const all = analyticsData.dailyTrends;
    if (dateRange === "7d") return all.slice(-7);
    if (dateRange === "30d") return all;
    const prior2 = all.map((d) => ({
      ...d,
      date: d.date.replace(/(\d+)\/(\d+)/, (_, dd, mm) => {
        const m = Number(mm) - 2;
        return `${dd}/${m < 1 ? String(m + 12).padStart(2, "0") : String(m).padStart(2, "0")}`;
      }),
    }));
    const prior1 = all.map((d) => ({
      ...d,
      date: d.date.replace(/(\d+)\/(\d+)/, (_, dd, mm) => {
        const m = Number(mm) - 1;
        return `${dd}/${m < 1 ? String(m + 12).padStart(2, "0") : String(m).padStart(2, "0")}`;
      }),
    }));
    return [...prior2, ...prior1, ...all];
  }, [dateRange]);

  const areaData = useMemo(
    () =>
      trendData.map((d, i) => ({
        date: d.date,
        inbound: Math.round(d.calls * (0.3 + (i % 3) * 0.04)),
        outbound: Math.round(d.calls * (0.7 - (i % 3) * 0.04)),
      })),
    [trendData],
  );

  const totalCalls = useMemo(
    () => trendData.reduce((a, d) => a + d.calls, 0),
    [trendData],
  );
  const avgDurSecs = useMemo(
    () =>
      Math.round(
        trendData.reduce((a, d) => a + d.avgDuration, 0) / trendData.length,
      ),
    [trendData],
  );

  const funnelData = analyticsData.conversionFunnel;
  const maxFunnelCount = funnelData[0].count;

  const sortedAgents = useMemo(() => {
    const copy = [...agentPerfData];
    if (!sortDir) return copy;
    copy.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "name") {
        av = a.name;
        bv = b.name;
      } else if (sortKey === "totalCalls") {
        av = a.totalCalls;
        bv = b.totalCalls;
      } else if (sortKey === "avgHandle") {
        av = a.avgHandleSecs;
        bv = b.avgHandleSecs;
      } else if (sortKey === "transfers") {
        av = a.transfers;
        bv = b.transfers;
      } else if (sortKey === "conversions") {
        av = a.conversions;
        bv = b.conversions;
      } else if (sortKey === "rate") {
        av = a.successRate;
        bv = b.successRate;
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc"
        ? (av as number) - (bv as number)
        : (bv as number) - (av as number);
    });
    return copy;
  }, [sortKey, sortDir]);

  // Revenue trend filtered
  const filteredRevTrend = useMemo(() => {
    if (revFilter === "all") return revTrendData;
    return revTrendData.map((d) =>
      revFilter === "inbound" ? { ...d, outbound: 0 } : { ...d, inbound: 0 },
    );
  }, [revFilter]);

  // Sorted deal table
  const sortedDeals = useMemo(() => {
    const copy = [...sampleClosedDeals];
    if (!dealSortDir) return copy;
    copy.sort((a, b) => {
      let av = 0;
      let bv = 0;
      if (dealSortKey === "daysToClose") {
        av = a.daysToClose;
        bv = b.daysToClose;
      } else if (dealSortKey === "revenueAmount") {
        av = a.revenueAmount;
        bv = b.revenueAmount;
      } else if (dealSortKey === "closeDate") {
        av = a.closeDate.getTime();
        bv = b.closeDate.getTime();
      }
      return dealSortDir === "asc" ? av - bv : bv - av;
    });
    return copy;
  }, [dealSortKey, dealSortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
      );
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleDealSort(key: DealSortKey) {
    if (dealSortKey === key) {
      setDealSortDir((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
      );
    } else {
      setDealSortKey(key);
      setDealSortDir("desc");
    }
  }

  const xInterval = dateRange === "3m" ? 13 : dateRange === "30d" ? 4 : 0;
  return (
    <div className="flex flex-col gap-5 p-5 min-h-0" data-ocid="analytics-page">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold font-display text-foreground">
            Analytics &amp; Performance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            GenAI Voice Automation · Call intelligence &amp; conversion tracking
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center bg-muted/40 border border-border rounded-md p-0.5 gap-0.5"
            data-ocid="date-range-selector"
          >
            {dateRangeBtns.map((b) => (
              <button
                type="button"
                key={b.value}
                data-ocid={`date-range-${b.value}`}
                onClick={() => setDateRange(b.value)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-smooth ${
                  dateRange === b.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            data-ocid="export-report-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-smooth"
          >
            <Download size={13} />
            Export Report
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          REVENUE & DEAL INTELLIGENCE SECTION
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.04 }}
      >
        {/* Section header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={15} className="text-accent" />
            <h2 className="text-sm font-bold font-display text-foreground">
              Revenue &amp; Deal Intelligence
            </h2>
          </div>
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted/50 border border-border px-2 py-0.5 rounded">
            {sampleClosedDeals.length} Closed Deals
          </span>
        </div>

        {/* ROW 1 — Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <RevSummaryCard
            icon={<DollarSign size={14} />}
            label="Total Revenue"
            value={fmtINR(totalRevenue)}
            sub={`₹${totalRevenue.toLocaleString("en-IN")} total`}
          />
          <RevSummaryCard
            icon={<TrendingUp size={14} />}
            label="Total Deals Closed"
            value={String(sampleClosedDeals.length)}
            sub={`${inboundDeals.length} inbound · ${outboundDeals.length} outbound`}
            accent
          />
          <RevSummaryCard
            icon={<BarChart3 size={14} />}
            label="Avg Deal Value"
            value={`₹${avgDealValue.toLocaleString("en-IN")}`}
            sub="Per closed deal"
          />
          <RevSummaryCard
            icon={<Clock size={14} />}
            label="Avg Days to Close"
            value={`${avgDaysToClose} days`}
            sub="Lead → Deal closed"
            accent
          />
        </div>

        {/* ROW 2 — Lead Source Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {/* LEFT — Inbound vs Outbound Revenue */}
          <div
            className="surface-chart p-4"
            data-ocid="revenue-source-breakdown"
          >
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Inbound vs Outbound Revenue
            </h3>
            <div className="space-y-4">
              {/* Metric rows */}
              {[
                {
                  label: "Total Revenue",
                  inbVal: inboundRevenue,
                  outbVal: outboundRevenue,
                  fmt: (v: number) => fmtINR(v),
                },
                {
                  label: "Deal Count",
                  inbVal: inboundDeals.length,
                  outbVal: outboundDeals.length,
                  fmt: (v: number) => String(v),
                },
                {
                  label: "Avg Deal Value",
                  inbVal: inboundAvgDeal,
                  outbVal: outboundAvgDeal,
                  fmt: (v: number) => `₹${v.toLocaleString("en-IN")}`,
                },
                {
                  label: "Avg Days to Close",
                  inbVal: inboundAvgDays,
                  outbVal: outboundAvgDays,
                  fmt: (v: number) => `${v}d`,
                },
              ].map((row) => {
                const maxVal = Math.max(row.inbVal, row.outbVal) || 1;
                return (
                  <div key={row.label}>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1.5">
                      {row.label}
                    </p>
                    <div className="space-y-1.5">
                      {/* Inbound bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-primary/80 w-14 shrink-0 font-semibold">
                          Inbound
                        </span>
                        <div className="flex-1 h-5 bg-muted/40 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.round((row.inbVal / maxVal) * 100)}%`,
                            }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full rounded flex items-center justify-end pr-2"
                            style={{ background: "oklch(0.72 0.2 190 / 0.8)" }}
                          >
                            <span className="text-[9px] font-bold text-foreground whitespace-nowrap">
                              {row.fmt(row.inbVal)}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                      {/* Outbound bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-accent/80 w-14 shrink-0 font-semibold">
                          Outbound
                        </span>
                        <div className="flex-1 h-5 bg-muted/40 rounded overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${Math.round((row.outbVal / maxVal) * 100)}%`,
                            }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.7,
                              delay: 0.1,
                              ease: "easeOut",
                            }}
                            className="h-full rounded flex items-center justify-end pr-2"
                            style={{ background: "oklch(0.68 0.18 65 / 0.8)" }}
                          >
                            <span className="text-[9px] font-bold text-foreground whitespace-nowrap">
                              {row.fmt(row.outbVal)}
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — Avg Days to Close by Source */}
          <div className="surface-chart p-4" data-ocid="days-to-close-card">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Average Days to Close by Source
            </h3>
            <div className="space-y-5">
              {/* Inbound */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Inbound Calls
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {inboundDeals.length} deals analyzed
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold font-display text-primary">
                    {inboundAvgDays}
                  </span>
                  <span className="text-sm text-primary/70 font-semibold">
                    days avg
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-1">
                    <ArrowUpRight size={9} />
                    Faster
                  </span>
                </div>
                <div className="h-2 bg-muted/40 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${Math.round(
                        (inboundAvgDays /
                          Math.max(inboundAvgDays, outboundAvgDays)) *
                          100,
                      )}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded"
                    style={{ background: "oklch(0.72 0.2 190)" }}
                  />
                </div>
              </div>

              {/* Outbound */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-xs font-semibold text-foreground">
                      Outbound Calls
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {outboundDeals.length} deals analyzed
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold font-display text-accent">
                    {outboundAvgDays}
                  </span>
                  <span className="text-sm text-accent/70 font-semibold">
                    days avg
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded ml-1">
                    <ArrowDownRight size={9} />
                    Longer
                  </span>
                </div>
                <div className="h-2 bg-muted/40 rounded overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${Math.round(
                        (outboundAvgDays /
                          Math.max(inboundAvgDays, outboundAvgDays)) *
                          100,
                      )}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                    className="h-full rounded"
                    style={{ background: "oklch(0.68 0.18 65)" }}
                  />
                </div>
              </div>

              {/* Comparison bar */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">
                  Total Revenue Split
                </p>
                <div className="flex h-3 rounded overflow-hidden gap-0.5">
                  <div
                    className="rounded-l transition-smooth"
                    style={{
                      width: `${Math.round((inboundRevenue / (inboundRevenue + outboundRevenue)) * 100)}%`,
                      background: "oklch(0.72 0.2 190)",
                    }}
                  />
                  <div
                    className="rounded-r flex-1"
                    style={{ background: "oklch(0.68 0.18 65)" }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] font-semibold">
                  <span className="text-primary">
                    Inbound {Math.round((inboundRevenue / totalRevenue) * 100)}%
                    · {fmtINR(inboundRevenue)}
                  </span>
                  <span className="text-accent">
                    Outbound{" "}
                    {Math.round((outboundRevenue / totalRevenue) * 100)}% ·{" "}
                    {fmtINR(outboundRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3 — Revenue Trend */}
        <div className="surface-chart p-4 mb-3" data-ocid="revenue-trend-chart">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Revenue Trend — Last 30 Days
            </h3>
            <div className="flex items-center bg-muted/40 border border-border rounded-md p-0.5 gap-0.5">
              {(["all", "inbound", "outbound"] as RevFilter[]).map((f) => (
                <button
                  type="button"
                  key={f}
                  data-ocid={`rev-filter-${f}`}
                  onClick={() => setRevFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition-smooth ${
                    revFilter === f
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={filteredRevTrend}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradRevInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="gradRevOutbound"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(v: number) => fmtINR(v)}
              />
              <Tooltip
                content={<RevenueTooltip />}
                cursor={{ stroke: "oklch(var(--border))", strokeWidth: 1 }}
              />
              {revFilter !== "outbound" && (
                <Area
                  type="monotone"
                  dataKey="inbound"
                  name="Inbound"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  fill="url(#gradRevInbound)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#2dd4bf" }}
                />
              )}
              {revFilter !== "inbound" && (
                <Area
                  type="monotone"
                  dataKey="outbound"
                  name="Outbound"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#gradRevOutbound)"
                  dot={false}
                  activeDot={{ r: 3, fill: "#f59e0b" }}
                />
              )}
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value: string) => (
                  <span style={{ color: "oklch(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ROW 4 — Closed Deals Table */}
        <div className="surface-chart p-4" data-ocid="closed-deals-table">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Closed Deals
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">
                Click row for details
              </span>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {sampleClosedDeals.length} deals
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { label: "Lead Name", key: null, align: "text-left" },
                    { label: "Company", key: null, align: "text-left" },
                    { label: "Industry", key: null, align: "text-left" },
                    { label: "Source", key: null, align: "text-left" },
                    { label: "Received", key: null, align: "text-right" },
                    { label: "First Contact", key: null, align: "text-right" },
                    {
                      label: "Closed",
                      key: "closeDate" as DealSortKey,
                      align: "text-right",
                    },
                    {
                      label: "Days to Close",
                      key: "daysToClose" as DealSortKey,
                      align: "text-right",
                    },
                    {
                      label: "Revenue",
                      key: "revenueAmount" as DealSortKey,
                      align: "text-right",
                    },
                    { label: "Agent", key: null, align: "text-left" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      className={`px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${col.align}`}
                    >
                      {col.key ? (
                        <button
                          type="button"
                          data-ocid={`deal-sort-${col.key}`}
                          onClick={() => handleDealSort(col.key as DealSortKey)}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                        >
                          {col.label}
                          <SortIcon
                            dir={dealSortKey === col.key ? dealSortDir : null}
                          />
                        </button>
                      ) : (
                        col.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedDeals.map((deal, i) => (
                  <tr
                    key={deal.id}
                    data-ocid={`deal-row-${deal.id}`}
                    onClick={() => setSelectedDeal(deal)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedDeal(deal)
                    }
                    tabIndex={0}
                    className={`border-b border-border/50 cursor-pointer hover:bg-primary/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                      i % 2 === 1 ? "bg-muted/10" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-xs font-semibold text-foreground">
                        {deal.leadName}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-muted-foreground">
                        {deal.company}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] text-muted-foreground">
                        {deal.industry ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <SourceBadge source={deal.leadSource} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {fmtDate(deal.leadReceivedDate)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {fmtDate(deal.firstContactDate)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-[11px] text-foreground font-mono font-semibold">
                        {fmtDate(deal.closeDate)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={`text-xs font-bold font-mono ${
                          deal.daysToClose <= avgDaysToClose
                            ? "text-emerald-400"
                            : "text-accent"
                        }`}
                      >
                        {deal.daysToClose}d
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-bold font-mono text-foreground">
                        ₹{deal.revenueAmount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[11px] text-muted-foreground">
                        {deal.assignedAgent}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border bg-muted/20">
                  <td colSpan={7} className="px-3 py-2">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Totals
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="text-xs font-bold text-foreground font-mono">
                      {avgDaysToClose}d avg
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="text-xs font-bold text-primary font-mono">
                      {fmtINR(totalRevenue)}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ─── Deal Detail Slide Panel ─────────────────────────────────────────── */}
      <DealDetailPanel
        deal={selectedDeal}
        onClose={() => setSelectedDeal(null)}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          EXISTING ANALYTICS SECTIONS (UNCHANGED)
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── Top Metrics Row ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <MetricCard
          icon={<Phone size={15} />}
          label="Total Calls"
          value={formatNum(totalCalls)}
          trend="+14.2%"
          trendUp
          sub="vs previous period"
        />
        <MetricCard
          icon={<Clock size={15} />}
          label="Avg Call Duration"
          value={fmtDuration(avgDurSecs)}
          trend="-0.8%"
          trendUp={false}
          sub="All call types"
        />
        <MetricCard
          icon={<ArrowRightLeft size={15} />}
          label="Transfer Rate"
          value="18.3%"
          trend="+2.1%"
          trendUp={false}
          sub="Calls transferred to agents"
        />
        <MetricCard
          icon={<TrendingUp size={15} />}
          label="Conversion Rate"
          value="18.2%"
          trend="+3.4%"
          trendUp
          sub="Leads → Hot Leads"
        />
      </motion.div>

      {/* ── Charts Row 1: Area + Outcome ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Call Volume Trend */}
        <div className="surface-chart p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Call Volume Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={areaData}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradInbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOutbound" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                interval={xInterval}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "oklch(var(--border))", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="inbound"
                name="Inbound"
                stroke="#2dd4bf"
                strokeWidth={2}
                fill="url(#gradInbound)"
                dot={false}
                activeDot={{ r: 3, fill: "#2dd4bf" }}
              />
              <Area
                type="monotone"
                dataKey="outbound"
                name="Outbound"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradOutbound)"
                dot={false}
                activeDot={{ r: 3, fill: "#6366f1" }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value: string) => (
                  <span style={{ color: "oklch(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Call Outcome Breakdown */}
        <div className="surface-chart p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Call Outcome Breakdown · 4 Weeks
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={weeklyOutcomes}
              barSize={12}
              barGap={3}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="Completed"
                name="Completed"
                fill="#2dd4bf"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="Transferred"
                name="Transferred"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="Missed"
                name="Missed"
                fill="#f59e0b"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="Failed"
                name="Failed"
                fill="#ef4444"
                radius={[3, 3, 0, 0]}
              />
              <Legend
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value: string) => (
                  <span style={{ color: "oklch(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Charts Row 2: Funnel + Hourly ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-3"
      >
        {/* Conversion Funnel */}
        <div className="surface-chart p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Conversion Funnel
            </h2>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              End-to-End
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {funnelData.map((item, i) => {
              const pct =
                i === 0
                  ? "100%"
                  : `${Math.round((item.count / maxFunnelCount) * 100)}%`;
              return (
                <FunnelBar
                  key={item.stage}
                  stage={item.stage}
                  count={item.count}
                  maxCount={maxFunnelCount}
                  pct={pct}
                />
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-border grid grid-cols-4 gap-1">
            {funnelData.slice(1).map((item, i) => {
              const drop = Math.round(
                ((funnelData[i].count - item.count) / funnelData[i].count) *
                  100,
              );
              return (
                <div key={item.stage} className="text-center">
                  <p className="text-[10px] text-destructive font-bold">
                    -{drop}%
                  </p>
                  <p className="text-[9px] text-muted-foreground truncate">
                    {item.stage.split(" ")[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Calls by Hour of Day */}
        <div className="surface-chart p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Calls by Hour of Day · 9am – 8pm
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={hourlyData}
              barSize={18}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="calls"
                name="Calls"
                fill="#2dd4bf"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Charts Row 3: Campaign Performance ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
      >
        <div className="surface-chart p-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Campaign Performance Comparison
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={campaignPerf}
              barSize={12}
              barGap={4}
              margin={{ top: 4, right: 16, left: -8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 9.5, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={28}
                unit="%"
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="successRate"
                name="Success Rate %"
                fill="#2dd4bf"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="transferRate"
                name="Transfer Rate %"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="avgDurationMins"
                name="Avg Duration (min)"
                fill="#f59e0b"
                radius={[3, 3, 0, 0]}
              />
              <Legend
                iconType="square"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={(value: string) => (
                  <span style={{ color: "oklch(var(--muted-foreground))" }}>
                    {value}
                  </span>
                )}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Agent Performance Table ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        <div className="surface-chart p-4" data-ocid="agent-perf-table">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Agent Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr className="border-b border-border">
                  {colHeaders.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${col.align ?? "text-left"}`}
                    >
                      <button
                        type="button"
                        data-ocid={`sort-${col.key}`}
                        onClick={() => handleSort(col.key)}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {col.label}
                        <SortIcon dir={sortKey === col.key ? sortDir : null} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedAgents.map((row) => (
                  <tr
                    key={row.key}
                    data-ocid={`agent-row-${row.key}`}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                          {row.name.split(" ").pop()?.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-mono text-foreground font-semibold">
                        {formatNum(row.totalCalls)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-mono text-muted-foreground">
                        {row.avgHandleSecs > 0
                          ? fmtDuration(row.avgHandleSecs)
                          : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-mono text-foreground">
                        {row.transfers}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-xs font-mono text-foreground font-semibold">
                        {row.conversions}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-bold rounded px-1.5 py-0.5 ${
                          row.successRate >= 80
                            ? "bg-emerald-500/10 text-emerald-400"
                            : row.successRate >= 70
                              ? "bg-accent/10 text-accent"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {row.successRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
