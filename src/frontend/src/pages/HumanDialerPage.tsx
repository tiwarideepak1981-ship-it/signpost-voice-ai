import LeadEntryForm from "@/components/LeadEntryForm";
/**
 * HumanDialerPage — Phone Dialer for human agents.
 *
 * ARCHITECTURE RULES (prevent React #185 infinite loop):
 * 1. Every Zustand value is selected with an INDIVIDUAL primitive selector.
 * 2. All child components (DialpadPanel, InCallPanel, IncomingBanner, HistoryPanel)
 *    are defined OUTSIDE this component and receive only primitive props + stable actions.
 * 3. useEffect for timers uses useRef for interval IDs — NEVER state.
 * 4. Incoming call simulation uses a single useEffect([]) with a useRef interval.
 * 5. Call timer: counts in a ref, updates displayed string state once/second.
 * 6. NO callbacks passed as props — child components import actions from the store directly.
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHumanDialerStore } from "@/store/humanDialerStore";
import type { HumanCallHistoryEntry } from "@/store/humanDialerStore";
import { leadsStore } from "@/store/leadsStore";
import type { Lead } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Delete,
  Grid3X3,
  Mic,
  MicOff,
  PauseCircle,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function fmtTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const FAKE_CALLERS = [
  { phone: "+91 98765 43210", name: "Rajesh Mehta", company: "InfoSys Ltd" },
  { phone: "+91 80123 45678", name: "Priya Sharma", company: "TCS Solutions" },
  { phone: "+91 70987 65432", name: "Arjun Patel", company: "Wipro Tech" },
  { phone: "+91 99001 12233", name: "Sunita Reddy", company: "HCL Systems" },
  { phone: "8291190000", name: "Marketing Line", company: "Signpost India" },
];

// ─── Dialpad ──────────────────────────────────────────────────────────────────

const KEYS: string[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "*",
  "0",
  "#",
];

interface DialpadPanelProps {
  dialedNumber: string;
  onDigit: (d: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onCall: () => void;
  disabled: boolean;
}

function DialpadPanel({
  dialedNumber,
  onDigit,
  onBackspace,
  onClear,
  onCall,
  disabled,
}: DialpadPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Number display */}
      <div className="flex items-center gap-2 bg-muted/30 border border-border rounded-lg px-4 py-3">
        <span className="flex-1 text-xl font-mono font-semibold text-foreground tracking-widest min-w-0 truncate">
          {dialedNumber || (
            <span className="text-muted-foreground text-base font-normal">
              Enter number...
            </span>
          )}
        </span>
        {dialedNumber && (
          <button
            type="button"
            onClick={onBackspace}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            aria-label="Backspace"
            data-ocid="dialer.backspace_button"
          >
            <Delete size={16} />
          </button>
        )}
        {dialedNumber.length > 1 && (
          <button
            type="button"
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            aria-label="Clear"
            data-ocid="dialer.clear_button"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Keys grid */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onDigit(key)}
            data-ocid={`dialer.key_${key}`}
            className="h-12 rounded-lg bg-muted/40 hover:bg-muted border border-border text-foreground font-semibold text-lg transition-colors select-none active:scale-95"
          >
            {key}
          </button>
        ))}
      </div>

      {/* Call button */}
      <Button
        onClick={onCall}
        disabled={disabled || !dialedNumber.trim()}
        data-ocid="dialer.call_button"
        className="h-12 text-base font-semibold bg-green-600 hover:bg-green-500 text-white border-0 disabled:opacity-40"
      >
        <Phone size={18} className="mr-2" />
        Call
      </Button>
    </div>
  );
}

// ─── In-Call Panel ────────────────────────────────────────────────────────────

interface InCallPanelProps {
  phone: string;
  name: string;
  company: string;
  callState: "ringing" | "connected";
  displayTime: string;
  muteActive: boolean;
  holdActive: boolean;
  showDtmf: boolean;
  onToggleDtmf: () => void;
  onMute: () => void;
  onHold: () => void;
  onEnd: () => void;
}

function InCallPanel({
  phone,
  name,
  company,
  callState,
  displayTime,
  muteActive,
  holdActive,
  showDtmf,
  onToggleDtmf,
  onMute,
  onHold,
  onEnd,
}: InCallPanelProps) {
  // Internal store access for DTMF digit append — direct, no prop drilling
  const appendDialedDigit = useHumanDialerStore((s) => s.appendDialedDigit);

  return (
    <div className="flex flex-col gap-4" data-ocid="dialer.incall_panel">
      {/* Caller info */}
      <div className="text-center py-4 border border-border rounded-xl bg-muted/20">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
          <Phone size={22} className="text-primary" />
        </div>
        <p className="text-lg font-bold text-foreground">{name}</p>
        {company && <p className="text-xs text-muted-foreground">{company}</p>}
        <p className="text-sm text-muted-foreground font-mono mt-1">{phone}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge
            className={
              callState === "connected"
                ? "bg-green-600/20 text-green-400 border-green-600/30"
                : "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
            }
          >
            {callState === "connected"
              ? `On Call • ${displayTime}`
              : "Connecting..."}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onMute}
          data-ocid="dialer.mute_toggle"
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
            muteActive
              ? "bg-orange-600/20 border-orange-500/40 text-orange-400"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {muteActive ? <MicOff size={18} /> : <Mic size={18} />}
          <span className="text-[10px] font-medium">
            {muteActive ? "Unmute" : "Mute"}
          </span>
        </button>

        <button
          type="button"
          onClick={onHold}
          data-ocid="dialer.hold_toggle"
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
            holdActive
              ? "bg-yellow-600/20 border-yellow-500/40 text-yellow-400"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <PauseCircle size={18} />
          <span className="text-[10px] font-medium">
            {holdActive ? "Resume" : "Hold"}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleDtmf}
          data-ocid="dialer.dtmf_toggle"
          className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-colors ${
            showDtmf
              ? "bg-primary/20 border-primary/40 text-primary"
              : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          <Grid3X3 size={18} />
          <span className="text-[10px] font-medium">Keypad</span>
        </button>
      </div>

      {/* DTMF mini keypad */}
      {showDtmf && (
        <div className="grid grid-cols-3 gap-1.5 p-3 bg-muted/20 rounded-lg border border-border">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => appendDialedDigit(key)}
              data-ocid={`dialer.dtmf_${key}`}
              className="h-9 rounded bg-muted/50 hover:bg-muted border border-border text-foreground font-semibold text-sm transition-colors"
            >
              {key}
            </button>
          ))}
        </div>
      )}

      {/* End Call */}
      <Button
        onClick={onEnd}
        data-ocid="dialer.end_call_button"
        className="h-12 text-base font-semibold bg-red-600 hover:bg-red-500 text-white border-0"
      >
        <PhoneOff size={18} className="mr-2" />
        End Call
      </Button>
    </div>
  );
}

// ─── Incoming Call Banner ─────────────────────────────────────────────────────

interface IncomingBannerProps {
  phone: string;
  name: string;
  company: string;
  onAccept: () => void;
  onReject: () => void;
}

function IncomingBanner({
  phone,
  name,
  company,
  onAccept,
  onReject,
}: IncomingBannerProps) {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 rounded-xl border border-green-500/40 bg-green-600/10 mb-4 animate-pulse"
      data-ocid="dialer.incoming_banner"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-green-600/30 flex items-center justify-center shrink-0">
          <PhoneIncoming size={16} className="text-green-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            Incoming Call
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {name} • {phone}
          </p>
          {company && (
            <p className="text-[10px] text-muted-foreground truncate">
              {company}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onReject}
          data-ocid="dialer.reject_button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
        >
          <PhoneOff size={14} />
          Reject
        </button>
        <button
          type="button"
          onClick={onAccept}
          data-ocid="dialer.accept_button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
        >
          <Phone size={14} />
          Accept
        </button>
      </div>
    </div>
  );
}

// ─── Call History Panel ───────────────────────────────────────────────────────

interface HistoryPanelProps {
  entries: HumanCallHistoryEntry[];
  onClear: () => void;
  convertedIds: Set<string>;
  onLogAsLead: (entry: HumanCallHistoryEntry) => void;
  onViewCrm: () => void;
}

function HistoryPanel({
  entries,
  onClear,
  convertedIds,
  onLogAsLead,
  onViewCrm,
}: HistoryPanelProps) {
  return (
    <div className="flex flex-col h-full" data-ocid="dialer.history_panel">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-semibold text-foreground">Call History</h3>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            data-ocid="dialer.clear_history_button"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center flex-1 gap-3 py-12 text-center"
          data-ocid="dialer.history_empty_state"
        >
          <Phone size={28} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No calls yet</p>
          <p className="text-xs text-muted-foreground/60">
            Your call history will appear here
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1.5 pr-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                data-ocid={`dialer.history_item.${idx + 1}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 transition-colors"
              >
                <div className="shrink-0">
                  {entry.type === "inbound" ? (
                    entry.outcome === "rejected" ||
                    entry.outcome === "missed" ? (
                      <PhoneMissed size={15} className="text-red-400" />
                    ) : (
                      <PhoneIncoming size={15} className="text-green-400" />
                    )
                  ) : (
                    <PhoneOutgoing size={15} className="text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {entry.name !== entry.phone ? entry.name : entry.phone}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {entry.phone}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {fmtTimestamp(entry.timestamp)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge
                    className={
                      entry.outcome === "completed"
                        ? "text-[9px] py-0 px-1.5 bg-green-600/15 text-green-400 border-green-600/30"
                        : entry.outcome === "rejected"
                          ? "text-[9px] py-0 px-1.5 bg-red-600/15 text-red-400 border-red-600/30"
                          : "text-[9px] py-0 px-1.5 bg-yellow-600/15 text-yellow-400 border-yellow-600/30"
                    }
                  >
                    {entry.outcome}
                  </Badge>
                  {entry.durationSecs > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {fmtDuration(entry.durationSecs)}
                    </span>
                  )}
                  {/* Log as Lead / View CRM */}
                  {convertedIds.has(entry.id) ? (
                    <button
                      type="button"
                      onClick={onViewCrm}
                      className="text-[9px] px-1.5 py-0.5 rounded border font-semibold bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                      data-ocid={`dialer.view_crm.${idx + 1}`}
                    >
                      View CRM
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onLogAsLead(entry)}
                      className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                      data-ocid={`dialer.log_as_lead.${idx + 1}`}
                    >
                      <UserPlus className="w-2.5 h-2.5" />
                      Log Lead
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HumanDialerPage() {
  const navigate = useNavigate();

  // Individual primitive selectors — NO destructuring of store object
  const dialedNumber = useHumanDialerStore((s) => s.dialedNumber);
  const callState = useHumanDialerStore((s) => s.callState);
  const currentCallerPhone = useHumanDialerStore((s) => s.currentCallerPhone);
  const currentCallerName = useHumanDialerStore((s) => s.currentCallerName);
  const currentCallerCompany = useHumanDialerStore(
    (s) => s.currentCallerCompany,
  );
  const muteActive = useHumanDialerStore((s) => s.muteActive);
  const holdActive = useHumanDialerStore((s) => s.holdActive);
  const incomingPhone = useHumanDialerStore((s) => s.incomingPhone);
  const incomingName = useHumanDialerStore((s) => s.incomingName);
  const incomingCompany = useHumanDialerStore((s) => s.incomingCompany);
  const callHistory = useHumanDialerStore((s) => s.callHistory);

  // Store actions — fetched once; Zustand actions are stable across renders
  const appendDialedDigit = useHumanDialerStore((s) => s.appendDialedDigit);
  const backspaceDialedNumber = useHumanDialerStore(
    (s) => s.backspaceDialedNumber,
  );
  const clearDialedNumber = useHumanDialerStore((s) => s.clearDialedNumber);
  const initiateCall = useHumanDialerStore((s) => s.initiateCall);
  const acceptIncomingCall = useHumanDialerStore((s) => s.acceptIncomingCall);
  const rejectIncomingCall = useHumanDialerStore((s) => s.rejectIncomingCall);
  const toggleMute = useHumanDialerStore((s) => s.toggleMute);
  const toggleHold = useHumanDialerStore((s) => s.toggleHold);
  const endCall = useHumanDialerStore((s) => s.endCall);
  const addToHistory = useHumanDialerStore((s) => s.addToHistory);
  const clearHistory = useHumanDialerStore((s) => s.clearHistory);
  const simulateIncomingCall = useHumanDialerStore(
    (s) => s.simulateIncomingCall,
  );

  // Timer: count in ref, display in state — prevents extra re-renders
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedSecsRef = useRef<number>(0);
  const [displayTime, setDisplayTime] = useState("00:00");

  // Call type ref — stable reference to track if call was inbound/outbound
  const callTypeRef = useRef<"inbound" | "outbound">("outbound");
  const [showDtmf, setShowDtmf] = useState(false);

  // Track callState in ref for use inside setInterval without stale closure
  const callStateRef = useRef(callState);
  callStateRef.current = callState;

  // Refs that mirror current phone values — updated separately so the timer
  // effect only depends on callState (prevents infinite re-render loops).
  const currentCallerPhoneRef = useRef(currentCallerPhone);
  const incomingPhoneRef = useRef(incomingPhone);
  useEffect(() => {
    currentCallerPhoneRef.current = currentCallerPhone;
  }, [currentCallerPhone]);
  useEffect(() => {
    incomingPhoneRef.current = incomingPhone;
  }, [incomingPhone]);

  // Ref for simulateIncomingCall so the simulation effect keeps [] deps
  const simulateIncomingCallRef = useRef(simulateIncomingCall);
  useEffect(() => {
    simulateIncomingCallRef.current = simulateIncomingCall;
  }, [simulateIncomingCall]);

  // Timer management — starts when connected, stops when idle
  useEffect(() => {
    if (callState === "connected") {
      // Determine call type using refs captured at transition time
      if (
        incomingPhoneRef.current &&
        currentCallerPhoneRef.current === incomingPhoneRef.current
      ) {
        callTypeRef.current = "inbound";
      } else {
        callTypeRef.current = "outbound";
      }

      elapsedSecsRef.current = 0;
      setDisplayTime("00:00");

      timerRef.current = setInterval(() => {
        elapsedSecsRef.current += 1;
        setDisplayTime(fmtDuration(elapsedSecsRef.current));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  // Incoming call simulation — single effect, single ref timeout, never re-fires
  const incomingSimRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const scheduleNext = () => {
      const delay = 30000 + Math.random() * 30000; // 30–60s
      incomingSimRef.current = setTimeout(() => {
        if (callStateRef.current === "idle") {
          const caller =
            FAKE_CALLERS[Math.floor(Math.random() * FAKE_CALLERS.length)];
          simulateIncomingCallRef.current(
            caller.phone,
            caller.name,
            caller.company,
          );
        }
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      if (incomingSimRef.current) {
        clearTimeout(incomingSimRef.current);
      }
    };
  }, []);

  function handleCall() {
    if (!dialedNumber.trim() || callState !== "idle") return;
    callTypeRef.current = "outbound";
    initiateCall(dialedNumber, "", "");

    // Simulate ringing → connected after 3s
    setTimeout(() => {
      // Only transition if still ringing
      useHumanDialerStore.setState((s) => {
        if (s.callState === "ringing") {
          return { callState: "connected" };
        }
        return s;
      });
    }, 3000);
  }

  function handleEndCall() {
    const duration = elapsedSecsRef.current;
    const entry = {
      id: `hcall-${Date.now()}`,
      phone: currentCallerPhone,
      name: currentCallerName || currentCallerPhone,
      company: currentCallerCompany,
      type: callTypeRef.current,
      durationSecs: duration,
      timestamp: new Date().toISOString(),
      outcome: "completed" as const,
    };
    addToHistory(entry);
    setDisplayTime("00:00");
    elapsedSecsRef.current = 0;
    setShowDtmf(false);
    endCall();
  }

  function handleAccept() {
    callTypeRef.current = "inbound";
    acceptIncomingCall();
  }

  function handleReject() {
    rejectIncomingCall();
  }

  const isInCall = callState === "ringing" || callState === "connected";

  // Lead entry state — fully isolated, no impact on dialer state
  const [logLeadEntry, setLogLeadEntry] =
    useState<HumanCallHistoryEntry | null>(null);
  const [convertedIds, setConvertedIds] = useState<Set<string>>(new Set());

  function handleLogAsLead(entry: HumanCallHistoryEntry) {
    setLogLeadEntry(entry);
  }

  function handleLeadSave(lead: Lead) {
    leadsStore.addLeads([lead]);
    if (logLeadEntry) {
      setConvertedIds((prev) => {
        const next = new Set(prev);
        next.add(logLeadEntry.id);
        return next;
      });
    }
  }

  function handleViewCrm() {
    navigate({ to: "/leads" });
  }

  return (
    <div className="flex flex-col h-full min-h-0" data-ocid="human_dialer.page">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-card">
        <div>
          <h1 className="text-lg font-bold font-display text-foreground">
            Phone Dialer
          </h1>
          <p className="text-xs text-muted-foreground">
            Human agent dialer — outbound calls &amp; inbound from 8291190000
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              callState === "connected"
                ? "bg-green-600/20 text-green-400 border-green-600/30"
                : callState === "ringing"
                  ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
                  : callState === "incoming"
                    ? "bg-blue-600/20 text-blue-400 border-blue-600/30 animate-pulse"
                    : "bg-muted/40 text-muted-foreground border-border"
            }
            data-ocid="human_dialer.status_badge"
          >
            {callState === "connected"
              ? "On Call"
              : callState === "ringing"
                ? "Ringing"
                : callState === "incoming"
                  ? "Incoming"
                  : "Available"}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto p-6">
        {/* Incoming banner */}
        {callState === "incoming" && (
          <IncomingBanner
            phone={incomingPhone}
            name={incomingName}
            company={incomingCompany}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left: Dialpad / In-Call */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="bg-card border border-border rounded-xl p-5">
              <h2 className="text-sm font-semibold text-foreground mb-4">
                {isInCall ? "Active Call" : "Dial Number"}
              </h2>

              {isInCall ? (
                <InCallPanel
                  phone={currentCallerPhone}
                  name={currentCallerName}
                  company={currentCallerCompany}
                  callState={callState as "ringing" | "connected"}
                  displayTime={displayTime}
                  muteActive={muteActive}
                  holdActive={holdActive}
                  showDtmf={showDtmf}
                  onToggleDtmf={() => setShowDtmf((v) => !v)}
                  onMute={toggleMute}
                  onHold={toggleHold}
                  onEnd={handleEndCall}
                />
              ) : (
                <DialpadPanel
                  dialedNumber={dialedNumber}
                  onDigit={appendDialedDigit}
                  onBackspace={backspaceDialedNumber}
                  onClear={clearDialedNumber}
                  onCall={handleCall}
                  disabled={isInCall}
                />
              )}
            </div>

            {/* Quick dial recent */}
            {!isInCall && callHistory.length > 0 && (
              <div className="mt-4 bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3">
                  Recent
                </p>
                <div className="flex flex-col gap-1.5">
                  {callHistory.slice(0, 3).map((entry, idx) => (
                    <button
                      key={entry.id}
                      type="button"
                      data-ocid={`dialer.quick_dial.${idx + 1}`}
                      onClick={() => {
                        useHumanDialerStore.setState({
                          dialedNumber: entry.phone,
                        });
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/40 transition-colors text-left"
                    >
                      {entry.type === "inbound" ? (
                        <PhoneIncoming
                          size={13}
                          className="text-green-400 shrink-0"
                        />
                      ) : (
                        <PhoneOutgoing
                          size={13}
                          className="text-blue-400 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">
                          {entry.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {entry.phone}
                        </p>
                      </div>
                      <Phone
                        size={12}
                        className="text-muted-foreground/60 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: History */}
          <div className="flex-1 min-w-0 bg-card border border-border rounded-xl p-5 flex flex-col min-h-[400px]">
            <HistoryPanel
              entries={callHistory}
              onClear={clearHistory}
              convertedIds={convertedIds}
              onLogAsLead={handleLogAsLead}
              onViewCrm={handleViewCrm}
            />
          </div>
        </div>
      </div>

      {/* Lead entry form — fully isolated */}
      {logLeadEntry && (
        <LeadEntryForm
          isOpen={logLeadEntry !== null}
          onClose={() => setLogLeadEntry(null)}
          onSave={handleLeadSave}
          title={`Log Lead — ${logLeadEntry.name}`}
          prefill={{
            source: "Phone Call",
            channel: "Phone",
            clientContactPerson:
              logLeadEntry.name !== logLeadEntry.phone ? logLeadEntry.name : "",
            clientMobileNumber: logLeadEntry.phone,
            clientCompanyName: logLeadEntry.company,
          }}
        />
      )}
    </div>
  );
}
