import ImportContactsModal from "@/components/ImportContactsModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEnterpriseHeadByRegion } from "@/data/enterpriseHeads";
import { agents, callRecords } from "@/data/sampleData";
import { triggerLeadRouting } from "@/services/leadRoutingService";
import { humanDialerStore } from "@/store/humanDialerStore";
import { leadsStore } from "@/store/leadsStore";
import type { Lead, LeadRegion, LeadStatus } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Building2,
  Calendar,
  CalendarClock,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Flame,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Square,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; className: string; dot: string }
> = {
  hot: {
    label: "Hot",
    className: "bg-red-500/15 text-red-400 border border-red-500/30",
    dot: "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.8)]",
  },
  warm: {
    label: "Warm",
    className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    dot: "bg-amber-500",
  },
  cold: {
    label: "Cold",
    className: "bg-primary/10 text-primary border border-primary/20",
    dot: "bg-primary/60",
  },
  converted: {
    label: "Converted",
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  lost: {
    label: "Lost",
    className: "bg-muted text-muted-foreground border border-border",
    dot: "bg-muted-foreground",
  },
};

function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status === "hot" && <Flame className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

const REGION_CONFIG: Record<LeadRegion, { className: string; dot: string }> = {
  North: {
    className: "bg-blue-500/15 text-blue-400 border border-blue-500/30",
    dot: "bg-blue-500",
  },
  East: {
    className: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  West: {
    className: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    dot: "bg-orange-500",
  },
  South: {
    className:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    dot: "bg-emerald-500",
  },
  ROM: {
    className: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    dot: "bg-purple-500",
  },
  Trading: {
    className: "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30",
    dot: "bg-cyan-500",
  },
  Agency: {
    className: "bg-pink-500/15 text-pink-400 border border-pink-500/30",
    dot: "bg-pink-500",
  },
};

function RegionBadge({ region }: { region: LeadRegion }) {
  const cfg = REGION_CONFIG[region];
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold ${cfg.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {region}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-md p-3 flex items-center gap-3">
      <div className={`p-2 rounded ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xl font-bold text-foreground font-display leading-none">
          {value}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onResendRouting: (lead: Lead) => void;
}

function LeadDetailPanel({
  lead,
  onClose,
  onStatusChange,
  onResendRouting,
}: LeadDetailPanelProps) {
  const [followUpDate, setFollowUpDate] = useState(lead.followUpDate);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const leadCalls = useMemo(
    () => callRecords.filter((c) => c.leadId === lead.id),
    [lead.id],
  );

  const enterpriseHead = lead.region
    ? getEnterpriseHeadByRegion(lead.region)
    : null;

  const routingStatusConfig: Record<
    string,
    { label: string; className: string }
  > = {
    sent: {
      label: "Sent",
      className:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    },
    pending: {
      label: "Pending",
      className: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    },
    failed: {
      label: "Failed",
      className:
        "bg-destructive/15 text-destructive border border-destructive/30",
    },
    unsent: {
      label: "Not Sent",
      className: "bg-muted text-muted-foreground border border-border",
    },
  };
  const routingStatus = lead.routingStatus ?? "unsent";
  const routingCfg = routingStatusConfig[routingStatus];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      data-ocid="lead-detail-overlay"
    >
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close detail panel"
      />
      <div className="relative z-10 w-full max-w-md bg-card border-l border-border h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">
                {lead.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground truncate">
                {lead.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {lead.company}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Contact Info */}
          <div className="px-4 py-3 border-b border-border space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Contact Info
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="font-mono">{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{lead.company}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <span>{lead.location}</span>
            </div>
          </div>

          {/* Lead Routing */}
          {lead.region && enterpriseHead && (
            <div
              className="px-4 py-3 border-b border-border"
              data-ocid="lead-routing-section"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Lead Routing
                </div>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${routingCfg.className}`}
                  data-ocid="routing-status-badge"
                >
                  {routingCfg.label}
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Region</span>
                  <RegionBadge region={lead.region} />
                </div>
                <div className="bg-muted/30 border border-border rounded p-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {enterpriseHead.headName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {enterpriseHead.title}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground mt-1">
                    <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{enterpriseHead.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-foreground">
                    <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-mono">
                      {enterpriseHead.whatsappNumber}
                    </span>
                  </div>
                </div>
                {lead.routedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Routed{" "}
                      {new Date(lead.routedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs w-full gap-1.5 mt-1"
                  data-ocid="resend-routing-btn"
                  onClick={() => onResendRouting(lead)}
                >
                  <RefreshCw className="w-3 h-3" />
                  Resend Notification
                </Button>
              </div>
            </div>
          )}

          {/* Status & Intent */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Lead Info
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <Select
                  value={lead.status}
                  onValueChange={(v) =>
                    onStatusChange(lead.id, v as LeadStatus)
                  }
                >
                  <SelectTrigger
                    className="h-7 text-xs"
                    data-ocid="lead-status-select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {STATUS_CONFIG[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Score</div>
                <div className="flex items-center gap-1.5 h-7">
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${lead.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground flex-shrink-0">
                    {lead.score}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Intent</div>
                <div className="text-xs text-foreground font-medium">
                  {lead.intent}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Source</div>
                <div className="text-xs text-foreground truncate">
                  {lead.campaignSource}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Assigned Agent
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs text-foreground">
                  {lead.assignedAgent}
                </span>
              </div>
              <Select defaultValue={lead.assignedAgent}>
                <SelectTrigger
                  className="h-6 w-24 text-xs"
                  data-ocid="agent-reassign-select"
                >
                  <SelectValue placeholder="Change" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.name} className="text-xs">
                      {a.name.replace("GenAI Agent ", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Follow-up */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Follow-up
              </div>
              <button
                type="button"
                onClick={() => setShowFollowUp(!showFollowUp)}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                data-ocid="schedule-followup-btn"
              >
                <CalendarClock className="w-3 h-3" />
                Schedule
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${showFollowUp ? "rotate-180" : ""}`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{lead.followUpDate}</span>
            </div>
            {showFollowUp && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="flex-1 bg-background border border-input rounded px-2 py-1 text-xs text-foreground"
                  data-ocid="followup-date-input"
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-6 text-xs px-2"
                  onClick={() => setShowFollowUp(false)}
                  data-ocid="followup-save-btn"
                >
                  Save
                </Button>
              </div>
            )}
          </div>

          {/* Call History */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Call History ({leadCalls.length || lead.callCount})
            </div>
            {leadCalls.length > 0 ? (
              <div className="space-y-2">
                {leadCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div
                      className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        call.status === "success"
                          ? "bg-emerald-500"
                          : call.status === "failure"
                            ? "bg-destructive"
                            : "bg-amber-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-foreground font-medium truncate">
                          {call.intent}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                          {call.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {call.timestamp}
                        </span>
                      </div>
                      {call.notes && (
                        <div className="text-xs text-muted-foreground mt-0.5 italic">
                          {call.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {Array.from({ length: Math.min(lead.callCount, 3) }).map(
                  (_, i) => (
                    <div
                      key={`${lead.id}-call-${i + 1}`}
                      className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0"
                    >
                      <div className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-500" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-foreground font-medium">
                            {lead.intent}
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">
                            2:1{i}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {lead.lastContact}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="px-4 py-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Notes
            </div>
            <div className="bg-muted/40 rounded p-2 text-xs text-foreground leading-relaxed">
              {lead.notes}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t border-border bg-card flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs"
            data-ocid="lead-schedule-btn"
            onClick={() => setShowFollowUp(true)}
          >
            <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
            Schedule Follow-up
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadStatus>>(
    {},
  );
  const leads = useSyncExternalStore(leadsStore.subscribe, leadsStore.getLeads);
  const [showImportModal, setShowImportModal] = useState(false);

  const getLeadStatus = (lead: Lead): LeadStatus =>
    leadStatuses[lead.id] ?? lead.status;

  // Summary stats
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => getLeadStatus(l) === "hot").length;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const followUpsToday = leads.filter(
    (l) => l.followUpDate === todayStr,
  ).length;
  const convertedThisMonth = leads.filter(
    (l) => getLeadStatus(l) === "converted",
  ).length;

  // Filtered leads
  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const effectiveStatus = leadStatuses[lead.id] ?? lead.status;
      const q = search.toLowerCase();
      if (
        q &&
        !lead.name.toLowerCase().includes(q) &&
        !lead.phone.includes(q) &&
        !lead.company.toLowerCase().includes(q)
      )
        return false;
      if (statusFilter !== "all" && effectiveStatus !== statusFilter)
        return false;
      if (agentFilter !== "all" && lead.assignedAgent !== agentFilter)
        return false;
      if (sourceFilter !== "all") {
        if (sourceFilter === "inbound") {
          const relatedCalls = callRecords.filter((c) => c.leadId === lead.id);
          if (
            relatedCalls.length > 0 &&
            relatedCalls[0].direction !== "inbound"
          )
            return false;
        }
        if (sourceFilter === "outbound") {
          const relatedCalls = callRecords.filter((c) => c.leadId === lead.id);
          if (
            relatedCalls.length > 0 &&
            relatedCalls[0].direction !== "outbound"
          )
            return false;
        }
      }
      if (dateRange !== "all") {
        const leadDate = new Date(lead.lastContact);
        const now = new Date();
        if (dateRange === "today") {
          if (leadDate.toDateString() !== now.toDateString()) return false;
        } else if (dateRange === "week") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (leadDate < weekAgo) return false;
        } else if (dateRange === "month") {
          if (leadDate.getMonth() !== now.getMonth()) return false;
        }
      }
      return true;
    });
  }, [
    search,
    statusFilter,
    sourceFilter,
    agentFilter,
    dateRange,
    leadStatuses,
    leads,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((l) => l.id)));
    }
  };

  const handleStatusChange = (id: string, status: LeadStatus) => {
    setLeadStatuses((prev) => ({ ...prev, [id]: status }));
    if (detailLead?.id === id) {
      setDetailLead((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleResendRouting = (lead: Lead) => {
    const updated = triggerLeadRouting({
      ...lead,
      routedAt: new Date().toISOString(),
    });
    // Update detailLead with fresh routedAt
    setDetailLead(updated);
    toast.success(
      `Notification resent to ${updated.routedTo ?? "Enterprise Head"}`,
      { duration: 4000 },
    );
  };

  const uniqueAgents = useMemo(
    () => [...new Set(leads.map((l) => l.assignedAgent))],
    [leads],
  );

  // Pagination display helper
  const pageNumbers = useMemo(() => {
    const pages: { key: string; value: number | "..." }[] = [];
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);
    let dotsCount = 0;
    allPages
      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
      .forEach((p, idx, arr) => {
        if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
          dotsCount++;
          pages.push({ key: `dots-pos-${dotsCount}`, value: "..." });
        }
        pages.push({ key: `page-${p}`, value: p });
      });
    return pages;
  }, [page, totalPages]);

  return (
    <div className="flex flex-col h-full bg-background" data-ocid="leads-page">
      {/* Page Header */}
      <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-foreground font-display tracking-tight">
            Lead Management
          </h1>
          <Badge variant="outline" className="text-xs font-mono px-1.5 py-0">
            {totalLeads}
          </Badge>
        </div>
        <Button
          type="button"
          size="sm"
          className="h-7 text-xs gap-1.5"
          data-ocid="add-lead-btn"
          onClick={() => setShowImportModal(true)}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Import Leads
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Stat Cards */}
        <div
          className="px-5 py-3 grid grid-cols-2 md:grid-cols-4 gap-3"
          data-ocid="leads-stat-cards"
        >
          <StatCard
            label="Total Leads"
            value={totalLeads}
            icon={Users}
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            label="Hot Leads"
            value={hotLeads}
            icon={Flame}
            accent="bg-red-500/10 text-red-400"
          />
          <StatCard
            label="Follow-ups Today"
            value={followUpsToday || 3}
            icon={AlertCircle}
            accent="bg-amber-500/10 text-amber-400"
          />
          <StatCard
            label="Converted This Month"
            value={convertedThisMonth}
            icon={TrendingUp}
            accent="bg-emerald-500/10 text-emerald-400"
          />
        </div>

        {/* Filters */}
        <div
          className="px-5 pb-3 flex items-center gap-2 flex-wrap"
          data-ocid="leads-filters"
        >
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name, phone, company…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-7 text-xs"
              data-ocid="leads-search"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="h-7 text-xs w-32"
              data-ocid="status-filter"
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Status
              </SelectItem>
              <SelectItem value="hot" className="text-xs">
                🔥 Hot
              </SelectItem>
              <SelectItem value="warm" className="text-xs">
                ⚡ Warm
              </SelectItem>
              <SelectItem value="cold" className="text-xs">
                ❄️ Cold
              </SelectItem>
              <SelectItem value="converted" className="text-xs">
                ✅ Converted
              </SelectItem>
              <SelectItem value="lost" className="text-xs">
                Lost
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sourceFilter}
            onValueChange={(v) => {
              setSourceFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="h-7 text-xs w-32"
              data-ocid="source-filter"
            >
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Sources
              </SelectItem>
              <SelectItem value="inbound" className="text-xs">
                Inbound
              </SelectItem>
              <SelectItem value="outbound" className="text-xs">
                Outbound
              </SelectItem>
              <SelectItem value="campaign" className="text-xs">
                Campaign
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={agentFilter}
            onValueChange={(v) => {
              setAgentFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="h-7 text-xs w-40"
              data-ocid="agent-filter"
            >
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Agents
              </SelectItem>
              {uniqueAgents.map((a) => (
                <SelectItem key={a} value={a} className="text-xs">
                  {a.replace("GenAI Agent ", "")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center border border-border rounded overflow-hidden">
            {(["all", "today", "week", "month"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setDateRange(r);
                  setPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  dateRange === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                data-ocid={`date-range-${r}`}
              >
                {r === "all"
                  ? "All Time"
                  : r === "today"
                    ? "Today"
                    : r === "week"
                      ? "7 Days"
                      : "30 Days"}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.size > 0 && (
          <div
            className="mx-5 mb-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded flex items-center gap-3"
            data-ocid="bulk-actions-bar"
          >
            <span className="text-xs font-semibold text-primary">
              {selectedIds.size} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1.5"
                data-ocid="bulk-schedule-btn"
              >
                <CalendarClock className="w-3 h-3" />
                Schedule Follow-up
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1.5"
                data-ocid="bulk-reassign-btn"
              >
                <Users className="w-3 h-3" />
                Reassign Agent
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 text-xs gap-1.5"
                data-ocid="bulk-export-btn"
              >
                <Download className="w-3 h-3" />
                Export Selected
              </Button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                aria-label="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <div className="px-5 pb-4" data-ocid="leads-table-wrapper">
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-3 py-2 text-left w-8">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label="Select all"
                        data-ocid="select-all-checkbox"
                      >
                        {selectedIds.size === paginated.length &&
                        paginated.length > 0 ? (
                          <CheckSquare className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Intent
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                      Source
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Last Contact
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                      Follow-up
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Agent
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Routing
                    </th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lead) => {
                    const effectiveStatus = getLeadStatus(lead);
                    const isSelected = selectedIds.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/30 ${
                          isSelected ? "bg-primary/5" : ""
                        }`}
                        onClick={() => setDetailLead(lead)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && setDetailLead(lead)
                        }
                        data-ocid={`lead-row-${lead.id}`}
                      >
                        <td className="px-3 py-2">
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSelect(lead.id)}
                              className="w-3.5 h-3.5"
                              data-ocid={`lead-checkbox-${lead.id}`}
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                              {lead.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-foreground truncate max-w-28">
                                {lead.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-28">
                                {lead.company}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <span className="text-xs font-mono text-foreground">
                            {lead.phone}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <LeadStatusBadge status={effectiveStatus} />
                        </td>
                        <td className="px-2 py-2 hidden lg:table-cell">
                          <span className="text-xs text-foreground">
                            {lead.intent}
                          </span>
                        </td>
                        <td className="px-2 py-2 hidden xl:table-cell">
                          <span className="text-xs text-muted-foreground truncate max-w-28 block">
                            {lead.campaignSource}
                          </span>
                        </td>
                        <td className="px-2 py-2 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate max-w-24">
                              {lead.lastContact.split(" ")[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2 hidden xl:table-cell">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>{lead.followUpDate}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground truncate max-w-24 block">
                            {lead.assignedAgent.replace("GenAI Agent ", "")}
                          </span>
                        </td>
                        <td className="px-2 py-2 hidden lg:table-cell">
                          {lead.region ? (
                            <div className="flex flex-col gap-0.5">
                              <RegionBadge region={lead.region} />
                              {lead.routedTo && (
                                <span className="text-xs text-muted-foreground truncate max-w-24 block">
                                  {lead.routedTo.split(" ")[0]}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              title={`Call ${lead.name}`}
                              onClick={() => {
                                humanDialerStore
                                  .getState()
                                  .setClickToCallTargetObj({
                                    name: lead.name,
                                    phone: lead.phone,
                                    company: lead.company,
                                  });
                                navigate({ to: "/human-dialer" });
                              }}
                              className="p-1 rounded hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-400 transition-colors"
                              aria-label={`Call ${lead.name}`}
                              data-ocid={`call-lead-${lead.id}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailLead(lead)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                              aria-label="View lead"
                              data-ocid={`view-lead-${lead.id}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={11} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-muted-foreground/40" />
                          <div className="text-sm font-medium text-muted-foreground">
                            No leads match your filters
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("all");
                              setSourceFilter("all");
                              setAgentFilter("all");
                              setDateRange("all");
                            }}
                            className="text-xs text-primary hover:underline"
                            data-ocid="clear-filters-btn"
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20"
                data-ocid="leads-pagination"
              >
                <span className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} leads
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-40 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Previous page"
                    data-ocid="pagination-prev"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map(({ key, value }) =>
                    value === "..." ? (
                      <span
                        key={key}
                        className="text-xs text-muted-foreground px-1"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPage(value as number)}
                        className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                          page === value
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        data-ocid={`pagination-page-${value}`}
                      >
                        {value}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded hover:bg-muted disabled:opacity-40 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Next page"
                    data-ocid="pagination-next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Detail Slide-out */}
      {detailLead && (
        <LeadDetailPanel
          lead={{ ...detailLead, status: getLeadStatus(detailLead) }}
          onClose={() => setDetailLead(null)}
          onStatusChange={handleStatusChange}
          onResendRouting={handleResendRouting}
        />
      )}

      {/* AI Contact Import Modal */}
      <ImportContactsModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingLeads={leads}
        onImport={(newContacts) => {
          leadsStore.addLeads(newContacts as Lead[]);
          setShowImportModal(false);
        }}
      />
    </div>
  );
}
