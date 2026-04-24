import { ENTERPRISE_HEADS } from "@/data/enterpriseHeads";
import { detectRegion } from "@/services/leadRoutingService";
import type { Lead, LeadStatus } from "@/types";
import type { LeadRegion } from "@/types";
import * as Dialog from "@radix-ui/react-dialog";
import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Flame,
  MapPin,
  Snowflake,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ImportedContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  industry: string;
  country: string;
  state: string;
  city: string;
  aiStatus: LeadStatus;
  isDuplicate: boolean;
  duplicateType?: "email" | "phone" | "both";
  selected: boolean;
}

interface FilterState {
  country: string;
  state: string;
  city: string;
  company: string;
  designation: string;
  name: string;
  industry: string;
}

interface FollowUpSchedulerState {
  date: string;
  agent: string;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  existingLeads: Lead[];
  onImport: (contacts: Partial<Lead>[]) => void;
}

const AGENTS = [
  "Priya Sharma",
  "Arjun Mehta",
  "Kavya Nair",
  "Rahul Singh",
  "Deepika Rao",
];

// ─── AI Status Logic ─────────────────────────────────────────────────────────

function inferAiStatus(designation: string, industry: string): LeadStatus {
  const d = designation.toLowerCase();
  const i = industry.toLowerCase();
  const hotDesignations = [
    "ceo",
    "cto",
    "cfo",
    "coo",
    "director",
    "vp",
    "founder",
    "president",
    "chief",
    "managing director",
    "md",
    "partner",
    "owner",
  ];
  const hotIndustries = [
    "tech",
    "technology",
    "fintech",
    "finance",
    "banking",
    "healthcare",
    "pharma",
    "saas",
    "software",
    "ai",
    "ml",
    "cloud",
  ];
  const warmDesignations = [
    "manager",
    "senior",
    "lead",
    "head",
    "principal",
    "sr.",
    "sr ",
    "architect",
    "engineer",
    "analyst",
    "specialist",
    "consultant",
    "advisor",
  ];

  const isHotDesig = hotDesignations.some((hd) => d.includes(hd));
  const isHotIndustry = hotIndustries.some((hi) => i.includes(hi));
  const isWarmDesig = warmDesignations.some((wd) => d.includes(wd));

  if (isHotDesig && isHotIndustry) return "hot";
  if (isHotDesig) return "warm";
  if (isWarmDesig) return "warm";
  return "cold";
}

// ─── CSV Parser ───────────────────────────────────────────────────────────────

function parseCSV(text: string): Partial<ImportedContact>[] {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(",").map((h) => h.trim().replace(/"/g, ""));

  const colIndex = (names: string[]) =>
    names.reduce<number>(
      (found, n) => (found === -1 ? headers.indexOf(n) : found),
      -1,
    );

  const nameIdx = colIndex(["name", "full name", "contact name"]);
  const emailIdx = colIndex(["email", "email address", "e-mail"]);
  const phoneIdx = colIndex(["phone", "phone number", "mobile", "contact"]);
  const companyIdx = colIndex(["company", "organization", "org"]);
  const designationIdx = colIndex([
    "designation",
    "title",
    "job title",
    "role",
    "position",
  ]);
  const industryIdx = colIndex(["industry", "sector", "vertical"]);
  const countryIdx = colIndex(["country"]);
  const stateIdx = colIndex(["state", "province"]);
  const cityIdx = colIndex(["city", "town"]);

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const get = (idx: number) => (idx >= 0 ? (cols[idx] ?? "") : "");
      return {
        name: get(nameIdx),
        email: get(emailIdx),
        phone: get(phoneIdx),
        company: get(companyIdx),
        designation: get(designationIdx),
        industry: get(industryIdx),
        country: get(countryIdx),
        state: get(stateIdx),
        city: get(cityIdx),
      };
    })
    .filter((c) => c.name || c.email || c.phone);
}

function parsePastedText(text: string): Partial<ImportedContact>[] {
  const lines = text
    .trim()
    .split("\n")
    .filter((l) => l.trim());
  return lines
    .map((line) => {
      const cols = line.split(/[,\t]/).map((c) => c.trim());
      return {
        name: cols[0] ?? "",
        email: cols[1] ?? "",
        phone: cols[2] ?? "",
        company: cols[3] ?? "",
        designation: cols[4] ?? "",
        industry: cols[5] ?? "",
        country: cols[6] ?? "",
        state: cols[7] ?? "",
        city: cols[8] ?? "",
      };
    })
    .filter((c) => c.name || c.email || c.phone);
}

function buildContacts(
  raw: Partial<ImportedContact>[],
  existingLeads: Lead[],
): ImportedContact[] {
  return raw.map((r, idx) => {
    const emailMatch = r.email
      ? existingLeads.some(
          (l) => l.email.toLowerCase() === r.email!.toLowerCase(),
        )
      : false;
    const phoneMatch = r.phone
      ? existingLeads.some((l) => l.phone === r.phone)
      : false;

    let duplicateType: ImportedContact["duplicateType"] = undefined;
    if (emailMatch && phoneMatch) duplicateType = "both";
    else if (emailMatch) duplicateType = "email";
    else if (phoneMatch) duplicateType = "phone";

    const designation = r.designation ?? "";
    const industry = r.industry ?? "";

    return {
      id: `import-${Date.now()}-${idx}`,
      name: r.name ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      company: r.company ?? "",
      designation,
      industry,
      country: r.country ?? "",
      state: r.state ?? "",
      city: r.city ?? "",
      aiStatus: inferAiStatus(designation, industry),
      isDuplicate: emailMatch || phoneMatch,
      duplicateType,
      selected: !(emailMatch || phoneMatch),
    };
  });
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportToCSV(contacts: ImportedContact[]) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Company",
    "Designation",
    "Country",
    "State",
    "City",
    "Industry",
    "AI Status",
  ];
  const rows = contacts.map((c) =>
    [
      c.name,
      c.email,
      c.phone,
      c.company,
      c.designation,
      c.country,
      c.state,
      c.city,
      c.industry,
      c.aiStatus,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `contacts-export-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: LeadStatus }) {
  if (status === "hot")
    return (
      <span className="badge-hot">
        <Flame className="w-3 h-3" />
        Hot
      </span>
    );
  if (status === "warm")
    return (
      <span className="badge-warm">
        <Zap className="w-3 h-3" />
        Warm
      </span>
    );
  return (
    <span className="badge-cold">
      <Snowflake className="w-3 h-3" />
      Cold
    </span>
  );
}

// ─── Follow-up Scheduler Modal ────────────────────────────────────────────────

interface SchedulerProps {
  selectedCount: number;
  onConfirm: (data: FollowUpSchedulerState) => void;
  onCancel: () => void;
}

function FollowUpScheduler({
  selectedCount,
  onConfirm,
  onCancel,
}: SchedulerProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<FollowUpSchedulerState>({
    date: today,
    agent: AGENTS[0],
    notes: "",
  });

  const set = (key: keyof FollowUpSchedulerState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      data-ocid="followup-scheduler-overlay"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        role="button"
        tabIndex={-1}
        aria-label="Close scheduler"
        onClick={onCancel}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
      />

      {/* Card */}
      <div
        className="relative z-10 bg-popover border border-accent/40 rounded-md shadow-2xl w-full max-w-md"
        data-ocid="followup-scheduler-modal"
        style={{ boxShadow: "0 0 40px oklch(0.68 0.18 65 / 0.15)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground font-display tracking-tight">
              Schedule Follow-up
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close scheduler"
            data-ocid="scheduler-close-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <div className="px-3 py-2 bg-accent/10 border border-accent/20 rounded text-xs text-accent font-semibold">
            Scheduling follow-up for{" "}
            <span className="text-foreground">
              {selectedCount} selected contact{selectedCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label htmlFor="followup-date" className="filter-label block">
              Follow-up Date <span className="text-destructive">*</span>
            </label>
            <input
              id="followup-date"
              type="date"
              min={today}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              className="filter-input w-full px-3 py-2 text-sm"
              data-ocid="scheduler-date-input"
            />
          </div>

          {/* Agent */}
          <div className="space-y-1.5">
            <label htmlFor="followup-agent" className="filter-label block">
              Assigned Agent <span className="text-destructive">*</span>
            </label>
            <select
              id="followup-agent"
              value={form.agent}
              onChange={(e) => set("agent", e.target.value)}
              className="filter-input w-full px-3 py-2 text-sm"
              data-ocid="scheduler-agent-select"
            >
              {AGENTS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label htmlFor="followup-notes" className="filter-label block">
              Notes{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="followup-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Add context for the follow-up call…"
              rows={3}
              className="w-full bg-background border border-input rounded px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-smooth resize-none"
              data-ocid="scheduler-notes-input"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-card/40 rounded-b-md">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            data-ocid="scheduler-cancel-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(form)}
            disabled={!form.date || !form.agent}
            className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-accent-foreground px-3 py-2 rounded-sm text-xs font-semibold transition-smooth disabled:opacity-40 disabled:cursor-not-allowed"
            data-ocid="scheduler-confirm-btn"
          >
            <Calendar className="w-3.5 h-3.5" />
            Confirm Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sample CSV ───────────────────────────────────────────────────────────────

const SAMPLE_CSV = `Name,Email,Phone,Company,Designation,Industry,Country,State,City
Sarah Chen,sarah.chen@nexatech.io,+1-555-0192,NexaTech Solutions,CEO,Technology,USA,California,San Francisco
Marcus Webb,marcus.webb@finvault.com,+1-555-0234,FinVault Corp,CFO,Finance,USA,New York,New York City
Priya Sharma,priya.s@healthbridge.in,+91-98765-43210,HealthBridge India,Director,Healthcare,India,Maharashtra,Mumbai
Tom Bradley,t.bradley@cloudshift.io,+44-7911-123456,CloudShift Ltd,Senior Manager,SaaS,UK,England,London
Ana Rodrigues,a.rodrigues@mercado.br,+55-11-91234-5678,Mercado Digital,Marketing Manager,E-commerce,Brazil,São Paulo,São Paulo
David Kim,d.kim@aiforward.co,+82-10-1234-5678,AI Forward,Founder,AI,South Korea,Seoul,Gangnam
Lisa Hoffman,l.hoffman@pharmanet.de,+49-30-12345678,PharmaNet GmbH,VP Sales,Pharma,Germany,Berlin,Berlin
James Okafor,j.okafor@techbridge.ng,+234-803-456-7890,TechBridge Nigeria,Business Development,Technology,Nigeria,Lagos,Victoria Island`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImportContactsModal({
  open,
  onClose,
  existingLeads,
  onImport,
}: Props) {
  const [activeTab, setActiveTab] = useState<"csv" | "paste">("csv");
  const [step, setStep] = useState<1 | 2>(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ImportedContact[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    state: "",
    city: "",
    company: "",
    designation: "",
    name: "",
    industry: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSample, setShowSample] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [followUpScheduled, setFollowUpScheduled] = useState<{
    agent: string;
    date: string;
  } | null>(null);

  const resetState = useCallback(() => {
    setStep(1);
    setContacts([]);
    setFileName(null);
    setPasteText("");
    setFilters({
      country: "",
      state: "",
      city: "",
      company: "",
      designation: "",
      name: "",
      industry: "",
    });
    setShowSample(false);
    setIsDragOver(false);
    setShowScheduler(false);
    setFollowUpScheduled(null);
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processRaw = (raw: Partial<ImportedContact>[]) => {
    if (raw.length === 0) return;
    const built = buildContacts(raw, existingLeads);
    setContacts(built);
    setStep(2);
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processRaw(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const handleAnalyze = () => {
    if (activeTab === "csv" && fileName) return;
    if (activeTab === "paste" && pasteText.trim()) {
      processRaw(parsePastedText(pasteText));
    }
  };

  const toggleContact = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  };

  // Toggle all currently visible (filtered) non-duplicate contacts
  const toggleAll = (checked: boolean) => {
    const visibleIds = new Set(
      filteredContacts.filter((c) => !c.isDuplicate).map((c) => c.id),
    );
    setContacts((prev) =>
      prev.map((c) => (visibleIds.has(c.id) ? { ...c, selected: checked } : c)),
    );
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const f = filters;
      if (f.name && !c.name.toLowerCase().includes(f.name.toLowerCase()))
        return false;
      if (
        f.company &&
        !c.company.toLowerCase().includes(f.company.toLowerCase())
      )
        return false;
      if (
        f.designation &&
        !c.designation.toLowerCase().includes(f.designation.toLowerCase())
      )
        return false;
      if (
        f.industry &&
        !c.industry.toLowerCase().includes(f.industry.toLowerCase())
      )
        return false;
      if (
        f.country &&
        !c.country.toLowerCase().includes(f.country.toLowerCase())
      )
        return false;
      if (f.state && !c.state.toLowerCase().includes(f.state.toLowerCase()))
        return false;
      if (f.city && !c.city.toLowerCase().includes(f.city.toLowerCase()))
        return false;
      return true;
    });
  }, [contacts, filters]);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter((v) => v.trim() !== "").length,
    [filters],
  );

  const selectedContacts = useMemo(
    () => contacts.filter((c) => c.selected),
    [contacts],
  );
  const totalSelected = selectedContacts.length;
  const duplicateCount = contacts.filter((c) => c.isDuplicate).length;
  const allVisibleNonDupSelected =
    filteredContacts.filter((c) => !c.isDuplicate).length > 0 &&
    filteredContacts.filter((c) => !c.isDuplicate).every((c) => c.selected);

  const handleExportCSV = () => {
    exportToCSV(selectedContacts);
  };

  const handleScheduleConfirm = (data: FollowUpSchedulerState) => {
    setShowScheduler(false);
    setFollowUpScheduled({ agent: data.agent, date: data.date });
    const formattedDate = new Date(data.date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    toast.success(
      `Follow-up scheduled for ${totalSelected} contact${totalSelected !== 1 ? "s" : ""} on ${formattedDate} — assigned to ${data.agent}`,
      {
        duration: 5000,
      },
    );
  };

  const handleImport = () => {
    const toImport = contacts
      .filter((c) => c.selected && !c.isDuplicate)
      .map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        status: c.aiStatus,
        location: [c.city, c.state, c.country].filter(Boolean).join(", "),
        city: c.city,
        score: c.aiStatus === "hot" ? 85 : c.aiStatus === "warm" ? 60 : 35,
        intent: "AI Import",
        callCount: 0,
        assignedAgent: "Unassigned",
        campaignSource: "AI Contact Import",
        lastContact: new Date().toISOString().split("T")[0],
        followUpDate: new Date(Date.now() + 7 * 86400000)
          .toISOString()
          .split("T")[0],
        notes: `Imported via AI Contact Import. Designation: ${c.designation}. Industry: ${c.industry}.`,
      }));
    onImport(toImport);
    if (toImport.length > 0) {
      toast.success(
        `${toImport.length} lead${toImport.length !== 1 ? "s" : ""} routed to Enterprise Heads`,
        { duration: 5000 },
      );
    }
    handleClose();
  };

  const setFilter = (key: keyof FilterState, val: string) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const uniqueValues = (field: keyof ImportedContact) =>
    [...new Set(contacts.map((c) => String(c[field])).filter(Boolean))].slice(
      0,
      20,
    );

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-label="Import Contacts Modal"
        >
          <div
            className="bg-popover border border-primary/30 rounded-md shadow-2xl w-full max-w-6xl flex flex-col"
            style={{ height: "85vh" }}
            data-ocid="import-contacts-modal"
          >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="modal-header flex-shrink-0">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary flex-shrink-0" />
                  <Dialog.Title className="text-sm font-bold text-foreground font-display tracking-tight">
                    Import Contacts for GenAI Outreach
                  </Dialog.Title>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${step === 1 ? "text-primary" : "text-muted-foreground"}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      1
                    </span>
                    Input Data
                  </div>
                  <div className="flex-1 h-px bg-border max-w-16" />
                  <div
                    className={`flex items-center gap-1.5 text-xs font-medium ${step === 2 ? "text-primary" : "text-muted-foreground"}`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      2
                    </span>
                    Preview &amp; Filter
                  </div>
                </div>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  aria-label="Close modal"
                  data-ocid="import-modal-close"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* ── Body ───────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {step === 1 ? (
                <div className="flex flex-col gap-4 p-5 flex-1 overflow-y-auto">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("csv")}
                      className={`input-tab flex items-center gap-2 ${activeTab === "csv" ? "input-tab-active" : "input-tab-inactive"}`}
                      data-ocid="tab-csv"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      CSV Drag &amp; Drop
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("paste")}
                      className={`input-tab flex items-center gap-2 ${activeTab === "paste" ? "input-tab-active" : "input-tab-inactive"}`}
                      data-ocid="tab-paste"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Text Paste
                    </button>
                  </div>

                  {activeTab === "csv" ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        className={`dragdrop-zone w-full ${isDragOver ? "active" : ""}`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Drop CSV file here or click to browse"
                        data-ocid="csv-dropzone"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files?.[0] && handleFile(e.target.files[0])
                          }
                          data-ocid="csv-file-input"
                        />
                        <Upload className="w-8 h-8 text-primary/60 mx-auto mb-3" />
                        {fileName ? (
                          <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-semibold text-foreground">
                              {fileName}
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="text-sm font-semibold text-foreground mb-1">
                              Drag &amp; Drop CSV File
                            </div>
                            <div className="text-xs text-muted-foreground">
                              or{" "}
                              <span className="text-primary underline underline-offset-2 cursor-pointer">
                                browse computer
                              </span>
                            </div>
                          </>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Ensure headers: Name, Email, Phone, Company,
                          Designation, Industry, Country, State, City
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSample(!showSample)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                          data-ocid="sample-csv-toggle"
                        >
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${showSample ? "rotate-180" : ""}`}
                          />
                          {showSample ? "Hide" : "View"} sample CSV format
                        </button>
                        {fileName && (
                          <button
                            type="button"
                            onClick={() => {
                              setFileName(null);
                              setContacts([]);
                              setStep(1);
                              if (fileInputRef.current)
                                fileInputRef.current.value = "";
                            }}
                            className="text-xs text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1"
                            data-ocid="clear-file-btn"
                          >
                            <X className="w-3 h-3" /> Clear file
                          </button>
                        )}
                      </div>
                      {showSample && (
                        <pre className="bg-muted/40 border border-border rounded p-3 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre">
                          {SAMPLE_CSV}
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs text-muted-foreground">
                        Paste contact data — one per line, comma or tab
                        separated. Format: Name, Email, Phone, Company,
                        Designation, Industry, Country, State, City
                      </div>
                      <textarea
                        value={pasteText}
                        onChange={(e) => setPasteText(e.target.value)}
                        placeholder="Sarah Chen,sarah.chen@nexatech.io,+1-555-0192,NexaTech Solutions,CEO,Technology,USA,California,San Francisco&#10;Marcus Webb,marcus.webb@finvault.com,+1-555-0234,FinVault Corp,CFO,Finance,USA,New York,New York City"
                        rows={12}
                        className="w-full bg-background border border-input rounded p-3 text-xs font-mono text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                        data-ocid="paste-text-input"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {pasteText.trim()
                            ? `~${
                                pasteText
                                  .trim()
                                  .split("\n")
                                  .filter((l) => l.trim()).length
                              } lines detected`
                            : "No data pasted"}
                        </span>
                        {pasteText && (
                          <button
                            type="button"
                            onClick={() => setPasteText("")}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Clear
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Preview & Filter */
                <div className="flex flex-1 min-h-0 overflow-hidden">
                  {/* Filter Sidebar */}
                  <div
                    className="w-52 flex-shrink-0 border-r border-border bg-card/60 p-3 overflow-y-auto"
                    data-ocid="import-filter-sidebar"
                  >
                    {/* Filters heading with active badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-foreground uppercase tracking-widest">
                        Filters
                      </span>
                      {activeFilterCount > 0 && (
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold"
                          title={`${activeFilterCount} active filter${activeFilterCount !== 1 ? "s" : ""}`}
                          data-ocid="active-filter-count-badge"
                        >
                          {activeFilterCount}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="mb-3 p-2 bg-muted/40 rounded space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Total parsed
                        </span>
                        <span className="font-semibold text-foreground">
                          {contacts.length}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          Duplicates
                        </span>
                        <span className="font-semibold text-destructive">
                          {duplicateCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          New contacts
                        </span>
                        <span className="font-semibold text-emerald-400">
                          {contacts.length - duplicateCount}
                        </span>
                      </div>
                      {filteredContacts.length !== contacts.length && (
                        <div className="flex justify-between text-xs border-t border-border pt-1 mt-1">
                          <span className="text-muted-foreground">
                            Filtered
                          </span>
                          <span className="font-semibold text-primary">
                            {filteredContacts.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {(
                      [
                        "name",
                        "company",
                        "designation",
                        "industry",
                        "country",
                        "state",
                        "city",
                      ] as (keyof FilterState)[]
                    ).map((field) => (
                      <div key={field} className="space-y-1 mb-2">
                        <label
                          htmlFor={`filter-input-${field}`}
                          className="filter-label"
                        >
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        {["country", "state", "city", "industry"].includes(
                          field,
                        ) &&
                        uniqueValues(field as keyof ImportedContact).length >
                          0 ? (
                          <select
                            id={`filter-input-${field}`}
                            value={filters[field]}
                            onChange={(e) => setFilter(field, e.target.value)}
                            className="filter-input"
                            data-ocid={`filter-${field}`}
                          >
                            <option value="">All</option>
                            {uniqueValues(field as keyof ImportedContact).map(
                              (v) => (
                                <option key={v} value={v}>
                                  {v}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          <input
                            id={`filter-input-${field}`}
                            type="text"
                            value={filters[field]}
                            onChange={(e) => setFilter(field, e.target.value)}
                            placeholder={`Filter by ${field}…`}
                            className="filter-input"
                            data-ocid={`filter-${field}`}
                          />
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        setFilters({
                          country: "",
                          state: "",
                          city: "",
                          company: "",
                          designation: "",
                          name: "",
                          industry: "",
                        })
                      }
                      className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1 rounded hover:bg-muted"
                      data-ocid="clear-filters-btn"
                    >
                      Clear all filters
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border bg-card/40 flex items-center justify-between flex-shrink-0">
                      <div className="text-xs font-semibold text-foreground">
                        Contact Preview
                        <span className="ml-2 text-muted-foreground font-normal">
                          ({filteredContacts.length} contacts
                          {filteredContacts.length !== contacts.length
                            ? ` of ${contacts.length}`
                            : ""}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Bot className="w-3.5 h-3.5 text-primary" />
                          AI Status applied
                        </div>
                        {duplicateCount > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-destructive">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {duplicateCount} duplicate
                            {duplicateCount !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Routing Preview */}
                    {selectedContacts.filter((c) => !c.isDuplicate).length >
                      0 &&
                      (() => {
                        const routingGroups: Partial<
                          Record<
                            LeadRegion,
                            { count: number; headName: string }
                          >
                        > = {};
                        for (const c of selectedContacts.filter(
                          (c) => !c.isDuplicate,
                        )) {
                          const region = detectRegion({
                            company: c.company,
                            location: [c.city, c.state]
                              .filter(Boolean)
                              .join(", "),
                            city: c.city,
                          });
                          const head = ENTERPRISE_HEADS.find(
                            (h) => h.region === region,
                          );
                          if (!routingGroups[region]) {
                            routingGroups[region] = {
                              count: 0,
                              headName: head?.headName ?? "Unknown",
                            };
                          }
                          routingGroups[region]!.count += 1;
                        }
                        const entries = Object.entries(routingGroups) as Array<
                          [LeadRegion, { count: number; headName: string }]
                        >;
                        if (entries.length === 0) return null;
                        return (
                          <div
                            className="mx-3 my-2 p-2.5 bg-primary/5 border border-primary/20 rounded flex-shrink-0"
                            data-ocid="routing-preview-section"
                          >
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-2">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              Routing Preview —{" "}
                              {entries.reduce((a, [, v]) => a + v.count, 0)}{" "}
                              leads will be routed
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {entries.map(([region, data]) => (
                                <span
                                  key={region}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-card border border-border rounded text-xs"
                                >
                                  <span className="font-semibold text-foreground">
                                    {region}
                                  </span>
                                  <span className="text-muted-foreground">
                                    → {data.headName}
                                  </span>
                                  <span className="ml-1 px-1 bg-primary/15 text-primary rounded font-bold">
                                    {data.count}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}

                    <div className="flex-1 overflow-auto">
                      <table className="contact-table w-full">
                        <thead className="sticky top-0 bg-muted/60 z-10">
                          <tr>
                            <th className="px-3 py-2 text-left w-8">
                              <input
                                type="checkbox"
                                className="filter-checkbox w-3.5 h-3.5"
                                checked={allVisibleNonDupSelected}
                                onChange={(e) => toggleAll(e.target.checked)}
                                aria-label="Select all visible non-duplicate contacts"
                                data-ocid="select-all-import"
                              />
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              Name
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              Email
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              Phone
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                              Company
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">
                              Designation
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                              Location
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              AI Status
                            </th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                              Dup.
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredContacts.map((c) => (
                            <tr
                              key={c.id}
                              className={`contact-row ${c.isDuplicate ? "duplicate-row" : ""}`}
                              data-ocid={`import-row-${c.id}`}
                            >
                              <td className="contact-cell px-3">
                                <input
                                  type="checkbox"
                                  className="filter-checkbox w-3.5 h-3.5"
                                  checked={c.selected}
                                  disabled={c.isDuplicate}
                                  onChange={() => toggleContact(c.id)}
                                  aria-label={`Select ${c.name}`}
                                  data-ocid={`import-checkbox-${c.id}`}
                                />
                              </td>
                              <td className="contact-cell">
                                <div className="font-semibold text-foreground truncate max-w-32">
                                  {c.name || (
                                    <span className="text-muted-foreground italic">
                                      —
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="contact-cell">
                                <span className="text-muted-foreground truncate max-w-40 block">
                                  {c.email || "—"}
                                </span>
                              </td>
                              <td className="contact-cell">
                                <span className="font-mono text-foreground whitespace-nowrap">
                                  {c.phone || "—"}
                                </span>
                              </td>
                              <td className="contact-cell hidden lg:table-cell">
                                <span className="truncate max-w-32 block">
                                  {c.company || "—"}
                                </span>
                              </td>
                              <td className="contact-cell hidden xl:table-cell">
                                <span className="truncate max-w-32 block text-muted-foreground">
                                  {c.designation || "—"}
                                </span>
                              </td>
                              <td className="contact-cell hidden lg:table-cell">
                                <span className="text-muted-foreground whitespace-nowrap">
                                  {[c.city, c.state, c.country]
                                    .filter(Boolean)
                                    .join(", ") || "—"}
                                </span>
                              </td>
                              <td className="contact-cell">
                                <StatusBadge status={c.aiStatus} />
                              </td>
                              <td className="contact-cell">
                                {c.isDuplicate ? (
                                  <span className="duplicate-badge">
                                    <AlertTriangle className="w-3 h-3" />
                                    {c.duplicateType === "both"
                                      ? "Email+Phone"
                                      : c.duplicateType === "email"
                                        ? "Email"
                                        : "Phone"}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                          {filteredContacts.length === 0 && (
                            <tr>
                              <td
                                colSpan={9}
                                className="py-10 text-center text-muted-foreground text-xs"
                              >
                                No contacts match the current filters.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer / Action Bar ────────────────────────────────────── */}
            <div className="flex-shrink-0 border-t border-border bg-card/60">
              {/* Bulk Action Bar — shown when contacts are selected in step 2 */}
              {step === 2 && totalSelected > 0 && (
                <div
                  className="px-4 py-2.5 border-b border-border flex items-center gap-3 flex-wrap"
                  style={{ background: "oklch(0.18 0.01 260)" }}
                  data-ocid="bulk-action-bar"
                >
                  <span className="text-xs font-semibold text-foreground">
                    <span className="text-primary">{totalSelected}</span>{" "}
                    contact{totalSelected !== 1 ? "s" : ""} selected
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    {followUpScheduled && (
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded"
                        data-ocid="followup-scheduled-badge"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Follow-up scheduled · {followUpScheduled.agent}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 bg-primary hover:bg-primary/80 text-primary-foreground px-3 py-1.5 rounded-sm text-xs font-semibold transition-smooth"
                      data-ocid="export-csv-btn"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export CSV
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowScheduler(true)}
                      className="flex items-center gap-1.5 bg-accent hover:bg-accent/80 text-accent-foreground px-3 py-1.5 rounded-sm text-xs font-semibold transition-smooth"
                      data-ocid="schedule-followup-btn"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Schedule Follow-up
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Footer */}
              <div className="px-4 py-3 flex items-center justify-between gap-4">
                {step === 1 ? (
                  <>
                    <div className="text-xs text-muted-foreground">
                      Upload a CSV or paste contact data to get started. AI will
                      auto-suggest Hot / Warm / Cold status.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="btn-cancel"
                        data-ocid="import-cancel-btn"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={
                          activeTab === "csv" ? !fileName : !pasteText.trim()
                        }
                        className="btn-import disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        data-ocid="analyze-preview-btn"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        Analyze and Preview
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setContacts([]);
                          setFollowUpScheduled(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        data-ocid="back-to-input-btn"
                      >
                        ← Back to Input
                      </button>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        <span className="font-semibold text-foreground">
                          {totalSelected}
                        </span>{" "}
                        contacts selected
                        {duplicateCount > 0 && (
                          <span className="ml-2 text-destructive">
                            {duplicateCount} duplicates skipped
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="btn-cancel"
                        data-ocid="import-cancel-btn-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleImport}
                        disabled={totalSelected === 0}
                        className="btn-import disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        data-ocid="confirm-import-btn"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Import {totalSelected} Contact
                        {totalSelected !== 1 ? "s" : ""}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Follow-up Scheduler Overlay ───────────────────────────────── */}
          {showScheduler && (
            <FollowUpScheduler
              selectedCount={totalSelected}
              onConfirm={handleScheduleConfirm}
              onCancel={() => setShowScheduler(false)}
            />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
