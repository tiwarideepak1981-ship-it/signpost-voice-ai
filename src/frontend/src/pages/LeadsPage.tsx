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
import type { Lead, LeadComment, LeadRegion, LeadStatus } from "@/types";
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
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Square,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
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

// ─── Detail Panel Section ─────────────────────────────────────────────────────
function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | undefined | null;
}) {
  if (value === undefined || value === null || value === "") return null;
  const display =
    typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  return (
    <div className="flex items-start justify-between gap-2 py-0.5">
      <span className="text-xs text-muted-foreground flex-shrink-0 w-36">
        {label}
      </span>
      <span className="text-xs text-foreground text-right break-words max-w-44">
        {display}
      </span>
    </div>
  );
}

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onResendRouting: (lead: Lead) => void;
}

const FOLLOWUP_TEMPLATES = [
  "Follow-up call made — no response, left voicemail.",
  "Sent campaign proposal via email, awaiting response.",
  "Connected on WhatsApp — shared media kit.",
  "Meeting scheduled for next week.",
  "Client requested revised proposal — will send by EOD.",
  "Follow-up pending — client traveling.",
];

function formatCommentTimestamp(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const mon = d.toLocaleString("en-IN", { month: "short" });
  const yr = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${mon} ${yr}, ${hh}:${mm}`;
}

function FollowUpComments({ lead }: { lead: Lead }) {
  const [commentText, setCommentText] = useState("");
  // Subscribe to live store so comments update immediately after save
  const liveLeads = useSyncExternalStore(
    leadsStore.subscribe,
    leadsStore.getLeads,
  );
  const liveLead = liveLeads.find((l) => l.id === lead.id) ?? lead;

  const handleTemplateClick = useCallback((tpl: string) => {
    setCommentText(tpl);
  }, []);

  const handleSave = useCallback(() => {
    const text = commentText.trim();
    if (!text) return;
    const comment: LeadComment = {
      id: `cmt-${lead.id}-${Date.now()}`,
      text,
      timestamp: new Date().toISOString(),
      author: "Agent",
    };
    leadsStore.addComment(lead.id, comment);
    setCommentText("");
  }, [commentText, lead.id]);

  const comments = liveLead.comments ?? [];

  return (
    <div
      className="px-4 py-3 border-b border-border"
      data-ocid="followup-comments-section"
    >
      <div className="flex items-center gap-1.5 mb-2">
        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Follow-up Comments
        </div>
      </div>

      {/* Template chips */}
      <div className="flex flex-wrap gap-1 mb-2">
        {FOLLOWUP_TEMPLATES.map((tpl) => (
          <button
            key={tpl}
            type="button"
            onClick={() => handleTemplateClick(tpl)}
            className="text-xs px-2 py-0.5 rounded-full bg-muted/60 border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors truncate max-w-44"
            title={tpl}
            data-ocid="followup-template-chip"
          >
            {tpl.length > 28 ? `${tpl.slice(0, 26)}…` : tpl}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Write a follow-up note..."
        rows={3}
        className="w-full bg-background border border-input rounded px-2.5 py-2 text-xs text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        data-ocid="followup-comment-textarea"
      />

      <Button
        type="button"
        size="sm"
        className="h-7 text-xs gap-1.5 mt-1.5 w-full"
        disabled={!commentText.trim()}
        onClick={handleSave}
        data-ocid="followup-save-comment-btn"
      >
        <Send className="w-3 h-3" />
        Save Comment
      </Button>

      {/* Comment log */}
      <div className="mt-3">
        {comments.length === 0 ? (
          <div
            className="text-xs text-muted-foreground text-center py-4 bg-muted/20 rounded"
            data-ocid="followup-comments-empty-state"
          >
            No follow-up comments yet. Add your first note above.
          </div>
        ) : (
          <div
            className="space-y-2 max-h-48 overflow-y-auto pr-0.5"
            data-ocid="followup-comments-list"
          >
            {comments.map((c) => (
              <div
                key={c.id}
                className="bg-muted/30 border border-border/60 rounded p-2 space-y-1"
              >
                <p className="text-xs text-foreground leading-relaxed">
                  {c.text}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-primary">
                    {c.author}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatCommentTimestamp(c.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
                {lead.clientContactPerson || lead.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {lead.clientCompanyName || lead.company}
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
          <DetailSection title="Contact Info">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-foreground">
                <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium">
                  {lead.clientContactPerson || lead.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="font-mono">
                  {lead.clientMobileNumber || lead.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate">
                  {lead.clientEmailId || lead.email}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span>{lead.clientCompanyName || lead.company}</span>
              </div>
              {lead.headOffice && (
                <div className="flex items-center gap-2 text-xs text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span>HO: {lead.headOffice}</span>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Lead Details */}
          <DetailSection title="Lead Details">
            <div className="space-y-0.5">
              <DetailRow label="Source" value={lead.source} />
              <DetailRow label="Channel" value={lead.channel} />
              <DetailRow label="Category" value={lead.category} />
              <DetailRow label="Type of Inquiry" value={lead.typeOfInquiry} />
              <DetailRow
                label="Enquiry Forwarded Through"
                value={lead.enquiryForwardedThrough}
              />
              <DetailRow
                label="Connected Status"
                value={lead.connectedStatus}
              />
              <DetailRow label="Stage" value={lead.stage} />
            </div>
          </DetailSection>

          {/* Requirements */}
          <DetailSection title="Requirements">
            {lead.requirements && (
              <div className="bg-muted/30 rounded p-2 text-xs text-foreground mb-2 leading-relaxed">
                {lead.requirements}
              </div>
            )}
            <div className="space-y-0.5">
              <DetailRow label="Duration" value={lead.duration} />
              <DetailRow
                label="Budget"
                value={
                  lead.budget
                    ? `₹${lead.budget.toLocaleString("en-IN")}`
                    : undefined
                }
              />
              <DetailRow
                label="Revenue (Display Amt)"
                value={
                  lead.revenueDisplayAmount
                    ? `₹${lead.revenueDisplayAmount.toLocaleString("en-IN")}`
                    : undefined
                }
              />
              <DetailRow
                label="Campaign Location"
                value={lead.campaignLocation}
              />
            </div>
          </DetailSection>

          {/* Sales Info */}
          <DetailSection title="Sales Info">
            <div className="space-y-0.5">
              <DetailRow label="Salesperson" value={lead.salesperson} />
              <DetailRow
                label="Reporting Manager"
                value={lead.reportingManager}
              />
              <div className="flex items-start justify-between gap-2 py-0.5">
                <span className="text-xs text-muted-foreground flex-shrink-0 w-36">
                  Region
                </span>
                <span className="text-xs text-right">
                  {lead.region && <RegionBadge region={lead.region} />}
                </span>
              </div>
              {lead.ehRegion && (
                <div className="flex items-start justify-between gap-2 py-0.5">
                  <span className="text-xs text-muted-foreground flex-shrink-0 w-36">
                    EH Region
                  </span>
                  <span className="text-xs text-right">
                    <RegionBadge region={lead.ehRegion} />
                  </span>
                </div>
              )}
            </div>
          </DetailSection>

          {/* Notes & WhatsApp */}
          <DetailSection title="Notes & Communication">
            {lead.remarks && (
              <div className="bg-muted/40 rounded p-2 text-xs text-foreground leading-relaxed mb-2">
                {lead.remarks}
              </div>
            )}
            <div className="space-y-0.5">
              <DetailRow
                label="Details via WhatsApp"
                value={lead.detailsRequestedViaWhatsApp}
              />
            </div>
            {!lead.remarks && (
              <div className="bg-muted/40 rounded p-2 text-xs text-foreground leading-relaxed">
                {lead.notes}
              </div>
            )}
          </DetailSection>

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

          {/* Status & Score */}
          <div className="px-4 py-3 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Lead Score & Status
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

          {/* Follow-up Comments */}
          <FollowUpComments lead={lead} />

          {/* Call History */}
          <div className="px-4 py-3">
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

// ─── Table column header ──────────────────────────────────────────────────────
function TH({
  children,
  right,
}: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-2 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

function TD({
  children,
  right,
  className = "",
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`px-2 py-1.5 ${right ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}

function CellText({
  value,
  mono,
}: { value?: string | number | null; mono?: boolean }) {
  if (!value && value !== 0)
    return <span className="text-xs text-muted-foreground/40">—</span>;
  return (
    <span
      className={`text-xs text-foreground truncate block max-w-28 ${mono ? "font-mono" : ""}`}
      title={String(value)}
    >
      {String(value)}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
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

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const effectiveStatus = leadStatuses[lead.id] ?? lead.status;
      const q = search.toLowerCase();
      if (
        q &&
        !lead.name.toLowerCase().includes(q) &&
        !(lead.clientContactPerson ?? "").toLowerCase().includes(q) &&
        !lead.phone.includes(q) &&
        !(lead.clientMobileNumber ?? "").includes(q) &&
        !lead.company.toLowerCase().includes(q) &&
        !(lead.clientCompanyName ?? "").toLowerCase().includes(q)
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

        {/* Leads Table — full 23-field horizontal scroll */}
        <div className="px-5 pb-4" data-ocid="leads-table-wrapper">
          <div className="border border-border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full data-table"
                style={{ minWidth: "2200px" }}
              >
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    <th className="px-3 py-2 text-left w-8 sticky left-0 bg-muted/40 z-10">
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
                    {/* Lead status badge */}
                    <TH>Status</TH>
                    {/* 23 form fields in order */}
                    <TH>Source</TH>
                    <TH>Channel</TH>
                    <TH>Client Contact Person</TH>
                    <TH>Client Mobile Number</TH>
                    <TH>Client Email ID</TH>
                    <TH>Client Company Name</TH>
                    <TH>Category</TH>
                    <TH>Head Office</TH>
                    <TH>Requirements</TH>
                    <TH>Duration</TH>
                    <TH>Budget</TH>
                    <TH>Reporting Manager</TH>
                    <TH>Salesperson</TH>
                    <TH>Remarks</TH>
                    <TH>Details via WhatsApp</TH>
                    <TH>Enquiry Fwd Through</TH>
                    <TH>Type of Inquiry</TH>
                    <TH>Connected Status</TH>
                    <TH>Stage</TH>
                    <TH>Campaign Location</TH>
                    <TH>Region</TH>
                    <TH>EH Region</TH>
                    <TH>Revenue (Display Amt)</TH>
                    <TH right>Action</TH>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lead, rowIdx) => {
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
                        data-ocid={`lead-row.item.${rowIdx + 1}`}
                      >
                        <td className="px-3 py-1.5 sticky left-0 bg-card z-10">
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
                        <TD>
                          <LeadStatusBadge status={effectiveStatus} />
                        </TD>
                        {/* Source */}
                        <TD>
                          <CellText value={lead.source} />
                        </TD>
                        {/* Channel */}
                        <TD>
                          <CellText value={lead.channel} />
                        </TD>
                        {/* Client Contact Person */}
                        <TD>
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                              {(lead.clientContactPerson || lead.name)
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <span
                              className="text-xs font-semibold text-foreground truncate max-w-28"
                              title={lead.clientContactPerson || lead.name}
                            >
                              {lead.clientContactPerson || lead.name}
                            </span>
                          </div>
                        </TD>
                        {/* Client Mobile Number */}
                        <TD>
                          <CellText
                            value={lead.clientMobileNumber || lead.phone}
                            mono
                          />
                        </TD>
                        {/* Client Email ID */}
                        <TD>
                          <span
                            className="text-xs text-foreground truncate block max-w-36"
                            title={lead.clientEmailId || lead.email}
                          >
                            {lead.clientEmailId || lead.email}
                          </span>
                        </TD>
                        {/* Client Company Name */}
                        <TD>
                          <span
                            className="text-xs text-foreground truncate block max-w-28"
                            title={lead.clientCompanyName || lead.company}
                          >
                            {lead.clientCompanyName || lead.company}
                          </span>
                        </TD>
                        {/* Category */}
                        <TD>
                          <CellText value={lead.category} />
                        </TD>
                        {/* Head Office */}
                        <TD>
                          <CellText value={lead.headOffice} />
                        </TD>
                        {/* Requirements */}
                        <TD>
                          {lead.requirements ? (
                            <span
                              className="text-xs text-foreground truncate block max-w-36"
                              title={lead.requirements}
                            >
                              {lead.requirements.length > 30
                                ? `${lead.requirements.slice(0, 30)}…`
                                : lead.requirements}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Duration */}
                        <TD>
                          <CellText value={lead.duration} />
                        </TD>
                        {/* Budget */}
                        <TD>
                          {lead.budget ? (
                            <span className="text-xs text-foreground font-mono">
                              ₹{lead.budget.toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Reporting Manager */}
                        <TD>
                          <CellText value={lead.reportingManager} />
                        </TD>
                        {/* Salesperson */}
                        <TD>
                          <CellText value={lead.salesperson} />
                        </TD>
                        {/* Remarks */}
                        <TD>
                          {lead.remarks ? (
                            <span
                              className="text-xs text-foreground truncate block max-w-36"
                              title={lead.remarks}
                            >
                              {lead.remarks.length > 28
                                ? `${lead.remarks.slice(0, 28)}…`
                                : lead.remarks}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Details via WhatsApp */}
                        <TD>
                          {lead.detailsRequestedViaWhatsApp !== undefined ? (
                            <span
                              className={`text-xs font-medium ${
                                lead.detailsRequestedViaWhatsApp
                                  ? "text-emerald-400"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {lead.detailsRequestedViaWhatsApp ? "Yes" : "No"}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Enquiry Forwarded Through */}
                        <TD>
                          <CellText value={lead.enquiryForwardedThrough} />
                        </TD>
                        {/* Type of Inquiry */}
                        <TD>
                          <CellText value={lead.typeOfInquiry} />
                        </TD>
                        {/* Connected Status */}
                        <TD>
                          {lead.connectedStatus ? (
                            <span
                              className={`text-xs font-medium ${
                                lead.connectedStatus === "Connected"
                                  ? "text-emerald-400"
                                  : lead.connectedStatus === "In Discussion"
                                    ? "text-amber-400"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {lead.connectedStatus}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Stage */}
                        <TD>
                          {lead.stage ? (
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                lead.stage === "Closed Won"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : lead.stage === "Closed Lost"
                                    ? "bg-muted text-muted-foreground"
                                    : lead.stage === "Negotiation"
                                      ? "bg-amber-500/15 text-amber-400"
                                      : lead.stage === "Proposal Sent"
                                        ? "bg-blue-500/15 text-blue-400"
                                        : "bg-muted/50 text-foreground"
                              }`}
                            >
                              {lead.stage}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Campaign Location */}
                        <TD>
                          <CellText value={lead.campaignLocation} />
                        </TD>
                        {/* Region */}
                        <TD>
                          {lead.region ? (
                            <RegionBadge region={lead.region} />
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* EH Region */}
                        <TD>
                          {lead.ehRegion ? (
                            <RegionBadge region={lead.ehRegion} />
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Revenue Display Amount */}
                        <TD>
                          {lead.revenueDisplayAmount ? (
                            <span className="text-xs text-foreground font-mono">
                              ₹
                              {lead.revenueDisplayAmount.toLocaleString(
                                "en-IN",
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">
                              —
                            </span>
                          )}
                        </TD>
                        {/* Action */}
                        <td className="px-2 py-1.5 text-right">
                          <div
                            className="flex items-center justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              title={`Call ${lead.clientContactPerson || lead.name}`}
                              onClick={() => {
                                humanDialerStore
                                  .getState()
                                  .setClickToCallTargetObj({
                                    name: lead.clientContactPerson || lead.name,
                                    phone:
                                      lead.clientMobileNumber || lead.phone,
                                    company:
                                      lead.clientCompanyName || lead.company,
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
                      <td colSpan={26} className="py-12 text-center">
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
