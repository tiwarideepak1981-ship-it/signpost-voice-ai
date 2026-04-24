import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { billingOverview } from "@/data/sampleData";
import {
  AlertTriangle,
  Bell,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Mail,
  MessageSquare,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ─── Plan Constants ───────────────────────────────────────────────────────────
const BASE_MONTHLY = 10000;
const OVERAGE_RATE = 5;
const INCLUDED_MINUTES = 2000;
const MINUTES_USED = billingOverview.currentMinutesUsed; // 1847
const OVERAGE = Math.max(0, MINUTES_USED - INCLUDED_MINUTES);
const OVERAGE_CHARGE = OVERAGE * OVERAGE_RATE;
const TOTAL_CHARGE = BASE_MONTHLY + OVERAGE_CHARGE;
const USAGE_PCT = Math.round((MINUTES_USED / INCLUDED_MINUTES) * 1000) / 10;
const REMAINING = INCLUDED_MINUTES - MINUTES_USED;
const REMAINING_PCT = Math.round((REMAINING / INCLUDED_MINUTES) * 100);

// ─── Daily Usage Data ─────────────────────────────────────────────────────────
interface DailyUsageRow {
  date: string;
  inbound: number;
  outbound: number;
  totalMinutes: number;
}

const dailyUsageData: DailyUsageRow[] = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2024, 4, 1 + i);
  const day = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  const inbound = 8 + (i % 7) * 2;
  const outbound = 12 + (i % 9) * 3;
  const totalMinutes = Math.round((inbound + outbound) * 1.8 + (i % 5));
  return { date: day, inbound, outbound, totalMinutes };
});

const dailyTotals = {
  inbound: dailyUsageData.reduce((s, r) => s + r.inbound, 0),
  outbound: dailyUsageData.reduce((s, r) => s + r.outbound, 0),
};

// ─── Invoice History ──────────────────────────────────────────────────────────
interface InvoiceRow {
  invoiceId: string;
  month: string;
  base: number;
  overage: number;
  total: number;
  status: "paid" | "pending" | "overdue";
}

const invoiceHistory: InvoiceRow[] = [
  {
    invoiceId: "INV-2024-005",
    month: "May 2024",
    base: 10000,
    overage: 0,
    total: 10000,
    status: "pending",
  },
  {
    invoiceId: "INV-2024-004",
    month: "April 2024",
    base: 10000,
    overage: 0,
    total: 10000,
    status: "paid",
  },
  {
    invoiceId: "INV-2024-003",
    month: "March 2024",
    base: 10000,
    overage: 785,
    total: 10785,
    status: "paid",
  },
  {
    invoiceId: "INV-2024-002",
    month: "February 2024",
    base: 10000,
    overage: 0,
    total: 10000,
    status: "paid",
  },
  {
    invoiceId: "INV-2024-001",
    month: "January 2024",
    base: 10000,
    overage: 0,
    total: 10000,
    status: "paid",
  },
  {
    invoiceId: "INV-2023-012",
    month: "December 2023",
    base: 10000,
    overage: 0,
    total: 10000,
    status: "overdue",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: InvoiceRow["status"] }) {
  if (status === "paid") return <span className="status-success">Paid</span>;
  if (status === "pending")
    return <span className="status-warning">Pending</span>;
  return <span className="status-error">Overdue</span>;
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function UsageRing({ pct }: { pct: number }) {
  const r = 64;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const trackColor = "oklch(0.22 0.015 260)";
  const fillColor =
    pct >= 90
      ? "oklch(0.68 0.18 65)"
      : pct >= 75
        ? "oklch(0.72 0.20 190)"
        : "oklch(0.65 0.20 150)";
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      className="rotate-[-90deg]"
      aria-hidden="true"
    >
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth="12"
      />
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke={fillColor}
        strokeWidth="12"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const nearLimit = REMAINING_PCT < 20;
  const criticalLimit = REMAINING_PCT < 10;

  return (
    <div className="space-y-5 p-5" data-ocid="billing-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-foreground tracking-tight">
            Billing & Usage
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            May 2024 · Agentic AI Voice Bot Plan
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-primary/40 text-primary hidden sm:flex"
        >
          Next billing: {billingOverview.nextInvoiceDate}
        </Badge>
      </div>

      {/* Warning Banner */}
      {criticalLimit && (
        <div
          className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm"
          role="alert"
          data-ocid="billing-limit-warning"
        >
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-destructive font-medium">
            ⚠️ You're approaching your monthly limit. Additional minutes will be
            billed at ₹5/min.
          </p>
        </div>
      )}

      {/* Hero: Meter + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Usage Meter */}
        <div
          className="bg-card border border-border rounded-lg p-5 flex flex-col items-center justify-center gap-2"
          data-ocid="usage-meter"
        >
          <p className="metric-label mb-1">Monthly Usage</p>
          <div className="relative w-40 h-40 flex items-center justify-center">
            <UsageRing pct={USAGE_PCT} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={`text-2xl font-bold font-display ${nearLimit ? "text-accent" : "text-foreground"}`}
              >
                {USAGE_PCT}%
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                used
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground font-mono">
              {MINUTES_USED.toLocaleString("en-IN")} /{" "}
              {INCLUDED_MINUTES.toLocaleString("en-IN")} min
            </p>
            <p
              className={`text-xs font-semibold mt-1 ${nearLimit ? "text-accent" : "text-muted-foreground"}`}
            >
              {REMAINING.toLocaleString("en-IN")} minutes remaining
            </p>
          </div>
          {nearLimit && !criticalLimit && (
            <span className="status-warning mt-1">
              <AlertTriangle className="h-3 w-3" /> Near Limit
            </span>
          )}
        </div>

        {/* Billing Breakdown Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Base Charge */}
          <div
            className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2"
            data-ocid="billing-base-card"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primary/10">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="metric-label">Base Charge</span>
            </div>
            <p className="text-2xl font-bold font-display text-foreground">
              {fmt(BASE_MONTHLY)}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              Flat monthly fee · includes{" "}
              {INCLUDED_MINUTES.toLocaleString("en-IN")} min
            </p>
          </div>

          {/* Overage */}
          <div
            className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2"
            data-ocid="billing-overage-card"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-accent/10">
                <TrendingUp className="h-3.5 w-3.5 text-accent" />
              </div>
              <span className="metric-label">Overage Charge</span>
            </div>
            <p
              className={`text-2xl font-bold font-display ${OVERAGE_CHARGE > 0 ? "text-accent" : "text-foreground"}`}
            >
              {fmt(OVERAGE_CHARGE)}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {OVERAGE > 0
                ? `${OVERAGE} min × ₹${OVERAGE_RATE}/min`
                : "No overage — within plan"}
            </p>
          </div>

          {/* Total */}
          <div
            className="bg-card border border-primary/30 rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden"
            data-ocid="billing-total-card"
          >
            <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/60 rounded-t-lg" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primary/10">
                <Zap className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="metric-label">Total This Month</span>
            </div>
            <p className="text-2xl font-bold font-display text-primary">
              {fmt(TOTAL_CHARGE)}
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {OVERAGE_CHARGE > 0
                ? `₹10,000 base + ${fmt(OVERAGE_CHARGE)} overage`
                : "Base plan only — no overage"}
            </p>
          </div>
        </div>
      </div>

      {/* Plan Details */}
      <div
        className="bg-card border border-border rounded-lg p-4"
        data-ocid="plan-details"
      >
        <h2 className="text-sm font-bold font-display text-foreground mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Plan Details
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              { label: "Plan", value: "Agentic AI Voice Bot", type: "text" },
              {
                label: "Included Minutes",
                value: "2,000 / month",
                type: "text",
              },
              { label: "Overage Rate", value: "₹5 / minute", type: "text" },
              { label: "Analytics", value: "Included", type: "text" },
              {
                label: "Next Billing",
                value: billingOverview.nextInvoiceDate,
                type: "text",
              },
              { label: "Payment Status", value: "pending", type: "badge" },
            ] as const
          ).map(({ label, value, type }) => (
            <div key={label} className="space-y-1">
              <p className="metric-label">{label}</p>
              {type === "badge" ? (
                <span className="status-warning">Pending</span>
              ) : (
                <p className="text-xs font-semibold text-foreground">{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Usage Table */}
      <div
        className="bg-card border border-border rounded-lg overflow-hidden"
        data-ocid="daily-usage-table"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Daily Usage — May 2024
          </h2>
          <span className="text-xs text-muted-foreground">30-day period</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-left">
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest w-28">
                  Date
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Inbound Calls
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Outbound Calls
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Total Minutes
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyUsageData.map((row) => (
                <tr
                  key={row.date}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-1.5 text-xs text-foreground font-mono">
                    {row.date}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-right text-foreground">
                    {row.inbound}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-right text-foreground">
                    {row.outbound}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-right font-mono text-foreground">
                    {row.totalMinutes}
                  </td>
                  <td className="px-3 py-1.5 text-xs text-right text-muted-foreground">
                    —
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/40 border-t-2 border-border font-semibold">
                <td className="px-3 py-2 text-xs text-foreground font-semibold">
                  Subtotal
                </td>
                <td className="px-3 py-2 text-xs text-right text-foreground">
                  {dailyTotals.inbound}
                </td>
                <td className="px-3 py-2 text-xs text-right text-foreground">
                  {dailyTotals.outbound}
                </td>
                <td className="px-3 py-2 text-xs text-right font-mono font-bold text-foreground">
                  {MINUTES_USED.toLocaleString("en-IN")}
                </td>
                <td className="px-3 py-2 text-xs text-right text-muted-foreground">
                  Included
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice History */}
      <div
        className="bg-card border border-border rounded-lg overflow-hidden"
        data-ocid="invoice-history-table"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold font-display text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Invoice History
          </h2>
          <span className="text-xs text-muted-foreground">Last 6 months</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-left">
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Invoice #
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Month
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Base Charge
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Overage
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-right">
                  Total
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  Status
                </th>
                <th className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-center">
                  Download
                </th>
              </tr>
            </thead>
            <tbody>
              {invoiceHistory.map((inv) => (
                <tr
                  key={inv.invoiceId}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-3 py-2 text-xs font-mono text-primary">
                    {inv.invoiceId}
                  </td>
                  <td className="px-3 py-2 text-xs text-foreground">
                    {inv.month}
                  </td>
                  <td className="px-3 py-2 text-xs text-right font-mono text-foreground">
                    {fmt(inv.base)}
                  </td>
                  <td className="px-3 py-2 text-xs text-right font-mono text-foreground">
                    {inv.overage > 0 ? (
                      <span className="text-accent">{fmt(inv.overage)}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-right font-mono font-bold text-foreground">
                    {fmt(inv.total)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-3 py-2 text-xs text-center">
                    <button
                      type="button"
                      aria-label={`Download ${inv.invoiceId}`}
                      className="p-1.5 rounded hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                      data-ocid={`invoice-download-${inv.invoiceId}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Alerts */}
      <div
        className="bg-card border border-border rounded-lg p-4"
        data-ocid="billing-alerts"
      >
        <h2 className="text-sm font-bold font-display text-foreground mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" /> Billing Alerts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Threshold */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Alert me when usage exceeds __% of included minutes
            </p>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={100}
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="w-24 h-8 text-sm font-mono bg-background border-input text-foreground"
                data-ocid="alert-threshold-input"
              />
              <span className="text-sm text-muted-foreground">%</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 text-xs border-border"
                data-ocid="alert-threshold-save"
              >
                Save
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded px-3 py-2">
              <Bell className="h-3.5 w-3.5 text-primary shrink-0" />
              <p className="text-[11px] text-foreground">
                Current alert: notify at{" "}
                <span className="font-bold text-primary">
                  {alertThreshold}%
                </span>{" "}
                usage (
                {Math.round(
                  (alertThreshold / 100) * INCLUDED_MINUTES,
                ).toLocaleString("en-IN")}{" "}
                min)
              </p>
            </div>
          </div>

          {/* Channel Toggles */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Alert channels</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <Label
                      htmlFor="email-alerts"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Email Alerts
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      billing@signpostindia.com
                    </p>
                  </div>
                </div>
                <Switch
                  id="email-alerts"
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                  data-ocid="email-alerts-toggle"
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <Label
                      htmlFor="sms-alerts"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      SMS Alerts
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      +91-98765-43210
                    </p>
                  </div>
                </div>
                <Switch
                  id="sms-alerts"
                  checked={smsAlerts}
                  onCheckedChange={setSmsAlerts}
                  data-ocid="sms-alerts-toggle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
