import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  agents,
  callRecords,
  campaigns,
  leads,
  sampleAIAgents,
} from "@/data/sampleData";
import { campaignStore } from "@/store/campaignStore";
import type { AICallLog, AICampaign, Campaign, CampaignStatus } from "@/types";
import {
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Clock,
  Copy,
  Eye,
  FileText,
  Mic,
  Pause,
  Pencil,
  Phone,
  Play,
  Plus,
  Rocket,
  Save,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ExtendedStatus = CampaignStatus | "scheduled";
type MainTab = "standard" | "ai";

// ─── Shared: Status badge ─────────────────────────────────────────────────────

const statusMeta: Record<ExtendedStatus, { label: string; className: string }> =
  {
    active: {
      label: "Active",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    paused: {
      label: "Paused",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    completed: {
      label: "Completed",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    draft: {
      label: "Draft",
      className: "bg-muted text-muted-foreground border-border",
    },
    scheduled: {
      label: "Scheduled",
      className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
  };

function StatusBadge({ status }: { status: ExtendedStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

const aiStatusMeta: Record<
  AICampaign["status"],
  { label: string; className: string; dot: string }
> = {
  running: {
    label: "Running",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    dot: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
  },
  draft: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

function AIStatusBadge({ status }: { status: AICampaign["status"] }) {
  const meta = aiStatusMeta[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${meta.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot} ${status === "running" ? "animate-pulse" : ""}`}
      />
      {meta.label}
    </span>
  );
}

// ─── Shared: Progress bar ─────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color =
    pct >= 80
      ? "bg-emerald-500"
      : pct >= 50
        ? "bg-primary"
        : pct > 0
          ? "bg-amber-500"
          : "bg-muted";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-smooth ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right shrink-0">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

// ─── Shared: Stat pill ────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  sub,
}: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-md px-3 py-2 min-w-[120px]">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STANDARD CAMPAIGNS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const relatedCalls = useMemo(
    () => callRecords.filter((c) => c.campaignId === campaign.id).slice(0, 20),
    [campaign.id],
  );
  const transferred = relatedCalls.filter((c) => c.status === "success").length;
  const pending = relatedCalls.filter((c) => c.status === "pending").length;

  return (
    <div className="border-t border-border bg-background/60">
      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border">
        <div className="p-4 space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Campaign Config
          </h3>
          <div className="space-y-2.5">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Description
              </div>
              <p className="text-xs text-foreground mt-0.5">
                {campaign.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Assigned Agent
                </div>
                <p className="text-xs text-foreground mt-0.5 font-medium">
                  {campaign.agent}
                </p>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Avg Duration
                </div>
                <p className="text-xs text-foreground mt-0.5 font-mono">
                  {campaign.avgDuration}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Start Date
                </div>
                <p className="text-xs text-foreground mt-0.5 font-mono">
                  {campaign.startDate}
                </p>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  End Date
                </div>
                <p className="text-xs text-foreground mt-0.5 font-mono">
                  {campaign.endDate}
                </p>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Dial Window
              </div>
              <div className="flex items-center gap-1.5 text-xs text-foreground">
                <Clock size={11} className="text-primary" />
                <span>09:00 AM – 07:00 PM (IST)</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                Progress Timeline
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-primary/70 rounded-full"
                  style={{
                    width:
                      campaign.targetCount > 0
                        ? `${Math.min(100, (campaign.completedCalls / campaign.targetCount) * 100)}%`
                        : "0%",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>{campaign.startDate}</span>
                <span>{campaign.endDate}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: "Calls Initiated",
                value: campaign.completedCalls.toLocaleString(),
                icon: Phone,
                color: "text-primary",
              },
              {
                label: "Successful",
                value: campaign.successCount.toLocaleString(),
                icon: CheckCircle2,
                color: "text-emerald-400",
              },
              {
                label: "Failed",
                value: campaign.failureCount.toLocaleString(),
                icon: XCircle,
                color: "text-destructive",
              },
              {
                label: "Transferred",
                value: transferred.toLocaleString(),
                icon: ArrowUpRight,
                color: "text-cyan-400",
              },
              {
                label: "Pending",
                value: pending.toLocaleString(),
                icon: Clock,
                color: "text-amber-400",
              },
              {
                label: "Total Minutes",
                value: campaign.totalMinutes.toLocaleString(),
                icon: Clock,
                color: "text-muted-foreground",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-muted/40 rounded-md px-2.5 py-2 flex items-center gap-2"
              >
                <Icon size={13} className={`shrink-0 ${color}`} />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground truncate">
                    {label}
                  </div>
                  <div className="text-sm font-bold text-foreground tabular-nums">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-muted/40 rounded-md px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} className="text-primary" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Success Rate
                </span>
              </div>
              <span className="text-sm font-bold text-emerald-400 tabular-nums">
                {campaign.successRate.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${campaign.successRate}%` }}
              />
            </div>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Recent Calls ({relatedCalls.length})
          </h3>
          <ScrollArea className="h-[220px]">
            <table className="w-full data-table">
              <thead>
                <tr className="text-left">
                  {["Caller", "Time", "Dur", "Status"].map((h) => (
                    <th
                      key={h}
                      className="text-[10px] text-muted-foreground font-semibold pb-1 pr-2"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relatedCalls.map((call) => (
                  <tr
                    key={call.id}
                    className="border-t border-border hover:bg-muted/30"
                  >
                    <td className="py-1 pr-2 text-foreground font-mono text-[10px]">
                      {call.callerId}
                    </td>
                    <td className="py-1 pr-2 text-muted-foreground text-[10px]">
                      {call.timestamp.split(" ")[1]}
                    </td>
                    <td className="py-1 pr-2 font-mono text-[10px] text-foreground">
                      {call.duration}
                    </td>
                    <td className="py-1">
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${call.status === "success" ? "bg-emerald-500/15 text-emerald-400" : call.status === "failure" ? "bg-destructive/15 text-destructive" : call.status === "pending" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {call.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {relatedCalls.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-muted-foreground text-xs"
                    >
                      No calls recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

// ─── Create campaign modal ────────────────────────────────────────────────────

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}
interface CreateForm {
  name: string;
  description: string;
  script: string;
  targetCount: string;
  startDate: string;
  endDate: string;
  dialFrom: string;
  dialTo: string;
  assignedAgents: string[];
}

function CreateCampaignModal({ open, onClose }: CreateModalProps) {
  const [form, setForm] = useState<CreateForm>({
    name: "",
    description: "",
    script: "",
    targetCount: "",
    startDate: "",
    endDate: "",
    dialFrom: "09:00",
    dialTo: "19:00",
    assignedAgents: [],
  });

  function toggleAgent(agentId: string) {
    setForm((f) => ({
      ...f,
      assignedAgents: f.assignedAgents.includes(agentId)
        ? f.assignedAgents.filter((a) => a !== agentId)
        : [...f.assignedAgents, agentId],
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Campaign name is required");
      return;
    }
    toast.success(`Campaign "${form.name}" created successfully`);
    onClose();
    setForm({
      name: "",
      description: "",
      script: "",
      targetCount: "",
      startDate: "",
      endDate: "",
      dialFrom: "09:00",
      dialTo: "19:00",
      assignedAgents: [],
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-base">
            Create Campaign
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[68vh] pr-1">
          <div className="space-y-4 py-1 pr-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Campaign Name *
              </Label>
              <Input
                data-ocid="create-campaign-name"
                placeholder="e.g. Q3 Brand Awareness Drive"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="h-8 text-sm bg-background border-input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <Input
                data-ocid="create-campaign-description"
                placeholder="Short description of campaign objective"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                className="h-8 text-sm bg-background border-input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Call Script
              </Label>
              <Textarea
                data-ocid="create-campaign-script"
                placeholder="Enter the call script or talking points for the GenAI agent…"
                value={form.script}
                onChange={(e) =>
                  setForm((f) => ({ ...f, script: e.target.value }))
                }
                rows={4}
                className="text-sm bg-background border-input resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Target Lead Count
              </Label>
              <Input
                data-ocid="create-campaign-target"
                type="number"
                placeholder="e.g. 500"
                value={form.targetCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetCount: e.target.value }))
                }
                className="h-8 text-sm bg-background border-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Start Date
                </Label>
                <Input
                  data-ocid="create-campaign-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="h-8 text-sm bg-background border-input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  End Date
                </Label>
                <Input
                  data-ocid="create-campaign-end"
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="h-8 text-sm bg-background border-input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Dial Time Window
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  data-ocid="create-campaign-dial-from"
                  type="time"
                  value={form.dialFrom}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dialFrom: e.target.value }))
                  }
                  className="h-8 text-sm bg-background border-input flex-1"
                />
                <span className="text-xs text-muted-foreground shrink-0">
                  to
                </span>
                <Input
                  data-ocid="create-campaign-dial-to"
                  type="time"
                  value={form.dialTo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, dialTo: e.target.value }))
                  }
                  className="h-8 text-sm bg-background border-input flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Assigned Agents
              </Label>
              <div className="space-y-1.5">
                {agents.map((agent) => {
                  const selected = form.assignedAgents.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      data-ocid={`create-agent-${agent.id}`}
                      onClick={() => toggleAgent(agent.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md border text-left transition-colors ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted/20"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${agent.status === "active" ? "bg-emerald-400" : agent.status === "idle" ? "bg-amber-400" : "bg-muted-foreground"}`}
                        />
                        <span className="text-xs font-medium">
                          {agent.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-muted-foreground">
                          {agent.successRate}% SR
                        </span>
                        {selected && (
                          <CheckCircle2 size={12} className="text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="create-campaign-cancel"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            data-ocid="create-campaign-submit"
            onClick={handleSubmit}
          >
            Create Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

type FilterStatus = "all" | ExtendedStatus;

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "completed", label: "Completed" },
  { key: "draft", label: "Draft" },
  { key: "scheduled", label: "Scheduled" },
];

// ─── Standard Campaigns Section ───────────────────────────────────────────────

function StandardCampaignsSection({
  onCreateCampaign,
}: { onCreateCampaign: () => void }) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>(campaigns);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? localCampaigns
        : localCampaigns.filter((c) => c.status === filter),
    [filter, localCampaigns],
  );

  const stats = useMemo(() => {
    const total = localCampaigns.length;
    const active = localCampaigns.filter((c) => c.status === "active").length;
    const completed = localCampaigns.filter(
      (c) => c.status === "completed",
    ).length;
    const totalCalls = localCampaigns.reduce((s, c) => s + c.completedCalls, 0);
    return { total, active, completed, totalCalls };
  }, [localCampaigns]);

  function togglePause(c: Campaign) {
    setLocalCampaigns((prev) =>
      prev.map((x) =>
        x.id === c.id
          ? { ...x, status: x.status === "active" ? "paused" : "active" }
          : x,
      ),
    );
    toast.success(
      `Campaign "${c.name}" ${c.status === "active" ? "paused" : "resumed"}`,
    );
  }

  function duplicate(c: Campaign) {
    const copy: Campaign = {
      ...c,
      id: `c${Date.now()}`,
      name: `${c.name} (Copy)`,
      status: "draft",
      completedCalls: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      totalMinutes: 0,
    };
    setLocalCampaigns((prev) => [copy, ...prev]);
    toast.success(`Duplicated "${c.name}"`);
  }

  function deleteCampaign(c: Campaign) {
    setLocalCampaigns((prev) => prev.filter((x) => x.id !== c.id));
    if (selectedId === c.id) setSelectedId(null);
    toast.success(`Campaign "${c.name}" deleted`);
  }

  function toggleDetail(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }
  const filterCount = (key: FilterStatus) =>
    key === "all"
      ? localCampaigns.length
      : localCampaigns.filter((c) => c.status === key).length;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Summary stats */}
      <div className="bg-card border-b border-border px-6 py-3 shrink-0">
        <div className="flex gap-3 flex-wrap">
          <StatPill label="Total Campaigns" value={stats.total} />
          <StatPill label="Active" value={stats.active} sub="Running now" />
          <StatPill label="Completed" value={stats.completed} sub="All time" />
          <StatPill
            label="Total Calls"
            value={stats.totalCalls.toLocaleString()}
            sub="Initiated"
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-card border-b border-border px-6 shrink-0">
        <div className="flex gap-0">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-ocid={`filter-${tab.key}`}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${filter === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
              <span
                className={`text-[10px] ${filter === tab.key ? "text-primary/70" : "text-muted-foreground/50"}`}
              >
                {filterCount(tab.key)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-background">
        <table className="w-full text-xs data-table min-w-[900px]">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            <tr>
              {[
                { label: "Campaign Name", cls: "pl-6 text-left w-[240px]" },
                { label: "Status", cls: "text-left w-[90px]" },
                { label: "Progress", cls: "text-left w-[150px]" },
                { label: "Target / Calls", cls: "text-right w-[120px]" },
                { label: "Success Rate", cls: "text-right w-[100px]" },
                { label: "Avg Duration", cls: "text-right w-[100px]" },
                { label: "Period", cls: "text-left w-[160px]" },
                { label: "Actions", cls: "pr-4 text-right w-[140px]" },
              ].map(({ label, cls }) => (
                <th
                  key={label}
                  className={`py-2.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground ${cls}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((campaign) => {
              const isOpen = selectedId === campaign.id;
              return (
                <>
                  <tr
                    key={campaign.id}
                    data-ocid={`campaign-row-${campaign.id}`}
                    className={`border-b border-border cursor-pointer transition-colors ${isOpen ? "bg-card/80" : "hover:bg-card/40"}`}
                    onClick={() => toggleDetail(campaign.id)}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      toggleDetail(campaign.id)
                    }
                  >
                    <td className="pl-6 px-2 py-2.5">
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronUp
                            size={13}
                            className="text-muted-foreground shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={13}
                            className="text-muted-foreground shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-[200px]">
                            {campaign.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                            {campaign.agent}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2.5">
                      <StatusBadge status={campaign.status as ExtendedStatus} />
                    </td>
                    <td className="px-2 py-2.5">
                      <ProgressBar
                        value={campaign.completedCalls}
                        max={campaign.targetCount}
                      />
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span className="font-mono text-foreground">
                        {campaign.completedCalls.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground mx-0.5">/</span>
                      <span className="font-mono text-muted-foreground">
                        {campaign.targetCount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <span
                        className={`font-bold tabular-nums ${campaign.successRate >= 80 ? "text-emerald-400" : campaign.successRate >= 60 ? "text-primary" : campaign.successRate > 0 ? "text-amber-400" : "text-muted-foreground"}`}
                      >
                        {campaign.successRate > 0
                          ? `${campaign.successRate.toFixed(1)}%`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right font-mono text-muted-foreground">
                      {campaign.avgDuration}
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={10} />
                        <span className="font-mono text-[10px]">
                          {campaign.startDate.slice(5)} →{" "}
                          {campaign.endDate.slice(5)}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-2 pr-4 py-2.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          type="button"
                          data-ocid={`view-${campaign.id}`}
                          title="View details"
                          onClick={() => toggleDetail(campaign.id)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          data-ocid={`edit-${campaign.id}`}
                          title="Edit"
                          onClick={() =>
                            toast.info(`Editing "${campaign.name}"`)
                          }
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        {(campaign.status === "active" ||
                          campaign.status === "paused") && (
                          <button
                            type="button"
                            data-ocid={`toggle-pause-${campaign.id}`}
                            title={
                              campaign.status === "active" ? "Pause" : "Resume"
                            }
                            onClick={() => togglePause(campaign)}
                            className={`p-1.5 rounded transition-colors ${campaign.status === "active" ? "hover:bg-amber-500/10 text-amber-400 hover:text-amber-300" : "hover:bg-emerald-500/10 text-emerald-400 hover:text-emerald-300"}`}
                          >
                            {campaign.status === "active" ? (
                              <Pause size={13} />
                            ) : (
                              <Play size={13} />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          data-ocid={`duplicate-${campaign.id}`}
                          title="Duplicate"
                          onClick={() => duplicate(campaign)}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          data-ocid={`delete-${campaign.id}`}
                          title="Delete"
                          onClick={() => deleteCampaign(campaign)}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${campaign.id}-detail`}>
                      <td colSpan={8} className="p-0">
                        <CampaignDetail campaign={campaign} />
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="py-16 text-center"
                  data-ocid="campaigns-empty"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Target size={32} className="text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No campaigns found
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {filter !== "all"
                        ? `No campaigns with status "${filter}"`
                        : "Create your first campaign to get started"}
                    </p>
                    {filter === "all" && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        data-ocid="empty-create-campaign"
                        onClick={onCreateCampaign}
                      >
                        <Plus size={13} className="mr-1" /> Create Campaign
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border px-6 py-2 shrink-0 flex items-center gap-6 text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <span className="text-foreground font-semibold">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="text-foreground font-semibold">
            {localCampaigns.length}
          </span>{" "}
          campaigns
        </span>
        <Separator orientation="vertical" className="h-3" />
        <span className="flex items-center gap-1">
          <TrendingUp size={11} />
          Avg success rate:{" "}
          <span className="text-emerald-400 font-semibold ml-1">
            {filtered.length > 0
              ? (
                  filtered.reduce((s, c) => s + c.successRate, 0) /
                  filtered.length
                ).toFixed(1)
              : "—"}
            %
          </span>
        </span>
        <Separator orientation="vertical" className="h-3" />
        <span className="flex items-center gap-1">
          <Phone size={11} />
          Calls shown:{" "}
          <span className="text-foreground font-semibold ml-1">
            {filtered
              .reduce((s, c) => s + c.completedCalls, 0)
              .toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI OUTBOUND CAMPAIGNS SECTION
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Transcript overlay ───────────────────────────────────────────────────────

function TranscriptOverlay({
  log,
  onClose,
}: { log: AICallLog; onClose: () => void }) {
  return (
    <dialog
      className="fixed inset-0 z-50 w-full h-full flex items-center justify-center bg-background/80 backdrop-blur-sm p-0 m-0 border-none max-w-none max-h-none"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      aria-modal="true"
      aria-label="Call transcript"
      open
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-[480px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div>
            <div className="text-sm font-semibold text-foreground font-display">
              {log.callerName}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {log.callerPhone} · {Math.floor(log.duration / 60)}m{" "}
              {log.duration % 60}s
            </div>
          </div>
          <button
            type="button"
            aria-label="Close transcript"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {log.transcript.map((line) => (
              <div
                key={`${log.id}-${line.timestamp}-${line.speaker}`}
                className={`flex gap-2.5 ${line.speaker === "AI" ? "" : "flex-row-reverse"}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[9px] font-bold ${line.speaker === "AI" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {line.speaker === "AI" ? <Bot size={11} /> : "P"}
                </div>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${line.speaker === "AI" ? "bg-primary/10 text-foreground border border-primary/20" : "bg-muted text-foreground"}`}
                >
                  <p>{line.text}</p>
                  <span className="text-[9px] text-muted-foreground mt-1 block">
                    {Math.floor(line.timestamp / 60)}:
                    {String(line.timestamp % 60).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </dialog>
  );
}

// ─── Action badge ─────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: AICallLog["actionTaken"] }) {
  const map: Record<AICallLog["actionTaken"], { label: string; cls: string }> =
    {
      resolved: {
        label: "Resolved",
        cls: "bg-emerald-500/15 text-emerald-400",
      },
      "scheduled-callback": {
        label: "Callback",
        cls: "bg-cyan-500/15 text-cyan-400",
      },
      "transferred-to-agent": {
        label: "Transferred",
        cls: "bg-primary/15 text-primary",
      },
      "gathered-info": {
        label: "Info Gathered",
        cls: "bg-amber-500/15 text-amber-400",
      },
      voicemail: { label: "Voicemail", cls: "bg-muted text-muted-foreground" },
    };
  const m = map[action];
  return (
    <span
      className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${m.cls}`}
    >
      {m.label}
    </span>
  );
}

// ─── AI Campaign Detail Panel ─────────────────────────────────────────────────

function AICampaignDetailPanel({
  campaign,
  onClose,
}: { campaign: AICampaign; onClose: () => void }) {
  const [transcriptLog, setTranscriptLog] = useState<AICallLog | null>(null);
  const outbound = sampleAIAgents.find((a) => a.type === "outbound");

  return (
    <>
      <div
        className="flex flex-col h-full bg-card border-l border-border"
        style={{ width: 460 }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Close panel"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ChevronLeft size={15} />
            </button>
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm text-foreground truncate">
                {campaign.name}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <AIStatusBadge status={campaign.status} />
                {campaign.startTime && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {campaign.startTime.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-5 space-y-5">
            {/* Progress summary */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Dialing Progress
              </div>
              <ProgressBar value={campaign.dialed} max={campaign.totalLeads} />
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Dialed",
                    value: campaign.dialed,
                    color: "text-foreground",
                  },
                  {
                    label: "Connected",
                    value: campaign.connected,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Voicemails",
                    value: campaign.voicemails,
                    color: "text-amber-400",
                  },
                  {
                    label: "Failed",
                    value: campaign.failed,
                    color: "text-destructive",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-muted/40 rounded-md px-2 py-2 text-center"
                  >
                    <div
                      className={`text-base font-bold tabular-nums ${color}`}
                    >
                      {value}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Campaign Performance
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Total Reaches",
                    value: campaign.connected.toLocaleString(),
                    icon: Phone,
                    color: "text-primary",
                  },
                  {
                    label: "Conversion Rate",
                    value: `${campaign.conversionRate}%`,
                    icon: TrendingUp,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Follow-ups Scheduled",
                    value: campaign.followUpsScheduled,
                    icon: Calendar,
                    color: "text-cyan-400",
                  },
                  {
                    label: "Avg Duration",
                    value:
                      campaign.avgDuration > 0
                        ? `${Math.floor(campaign.avgDuration / 60)}m ${campaign.avgDuration % 60}s`
                        : "—",
                    icon: Clock,
                    color: "text-amber-400",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="bg-muted/40 rounded-md px-3 py-2 flex items-center gap-2"
                  >
                    <Icon size={13} className={`shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground truncate">
                        {label}
                      </div>
                      <div className="text-sm font-bold text-foreground tabular-nums">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Agent info */}
            {outbound && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={14} className="text-primary" />
                  <div>
                    <div className="text-xs font-semibold text-foreground">
                      {outbound.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {outbound.phoneNumber}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {outbound.status}
                </span>
              </div>
            )}

            {/* Script preview */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Script Template
              </div>
              <div className="bg-muted/30 border border-border rounded-md px-3 py-2.5 text-xs text-muted-foreground italic leading-relaxed line-clamp-4">
                {campaign.scriptTemplate}
              </div>
            </div>

            {/* Call logs table */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                AI Call Logs ({campaign.callLogs.length})
              </div>
              {campaign.callLogs.length === 0 ? (
                <div
                  className="text-center py-8 text-muted-foreground text-xs"
                  data-ocid="ai-call-logs-empty"
                >
                  No calls yet — campaign not started
                </div>
              ) : (
                <div className="border border-border rounded-md overflow-hidden">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="py-2 px-2.5 text-left text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Prospect
                        </th>
                        <th className="py-2 px-2 text-left text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="py-2 px-2 text-left text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Outcome
                        </th>
                        <th className="py-2 px-2 text-left text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Sentiment
                        </th>
                        <th className="py-2 px-2 text-right text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                          Transcript
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaign.callLogs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                          data-ocid={`ai-log-row-${log.id}`}
                        >
                          <td className="py-2 px-2.5">
                            <div className="font-medium text-foreground truncate max-w-[100px]">
                              {log.callerName}
                            </div>
                            <div className="text-[9px] text-muted-foreground font-mono">
                              {log.callerPhone}
                            </div>
                          </td>
                          <td className="py-2 px-2 font-mono text-muted-foreground">
                            {Math.floor(log.duration / 60)}:
                            {String(log.duration % 60).padStart(2, "0")}
                          </td>
                          <td className="py-2 px-2">
                            <ActionBadge action={log.actionTaken} />
                          </td>
                          <td className="py-2 px-2">
                            <span
                              className={`text-[9px] font-semibold ${log.sentiment === "positive" ? "text-emerald-400" : log.sentiment === "negative" ? "text-destructive" : "text-muted-foreground"}`}
                            >
                              {log.sentiment}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <button
                              type="button"
                              data-ocid={`view-transcript-${log.id}`}
                              onClick={() => setTranscriptLog(log)}
                              className="text-[9px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 ml-auto"
                            >
                              <FileText size={10} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>

      {transcriptLog && (
        <TranscriptOverlay
          log={transcriptLog}
          onClose={() => setTranscriptLog(null)}
        />
      )}
    </>
  );
}

// ─── AI Campaign Card ─────────────────────────────────────────────────────────

function AICampaignCard({
  campaign,
  onReview,
  onTogglePause,
}: {
  campaign: AICampaign;
  onReview: (c: AICampaign) => void;
  onTogglePause: (c: AICampaign) => void;
}) {
  const pct =
    campaign.totalLeads > 0
      ? Math.min(100, (campaign.dialed / campaign.totalLeads) * 100)
      : 0;

  return (
    <div
      className="bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/40 transition-colors"
      data-ocid={`ai-campaign-card-${campaign.id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-sm text-foreground truncate">
              {campaign.name}
            </span>
            {campaign.status === "running" && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {campaign.scriptTemplate.slice(0, 60)}…
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {campaign.persistedAt && (
            <span
              title={`Saved ${campaign.persistedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`}
              className="flex items-center gap-1 text-[10px] text-emerald-400/80 font-medium"
              data-ocid={`ai-campaign-saved-${campaign.id}`}
            >
              <Save size={10} />
              <span className="hidden sm:inline">Saved</span>
            </span>
          )}
          <AIStatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Dialing progress</span>
          <span className="font-mono text-foreground">
            {campaign.dialed} / {campaign.totalLeads}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-smooth ${campaign.status === "running" ? "bg-emerald-500" : campaign.status === "completed" ? "bg-blue-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Dialed", value: campaign.dialed, color: "text-foreground" },
          {
            label: "Connected",
            value: campaign.connected,
            color: "text-emerald-400",
          },
          {
            label: "Voicemail",
            value: campaign.voicemails,
            color: "text-amber-400",
          },
          {
            label: "Failed",
            value: campaign.failed,
            color: "text-destructive",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-muted/30 rounded-md px-1.5 py-1.5 text-center"
          >
            <div className={`text-sm font-bold tabular-nums ${color}`}>
              {value}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mt-0.5">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Conversion + follow-ups */}
      <div className="flex items-center gap-3">
        {campaign.conversionRate > 0 && (
          <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <TrendingUp size={11} /> {campaign.conversionRate}% converted
          </span>
        )}
        {campaign.followUpsScheduled > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar size={10} /> {campaign.followUpsScheduled} follow-ups
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        {(campaign.status === "running" || campaign.status === "paused") && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            data-ocid={`ai-toggle-${campaign.id}`}
            onClick={() => onTogglePause(campaign)}
          >
            {campaign.status === "running" ? (
              <>
                <Pause size={11} /> Pause
              </>
            ) : (
              <>
                <Play size={11} /> Resume
              </>
            )}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          data-ocid={`ai-review-${campaign.id}`}
          onClick={() => onReview(campaign)}
        >
          <Eye size={11} /> Review
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1.5"
          data-ocid={`ai-logs-${campaign.id}`}
          onClick={() => onReview(campaign)}
        >
          <FileText size={11} /> View Logs
        </Button>
      </div>
    </div>
  );
}

// ─── Script templates ─────────────────────────────────────────────────────────

const SCRIPT_TEMPLATES: { name: string; content: string }[] = [
  {
    name: "Agency Outreach Pitch",
    content:
      "Hello [Name], this is ARIA calling from Signpost. I'm reaching out about your upcoming Q3 campaign planning. Our voice AI platform has helped agencies like GroupM and Dentsu reduce their outreach time by 60% while improving lead conversion rates. Would you have 10 minutes to discuss how we could optimize your client outreach campaigns?",
  },
  {
    name: "Campaign Performance Follow-up",
    content:
      "Hello [Name], following up on your recent campaign performance. Your current CTR is tracking at 2.4% which is 28% above benchmark. I wanted to share a few AI-driven optimizations that could push your ROAS to 3x by end of quarter. Would this be a good time to discuss the details?",
  },
  {
    name: "Media Plan Consultation",
    content:
      "Hi [Name], we noticed your brand is gearing up for the festive season campaign. Signpost has helped [similar_brand] achieve 2.8x ROAS with our programmatic buying and influencer mix strategy. We'd love to put together a custom media plan for your campaign. Can we schedule a quick 15-minute walkthrough this week?",
  },
  {
    name: "Brand Re-engagement",
    content:
      "Hi [Name], we noticed it's been a while since we connected. Signpost has launched several new capabilities including OTT advertising, regional language campaigns with local creators, and real-time campaign AI optimization. We'd love to show you what's new. Can we schedule a quick 10-minute catch-up call?",
  },
  {
    name: "Cold Outreach — Advertisers",
    content:
      "Hi [Name], I'm reaching out because [company] matches the profile of brands that see strong results with AI-powered advertising. We help teams in [industry] increase their campaign ROAS by 40-60% through programmatic optimization and AI audience targeting. Would you be open to a brief 10-minute call to explore if this could benefit your campaigns?",
  },
];

// ─── AI Campaign Launcher Modal ───────────────────────────────────────────────

interface LauncherModalProps {
  open: boolean;
  onClose: () => void;
  onLaunch: (name: string, leadCount: number) => void;
}

function AICampaignLauncherModal({
  open,
  onClose,
  onLaunch,
}: LauncherModalProps) {
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [selectedScript, setSelectedScript] = useState(
    SCRIPT_TEMPLATES[0].name,
  );
  const [scriptContent, setScriptContent] = useState(
    SCRIPT_TEMPLATES[0].content,
  );
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [launching, setLaunching] = useState(false);
  const [launched, setLaunched] = useState(false);

  const availableLeads = leads.slice(0, 10);

  function handleScriptSelect(name: string) {
    setSelectedScript(name);
    const tpl = SCRIPT_TEMPLATES.find((t) => t.name === name);
    if (tpl) setScriptContent(tpl.content);
  }

  function toggleLead(id: string) {
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selectedLeads.size === availableLeads.length)
      setSelectedLeads(new Set());
    else setSelectedLeads(new Set(availableLeads.map((l) => l.id)));
  }

  function handleLaunch() {
    if (launching || launched) return;
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      setLaunched(true);
      setTimeout(() => {
        onLaunch(campaignName, selectedLeads.size);
        onClose();
        setStep(1);
        setCampaignName("");
        setSelectedScript(SCRIPT_TEMPLATES[0].name);
        setScriptContent(SCRIPT_TEMPLATES[0].content);
        setSelectedLeads(new Set());
        setLaunching(false);
        setLaunched(false);
      }, 1200);
    }, 1800);
  }

  const estimatedMins = selectedLeads.size * 3;
  const canProceedStep1 = campaignName.trim().length > 0;
  const canProceedStep2 = selectedLeads.size > 0;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-base flex items-center gap-2">
            <Rocket size={16} className="text-primary" />
            Launch AI Outbound Campaign
          </DialogTitle>
        </DialogHeader>

        {/* Steps indicator */}
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${step === s ? "bg-primary text-primary-foreground" : step > s ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}
              >
                {step > s ? <CheckCircle2 size={12} /> : s}
              </div>
              <span
                className={`text-[11px] font-medium ${step === s ? "text-foreground" : "text-muted-foreground"}`}
              >
                {s === 1
                  ? "Setup"
                  : s === 2
                    ? "Select Leads"
                    : "Review & Launch"}
              </span>
              {s < 3 && (
                <div
                  className={`flex-1 h-px w-8 mx-1 ${step > s ? "bg-emerald-500" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Step 1 — Campaign Setup */}
        {step === 1 && (
          <div className="space-y-4 py-1">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Campaign Name *
              </Label>
              <Input
                data-ocid="ai-campaign-name"
                placeholder="e.g. April SaaS Upgrade Drive"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="h-9 text-sm bg-background border-input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Script Template
              </Label>
              <select
                data-ocid="ai-script-select"
                value={selectedScript}
                onChange={(e) => handleScriptSelect(e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {SCRIPT_TEMPLATES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Script Preview (editable)
              </Label>
              <Textarea
                data-ocid="ai-script-preview"
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                rows={5}
                className="text-xs bg-background border-input resize-none leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Step 2 — Select Leads */}
        {step === 2 && (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {selectedLeads.size} lead{selectedLeads.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                data-ocid="ai-select-all-leads"
              >
                {selectedLeads.size === availableLeads.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
            <div className="border border-border rounded-md overflow-hidden">
              <ScrollArea className="max-h-[300px]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border">
                      <th className="py-2 pl-3 pr-2 w-8" />
                      <th className="py-2 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Name
                      </th>
                      <th className="py-2 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Company
                      </th>
                      <th className="py-2 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Phone
                      </th>
                      <th className="py-2 px-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className={`border-b border-border last:border-0 cursor-pointer transition-colors ${selectedLeads.has(lead.id) ? "bg-primary/5" : "hover:bg-muted/20"}`}
                        onClick={() => toggleLead(lead.id)}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          toggleLead(lead.id)
                        }
                        data-ocid={`ai-lead-row-${lead.id}`}
                      >
                        <td className="py-2 pl-3 pr-2">
                          <Checkbox
                            checked={selectedLeads.has(lead.id)}
                            onCheckedChange={() => toggleLead(lead.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </td>
                        <td className="py-2 px-2 font-medium text-foreground">
                          {lead.name}
                        </td>
                        <td className="py-2 px-2 text-muted-foreground truncate max-w-[120px]">
                          {lead.company}
                        </td>
                        <td className="py-2 px-2 font-mono text-muted-foreground">
                          {lead.phone}
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${lead.status === "hot" ? "bg-destructive/15 text-destructive" : lead.status === "warm" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"}`}
                          >
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>
        )}

        {/* Step 3 — Review & Launch */}
        {step === 3 && (
          <div className="space-y-4 py-1">
            <div className="bg-muted/30 border border-border rounded-xl p-4 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Campaign Summary
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Campaign Name", value: campaignName, icon: Mic },
                  {
                    label: "Script Template",
                    value: selectedScript,
                    icon: FileText,
                  },
                  {
                    label: "Leads Selected",
                    value: `${selectedLeads.size} leads`,
                    icon: Users,
                  },
                  {
                    label: "Est. Duration",
                    value: `~${estimatedMins} min`,
                    icon: Clock,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-muted-foreground">
                        {label}
                      </div>
                      <div className="text-xs font-semibold text-foreground truncate">
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <Zap size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-emerald-400">
                  Ready to Launch
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  VoiceAI Outbound agent will begin calling {selectedLeads.size}{" "}
                  leads immediately using the "{selectedScript}" script.
                </div>
              </div>
            </div>
            <Button
              type="button"
              className="w-full gap-2 h-10"
              data-ocid="ai-launch-campaign"
              onClick={handleLaunch}
              disabled={launching || launched}
            >
              {launched ? (
                <>
                  <CheckCircle2 size={15} /> Campaign Launched!
                </>
              ) : launching ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Launching…
                </>
              ) : (
                <>
                  <Rocket size={15} /> Launch AI Campaign
                </>
              )}
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          {step > 1 && step < 3 && !launched && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          )}
          {step === 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                data-ocid="ai-launcher-cancel"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                data-ocid="ai-launcher-next-1"
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
              >
                Next: Select Leads
              </Button>
            </>
          )}
          {step === 2 && (
            <Button
              type="button"
              size="sm"
              data-ocid="ai-launcher-next-2"
              disabled={!canProceedStep2}
              onClick={() => setStep(3)}
            >
              Review Campaign
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── AI Outbound Section ──────────────────────────────────────────────────────

function AIOutboundSection() {
  // Load from campaignStore (localStorage-backed, merges persisted over sample data)
  const localCampaigns = useSyncExternalStore(
    campaignStore.subscribe,
    campaignStore.getCampaigns,
  );
  const [detailCampaign, setDetailCampaign] = useState<AICampaign | null>(null);
  const [launcherOpen, setLauncherOpen] = useState(false);

  const outboundAgent = sampleAIAgents.find((a) => a.type === "outbound");

  function togglePause(c: AICampaign) {
    const next: AICampaign = {
      ...c,
      status: c.status === "running" ? "paused" : "running",
    };
    campaignStore.saveCampaign(next);
    // Keep detail panel in sync
    if (detailCampaign?.id === c.id) setDetailCampaign(next);
    toast.success(
      `AI Campaign "${c.name}" ${c.status === "running" ? "paused" : "resumed"}`,
    );
  }

  function handleLaunch(name: string, leadCount: number) {
    const newCampaign: AICampaign = {
      id: `ai-camp-${Date.now()}`,
      name,
      status: "running",
      scriptTemplate: "Launched via AI Campaign Launcher",
      totalLeads: leadCount,
      dialed: 0,
      connected: 0,
      voicemails: 0,
      failed: 0,
      avgDuration: 0,
      startTime: new Date(),
      conversionRate: 0,
      followUpsScheduled: 0,
      callLogs: [],
    };
    campaignStore.saveCampaign(newCampaign);
    toast.success(`AI Campaign launched — ${leadCount} leads queued`);
  }

  const stats = useMemo(
    () => ({
      running: localCampaigns.filter((c) => c.status === "running").length,
      total: localCampaigns.length,
      dialed: localCampaigns.reduce((s, c) => s + c.dialed, 0),
      converted: localCampaigns.reduce(
        (s, c) => s + Math.round((c.dialed * c.conversionRate) / 100),
        0,
      ),
    }),
    [localCampaigns],
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Section stats */}
      <div className="bg-card border-b border-border px-6 py-3 shrink-0">
        <div className="flex gap-3 flex-wrap">
          <StatPill label="Total AI Campaigns" value={stats.total} />
          <StatPill label="Running" value={stats.running} sub="Live now" />
          <StatPill
            label="Total Dialed"
            value={stats.dialed.toLocaleString()}
            sub="All campaigns"
          />
          <StatPill
            label="Converted"
            value={stats.converted.toLocaleString()}
            sub="Across campaigns"
          />
          {outboundAgent && (
            <div className="bg-card border border-primary/30 rounded-md px-3 py-2 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full shrink-0 bg-emerald-400 ${outboundAgent.status === "on-call" ? "animate-pulse" : ""}`}
              />
              <div>
                <div className="text-[10px] text-muted-foreground">
                  VoiceAI Outbound
                </div>
                <div className="text-xs font-semibold text-primary capitalize">
                  {outboundAgent.status}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content area with optional detail panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Campaign cards grid */}
        <div
          className={`flex-1 overflow-auto bg-background p-5 transition-all ${detailCampaign ? "pr-4" : ""}`}
        >
          <div
            className={`grid gap-4 ${detailCampaign ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}
          >
            {localCampaigns.map((c) => (
              <AICampaignCard
                key={c.id}
                campaign={c}
                onReview={setDetailCampaign}
                onTogglePause={togglePause}
              />
            ))}
          </div>
          {localCampaigns.length === 0 && (
            <div
              className="flex flex-col items-center justify-center h-64 gap-3"
              data-ocid="ai-campaigns-empty"
            >
              <Bot size={40} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground font-medium">
                No AI campaigns yet
              </p>
              <Button
                type="button"
                size="sm"
                onClick={() => setLauncherOpen(true)}
                className="gap-1.5"
                data-ocid="ai-empty-launch"
              >
                <Rocket size={13} /> Launch First AI Campaign
              </Button>
            </div>
          )}
        </div>

        {/* Detail slide-in panel */}
        {detailCampaign && (
          <div
            className="shrink-0 border-l border-border h-full overflow-auto"
            style={{ width: 460 }}
          >
            <AICampaignDetailPanel
              campaign={detailCampaign}
              onClose={() => setDetailCampaign(null)}
            />
          </div>
        )}
      </div>

      <AICampaignLauncherModal
        open={launcherOpen}
        onClose={() => setLauncherOpen(false)}
        onLaunch={handleLaunch}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function CampaignsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("standard");
  const [modalOpen, setModalOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="bg-card border-b border-border px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-bold text-foreground tracking-tight">
              Campaign Management
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage GenAI voice campaigns, track performance, and monitor call
              activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mainTab === "standard" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-ocid="open-create-campaign"
                onClick={() => setModalOpen(true)}
                className="gap-1.5"
              >
                <Plus size={14} /> Create Campaign
              </Button>
            )}
            {mainTab === "ai" && (
              <Button
                type="button"
                size="sm"
                data-ocid="open-ai-launcher"
                onClick={() => setLauncherOpen(true)}
                className="gap-1.5"
              >
                <Rocket size={14} /> Launch New AI Campaign
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main tab switcher */}
      <div className="bg-card border-b border-border px-6 shrink-0">
        <div className="flex gap-0">
          <button
            type="button"
            data-ocid="main-tab-standard"
            onClick={() => setMainTab("standard")}
            className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${mainTab === "standard" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Target size={13} /> Standard Campaigns
          </button>
          <button
            type="button"
            data-ocid="main-tab-ai"
            onClick={() => setMainTab("ai")}
            className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${mainTab === "ai" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Bot size={13} /> AI Campaigns
            <Badge
              variant="secondary"
              className="text-[9px] px-1.5 py-0 h-4 ml-0.5 bg-primary/15 text-primary border-primary/30"
            >
              AI
            </Badge>
          </button>
        </div>
      </div>

      {/* Tab content */}
      {mainTab === "standard" ? (
        <StandardCampaignsSection onCreateCampaign={() => setModalOpen(true)} />
      ) : (
        <AIOutboundSection key="ai-section" />
      )}

      {/* Standard create modal */}
      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* AI launcher triggered from header (AI tab) */}
      {mainTab === "ai" && (
        <AICampaignLauncherModal
          open={launcherOpen}
          onClose={() => setLauncherOpen(false)}
          onLaunch={(name, count) => {
            const newCampaign: AICampaign = {
              id: `ai-camp-${Date.now()}`,
              name,
              status: "running",
              scriptTemplate: "Launched via AI Campaign Launcher",
              totalLeads: count,
              dialed: 0,
              connected: 0,
              voicemails: 0,
              failed: 0,
              avgDuration: 0,
              startTime: new Date(),
              conversionRate: 0,
              followUpsScheduled: 0,
              callLogs: [],
            };
            campaignStore.saveCampaign(newCampaign);
            toast.success(`AI Campaign launched — ${count} leads queued`);
            setLauncherOpen(false);
          }}
        />
      )}
    </div>
  );
}
