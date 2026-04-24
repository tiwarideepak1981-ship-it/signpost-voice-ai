import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Check,
  Clock,
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  Key,
  Link,
  Moon,
  Phone,
  Plus,
  Route,
  Settings,
  Trash2,
  Webhook,
  Zap,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}
interface Intent {
  id: string;
  name: string;
  script: string;
}
interface RoutingRule {
  id: string;
  condition: string;
  action: string;
  priority: "High" | "Medium" | "Low";
  active: boolean;
}

// ─── Initial Data ─────────────────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type Day = (typeof DAYS)[number];

const DEFAULT_SCHEDULE: Record<Day, DaySchedule> = {
  Mon: { enabled: true, start: "09:00", end: "19:00" },
  Tue: { enabled: true, start: "09:00", end: "19:00" },
  Wed: { enabled: true, start: "09:00", end: "19:00" },
  Thu: { enabled: true, start: "09:00", end: "19:00" },
  Fri: { enabled: true, start: "09:00", end: "19:00" },
  Sat: { enabled: true, start: "10:00", end: "14:00" },
  Sun: { enabled: false, start: "10:00", end: "14:00" },
};

const INITIAL_INTENTS: Intent[] = [
  {
    id: "i1",
    name: "FAQ",
    script: "Thank you for calling Signpost India. How can I assist you today?",
  },
  {
    id: "i2",
    name: "Pricing",
    script:
      "I'd be happy to explain our pricing. We offer plans starting at ₹10,000/month...",
  },
  {
    id: "i3",
    name: "Service Inquiry",
    script:
      "Let me explain our GenAI Voice Automation services and how they can help your business...",
  },
  {
    id: "i4",
    name: "Support",
    script: "I'll connect you with our support team right away...",
  },
  {
    id: "i5",
    name: "Appointment",
    script:
      "I can help you schedule a demo with our team. What date works best for you?",
  },
  {
    id: "i6",
    name: "Default / Fallback",
    script:
      "I'm sorry, I didn't understand that. Let me connect you with an agent.",
  },
];

const INITIAL_RULES: RoutingRule[] = [
  {
    id: "r1",
    condition: "Intent = Pricing AND Confidence > 80%",
    action: "Transfer to Sales Team",
    priority: "High",
    active: true,
  },
  {
    id: "r2",
    condition: "Call Duration > 5 min",
    action: "Transfer to Senior Agent",
    priority: "Medium",
    active: true,
  },
  {
    id: "r3",
    condition: "Intent = Support",
    action: "Transfer to Support Queue",
    priority: "High",
    active: true,
  },
  {
    id: "r4",
    condition: "Unknown Intent AND Confidence < 60%",
    action: "Transfer to Any Available Agent",
    priority: "Low",
    active: false,
  },
];

const TIMEZONES = [
  "Asia/Kolkata (IST, UTC+5:30)",
  "Asia/Dubai (GST, UTC+4:00)",
  "Asia/Singapore (SGT, UTC+8:00)",
  "Europe/London (GMT/BST)",
  "America/New_York (EST/EDT)",
  "America/Los_Angeles (PST/PDT)",
  "America/Chicago (CST/CDT)",
  "Pacific/Auckland (NZST, UTC+12:00)",
  "Asia/Tokyo (JST, UTC+9:00)",
  "Europe/Berlin (CET/CEST)",
];

// ─── Helper Components ────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-primary" />
      </div>
      <div>
        <h2 className="text-sm font-bold font-display text-foreground">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: RoutingRule["priority"] }) {
  const cls =
    priority === "High"
      ? "status-error"
      : priority === "Medium"
        ? "status-warning"
        : "status-info";
  return <span className={cls}>{priority}</span>;
}

function mockSave(label?: string) {
  toast.success(label ?? "Changes saved", {
    description: "Your settings have been updated successfully.",
    duration: 3000,
  });
}

// ─── Tab: Business Hours ──────────────────────────────────────────────────────
function BusinessHoursTab() {
  const [timezone, setTimezone] = useState(TIMEZONES[0]);
  const [schedule, setSchedule] = useState<Record<Day, DaySchedule>>(
    structuredClone(DEFAULT_SCHEDULE),
  );

  function toggle(day: Day) {
    setSchedule((s) => ({
      ...s,
      [day]: { ...s[day], enabled: !s[day].enabled },
    }));
  }
  function setTime(day: Day, field: "start" | "end", val: string) {
    setSchedule((s) => ({ ...s, [day]: { ...s[day], [field]: val } }));
  }
  function reset() {
    setSchedule(structuredClone(DEFAULT_SCHEDULE));
    toast.info("Schedule reset to defaults");
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Clock}
        title="Business Hours"
        subtitle="Configure operating hours for your GenAI voice agents."
      />

      {/* Timezone */}
      <div className="bg-card border border-border rounded-md p-4 space-y-3">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Time Zone
        </Label>
        <select
          data-ocid="settings-timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-xs text-xs bg-popover border border-input rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>

      {/* Day schedule grid */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="grid grid-cols-[80px_48px_1fr_1fr] items-center gap-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-4 py-2 border-b border-border bg-muted/30">
          <span>Day</span>
          <span>On</span>
          <span>Start</span>
          <span>End</span>
        </div>
        {DAYS.map((day) => {
          const row = schedule[day];
          return (
            <div
              key={day}
              className="grid grid-cols-[80px_48px_1fr_1fr] items-center gap-0 px-4 py-2.5 border-b border-border last:border-0 hover:bg-muted/10 transition-smooth"
            >
              <span
                className={`text-xs font-semibold ${row.enabled ? "text-foreground" : "text-muted-foreground"}`}
              >
                {day}
              </span>
              <Switch
                data-ocid={`settings-biz-toggle-${day.toLowerCase()}`}
                checked={row.enabled}
                onCheckedChange={() => toggle(day)}
                className="scale-75"
              />
              <input
                type="time"
                value={row.start}
                disabled={!row.enabled}
                onChange={(e) => setTime(day, "start", e.target.value)}
                data-ocid={`settings-biz-start-${day.toLowerCase()}`}
                className="w-24 text-xs bg-popover border border-input rounded px-2 py-1 text-foreground disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <input
                type="time"
                value={row.end}
                disabled={!row.enabled}
                onChange={(e) => setTime(day, "end", e.target.value)}
                data-ocid={`settings-biz-end-${day.toLowerCase()}`}
                className="w-24 text-xs bg-popover border border-input rounded px-2 py-1 text-foreground disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          data-ocid="settings-biz-save"
          onClick={() => mockSave("Business hours saved")}
          className="text-xs"
        >
          <Check size={12} className="mr-1.5" />
          Save Changes
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid="settings-biz-reset"
          onClick={reset}
          className="text-xs"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}

// ─── Tab: Bot Scripts & Intents ───────────────────────────────────────────────
function BotScriptsTab() {
  const [intents, setIntents] = useState<Intent[]>(INITIAL_INTENTS);
  const [threshold, setThreshold] = useState(70);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editScript, setEditScript] = useState("");
  const [editName, setEditName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScript, setNewScript] = useState("");

  function startEdit(intent: Intent) {
    setEditingId(intent.id);
    setEditName(intent.name);
    setEditScript(intent.script);
    setShowAdd(false);
  }
  function saveEdit() {
    setIntents((prev) =>
      prev.map((i) =>
        i.id === editingId ? { ...i, name: editName, script: editScript } : i,
      ),
    );
    setEditingId(null);
    toast.success("Intent updated");
  }
  function deleteIntent(id: string) {
    setIntents((prev) => prev.filter((i) => i.id !== id));
    toast.info("Intent removed");
  }
  function addIntent() {
    if (!newName.trim() || !newScript.trim()) return;
    setIntents((prev) => [
      ...prev,
      { id: `i${Date.now()}`, name: newName, script: newScript },
    ]);
    setNewName("");
    setNewScript("");
    setShowAdd(false);
    toast.success("Intent added");
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Zap}
        title="Bot Scripts & Intents"
        subtitle="Manage conversation scripts and confidence escalation threshold."
      />

      {/* Intent cards */}
      <div className="space-y-2">
        {intents.map((intent) => (
          <div
            key={intent.id}
            className="bg-card border border-border rounded-md p-3"
          >
            {editingId === intent.id ? (
              <div className="space-y-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  data-ocid={`settings-intent-name-${intent.id}`}
                  className="text-xs h-7"
                  placeholder="Intent name"
                />
                <Textarea
                  value={editScript}
                  onChange={(e) => setEditScript(e.target.value)}
                  data-ocid={`settings-intent-script-${intent.id}`}
                  className="text-xs min-h-[60px] resize-none"
                  placeholder="Script text..."
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveEdit}
                    data-ocid="settings-intent-save-edit"
                    className="text-xs h-6"
                  >
                    <Check size={11} className="mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="text-xs h-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold font-display text-foreground">
                      {intent.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      intent
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {intent.script.length > 80
                      ? `${intent.script.slice(0, 80)}…`
                      : intent.script}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    aria-label="Edit intent"
                    data-ocid={`settings-intent-edit-${intent.id}`}
                    onClick={() => startEdit(intent)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete intent"
                    data-ocid={`settings-intent-delete-${intent.id}`}
                    onClick={() => deleteIntent(intent.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new intent */}
      {showAdd ? (
        <div className="bg-card border border-primary/20 rounded-md p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">New Intent</p>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            data-ocid="settings-intent-new-name"
            className="text-xs h-7"
            placeholder="Intent name (e.g. Billing)"
          />
          <Textarea
            value={newScript}
            onChange={(e) => setNewScript(e.target.value)}
            data-ocid="settings-intent-new-script"
            className="text-xs min-h-[60px] resize-none"
            placeholder="Bot response script..."
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={addIntent}
              data-ocid="settings-intent-add-confirm"
              className="text-xs h-6"
            >
              <Plus size={11} className="mr-1" />
              Add Intent
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="text-xs h-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid="settings-intent-add-btn"
          onClick={() => setShowAdd(true)}
          className="text-xs"
        >
          <Plus size={12} className="mr-1.5" />
          Add New Intent
        </Button>
      )}

      {/* Confidence threshold */}
      <div className="bg-card border border-border rounded-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Escalation Confidence Threshold
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Escalate to human agent when bot confidence drops below this level
            </p>
          </div>
          <span className="text-sm font-bold font-display text-primary">
            {threshold}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          data-ocid="settings-confidence-threshold"
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0% — Always escalate</span>
          <span>100% — Never escalate</span>
        </div>
        <Button
          type="button"
          size="sm"
          data-ocid="settings-scripts-save"
          onClick={() => mockSave("Bot scripts saved")}
          className="text-xs"
        >
          <Check size={12} className="mr-1.5" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Tab: Agent Routing Rules ─────────────────────────────────────────────────
function RoutingRulesTab() {
  const [rules, setRules] = useState<RoutingRule[]>(INITIAL_RULES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<RoutingRule>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newRule, setNewRule] = useState({
    condition: "",
    action: "",
    priority: "Medium" as RoutingRule["priority"],
  });

  function toggleRule(id: string) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)),
    );
  }
  function startEdit(r: RoutingRule) {
    setEditingId(r.id);
    setEditData({
      condition: r.condition,
      action: r.action,
      priority: r.priority,
    });
    setShowAdd(false);
  }
  function saveEdit() {
    setRules((prev) =>
      prev.map((r) => (r.id === editingId ? { ...r, ...editData } : r)),
    );
    setEditingId(null);
    toast.success("Rule updated");
  }
  function deleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.info("Rule removed");
  }
  function addRule() {
    if (!newRule.condition.trim() || !newRule.action.trim()) return;
    setRules((prev) => [
      ...prev,
      { id: `r${Date.now()}`, ...newRule, active: true },
    ]);
    setNewRule({ condition: "", action: "", priority: "Medium" });
    setShowAdd(false);
    toast.success("Routing rule added");
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Route}
        title="Agent Routing Rules"
        subtitle="Define conditions that trigger automatic call transfers to human agents."
      />

      {/* Rules table */}
      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="hidden md:grid grid-cols-[32px_1fr_1fr_72px_64px_80px] items-center gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest border-b border-border bg-muted/30">
          <span>#</span>
          <span>Trigger Condition</span>
          <span>Action</span>
          <span>Priority</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>
        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className="border-b border-border last:border-0 hover:bg-muted/10 transition-smooth"
          >
            {editingId === rule.id ? (
              <div className="p-3 space-y-2">
                <Input
                  value={editData.condition ?? ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, condition: e.target.value }))
                  }
                  data-ocid={`settings-rule-cond-${rule.id}`}
                  className="text-xs h-7"
                  placeholder="Trigger condition"
                />
                <Input
                  value={editData.action ?? ""}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, action: e.target.value }))
                  }
                  data-ocid={`settings-rule-action-${rule.id}`}
                  className="text-xs h-7"
                  placeholder="Action to take"
                />
                <select
                  value={editData.priority ?? "Medium"}
                  onChange={(e) =>
                    setEditData((d) => ({
                      ...d,
                      priority: e.target.value as RoutingRule["priority"],
                    }))
                  }
                  className="text-xs bg-popover border border-input rounded px-2 py-1 text-foreground focus:outline-none"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveEdit}
                    data-ocid="settings-rule-save-edit"
                    className="text-xs h-6"
                  >
                    <Check size={11} className="mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingId(null)}
                    className="text-xs h-6"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[32px_1fr] md:grid-cols-[32px_1fr_1fr_72px_64px_80px] items-center gap-2 px-3 py-2.5">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-foreground truncate font-medium">
                    {rule.condition}
                  </p>
                  <p className="text-[11px] text-muted-foreground md:hidden mt-0.5 truncate">
                    → {rule.action}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground hidden md:block truncate">
                  {rule.action}
                </p>
                <div className="hidden md:block">
                  <PriorityBadge priority={rule.priority} />
                </div>
                <div className="hidden md:flex items-center">
                  <Switch
                    data-ocid={`settings-rule-toggle-${rule.id}`}
                    checked={rule.active}
                    onCheckedChange={() => toggleRule(rule.id)}
                    className="scale-75"
                  />
                </div>
                <div className="hidden md:flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label="Edit rule"
                    data-ocid={`settings-rule-edit-${rule.id}`}
                    onClick={() => startEdit(rule)}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete rule"
                    data-ocid={`settings-rule-delete-${rule.id}`}
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-smooth"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add rule */}
      {showAdd ? (
        <div className="bg-card border border-primary/20 rounded-md p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">New Rule</p>
          <Input
            value={newRule.condition}
            onChange={(e) =>
              setNewRule((r) => ({ ...r, condition: e.target.value }))
            }
            data-ocid="settings-rule-new-condition"
            className="text-xs h-7"
            placeholder="Trigger condition (e.g. Intent = Billing)"
          />
          <Input
            value={newRule.action}
            onChange={(e) =>
              setNewRule((r) => ({ ...r, action: e.target.value }))
            }
            data-ocid="settings-rule-new-action"
            className="text-xs h-7"
            placeholder="Action (e.g. Transfer to Billing Team)"
          />
          <select
            value={newRule.priority}
            onChange={(e) =>
              setNewRule((r) => ({
                ...r,
                priority: e.target.value as RoutingRule["priority"],
              }))
            }
            className="text-xs bg-popover border border-input rounded px-2 py-1 text-foreground focus:outline-none"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={addRule}
              data-ocid="settings-rule-add-confirm"
              className="text-xs h-6"
            >
              <Plus size={11} className="mr-1" />
              Add Rule
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowAdd(false)}
              className="text-xs h-6"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid="settings-rule-add-btn"
          onClick={() => setShowAdd(true)}
          className="text-xs"
        >
          <Plus size={12} className="mr-1.5" />
          Add Rule
        </Button>
      )}
    </div>
  );
}

// ─── Tab: System Preferences ──────────────────────────────────────────────────
function SystemPrefsTab() {
  const [businessName, setBusinessName] = useState("Signpost India");
  const [language, setLanguage] = useState("English (India)");
  const [tz, setTz] = useState(TIMEZONES[0]);
  const [darkMode, setDarkMode] = useState(true);
  const [notifs, setNotifs] = useState({
    billingThreshold: true,
    hotLead: true,
    campaignComplete: false,
    smsAlerts: false,
  });

  function toggleNotif(key: keyof typeof notifs) {
    setNotifs((n) => ({ ...n, [key]: !n[key] }));
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Settings}
        title="System Preferences"
        subtitle="General configuration for your Signpost India account."
      />

      {/* Business info */}
      <div className="bg-card border border-border rounded-md p-4 space-y-4">
        <p className="text-xs font-bold font-display text-foreground border-b border-border pb-2">
          Business Information
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Business Name
            </Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              data-ocid="settings-business-name"
              className="text-xs h-8"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Language Preference
            </Label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              data-ocid="settings-language"
              className="w-full text-xs bg-popover border border-input rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-8"
            >
              {[
                "English (India)",
                "Hindi",
                "Tamil",
                "Telugu",
                "Kannada",
                "Marathi",
                "Bengali",
                "Gujarati",
              ].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Default Timezone
            </Label>
            <select
              value={tz}
              onChange={(e) => setTz(e.target.value)}
              data-ocid="settings-default-tz"
              className="w-full text-xs bg-popover border border-input rounded px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring h-8"
            >
              {TIMEZONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="bg-card border border-border rounded-md p-4 space-y-3">
        <p className="text-xs font-bold font-display text-foreground border-b border-border pb-2">
          Notification Preferences
        </p>
        {(
          [
            {
              key: "billingThreshold",
              label: "Billing Threshold Alert",
              desc: "Email alert when usage reaches 80% of plan limit",
            },
            {
              key: "hotLead",
              label: "New Hot Lead",
              desc: "Notify when a lead crosses score threshold of 80",
            },
            {
              key: "campaignComplete",
              label: "Campaign Completion",
              desc: "Email summary when a campaign finishes all calls",
            },
            {
              key: "smsAlerts",
              label: "SMS Critical Alerts",
              desc: "SMS for system-critical events (downtime, failures)",
            },
          ] as const
        ).map(({ key, label, desc }) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 py-1.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">{label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
            </div>
            <Switch
              data-ocid={`settings-notif-${key}`}
              checked={notifs[key]}
              onCheckedChange={() => toggleNotif(key)}
              className="scale-75 shrink-0"
            />
          </div>
        ))}
      </div>

      {/* Theme */}
      <div className="bg-card border border-border rounded-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon size={14} className="text-primary" />
            <div>
              <p className="text-xs font-semibold text-foreground">Dark Mode</p>
              <p className="text-[11px] text-muted-foreground">
                Professional dark theme — currently active
              </p>
            </div>
          </div>
          <Switch
            data-ocid="settings-dark-mode"
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="scale-75"
          />
        </div>
      </div>

      <Button
        type="button"
        size="sm"
        data-ocid="settings-prefs-save"
        onClick={() => mockSave("Preferences saved")}
        className="text-xs"
      >
        <Check size={12} className="mr-1.5" />
        Save Changes
      </Button>
    </div>
  );
}

// ─── Tab: API Integrations ────────────────────────────────────────────────────
function ApiIntegrationsTab() {
  const [revealed, setRevealed] = useState(false);
  const apiKey = "sk-signpost-prod-a8f2d9e1c4b3f7a2d5e8c1b4f7a2d5e8";
  const webhookUrl = "https://api.signpostindia.ai/webhooks/voice/v2/events";
  const maskedKey = `sk-signpost-prod-${"•".repeat(24)}`;
  const copyRef = useRef<HTMLTextAreaElement>(null);

  const copyText = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    });
  }, []);

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={Key}
        title="API Integrations"
        subtitle="Manage API credentials and webhook endpoints (read-only)."
      />

      {/* API Key */}
      <div className="bg-card border border-border rounded-md p-4 space-y-3">
        <p className="text-xs font-bold font-display text-foreground border-b border-border pb-2">
          API Key
        </p>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 min-w-0 text-xs font-mono bg-popover border border-input rounded px-3 py-1.5 text-foreground truncate"
            data-ocid="settings-api-key-display"
          >
            {revealed ? apiKey : maskedKey}
          </code>
          <button
            type="button"
            aria-label={revealed ? "Hide API key" : "Reveal API key"}
            data-ocid="settings-api-key-reveal"
            onClick={() => setRevealed((r) => !r)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth shrink-0"
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            type="button"
            aria-label="Copy API key"
            data-ocid="settings-api-key-copy"
            onClick={() => copyText(apiKey, "API key")}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth shrink-0"
          >
            <Copy size={13} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle size={11} className="text-accent shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            Keep this key confidential. Rotate immediately if compromised.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          data-ocid="settings-api-key-request"
          onClick={() =>
            toast.info(
              "New API key request submitted. You'll receive confirmation via email.",
            )
          }
          className="text-xs"
        >
          <Key size={12} className="mr-1.5" />
          Request New API Key
        </Button>
      </div>

      {/* Webhook URL */}
      <div className="bg-card border border-border rounded-md p-4 space-y-3">
        <p className="text-xs font-bold font-display text-foreground border-b border-border pb-2">
          Webhook URL
        </p>
        <div className="flex items-center gap-2">
          <code
            className="flex-1 min-w-0 text-xs font-mono bg-popover border border-input rounded px-3 py-1.5 text-foreground truncate"
            data-ocid="settings-webhook-url"
          >
            {webhookUrl}
          </code>
          <button
            type="button"
            aria-label="Copy webhook URL"
            data-ocid="settings-webhook-copy"
            onClick={() => copyText(webhookUrl, "Webhook URL")}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-smooth shrink-0"
          >
            <Copy size={13} />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Register this URL in your CRM or third-party tool to receive call
          events in real time.
        </p>
      </div>

      {/* CRM Integration status */}
      <div className="bg-card border border-border rounded-md p-4 space-y-3">
        <p className="text-xs font-bold font-display text-foreground border-b border-border pb-2">
          CRM Integrations
        </p>
        <div className="space-y-2">
          {[
            { name: "Salesforce CRM", status: "connected", icon: Link },
            { name: "HubSpot", status: "connected", icon: Link },
            { name: "Zoho CRM", status: "disconnected", icon: Link },
            { name: "Freshsales", status: "disconnected", icon: Link },
          ].map(({ name, status, icon: Icon }) => (
            <div
              key={name}
              className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <Icon size={12} className="text-muted-foreground" />
                <span className="text-xs text-foreground">{name}</span>
              </div>
              <span
                className={
                  status === "connected" ? "status-success" : "status-error"
                }
              >
                {status === "connected" ? "Connected" : "Disconnected"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden textarea for clipboard fallback */}
      <textarea ref={copyRef} className="sr-only" readOnly />
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────
export default function SettingsPage() {
  return (
    <div className="p-4 space-y-4" data-ocid="settings-page">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Settings size={13} className="text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold font-display text-foreground leading-none">
            Settings
          </h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Configure business hours, bot scripts, routing rules, and API
            credentials.
          </p>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Tabs defaultValue="hours" data-ocid="settings-tabs">
        <TabsList className="h-8 bg-muted/50 border border-border mb-4">
          <TabsTrigger
            value="hours"
            data-ocid="settings-tab-hours"
            className="text-xs h-6 px-3"
          >
            <Clock size={11} className="mr-1.5" />
            Business Hours
          </TabsTrigger>
          <TabsTrigger
            value="scripts"
            data-ocid="settings-tab-scripts"
            className="text-xs h-6 px-3"
          >
            <Zap size={11} className="mr-1.5" />
            Bot Scripts
          </TabsTrigger>
          <TabsTrigger
            value="routing"
            data-ocid="settings-tab-routing"
            className="text-xs h-6 px-3"
          >
            <Route size={11} className="mr-1.5" />
            Routing Rules
          </TabsTrigger>
          <TabsTrigger
            value="prefs"
            data-ocid="settings-tab-prefs"
            className="text-xs h-6 px-3"
          >
            <Globe size={11} className="mr-1.5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="api"
            data-ocid="settings-tab-api"
            className="text-xs h-6 px-3"
          >
            <Webhook size={11} className="mr-1.5" />
            API
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <BusinessHoursTab />
        </TabsContent>
        <TabsContent value="scripts">
          <BotScriptsTab />
        </TabsContent>
        <TabsContent value="routing">
          <RoutingRulesTab />
        </TabsContent>
        <TabsContent value="prefs">
          <SystemPrefsTab />
        </TabsContent>
        <TabsContent value="api">
          <ApiIntegrationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
