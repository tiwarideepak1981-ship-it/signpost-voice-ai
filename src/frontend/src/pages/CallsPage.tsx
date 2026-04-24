import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Brain,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Search,
  Tag,
  User,
  UserCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { agents, callRecords } from "../data/sampleData";
import type { Agent, CallDirection, CallRecord, CallStatus } from "../types";

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 20;

const STATUS_OPTS: { value: CallStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "success", label: "Completed" },
  { value: "pending", label: "Transferred" },
  { value: "missed", label: "Missed" },
  { value: "failure", label: "Failed" },
  { value: "inprogress", label: "In Progress" },
];

const INTENT_OPTS = [
  "All Intents",
  "Media Plan Inquiry",
  "Campaign Performance Review",
  "Creative Brief Discussion",
  "Ad Budget Allocation",
  "Audience Targeting Strategy",
  "Brand Proposal Presentation",
  "Performance Metrics Consultation",
  "Influencer Collaboration Request",
  "Digital Ad Spend Optimization",
  "Campaign ROI Analysis",
];

const DATE_OPTS = ["Today", "Last 7 Days", "Last 30 Days", "All"] as const;
type DateRange = (typeof DATE_OPTS)[number];

// ─── Mock transcript per call ─────────────────────────────────────────────────
const TRANSCRIPTS = [
  [
    "Agent: Hello, this is GenAI Agent calling from Signpost. Am I speaking with the media planning lead?",
    "Caller: Yes, this is me. What is this regarding?",
    "Agent: I'm calling to follow up on your Q3 campaign performance review. Our platform shows your current campaigns are running at 1.8x ROAS — we can help push that to 2.5x with AI-driven audience optimization.",
    "Caller: That sounds interesting. Please send me the detailed report on email.",
  ],
  [
    "Agent: Good afternoon! I'm calling regarding your media plan inquiry for the upcoming festive season campaign.",
    "Caller: Yes, I've been waiting. Can you walk me through the channel mix recommendation?",
    "Agent: Absolutely. We're recommending a 40% digital, 35% OTT, and 25% social media split based on your target demographic of 18-35 urban consumers.",
    "Caller: That sounds good. Let me discuss with my team and I'll call back.",
  ],
  [
    "Agent: Hello, I'm calling about the creative brief discussion for your upcoming product launch campaign.",
    "Caller: Yes, we need a strong visual direction for the D2C brand launch.",
    "Agent: We've prepared three campaign concepts — one performance-led, one brand awareness, and one influencer-first approach. I can connect you with our creative strategist right now.",
    "Caller: Please connect me to a senior creative consultant for this.",
  ],
  [
    "Agent: Hi there! Calling about your programmatic onboarding request for display advertising.",
    "Caller: Oh yes, we submitted the brief last week for a ₹12L monthly campaign.",
    "Agent: Great. I need to confirm your brand safety parameters and target audience segments to proceed. Is that okay?",
    "Caller: Sure, let me pull up the campaign brief.",
  ],
];

const CONFIDENCE_SCORES = [92, 87, 78, 94, 83, 71, 89, 96, 76, 88];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getAgentByName(name: string): Agent | undefined {
  return agents.find((a) => a.name === name);
}

function filterByDate(record: CallRecord, range: DateRange): boolean {
  if (range === "All") return true;
  const now = new Date(2024, 3, 30);
  const callDate = new Date(record.timestamp);
  const diffDays = (now.getTime() - callDate.getTime()) / (1000 * 60 * 60 * 24);
  if (range === "Today") return diffDays < 1;
  if (range === "Last 7 Days") return diffDays <= 7;
  if (range === "Last 30 Days") return diffDays <= 30;
  return true;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: CallStatus }) {
  const map: Record<
    CallStatus,
    { cls: string; label: string; icon: React.ReactNode }
  > = {
    success: {
      cls: "status-success",
      label: "Completed",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    pending: {
      cls: "status-warning",
      label: "Transferred",
      icon: <ArrowUpRight className="w-3 h-3" />,
    },
    missed: {
      cls: "status-error",
      label: "Missed",
      icon: <PhoneMissed className="w-3 h-3" />,
    },
    failure: {
      cls: "status-error",
      label: "Failed",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    inprogress: {
      cls: "status-info",
      label: "In Progress",
      icon: <Loader className="w-3 h-3 animate-spin" />,
    },
  };
  const { cls, label, icon } = map[status];
  return (
    <span className={cls}>
      {icon}
      {label}
    </span>
  );
}

// ─── Direction Badge ──────────────────────────────────────────────────────────
function DirectionBadge({ direction }: { direction: CallDirection }) {
  if (direction === "inbound") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-primary/10 text-primary">
        <ArrowDownLeft className="w-3 h-3" /> Inbound
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded bg-accent/10 text-accent">
      <ArrowUpRight className="w-3 h-3" /> Outbound
    </span>
  );
}

// ─── Intent Badge ─────────────────────────────────────────────────────────────
const INTENT_COLORS: Record<string, string> = {
  "Media Plan Inquiry": "bg-blue-500/10 text-blue-400",
  "Campaign Performance Review": "bg-purple-500/10 text-purple-400",
  "Creative Brief Discussion": "bg-rose-500/10 text-rose-400",
  "Ad Budget Allocation": "bg-emerald-500/10 text-emerald-400",
  "Audience Targeting Strategy": "bg-orange-500/10 text-orange-400",
  "Brand Proposal Presentation": "bg-cyan-500/10 text-cyan-400",
  "Performance Metrics Consultation": "bg-yellow-500/10 text-yellow-400",
  "Influencer Collaboration Request": "bg-teal-500/10 text-teal-400",
  "Digital Ad Spend Optimization": "bg-indigo-500/10 text-indigo-400",
  "Campaign ROI Analysis": "bg-pink-500/10 text-pink-400",
};

function IntentBadge({ intent }: { intent: string }) {
  const cls = INTENT_COLORS[intent] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${cls}`}
    >
      {intent}
    </span>
  );
}

// ─── Call Detail Panel ────────────────────────────────────────────────────────
interface DetailPanelProps {
  record: CallRecord;
  onClose: () => void;
}

function CallDetailPanel({ record, onClose }: DetailPanelProps) {
  const idx = Number.parseInt(record.id.replace("call-", ""), 10) - 1;
  const transcriptLines = TRANSCRIPTS[idx % TRANSCRIPTS.length];
  const confidence = CONFIDENCE_SCORES[idx % CONFIDENCE_SCORES.length];
  const agentObj = getAgentByName(record.agent);

  return (
    <div className="fixed inset-0 z-50 flex" data-ocid="call-detail-overlay">
      {/* Backdrop */}
      <div
        className="flex-1 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close detail panel"
      />
      {/* Slide-out Panel */}
      <div className="w-[480px] bg-card border-l border-border flex flex-col h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
              Call Detail
            </p>
            <p className="text-sm font-semibold text-foreground font-display">
              {record.callerId}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted transition-smooth text-muted-foreground hover:text-foreground"
            aria-label="Close panel"
            data-ocid="call-detail-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 px-5 py-4 space-y-5">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="metric-card">
              <p className="metric-label">Status</p>
              <StatusBadge status={record.status} />
            </div>
            <div className="metric-card">
              <p className="metric-label">Duration</p>
              <p className="metric-value text-sm">{record.duration}</p>
            </div>
            <div className="metric-card">
              <p className="metric-label">Direction</p>
              <DirectionBadge direction={record.direction} />
            </div>
          </div>

          {/* Call Metadata */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Call Metadata
            </h3>
            <div className="bg-background rounded-md border border-border divide-y divide-border">
              {[
                {
                  icon: <Phone className="w-3 h-3" />,
                  label: "Caller ID",
                  value: record.callerId,
                },
                {
                  icon: <Clock className="w-3 h-3" />,
                  label: "Timestamp",
                  value: record.timestamp,
                },
                {
                  icon: <Tag className="w-3 h-3" />,
                  label: "Campaign",
                  value: record.campaign,
                },
                {
                  icon: <User className="w-3 h-3" />,
                  label: "Agent",
                  value: record.agent,
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-3 py-2">
                  <span className="text-muted-foreground flex-shrink-0">
                    {icon}
                  </span>
                  <span className="text-xs text-muted-foreground w-24 flex-shrink-0">
                    {label}
                  </span>
                  <span className="text-xs text-foreground font-medium truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Intent & Confidence */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> Intent Analysis
            </h3>
            <div className="bg-background rounded-md border border-border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <IntentBadge intent={record.intent} />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Confidence
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      confidence >= 85
                        ? "text-emerald-400"
                        : confidence >= 70
                          ? "text-accent"
                          : "text-destructive"
                    }`}
                  >
                    {confidence}%
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-smooth ${
                    confidence >= 85
                      ? "bg-emerald-400"
                      : confidence >= 70
                        ? "bg-accent"
                        : "bg-destructive"
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Sentiment:{" "}
                <span
                  className={`font-semibold ${
                    record.sentiment === "positive"
                      ? "text-emerald-400"
                      : record.sentiment === "negative"
                        ? "text-destructive"
                        : "text-foreground"
                  }`}
                >
                  {record.sentiment}
                </span>
              </div>
            </div>
          </div>

          {/* Lead Captured */}
          {record.leadId && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Lead Captured
              </h3>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-md px-3 py-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-400">
                    Lead ID: {record.leadId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Lead created and queued for follow-up
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Agent Transfer Details */}
          {record.status === "pending" && agentObj && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Transfer Details
              </h3>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-md px-3 py-2">
                <p className="text-xs font-semibold text-accent">
                  {agentObj.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Status: {agentObj.status} · Avg Duration:{" "}
                  {agentObj.avgDuration}
                </p>
                <p className="text-xs text-muted-foreground">
                  Success Rate: {agentObj.successRate}% · Total Calls:{" "}
                  {agentObj.totalCalls.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Transcript Preview */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Transcript Preview
            </h3>
            <div className="bg-background rounded-md border border-border p-3 space-y-2">
              {transcriptLines.map((line) => {
                const isAgent = line.startsWith("Agent:");
                const lineKey = line.slice(0, 30);
                return (
                  <div
                    key={lineKey}
                    className={`flex gap-2 ${isAgent ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`text-xs px-3 py-1.5 rounded-lg max-w-[85%] ${
                        isAgent
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {line.replace(/^(Agent|Caller): /, "")}
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground text-center pt-1">
                — End of preview —
              </p>
            </div>
          </div>

          {/* Notes */}
          {record.notes && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Notes
              </h3>
              <div className="bg-background border border-border rounded-md px-3 py-2">
                <p className="text-xs text-foreground">{record.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Calls Page ───────────────────────────────────────────────────────────────
type TabKey = "inbound" | "outbound" | "missed";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "inbound",
    label: "Inbound Calls",
    icon: <PhoneIncoming className="w-4 h-4" />,
  },
  {
    key: "outbound",
    label: "Outbound Calls",
    icon: <PhoneOutgoing className="w-4 h-4" />,
  },
  {
    key: "missed",
    label: "Missed Calls",
    icon: <PhoneMissed className="w-4 h-4" />,
  },
];

export default function CallsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("inbound");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CallStatus | "all">("all");
  const [intentFilter, setIntentFilter] = useState("All Intents");
  const [dateRange, setDateRange] = useState<DateRange>("Last 30 Days");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Tab filtering ──
  const tabFiltered = useMemo<CallRecord[]>(() => {
    if (activeTab === "missed")
      return callRecords.filter((r) => r.status === "missed");
    return callRecords.filter(
      (r) => r.direction === (activeTab as CallDirection),
    );
  }, [activeTab]);

  // ── Combined filtering ──
  const filteredCalls = useMemo<CallRecord[]>(() => {
    return tabFiltered.filter((r) => {
      if (search && !r.callerId.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (intentFilter !== "All Intents" && r.intent !== intentFilter)
        return false;
      if (!filterByDate(r, dateRange)) return false;
      return true;
    });
  }, [tabFiltered, search, statusFilter, intentFilter, dateRange]);

  const filteredCount = filteredCalls.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pageCallSlice = filteredCalls.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ── Tab count badges ──
  const tabCounts: Record<TabKey, number> = useMemo(
    () => ({
      inbound: callRecords.filter((r) => r.direction === "inbound").length,
      outbound: callRecords.filter((r) => r.direction === "outbound").length,
      missed: callRecords.filter((r) => r.status === "missed").length,
    }),
    [],
  );

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds(new Set());
  }

  function resetPage() {
    setCurrentPage(1);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const currentIds = pageCallSlice.map((r) => r.id);
    if (selectedIds.size === currentIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentIds));
    }
  }

  const allSelected =
    pageCallSlice.length > 0 && selectedIds.size === pageCallSlice.length;
  const startIdx = (safePage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(safePage * PAGE_SIZE, filteredCount);

  const pageWindow = useMemo(() => {
    const pages: number[] = [];
    const start = Math.max(1, safePage - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }, [safePage, totalPages]);

  return (
    <div className="h-full flex flex-col gap-0 overflow-hidden">
      {/* Page Header */}
      <div className="px-6 py-4 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-foreground font-display tracking-tight">
            Call Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor and review all voice interactions across campaigns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-mono">
            {callRecords.length.toLocaleString()} total records
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-card flex-shrink-0 px-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key)}
            data-ocid={`tab-${tab.key}`}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth -mb-px ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                activeTab === tab.key
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 bg-card border-b border-border flex flex-wrap items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            data-ocid="filter-search"
            className="h-8 pl-8 pr-3 text-xs bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-52"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as CallStatus | "all");
            resetPage();
          }}
          data-ocid="filter-status"
          className="h-8 px-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <select
          value={intentFilter}
          onChange={(e) => {
            setIntentFilter(e.target.value);
            resetPage();
          }}
          data-ocid="filter-intent"
          className="h-8 px-2 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {INTENT_OPTS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-background border border-border rounded-md p-0.5">
          {DATE_OPTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDateRange(d);
                resetPage();
              }}
              data-ocid={`date-${d.toLowerCase().replace(/\s/g, "-")}`}
              className={`px-2.5 py-1 text-xs rounded transition-smooth ${
                dateRange === d
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="ml-auto flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-xs text-accent font-semibold">
              {selectedIds.size} selected
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded"
            data-ocid="results-count"
          >
            {filteredCount.toLocaleString()} calls
          </span>
        </div>
      </div>

      {/* ── Table Area ── */}
      <div className="flex-1 overflow-auto bg-background">
        <table className="w-full text-xs data-table border-collapse min-w-[960px]">
          <thead className="sticky top-0 z-10 bg-card border-b border-border">
            <tr>
              <th className="w-8 px-3 py-2.5 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  data-ocid="select-all"
                  className="accent-primary w-3 h-3"
                />
              </th>
              {[
                "Date / Time",
                "Dir",
                "Phone Number",
                "Campaign",
                "Duration",
                "Intent",
                "Status",
                "Agent",
              ].map((col) => (
                <th
                  key={col}
                  className={`px-3 py-2.5 text-muted-foreground font-semibold uppercase tracking-widest text-left whitespace-nowrap ${col === "Duration" ? "text-right" : ""}`}
                >
                  {col}
                </th>
              ))}
              <th className="w-10 px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {pageCallSlice.length === 0 ? (
              <tr>
                <td colSpan={10}>
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-3"
                    data-ocid="empty-state"
                  >
                    <PhoneMissed className="w-10 h-10 text-muted-foreground/40" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      No calls match your filters
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      Try adjusting search, status, or date range
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              pageCallSlice.map((record, idx) => {
                const isSelected = selectedIds.has(record.id);
                const isEven = idx % 2 === 0;
                return (
                  <tr
                    key={record.id}
                    data-ocid={`call-row-${record.id}`}
                    tabIndex={0}
                    className={`group border-b border-border transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/5"
                        : isEven
                          ? "bg-background hover:bg-card/60"
                          : "bg-card/30 hover:bg-card/60"
                    }`}
                    onClick={() => setSelectedCall(record)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setSelectedCall(record)
                    }
                  >
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(record.id)}
                        className="accent-primary w-3 h-3"
                      />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground font-mono whitespace-nowrap">
                      {record.timestamp}
                    </td>
                    <td className="px-3 py-2">
                      <DirectionBadge direction={record.direction} />
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground font-medium">
                      {record.callerId}
                    </td>
                    <td className="px-3 py-2 max-w-[160px]">
                      <span className="truncate block text-foreground">
                        {record.campaign}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-foreground">
                      {record.duration}
                    </td>
                    <td className="px-3 py-2">
                      <IntentBadge intent={record.intent} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-3 py-2 max-w-[140px]">
                      <span className="truncate block text-muted-foreground">
                        {record.agent}
                      </span>
                    </td>
                    <td
                      className="px-3 py-2"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCall(record)}
                        data-ocid={`view-call-${record.id}`}
                        aria-label="View call details"
                        className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-smooth opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-card flex-shrink-0">
        <p
          className="text-xs text-muted-foreground"
          data-ocid="pagination-info"
        >
          {filteredCount === 0
            ? "No results"
            : `Showing ${startIdx}–${endIdx} of ${filteredCount.toLocaleString()} calls`}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            data-ocid="pagination-prev"
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-smooth text-muted-foreground hover:text-foreground"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pageWindow.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              data-ocid={`pagination-page-${p}`}
              className={`w-7 h-7 text-xs rounded font-medium transition-smooth ${
                p === safePage
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            data-ocid="pagination-next"
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-smooth text-muted-foreground hover:text-foreground"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Call Detail Panel */}
      {selectedCall && (
        <CallDetailPanel
          record={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  );
}
