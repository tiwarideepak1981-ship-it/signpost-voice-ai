import LeadEntryForm from "@/components/LeadEntryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leadsStore } from "@/store/leadsStore";
import type { AIInboundCallEntry, AIOutboundQueueEntry, Lead } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Radio,
  UserPlus,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ─── Static Sample Data ────────────────────────────────────────────────────────

const OUTBOUND_QUEUE: AIOutboundQueueEntry[] = [
  {
    id: "ob-1",
    leadId: "l1",
    leadName: "Rajesh Mehta",
    company: "Dentsu India",
    phone: "+91 98201 44102",
    status: "completed",
    attemptCount: 1,
    outcome: "Interested — Q3 brand awareness campaign discussion scheduled",
    durationSecs: 312,
    transcript: [
      {
        speaker: "AI",
        text: "Hello, is this Rajesh Mehta from Dentsu India?",
        timestamp: 0,
      },
      { speaker: "LEAD", text: "Yes, who is calling?", timestamp: 5 },
      {
        speaker: "AI",
        text: "This is ARIA, the AI assistant from Signpost. I'm calling regarding your Q3 brand awareness campaign planning for your FMCG clients. We have a ₹45L media budget optimization proposal ready.",
        timestamp: 8,
      },
      {
        speaker: "LEAD",
        text: "Okay, yes we are planning the Q3 campaigns now for three of our major clients.",
        timestamp: 24,
      },
      {
        speaker: "AI",
        text: "Perfect timing. Our platform has helped agencies achieve 15-18% better ROAS through AI-driven audience targeting and programmatic optimization. Would you like me to share the full media plan proposal?",
        timestamp: 32,
      },
      {
        speaker: "LEAD",
        text: "Yes, please send the document. I'll review with my media planning team.",
        timestamp: 51,
      },
      {
        speaker: "AI",
        text: "Absolutely. I'll send the detailed campaign proposal to your registered email right away. Is there a specific time you'd like our strategist to follow up?",
        timestamp: 60,
      },
      {
        speaker: "LEAD",
        text: "Thursday morning would be fine.",
        timestamp: 75,
      },
      {
        speaker: "AI",
        text: "Confirmed! Our campaign strategist will call you Thursday between 10 AM and 12 PM. Thank you, Rajesh!",
        timestamp: 79,
      },
    ],
  },
  {
    id: "ob-2",
    leadId: "l2",
    leadName: "Priya Sharma",
    company: "GroupM India",
    phone: "+91 99302 11874",
    status: "calling",
    attemptCount: 2,
    outcome: undefined,
    durationSecs: undefined,
    transcript: [],
  },
  {
    id: "ob-3",
    leadId: "l3",
    leadName: "Amit Verma",
    company: "Ogilvy India",
    phone: "+91 87654 32109",
    status: "completed",
    attemptCount: 1,
    outcome: "Callback scheduled — Friday 3 PM",
    durationSecs: 197,
    transcript: [
      {
        speaker: "AI",
        text: "Good morning Amit, this is ARIA from Signpost.",
        timestamp: 0,
      },
      { speaker: "LEAD", text: "Yes, tell me.", timestamp: 7 },
      {
        speaker: "AI",
        text: "I'm reaching out about our programmatic display campaign solution that has delivered 15-18% ROAS improvement for brands similar to yours. You had inquired about this last quarter.",
        timestamp: 10,
      },
      {
        speaker: "LEAD",
        text: "I'm busy right now. Can you call back Friday at 3 PM?",
        timestamp: 33,
      },
      {
        speaker: "AI",
        text: "Of course! I'll schedule a callback for Friday at 3 PM. We look forward to speaking with you then.",
        timestamp: 40,
      },
    ],
  },
  {
    id: "ob-4",
    leadId: "l4",
    leadName: "Sunita Iyer",
    company: "Publicis Sapient",
    phone: "+91 94455 78231",
    status: "failed",
    attemptCount: 3,
    outcome: "No answer after 3 attempts",
    durationSecs: 0,
    transcript: [],
  },
  {
    id: "ob-5",
    leadId: "l5",
    leadName: "Kiran Patel",
    company: "iProspect India",
    phone: "+91 98765 43219",
    status: "queued",
    attemptCount: 0,
    outcome: undefined,
    durationSecs: undefined,
    transcript: [],
  },
  {
    id: "ob-6",
    leadId: "l6",
    leadName: "Deepika Nair",
    company: "Kinnect",
    phone: "+91 90011 22334",
    status: "completed",
    attemptCount: 1,
    outcome: "Not interested at this time",
    durationSecs: 45,
    transcript: [
      {
        speaker: "AI",
        text: "Hello Deepika, this is ARIA from Signpost calling about our influencer marketing strategy platform for product launches.",
        timestamp: 0,
      },
      {
        speaker: "LEAD",
        text: "I'm not interested. Please remove me from your list.",
        timestamp: 9,
      },
      {
        speaker: "AI",
        text: "Absolutely, I'll update your preference immediately. Sorry to disturb you, have a great day.",
        timestamp: 14,
      },
    ],
  },
  {
    id: "ob-7",
    leadId: "l7",
    leadName: "Mohammed Ali",
    company: "Schbang",
    phone: "+91 91234 56780",
    status: "queued",
    attemptCount: 0,
    outcome: undefined,
    durationSecs: undefined,
    transcript: [],
  },
];

const INBOUND_CALLS: AIInboundCallEntry[] = [
  {
    id: "in-1",
    callerNumber: "+91 98201 55601",
    callerName: "Suresh Gupta",
    callerCompany: "HUL Marketing",
    receivedAt: new Date("2026-04-14T10:15:00"),
    duration: 284,
    status: "answered",
    intent: "Pricing",
    sentiment: "positive",
    actionTaken: "Sent digital ad package pricing, scheduled strategy call",
    transcript: [
      {
        speaker: "CALLER",
        text: "Hello, I'm calling to ask about your digital ad campaign pricing.",
        timestamp: 0,
      },
      {
        speaker: "AI",
        text: "Welcome to Signpost's support line! I'm ARIA, your AI assistant. I'd be happy to walk you through our advertising campaign packages.",
        timestamp: 4,
      },
      {
        speaker: "CALLER",
        text: "How much is the Performance Package for a monthly campaign?",
        timestamp: 16,
      },
      {
        speaker: "AI",
        text: "Our Performance Package starts at ₹12L per month. It includes programmatic display, social media ads across Instagram and YouTube, full audience targeting with AI optimization, and a weekly performance dashboard with CTR, impressions, and ROAS tracking.",
        timestamp: 22,
      },
      {
        speaker: "CALLER",
        text: "Can I get a written proposal?",
        timestamp: 48,
      },
      {
        speaker: "AI",
        text: "Absolutely! I'll email you a detailed media plan proposal. Our campaign strategist will also call you tomorrow to discuss the channel mix and targeting strategy in detail.",
        timestamp: 53,
      },
      { speaker: "CALLER", text: "Sounds good, thank you.", timestamp: 70 },
      {
        speaker: "AI",
        text: "You're welcome! Have a wonderful day, Suresh.",
        timestamp: 73,
      },
    ],
  },
  {
    id: "in-2",
    callerNumber: "+91 77001 88922",
    callerName: "Lakshmi Rao",
    callerCompany: undefined,
    receivedAt: new Date("2026-04-14T09:42:00"),
    duration: 0,
    status: "missed",
    intent: "Callback",
    sentiment: "neutral",
    actionTaken: "Missed — voicemail left",
    transcript: [],
  },
  {
    id: "in-3",
    callerNumber: "+91 91001 34567",
    callerName: "Vikram Singh",
    callerCompany: "Nestle India",
    receivedAt: new Date("2026-04-14T09:10:00"),
    duration: 521,
    status: "transferred",
    intent: "Interested",
    sentiment: "positive",
    actionTaken: "Transferred to senior media strategist",
    transcript: [
      {
        speaker: "CALLER",
        text: "I'd like to know more about your programmatic buying solution for our seasonal campaign.",
        timestamp: 0,
      },
      {
        speaker: "AI",
        text: "Hello Vikram! I'm ARIA from Signpost. We do have a premium programmatic buying platform designed for large FMCG brands. Could I ask a few questions to match you with the right campaign strategy?",
        timestamp: 4,
      },
      { speaker: "CALLER", text: "Sure, go ahead.", timestamp: 22 },
      {
        speaker: "AI",
        text: "What is your campaign objective — brand awareness, performance, or retargeting? And what's your monthly media budget?",
        timestamp: 25,
      },
      {
        speaker: "CALLER",
        text: "Primarily performance-driven for festive season. Budget is around ₹8L per month and we need at least 2.5x ROAS.",
        timestamp: 32,
      },
      {
        speaker: "AI",
        text: "Excellent! With ₹8L/month and a 2.5x ROAS target, our AI-optimized programmatic stack with dynamic creative optimization has delivered up to 3.1x ROAS for similar FMCG campaigns. Let me connect you with our senior media strategist for a detailed consultation.",
        timestamp: 42,
      },
      { speaker: "CALLER", text: "Please do.", timestamp: 65 },
      {
        speaker: "AI",
        text: "Transferring you now. One moment please.",
        timestamp: 68,
      },
    ],
  },
  {
    id: "in-4",
    callerNumber: "+91 80234 11029",
    callerName: "Ananya Das",
    callerCompany: "Nykaa Marketing",
    receivedAt: new Date("2026-04-14T08:55:00"),
    duration: 188,
    status: "answered",
    intent: "Objection",
    sentiment: "negative",
    actionTaken: "Objection handled, follow-up email sent",
    transcript: [
      {
        speaker: "CALLER",
        text: "I got a call from your number yesterday and I want to be removed from your calling list.",
        timestamp: 0,
      },
      {
        speaker: "AI",
        text: "I completely understand, Ananya. I sincerely apologize for any inconvenience. I'll immediately add your number to our do-not-contact list.",
        timestamp: 5,
      },
      {
        speaker: "CALLER",
        text: "Also I'm not interested in any advertising services at all.",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "Noted. I've updated your preference as 'not interested' across all service categories. You will not receive any further calls from Signpost. Is there anything else I can help with?",
        timestamp: 27,
      },
      { speaker: "CALLER", text: "No that's all.", timestamp: 45 },
      {
        speaker: "AI",
        text: "Thank you for letting us know, Ananya. Have a great day.",
        timestamp: 48,
      },
    ],
  },
  {
    id: "in-5",
    callerNumber: "+91 96644 20011",
    callerName: "Rohan Joshi",
    callerCompany: "Mamaearth Digital",
    receivedAt: new Date("2026-04-14T08:30:00"),
    duration: 342,
    status: "answered",
    intent: "Interested",
    sentiment: "positive",
    actionTaken: "Sent media plan, strategy meeting booked",
    transcript: [
      {
        speaker: "CALLER",
        text: "Hi, I'm interested in a full-funnel digital advertising campaign for our new product line.",
        timestamp: 0,
      },
      {
        speaker: "AI",
        text: "Great to hear, Rohan! We offer full-funnel digital campaigns covering awareness, consideration, and conversion stages. What category is the product in?",
        timestamp: 4,
      },
      {
        speaker: "CALLER",
        text: "It's a new skincare range for women aged 25-40.",
        timestamp: 19,
      },
      {
        speaker: "AI",
        text: "Perfect. For that demographic, we recommend a mix of Instagram Reels, YouTube pre-roll, and influencer collaborations with micro and mid-tier creators. Our starting package is ₹6L per month with full creative production included. Shall I send you a customized media plan?",
        timestamp: 23,
      },
      {
        speaker: "CALLER",
        text: "Yes, and can someone meet me to discuss the influencer strategy in detail?",
        timestamp: 45,
      },
      {
        speaker: "AI",
        text: "Absolutely! I'll book a meeting with our influencer marketing specialist. Would Wednesday at 11 AM work for you?",
        timestamp: 51,
      },
      { speaker: "CALLER", text: "Yes, Wednesday works.", timestamp: 64 },
      {
        speaker: "AI",
        text: "Meeting confirmed for Wednesday at 11 AM. You'll receive a calendar invite shortly. Thank you!",
        timestamp: 68,
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDuration(secs: number): string {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function outboundStatusStyle(status: string): string {
  if (status === "completed")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "calling")
    return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (status === "failed")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function inboundStatusStyle(status: string): string {
  if (status === "answered")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (status === "missed")
    return "bg-destructive/15 text-destructive border-destructive/30";
  if (status === "transferred")
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function intentStyle(intent: string): string {
  if (intent === "Interested")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (intent === "Pricing")
    return "bg-primary/10 text-primary border-primary/20";
  if (intent === "Callback")
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (intent === "Objection")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function sentimentDot(s: string): string {
  if (s === "positive") return "bg-emerald-400";
  if (s === "negative") return "bg-destructive";
  return "bg-muted-foreground";
}

// ─── Stat Bar ──────────────────────────────────────────────────────────────────

function StatBar({
  stats,
}: {
  stats: { label: string; value: number | string; color?: string }[];
}) {
  return (
    <div className="grid grid-cols-4 gap-0 border-b border-border bg-card">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={`px-4 py-2.5 flex flex-col gap-0.5 ${i > 0 ? "border-l border-border" : ""}`}
        >
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {s.label}
          </span>
          <span
            className={`text-xl font-bold font-mono ${s.color ?? "text-foreground"}`}
          >
            {s.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Transcript Expand ────────────────────────────────────────────────────────

function TranscriptRow({
  turns,
  colSpan,
  speakerLabel,
}: {
  turns: { speaker: string; text: string; timestamp: number }[];
  colSpan: number;
  speakerLabel: "LEAD" | "CALLER";
}) {
  if (!turns.length) {
    return (
      <tr className="bg-muted/10 border-b border-border">
        <td
          colSpan={colSpan}
          className="px-8 py-3 text-xs text-muted-foreground italic"
        >
          No transcript available for this call.
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-muted/10 border-b border-border">
      <td colSpan={colSpan} className="px-8 py-4">
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2">
          {turns.map((t, i) => {
            const isAI = t.speaker === "AI";
            return (
              <div
                key={`${t.speaker}-${i}`}
                className={`flex gap-2 ${isAI ? "justify-end" : "justify-start"}`}
              >
                {!isAI && (
                  <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                )}
                <div
                  className={`flex flex-col gap-0.5 max-w-[70%] ${isAI ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`flex items-center gap-1 text-xs ${isAI ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {isAI ? (
                      <>
                        <Bot className="w-3 h-3" />
                        <span className="font-semibold">AI Agent</span>
                      </>
                    ) : (
                      <span className="font-semibold">
                        {speakerLabel === "LEAD" ? "Lead" : "Caller"}
                      </span>
                    )}
                    <span className="text-muted-foreground/60">
                      {t.timestamp}s
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg text-xs leading-relaxed ${
                      isAI
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "bg-card border border-border text-foreground"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
                {isAI && (
                  <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-2.5 h-2.5 text-primary" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </td>
    </tr>
  );
}

// ─── Outbound Tab ─────────────────────────────────────────────────────────────

const outboundStats = [
  {
    label: "Total Queued",
    value: OUTBOUND_QUEUE.filter((r) => r.status === "queued").length,
    color: "text-muted-foreground",
  },
  {
    label: "In Progress",
    value: OUTBOUND_QUEUE.filter((r) => r.status === "calling").length,
    color: "text-blue-400",
  },
  {
    label: "Completed Today",
    value: OUTBOUND_QUEUE.filter((r) => r.status === "completed").length,
    color: "text-emerald-400",
  },
  {
    label: "Failed",
    value: OUTBOUND_QUEUE.filter((r) => r.status === "failed").length,
    color: "text-destructive",
  },
];

function OutboundTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Agent Status Bar */}
      <div className="px-4 py-2.5 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            ARIA — AI Outbound Agent
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded border bg-blue-500/15 text-blue-400 border-blue-500/30 font-semibold">
            On Call
          </span>
          <span className="text-xs text-muted-foreground">
            Currently dialing:{" "}
            <span className="text-foreground font-medium">
              Priya Sharma — GroupM India
            </span>
          </span>
        </div>
        <Link to="/campaigns">
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs gap-1.5"
            data-ocid="outbound-launch-campaign-btn"
          >
            <Zap className="w-3.5 h-3.5" />
            Launch New Campaign
            <ExternalLink className="w-3 h-3 opacity-60" />
          </Button>
        </Link>
      </div>

      {/* Stat Bar */}
      <StatBar stats={outboundStats} />

      {/* Table */}
      <div className="flex-1 overflow-auto" data-ocid="outbound-table">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 z-10">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lead
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Company
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Phone
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Outcome
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {OUTBOUND_QUEUE.map((row, idx) => (
              <>
                <tr
                  key={row.id}
                  onClick={() =>
                    setSelectedId(selectedId === row.id ? null : row.id)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    setSelectedId(selectedId === row.id ? null : row.id)
                  }
                  tabIndex={0}
                  className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/30 ${selectedId === row.id ? "bg-primary/5" : ""}`}
                  data-ocid={`outbound.item.${idx + 1}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {row.leadName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {row.leadName}
                      </span>
                      {selectedId === row.id ? (
                        <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground">
                      {row.company}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {row.phone}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-semibold inline-flex items-center gap-1 ${outboundStatusStyle(row.status)}`}
                    >
                      {row.status === "calling" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block flex-shrink-0" />
                      )}
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    <span className="text-xs font-mono text-foreground">
                      {row.attemptCount}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 hidden md:table-cell max-w-xs">
                    <span className="text-xs text-muted-foreground truncate block max-w-48">
                      {row.outcome ?? "—"}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {fmtDuration(row.durationSecs ?? 0)}
                    </span>
                  </td>
                </tr>
                {selectedId === row.id && (
                  <TranscriptRow
                    key={`${row.id}-tx`}
                    turns={row.transcript ?? []}
                    colSpan={7}
                    speakerLabel="LEAD"
                  />
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Inbound Tab ──────────────────────────────────────────────────────────────

const inboundStats = [
  { label: "Available", value: "Ready", color: "text-emerald-400" },
  {
    label: "Answered Today",
    value: INBOUND_CALLS.filter((r) => r.status === "answered").length,
    color: "text-emerald-400",
  },
  {
    label: "Missed",
    value: INBOUND_CALLS.filter((r) => r.status === "missed").length,
    color: "text-destructive",
  },
  {
    label: "Transferred",
    value: INBOUND_CALLS.filter((r) => r.status === "transferred").length,
    color: "text-amber-400",
  },
];

function InboundTab() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Map from callId → boolean (lead created)
  const [createdLeads, setCreatedLeads] = useState<Record<string, boolean>>({});
  // The currently open form call
  const [formCallId, setFormCallId] = useState<string | null>(null);

  const activeCall =
    formCallId !== null ? INBOUND_CALLS.find((c) => c.id === formCallId) : null;

  function handleCreateLeadSave(lead: Lead) {
    leadsStore.addLeads([lead]);
    if (formCallId) {
      setCreatedLeads((prev) => ({ ...prev, [formCallId]: true }));
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Live Status Card */}
      <div className="px-4 py-3 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-foreground">
              AI Agent Active on 8291190000
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold">
            Available
          </span>
          <span className="text-xs text-muted-foreground">
            Line ready · Auto-answers all inbound calls
          </span>
        </div>
      </div>

      {/* Stat Bar */}
      <StatBar stats={inboundStats} />

      {/* Table */}
      <div className="flex-1 overflow-auto" data-ocid="inbound-table">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 z-10">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Caller
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Time Received
              </th>
              <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Duration
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Intent
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                Action Taken
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Sentiment
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                CRM
              </th>
            </tr>
          </thead>
          <tbody>
            {INBOUND_CALLS.map((row, idx) => (
              <>
                <tr
                  key={row.id}
                  onClick={() =>
                    setSelectedId(selectedId === row.id ? null : row.id)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    setSelectedId(selectedId === row.id ? null : row.id)
                  }
                  tabIndex={0}
                  className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/30 ${selectedId === row.id ? "bg-primary/5" : ""}`}
                  data-ocid={`inbound.item.${idx + 1}`}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-bold text-muted-foreground flex-shrink-0">
                        {row.callerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground">
                          {row.callerName}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {row.callerNumber}
                        </span>
                      </div>
                      {selectedId === row.id ? (
                        <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0 ml-1" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 hidden md:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {fmtTime(row.receivedAt)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-right hidden lg:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {fmtDuration(row.duration)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${inboundStatusStyle(row.status)}`}
                    >
                      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${intentStyle(row.intent)}`}
                    >
                      {row.intent}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 hidden xl:table-cell max-w-xs">
                    <span className="text-xs text-muted-foreground truncate block max-w-52">
                      {row.actionTaken}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 text-center hidden md:table-cell">
                    <span
                      className={`inline-flex w-2 h-2 rounded-full ${sentimentDot(row.sentiment)}`}
                      title={row.sentiment}
                    />
                  </td>
                  {/* CRM action */}
                  <td
                    className="px-2 py-2.5 text-center"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    {createdLeads[row.id] ? (
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/leads" })}
                        className="text-xs px-1.5 py-0.5 rounded border font-semibold bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                        data-ocid={`inbound.view_crm.${idx + 1}`}
                      >
                        View CRM
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setFormCallId(row.id)}
                        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
                        data-ocid={`inbound.create_lead.${idx + 1}`}
                      >
                        <UserPlus className="w-3 h-3" />
                        Lead
                      </button>
                    )}
                  </td>
                </tr>
                {selectedId === row.id && (
                  <TranscriptRow
                    key={`${row.id}-tx`}
                    turns={row.transcript}
                    colSpan={8}
                    speakerLabel="CALLER"
                  />
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lead entry form for inbound call */}
      {activeCall && (
        <LeadEntryForm
          isOpen={formCallId !== null}
          onClose={() => setFormCallId(null)}
          onSave={handleCreateLeadSave}
          title={`Create Lead — ${activeCall.callerName}`}
          prefill={{
            source: "Inbound Call",
            channel: "Phone",
            clientContactPerson: activeCall.callerName,
            clientMobileNumber: activeCall.callerNumber,
            clientCompanyName: activeCall.callerCompany ?? "",
            requirements: activeCall.transcript.length
              ? activeCall.transcript
                  .slice(0, 3)
                  .map((t) => `${t.speaker}: ${t.text}`)
                  .join(" | ")
              : activeCall.actionTaken,
          }}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = "outbound" | "inbound";

export default function AIDialerPage() {
  const [tab, setTab] = useState<Tab>("outbound");

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">
              AI Agent Dialer
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Outbound calling &amp; Inbound handler · 8291190000
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs text-emerald-400 font-semibold">
            System Online
          </span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-4 pt-2 border-b border-border bg-card flex-shrink-0">
        <button
          type="button"
          onClick={() => setTab("outbound")}
          data-ocid="ai-dialer.outbound.tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            tab === "outbound"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PhoneOutgoing className="w-3.5 h-3.5" />
          AI Outbound Dialer
        </button>
        <button
          type="button"
          onClick={() => setTab("inbound")}
          data-ocid="ai-dialer.inbound.tab"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
            tab === "inbound"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <PhoneIncoming className="w-3.5 h-3.5" />
          AI Inbound Handler
          <Badge variant="secondary" className="text-xs h-4 px-1.5 py-0 ml-1">
            8291190000
          </Badge>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "outbound" ? <OutboundTab /> : <InboundTab />}
      </div>
    </div>
  );
}
