import LeadEntryForm from "@/components/LeadEntryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  marketingEmails,
  sampleAIAgents,
  sampleAICallLogs,
  sampleWhatsAppAIThreads,
  smsLogs,
  whatsappThreads,
} from "@/data/sampleData";
import { leadsStore } from "@/store/leadsStore";
import type {
  AIAgentStatus,
  AICallLog,
  Lead,
  SmsLog,
  WaReceiptStatus,
  WhatsAppAIThread,
  WhatsAppThread,
} from "@/types";
import {
  Bot,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Lock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Smartphone,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

// ─── Local Types ──────────────────────────────────────────────────────────────

type MsgType = "text" | "bot" | "handoff";

interface WaMessage {
  id: string;
  direction: "in" | "out";
  text: string;
  time: string;
  type: MsgType;
  receiptStatus?: WaReceiptStatus;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  sendDate: string;
  recipients: number;
  delivered: number;
  opens: number;
  clicks: number;
  status: "sent" | "draft" | "scheduled" | "paused";
  topLinks: { url: string; clicks: number }[];
}

// ─── Conversation data (keyed by thread id) ──────────────────────────────────

const CONVERSATIONS: Record<string, WaMessage[]> = {
  "wa-1": [
    {
      id: "m1",
      direction: "out",
      type: "bot",
      text: "Hello! I'm reaching out regarding your upcoming Q3 campaign brief. Can I take a moment to understand your campaign objectives and share our media planning recommendations?",
      time: "10:02",
    },
    {
      id: "m2",
      direction: "in",
      type: "text",
      text: "Yes, sure. We're planning a brand awareness push for our new product line.",
      time: "10:03",
    },
    {
      id: "m3",
      direction: "out",
      type: "bot",
      text: "Great! We have three packages — Digital Performance, Brand Amplification, and Full Funnel. The Brand Amplification package covers Instagram, YouTube, and programmatic display with AI-driven audience targeting and weekly CTR and ROAS reporting.",
      time: "10:04",
    },
    {
      id: "m4",
      direction: "in",
      type: "text",
      text: "What's the pricing for the Brand Amplification package?",
      time: "10:05",
    },
    {
      id: "m5",
      direction: "out",
      type: "bot",
      text: "The Brand Amplification package starts at ₹8L/month with full creative production included. For your campaign scale, we're projecting a 2.2x ROAS in the first 60 days. Would you like me to send you the detailed media plan?",
      time: "10:06",
    },
    {
      id: "m6",
      direction: "in",
      type: "text",
      text: "Can you share the updated creative assets and the media plan document?",
      time: "10:07",
    },
    {
      id: "m7",
      direction: "out",
      type: "handoff",
      text: "I'm connecting you with our campaign strategist Priya who will share the creative assets, media plan document, and answer any specific campaign queries.",
      time: "10:08",
    },
    {
      id: "m8",
      direction: "out",
      type: "text",
      text: "Hi, this is Priya from Signpost. I've just sent you the Brand Amplification media plan with full creative guidelines. You can also view it here: signpost.in/media-plan/q3-2024.",
      time: "10:10",
    },
    {
      id: "m9",
      direction: "in",
      type: "text",
      text: "Thank you, I will review and get back to you.",
      time: "10:12",
    },
  ],
  "wa-2": [
    {
      id: "m1",
      direction: "out",
      type: "bot",
      text: "Hello! I'm reaching out about your campaign performance review that we discussed last week.",
      time: "14:30",
    },
    {
      id: "m2",
      direction: "in",
      type: "text",
      text: "Yes, I've been waiting. What's the CTR on the Instagram ads?",
      time: "14:32",
    },
    {
      id: "m3",
      direction: "out",
      type: "bot",
      text: "Your Instagram campaign achieved a 3.2% CTR this week, which is 40% above the industry benchmark. Total impressions reached 2.4M and ROAS is currently at 2.8x.",
      time: "14:33",
    },
    {
      id: "m4",
      direction: "in",
      type: "text",
      text: "That's good. Can we scale the budget for Instagram by 20%?",
      time: "14:35",
    },
    {
      id: "m5",
      direction: "out",
      type: "bot",
      text: "Approved! We'll proceed with the 20% budget increase for Instagram. The updated media buy will be reflected in your dashboard within 24 hours.",
      time: "14:36",
    },
    {
      id: "m6",
      direction: "in",
      type: "text",
      text: "Please call me tomorrow afternoon to discuss the next campaign phase.",
      time: "14:38",
    },
    {
      id: "m7",
      direction: "out",
      type: "bot",
      text: "Absolutely! Our campaign manager will call you tomorrow between 2–5 PM. Is there a preferred time for the campaign planning discussion?",
      time: "14:39",
    },
    {
      id: "m8",
      direction: "in",
      type: "text",
      text: "3 PM works for me.",
      time: "14:40",
    },
    {
      id: "m9",
      direction: "out",
      type: "text",
      text: "Confirmed! Our campaign manager will call you at 3 PM tomorrow.",
      time: "14:41",
    },
  ],
};

const defaultConvo = (thread: WhatsAppThread): WaMessage[] => [
  {
    id: "d1",
    direction: "out",
    type: "bot",
    text: `Hello ${thread.contactName.split(" ")[0]}! I'm reaching out on behalf of Signpost. We have a tailored advertising campaign proposal for your brand that's been performing exceptionally well for similar clients.`,
    time: "09:15",
  },
  {
    id: "d2",
    direction: "in",
    type: "text",
    text: "Yes, what is this about?",
    time: "09:17",
  },
  {
    id: "d3",
    direction: "out",
    type: "bot",
    text: "We're offering a full-funnel digital advertising solution with programmatic buying, influencer amplification, and AI-driven ROAS optimization. Our recent campaigns have delivered 2.5x–3.2x ROAS for D2C brands.",
    time: "09:18",
  },
  {
    id: "d4",
    direction: "in",
    type: "text",
    text: "That sounds interesting. Tell me more about the targeting capabilities.",
    time: "09:20",
  },
  {
    id: "d5",
    direction: "out",
    type: "bot",
    text: "I'll have our senior campaign strategist connect with you to walk through the audience targeting and creative strategy.",
    time: "09:21",
  },
  {
    id: "d6",
    direction: "out",
    type: "handoff",
    text: "Connecting you now with our campaign strategist for a more detailed media planning discussion.",
    time: "09:22",
  },
  {
    id: "d7",
    direction: "out",
    type: "text",
    text: "Hi, this is the campaign team. What time works best for a strategy call this week?",
    time: "09:25",
  },
  {
    id: "d8",
    direction: "in",
    type: "text",
    text: thread.lastMessage,
    time: "09:30",
  },
];

// ─── Email Campaigns data ─────────────────────────────────────────────────────

const emailCampaigns: EmailCampaign[] = [
  {
    id: "ec1",
    name: "Q2 Campaign Performance Report",
    subject: "Your Q2 Ad Campaign Performance Report Is Here",
    previewText: "CTR up 32%, ROAS at 2.8x — see what's working",
    sendDate: "2024-04-15 09:00",
    recipients: 4850,
    delivered: 4701,
    opens: 2198,
    clicks: 412,
    status: "sent",
    topLinks: [
      { url: "signpost.in/campaign-report", clicks: 312 },
      { url: "signpost.in/book-strategy-call", clicks: 100 },
    ],
  },
  {
    id: "ec2",
    name: "Media Plan Review — Q3",
    subject: "Important: Your Q3 Media Plan Is Ready for Review",
    previewText:
      "Optimized channel mix to hit your awareness and conversion goals",
    sendDate: "2024-04-10 10:30",
    recipients: 2340,
    delivered: 2280,
    opens: 1456,
    clicks: 678,
    status: "sent",
    topLinks: [
      { url: "signpost.in/media-plan", clicks: 512 },
      { url: "signpost.in/faq", clicks: 166 },
    ],
  },
  {
    id: "ec3",
    name: "Creative Package — Festive Season",
    subject: "Your Festive Season Creative Package Is Ready",
    previewText: "High-impact creatives designed for maximum engagement",
    sendDate: "2024-04-20 08:00",
    recipients: 6100,
    delivered: 5920,
    opens: 2810,
    clicks: 590,
    status: "sent",
    topLinks: [
      { url: "signpost.in/creative-pack", clicks: 390 },
      { url: "signpost.in/brand-guidelines", clicks: 200 },
    ],
  },
  {
    id: "ec4",
    name: "Programmatic Buying — New Rates",
    subject: "Programmatic Buying Rates Updated — Act Now",
    previewText: "CPM rates at seasonal lows — lock in your Q3 inventory",
    sendDate: "2024-04-08 11:00",
    recipients: 1800,
    delivered: 1764,
    opens: 882,
    clicks: 243,
    status: "sent",
    topLinks: [
      { url: "signpost.in/programmatic", clicks: 180 },
      { url: "signpost.in/inventory-planner", clicks: 63 },
    ],
  },
  {
    id: "ec5",
    name: "Influencer Marketing Launch",
    subject: "Launch Your Influencer Campaign in 5 Days",
    previewText: "50+ verified micro-influencers ready for your brand",
    sendDate: "2024-04-25 09:30",
    recipients: 3200,
    delivered: 3104,
    opens: 1420,
    clicks: 340,
    status: "sent",
    topLinks: [
      { url: "signpost.in/influencer-hub", clicks: 260 },
      { url: "signpost.in/creator-roster", clicks: 80 },
    ],
  },
  {
    id: "ec6",
    name: "ROAS Optimization Audit",
    subject: "Free ROAS Audit — Boost Your Ad Returns",
    previewText:
      "Get a complimentary audit of your current ad spend efficiency",
    sendDate: "2024-05-01 08:00",
    recipients: 2900,
    delivered: 2813,
    opens: 1100,
    clicks: 198,
    status: "sent",
    topLinks: [{ url: "signpost.in/roas-audit", clicks: 140 }],
  },
  {
    id: "ec7",
    name: "OTT Advertising Opportunities",
    subject: "OTT Advertising: Reach Premium Audiences at Scale",
    previewText: "Connected TV and streaming ad placements now available",
    sendDate: "2024-04-30 10:00",
    recipients: 5400,
    delivered: 5238,
    opens: 2150,
    clicks: 490,
    status: "sent",
    topLinks: [{ url: "signpost.in/ott-ads", clicks: 350 }],
  },
  {
    id: "ec8",
    name: "Regional Campaign Drive",
    subject: "Regional Language Campaigns — Reach Bharat at Scale",
    previewText: "Hindi, Tamil, Telugu, Bengali campaigns with local creators",
    sendDate: "2024-03-28 09:00",
    recipients: 1600,
    delivered: 1568,
    opens: 890,
    clicks: 220,
    status: "sent",
    topLinks: [{ url: "signpost.in/regional-campaigns", clicks: 168 }],
  },
  {
    id: "ec9",
    name: "Performance Audit — May",
    subject: "Your May Performance Audit Report Is Ready",
    previewText: "Deep-dive into CTR, conversion rates, and audience insights",
    sendDate: "2024-05-05 00:00",
    recipients: 3800,
    delivered: 0,
    opens: 0,
    clicks: 0,
    status: "scheduled",
    topLinks: [],
  },
  {
    id: "ec10",
    name: "Brand Relaunch Campaign",
    subject: "Relaunch Your Brand with AI-Driven Advertising",
    previewText: "Something big is coming for Q3",
    sendDate: "2024-06-01 00:00",
    recipients: 8000,
    delivered: 0,
    opens: 0,
    clicks: 0,
    status: "draft",
    topLinks: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function fmtDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec.toString().padStart(2, "0")}s`;
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function statusColor(s: string) {
  if (s === "delivered" || s === "read")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "sent") return "bg-primary/10 text-primary border-primary/20";
  if (s === "failed")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function dirColor(d: string) {
  return d === "inbound"
    ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
    : "bg-violet-500/10 text-violet-400 border-violet-500/30";
}

function emailStatusColor(s: string) {
  if (s === "sent")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "scheduled") return "bg-primary/10 text-primary border-primary/20";
  if (s === "draft") return "bg-muted text-muted-foreground border-border";
  if (s === "paused")
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function sentimentColor(s: string) {
  if (s === "positive")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (s === "negative")
    return "bg-destructive/15 text-destructive border-destructive/30";
  return "bg-muted text-muted-foreground border-border";
}

function actionColor(a: string) {
  if (a === "transferred-to-agent")
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (a === "resolved")
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (a === "scheduled-callback")
    return "bg-primary/10 text-primary border-primary/20";
  if (a === "voicemail") return "bg-muted text-muted-foreground border-border";
  return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
}

function pct(a: number, b: number) {
  if (!b) return "—";
  return `${((a / b) * 100).toFixed(1)}%`;
}

// ─── WhatsApp Sub-components ──────────────────────────────────────────────────

function ReceiptIcon({ status }: { status: WaReceiptStatus }) {
  if (status === "sent") {
    return (
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        className="inline-block flex-shrink-0 text-muted-foreground"
      >
        <title>Sent</title>
        <path
          d="M1 4l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "delivered") {
    return (
      <svg
        width="16"
        height="8"
        viewBox="0 0 16 8"
        className="inline-block flex-shrink-0 text-muted-foreground"
      >
        <title>Delivered</title>
        <path
          d="M1 4l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 4l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="8"
      viewBox="0 0 16 8"
      className="inline-block flex-shrink-0 text-sky-400"
    >
      <title>Read</title>
      <path
        d="M1 4l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 4l3 3 7-7"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TypingBubble({ isBot }: { isBot?: boolean }) {
  return (
    <div className="flex justify-start mb-2">
      <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
        {isBot ? (
          <Bot className="w-3 h-3 text-primary" />
        ) : (
          <User className="w-3 h-3 text-muted-foreground" />
        )}
      </div>
      <div className="bg-card border border-border rounded-lg px-3 py-2.5 flex items-center gap-1">
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-typing-dot"
          style={{ animationDelay: "400ms" }}
        />
      </div>
    </div>
  );
}

function ThreadItem({
  thread,
  selected,
  onClick,
  isTyping,
}: {
  thread: WhatsAppThread;
  selected: boolean;
  onClick: () => void;
  isTyping?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`wa-thread-${thread.id}`}
      className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 cursor-pointer border-b border-border transition-colors ${selected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/40"}`}
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
        {initials(thread.contactName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-foreground truncate">
            {thread.contactName}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {thread.lastMessageTime.split(" ")[1]}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          {isTyping ? (
            <span className="text-xs text-emerald-400 italic flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full bg-emerald-400 animate-typing-dot inline-block"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-emerald-400 animate-typing-dot inline-block"
                style={{ animationDelay: "200ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-emerald-400 animate-typing-dot inline-block"
                style={{ animationDelay: "400ms" }}
              />
              typing…
            </span>
          ) : (
            <span className="text-xs text-muted-foreground truncate">
              {thread.lastMessage}
            </span>
          )}
          {thread.unreadCount > 0 && (
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function MessageBubble({ msg }: { msg: WaMessage }) {
  const isOut = msg.direction === "out";
  return (
    <div className={`flex ${isOut ? "justify-end" : "justify-start"} mb-2`}>
      {!isOut && (
        <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <User className="w-3 h-3 text-muted-foreground" />
        </div>
      )}
      <div
        className={`max-w-[72%] ${isOut ? "items-end" : "items-start"} flex flex-col gap-0.5`}
      >
        {msg.type === "handoff" && (
          <div className="flex items-center gap-1 text-xs text-amber-400 mb-1">
            <User className="w-3 h-3" />{" "}
            <span className="font-medium">Agent handoff</span>
          </div>
        )}
        {msg.type === "bot" && isOut && (
          <div className="flex items-center gap-1 text-xs text-primary mb-0.5">
            <Bot className="w-3 h-3" /> <span>GenAI Bot</span>
          </div>
        )}
        <div
          className={`px-3 py-2 rounded-lg text-xs leading-relaxed ${isOut ? (msg.type === "handoff" ? "bg-amber-500/15 text-amber-100 border border-amber-500/30" : "bg-primary text-primary-foreground") : "bg-card border border-border text-foreground"}`}
        >
          {msg.text}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{msg.time}</span>
          {isOut && msg.receiptStatus && (
            <ReceiptIcon status={msg.receiptStatus} />
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsAppTab({ threads }: { threads: WhatsAppThread[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<WhatsAppThread>(threads[0]);
  const [threadMessages, setThreadMessages] = useState<
    Record<string, WaMessage[]>
  >(() => {
    const init: Record<string, WaMessage[]> = {};
    for (const t of threads) {
      const base = CONVERSATIONS[t.id] ?? defaultConvo(t);
      init[t.id] = base.map((m) => ({
        ...m,
        receiptStatus:
          m.direction === "out" ? ("read" as WaReceiptStatus) : undefined,
      }));
    }
    return init;
  });
  const [isTyping, setIsTyping] = useState(false);
  const [sendInput, setSendInput] = useState("");
  // Convert to Lead — isolated state
  const [convertedThreadIds, setConvertedThreadIds] = useState<Set<string>>(
    new Set(),
  );
  const [leadFormOpen, setLeadFormOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return threads.filter((t) => {
      if (
        q &&
        !t.contactName.toLowerCase().includes(q) &&
        !t.contactPhone.includes(q)
      )
        return false;
      if (filter === "unread" && t.unreadCount === 0) return false;
      return true;
    });
  }, [threads, search, filter]);

  const messages = threadMessages[selected.id] ?? [];

  // scroll helper — called imperatively after state updates
  function scrollToBottom() {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function handleConvertToLead(lead: Lead) {
    leadsStore.addLeads([lead]);
    leadsStore.addLeads([lead]);
    setConvertedThreadIds((prev) => {
      const next = new Set(prev);
      next.add(selected.id);
      return next;
    });
    setLeadFormOpen(false);
  }

  function progressReceipt(msgId: string, threadId: string) {
    setTimeout(() => {
      setThreadMessages((prev) => {
        const msgs = prev[threadId] ?? [];
        return {
          ...prev,
          [threadId]: msgs.map((m) =>
            m.id === msgId
              ? { ...m, receiptStatus: "delivered" as WaReceiptStatus }
              : m,
          ),
        };
      });
    }, 800);
    setTimeout(() => {
      setThreadMessages((prev) => {
        const msgs = prev[threadId] ?? [];
        return {
          ...prev,
          [threadId]: msgs.map((m) =>
            m.id === msgId
              ? { ...m, receiptStatus: "read" as WaReceiptStatus }
              : m,
          ),
        };
      });
    }, 1600);
  }

  function handleSend() {
    if (!sendInput.trim()) return;
    const newId = `user-${Date.now()}`;
    const now = new Date();
    const newMsg: WaMessage = {
      id: newId,
      direction: "out",
      type: "text",
      text: sendInput.trim(),
      time: fmtTime(now),
      receiptStatus: "sent",
    };
    setSendInput("");
    setThreadMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), newMsg],
    }));
    scrollToBottom();
    progressReceipt(newId, selected.id);
    // AI typing then AI response
    setTimeout(() => {
      setIsTyping(true);
      scrollToBottom();
    }, 1600);
    setTimeout(() => {
      setIsTyping(false);
      const aiId = `ai-${Date.now()}`;
      const aiMsg: WaMessage = {
        id: aiId,
        direction: "in",
        type: "bot",
        text: "Thank you for reaching out! Our specialist will review your query and get back to you shortly. Is there anything else I can help you with?",
        time: fmtTime(new Date()),
      };
      setThreadMessages((prev) => ({
        ...prev,
        [selected.id]: [...(prev[selected.id] ?? []), aiMsg],
      }));
      scrollToBottom();
    }, 3200);
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-64 xl:w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-2 border-b border-border space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-7 text-xs"
              data-ocid="wa-search"
            />
          </div>
          <div className="flex items-center gap-1">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                data-ocid={`wa-filter-${f}`}
              >
                {f === "all" ? "All" : "Unread"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((t) => (
            <ThreadItem
              key={t.id}
              thread={t}
              selected={selected.id === t.id}
              onClick={() => setSelected(t)}
              isTyping={isTyping && selected.id === t.id}
            />
          ))}
          {filtered.length === 0 && (
            <div
              className="py-8 text-center text-xs text-muted-foreground"
              data-ocid="wa-empty"
            >
              No threads found
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="px-4 py-2.5 border-b border-border bg-card flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
            {initials(selected.contactName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground">
              {selected.contactName}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span className="font-mono">{selected.contactPhone}</span>
              {isTyping && (
                <span className="text-emerald-400 italic flex items-center gap-1 ml-1">
                  <span
                    className="w-1 h-1 rounded-full bg-emerald-400 animate-typing-dot inline-block"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1 h-1 rounded-full bg-emerald-400 animate-typing-dot inline-block"
                    style={{ animationDelay: "200ms" }}
                  />
                  <span
                    className="w-1 h-1 rounded-full bg-emerald-400 animate-typing-dot inline-block"
                    style={{ animationDelay: "400ms" }}
                  />
                  typing…
                </span>
              )}
            </div>
          </div>
          <span
            className={`text-xs px-2 py-0.5 rounded border font-semibold ${statusColor(selected.status)}`}
          >
            {selected.status}
          </span>
          {/* Convert to Lead button */}
          {convertedThreadIds.has(selected.id) ? (
            <span className="text-xs px-2 py-0.5 rounded border font-semibold bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              Lead Created ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setLeadFormOpen(true)}
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              data-ocid="wa-convert-to-lead-btn"
            >
              <UserPlus className="w-3 h-3" />
              Convert to Lead
            </button>
          )}
        </div>
        <div
          className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
          data-ocid="wa-convo-messages"
        >
          {messages.map((msg) => (
            <MessageBubble
              key={`${msg.id}-${msg.receiptStatus ?? "none"}`}
              msg={msg}
            />
          ))}
          {isTyping && <TypingBubble />}
          <div ref={bottomRef} />
        </div>
        {/* Send input */}
        <div
          className="px-4 py-2.5 border-t border-border bg-card flex items-center gap-2"
          data-ocid="wa-send-footer"
        >
          <Input
            placeholder="Type a message to demo the send flow…"
            value={sendInput}
            onChange={(e) => setSendInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 h-8 text-xs"
            data-ocid="wa-send-input"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={handleSend}
            aria-label="Send message"
            data-ocid="wa-send-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {/* Convert to Lead form */}
      <LeadEntryForm
        isOpen={leadFormOpen}
        onClose={() => setLeadFormOpen(false)}
        onSave={handleConvertToLead}
        title={`Convert to Lead — ${selected.contactName}`}
        prefill={{
          source: "WhatsApp",
          channel: "WhatsApp",
          clientContactPerson: selected.contactName,
          clientMobileNumber: selected.contactPhone,
          requirements: selected.lastMessage,
        }}
      />
    </div>
  );
}

// ─── SMS Tab ──────────────────────────────────────────────────────────────────

function SmsTab({ logs }: { logs: SmsLog[] }) {
  const [search, setSearch] = useState("");
  const [dirFilter, setDirFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((s) => {
      if (
        q &&
        !s.recipient.toLowerCase().includes(q) &&
        !s.phone.includes(q) &&
        !s.message.toLowerCase().includes(q)
      )
        return false;
      if (dirFilter !== "all" && s.direction !== dirFilter) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [logs, search, dirFilter, statusFilter]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2.5 border-b border-border bg-card flex items-center gap-2 flex-wrap flex-shrink-0">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-7 text-xs"
            data-ocid="sms-search"
          />
        </div>
        <Select value={dirFilter} onValueChange={setDirFilter}>
          <SelectTrigger
            className="h-7 text-xs w-32"
            data-ocid="sms-direction-filter"
          >
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Direction
            </SelectItem>
            <SelectItem value="outbound" className="text-xs">
              Sent
            </SelectItem>
            <SelectItem value="inbound" className="text-xs">
              Received
            </SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="h-7 text-xs w-32"
            data-ocid="sms-status-filter"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              All Status
            </SelectItem>
            <SelectItem value="delivered" className="text-xs">
              Delivered
            </SelectItem>
            <SelectItem value="read" className="text-xs">
              Read
            </SelectItem>
            <SelectItem value="failed" className="text-xs">
              Failed
            </SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} records
        </span>
      </div>
      <div className="flex-1 overflow-auto" data-ocid="sms-table">
        <table className="w-full data-table">
          <thead className="sticky top-0 bg-muted/40 z-10">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Timestamp
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Lead
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Phone
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Message
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Direction
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Campaign
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sms) => (
              <>
                <tr
                  key={sms.id}
                  className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() =>
                    setExpanded(expanded === sms.id ? null : sms.id)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    setExpanded(expanded === sms.id ? null : sms.id)
                  }
                  data-ocid={`sms-row-${sms.id}`}
                >
                  <td className="px-3 py-2 text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {sms.timestamp}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {initials(sms.recipient)}
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {sms.recipient}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-2 hidden md:table-cell">
                    <span className="text-xs font-mono text-muted-foreground">
                      {sms.phone}
                    </span>
                  </td>
                  <td className="px-2 py-2 max-w-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-foreground truncate">
                        {sms.message.slice(0, 60)}
                        {sms.message.length > 60 ? "…" : ""}
                      </span>
                      {expanded === sms.id ? (
                        <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${dirColor(sms.direction)}`}
                    >
                      {sms.direction === "inbound" ? "Received" : "Sent"}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${statusColor(sms.status)}`}
                    >
                      {sms.status}
                    </span>
                  </td>
                  <td className="px-2 py-2 hidden lg:table-cell">
                    {sms.campaignId ? (
                      <span className="text-xs text-muted-foreground font-mono">
                        {sms.campaignId.toUpperCase()}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
                {expanded === sms.id && (
                  <tr
                    key={`${sms.id}-expanded`}
                    className="bg-muted/20 border-b border-border"
                  >
                    <td colSpan={7} className="px-8 py-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
                            Full Message
                          </div>
                          <div className="text-xs text-foreground leading-relaxed">
                            {sms.message}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            className="py-12 text-center text-sm text-muted-foreground"
            data-ocid="sms-empty"
          >
            No SMS records match your filters
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Email Campaigns Tab ──────────────────────────────────────────────────────

function EmailCampaignsTab() {
  const [selected, setSelected] = useState<EmailCampaign | null>(null);
  const [showComing, setShowComing] = useState(false);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2.5 border-b border-border bg-card flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-semibold text-muted-foreground">
            {emailCampaigns.length} campaigns
          </span>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => setShowComing(true)}
            data-ocid="new-email-campaign-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            New Email Campaign
          </Button>
        </div>
        <div className="flex-1 overflow-auto" data-ocid="email-campaigns-table">
          <table className="w-full data-table">
            <thead className="sticky top-0 bg-muted/40 z-10">
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Subject
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Send Date
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Delivered
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-2 py-2 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                  Click Rate
                </th>
                <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {emailCampaigns.map((ec) => (
                <tr
                  key={ec.id}
                  onClick={() =>
                    setSelected(selected?.id === ec.id ? null : ec)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    setSelected(selected?.id === ec.id ? null : ec)
                  }
                  className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/30 ${selected?.id === ec.id ? "bg-primary/5" : ""}`}
                  data-ocid={`email-campaign-row-${ec.id}`}
                >
                  <td className="px-3 py-2">
                    <span className="text-xs font-semibold text-foreground">
                      {ec.name}
                    </span>
                  </td>
                  <td className="px-2 py-2 hidden lg:table-cell max-w-xs">
                    <span className="text-xs text-muted-foreground truncate block max-w-48">
                      {ec.subject}
                    </span>
                  </td>
                  <td className="px-2 py-2 hidden md:table-cell">
                    <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {ec.sendDate.split(" ")[0]}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className="text-xs font-mono text-foreground">
                      {ec.recipients.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right hidden md:table-cell">
                    <span className="text-xs font-mono text-foreground">
                      {ec.delivered ? ec.delivered.toLocaleString() : "—"}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span
                      className={`text-xs font-semibold ${ec.opens > 0 ? "text-emerald-400" : "text-muted-foreground"}`}
                    >
                      {pct(ec.opens, ec.delivered)}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-right hidden lg:table-cell">
                    <span
                      className={`text-xs font-semibold ${ec.clicks > 0 ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {pct(ec.clicks, ec.opens)}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${emailStatusColor(ec.status)}`}
                    >
                      {ec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div
          className="w-72 xl:w-80 flex-shrink-0 border-l border-border bg-card flex flex-col"
          data-ocid="email-campaign-detail"
        >
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground truncate">
              {selected.name}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              aria-label="Close detail"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-3 border-b border-border space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Subject Line
              </div>
              <div className="text-xs text-foreground font-medium">
                {selected.subject}
              </div>
              <div className="text-xs text-muted-foreground italic">
                {selected.previewText}
              </div>
            </div>
            <div className="px-4 py-3 border-b border-border">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Stats
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Recipients",
                    value: selected.recipients.toLocaleString(),
                  },
                  {
                    label: "Delivered",
                    value: selected.delivered
                      ? selected.delivered.toLocaleString()
                      : "—",
                  },
                  {
                    label: "Opens",
                    value: selected.opens
                      ? `${selected.opens.toLocaleString()} (${pct(selected.opens, selected.delivered)})`
                      : "—",
                  },
                  {
                    label: "Clicks",
                    value: selected.clicks
                      ? `${selected.clicks.toLocaleString()} (${pct(selected.clicks, selected.opens)})`
                      : "—",
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-muted/30 rounded p-2">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-bold text-foreground mt-0.5">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {selected.topLinks.length > 0 && (
              <div className="px-4 py-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Top Performing Links
                </div>
                <div className="space-y-2">
                  {selected.topLinks.map((link) => (
                    <div
                      key={link.url}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-primary truncate font-mono">
                        {link.url}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground flex-shrink-0">
                        <CheckCheck className="w-3 h-3 text-emerald-400" />
                        {link.clicks}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showComing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
          data-ocid="campaign-coming-soon-overlay"
        >
          <div className="bg-card border border-border rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Feature Locked
                </div>
                <div className="text-xs text-muted-foreground">
                  Email campaign creation
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Email campaign creation is coming soon. This feature is currently
              under development and will be available in the next release.
            </p>
            <Button
              type="button"
              size="sm"
              className="w-full h-8 text-xs"
              onClick={() => setShowComing(false)}
              data-ocid="coming-soon-close-btn"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AI Call Agent Tab ────────────────────────────────────────────────────────

function AICallDetailPanel({
  log,
  onClose,
}: { log: AICallLog; onClose: () => void }) {
  const [toastMsg, setToastMsg] = useState("");
  const [txOpen, setTxOpen] = useState(true);

  const handleRoute = () => {
    setToastMsg("Call routed to next available agent");
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div
      className="w-96 flex-shrink-0 border-l border-border bg-card flex flex-col"
      data-ocid="ai-call-detail-panel"
    >
      {toastMsg && (
        <div className="absolute top-4 right-4 z-50 bg-emerald-500/90 text-white text-xs px-3 py-2 rounded shadow-lg">
          {toastMsg}
        </div>
      )}
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-semibold text-foreground">
          Call Detail
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Caller info */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
              {initials(log.callerName)}
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                {log.callerName}
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                {log.callerPhone}
              </div>
              {log.callerCompany && (
                <div className="text-xs text-muted-foreground">
                  {log.callerCompany}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Meta badges */}
        <div className="px-4 py-3 border-b border-border flex flex-wrap gap-1.5">
          <span
            className={`text-xs px-2 py-0.5 rounded border font-semibold ${actionColor(log.actionTaken)}`}
          >
            {log.actionTaken.replace(/-/g, " ")}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded border font-semibold ${sentimentColor(log.sentiment)}`}
          >
            {log.sentiment}
          </span>
          <span className="text-xs px-2 py-0.5 rounded border font-semibold bg-muted text-muted-foreground border-border">
            {log.intent}
          </span>
          <span className="text-xs px-2 py-0.5 rounded border font-semibold bg-muted text-muted-foreground border-border">
            {fmtDuration(log.duration)}
          </span>
        </div>
        {/* Summary */}
        <div className="px-4 py-3 border-b border-border">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Call Summary
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            {log.summary}
          </p>
        </div>
        {/* Transcript */}
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={() => setTxOpen(!txOpen)}
            className="w-full flex items-center justify-between mb-2"
            data-ocid="transcript-toggle"
          >
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Transcript
            </div>
            {txOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>
          {txOpen && (
            <div
              className="space-y-2 max-h-64 overflow-y-auto pr-1"
              data-ocid="call-transcript"
            >
              {log.transcript.map((entry) => (
                <div
                  key={`${entry.speaker}-${entry.timestamp}`}
                  className={`flex gap-2 ${entry.speaker === "AI" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-2.5 py-1.5 ${entry.speaker === "AI" ? "bg-primary/15 border border-primary/30" : "bg-muted border border-border"}`}
                  >
                    <div
                      className={`text-xs font-semibold mb-0.5 ${entry.speaker === "AI" ? "text-primary" : "text-foreground"}`}
                    >
                      {entry.speaker}
                    </div>
                    <div
                      className={`text-xs leading-relaxed ${entry.speaker === "AI" ? "text-primary" : "text-foreground"}`}
                    >
                      {entry.text}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {entry.timestamp}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Actions */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0">
        <Button
          type="button"
          size="sm"
          className="w-full h-7 text-xs gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
          onClick={handleRoute}
          data-ocid="route-to-agent-btn"
        >
          <User className="w-3 h-3" /> Route to Agent
        </Button>
      </div>
    </div>
  );
}

function AICallAgentTab({
  agent,
  logs,
}: { agent: AIAgentStatus; logs: AICallLog[] }) {
  const [dirFilter, setDirFilter] = useState("inbound");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AICallLog | null>(null);
  const [showMonitor, setShowMonitor] = useState(false);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (dirFilter !== "all" && l.direction !== dirFilter) return false;
      if (sentimentFilter !== "all" && l.sentiment !== sentimentFilter)
        return false;
      if (actionFilter !== "all" && l.actionTaken !== actionFilter)
        return false;
      return true;
    });
  }, [logs, dirFilter, sentimentFilter, actionFilter]);

  const isLive = agent.status === "active" || agent.status === "on-call";

  return (
    <div className="flex h-full min-h-0">
      {/* Left panel */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card overflow-y-auto">
        {/* Agent status card */}
        <div className="p-3 border-b border-border">
          <div className="bg-background rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                {isLive && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-card animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-foreground">
                  {agent.name}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {agent.phoneNumber}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-0.5 rounded border font-bold bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                ● LIVE — Answering 24/7
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: "Today", value: agent.todayCallCount },
                { label: "Success", value: `${agent.successRate}%` },
                { label: "Avg Dur", value: fmtDuration(agent.avgCallDuration) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-muted/30 rounded p-1.5 text-center"
                >
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="text-xs font-bold text-foreground mt-0.5">
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Incoming call simulation */}
        <div className="p-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Incoming Call
          </div>
          <div
            className={`bg-background rounded-lg border p-3 space-y-2 ${showMonitor ? "border-emerald-500/40 bg-emerald-500/5" : "border-emerald-500/20"}`}
            data-ocid="incoming-call-card"
          >
            <div className="flex items-center gap-1 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span className="text-xs font-bold text-emerald-400">
                LIVE CALL
              </span>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-semibold">
                94% confidence
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Rajesh Kumar
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                +91 98205 44312
              </div>
              <div className="text-xs text-muted-foreground">
                Wipro Digital Marketing
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Intent:</span>
              <span className="text-xs font-semibold text-foreground">
                Media Plan Inquiry
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                className="flex-1 h-7 text-xs gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                onClick={() => setShowMonitor(!showMonitor)}
                data-ocid="monitor-call-btn"
              >
                <Phone className="w-3 h-3" /> Monitor Call
              </Button>
              <Button
                type="button"
                size="sm"
                className="flex-1 h-7 text-xs gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                data-ocid="route-incoming-btn"
              >
                <User className="w-3 h-3" /> Route to Agent
              </Button>
            </div>
            {showMonitor && (
              <div className="pt-1 text-xs text-emerald-400/80 italic">
                Monitoring live — AI is handling the call…
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          {/* Filter bar */}
          <div className="px-4 py-2.5 border-b border-border bg-card flex items-center gap-2 flex-wrap flex-shrink-0">
            <div className="flex items-center gap-0.5 bg-muted/40 rounded p-0.5">
              {["all", "inbound", "outbound"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDirFilter(v)}
                  className={`px-2.5 py-1 text-xs rounded transition-colors font-semibold ${dirFilter === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  data-ocid={`ai-dir-filter-${v}`}
                >
                  {v === "all" ? "All" : v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger
                className="h-7 text-xs w-32"
                data-ocid="ai-sentiment-filter"
              >
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Sentiment
                </SelectItem>
                <SelectItem value="positive" className="text-xs">
                  Positive
                </SelectItem>
                <SelectItem value="neutral" className="text-xs">
                  Neutral
                </SelectItem>
                <SelectItem value="negative" className="text-xs">
                  Negative
                </SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger
                className="h-7 text-xs w-40"
                data-ocid="ai-action-filter"
              >
                <SelectValue placeholder="Action Taken" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Actions
                </SelectItem>
                <SelectItem value="resolved" className="text-xs">
                  Resolved
                </SelectItem>
                <SelectItem value="transferred-to-agent" className="text-xs">
                  Transferred
                </SelectItem>
                <SelectItem value="scheduled-callback" className="text-xs">
                  Callback Scheduled
                </SelectItem>
                <SelectItem value="gathered-info" className="text-xs">
                  Gathered Info
                </SelectItem>
                <SelectItem value="voicemail" className="text-xs">
                  Voicemail
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground ml-auto">
              {filtered.length} calls
            </span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto" data-ocid="ai-call-logs-table">
            <table className="w-full data-table">
              <thead className="sticky top-0 bg-muted/40 z-10">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Caller
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Time
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                    Duration
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sentiment
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                    Intent
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className={`border-b border-border cursor-pointer transition-colors hover:bg-muted/30 ${selectedLog?.id === log.id ? "bg-primary/5" : ""}`}
                    onClick={() =>
                      setSelectedLog(selectedLog?.id === log.id ? null : log)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      setSelectedLog(selectedLog?.id === log.id ? null : log)
                    }
                    data-ocid={`ai-call-row-${log.id}`}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {initials(log.callerName)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground">
                            {log.callerName}
                          </div>
                          {log.callerCompany && (
                            <div className="text-xs text-muted-foreground">
                              {log.callerCompany}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {log.callerPhone}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${dirColor(log.direction)}`}
                      >
                        {log.direction}
                      </span>
                    </td>
                    <td className="px-2 py-2 hidden lg:table-cell">
                      <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {fmtDate(log.timestamp)}
                      </span>
                    </td>
                    <td className="px-2 py-2 hidden md:table-cell">
                      <span className="text-xs font-mono text-muted-foreground">
                        {fmtDuration(log.duration)}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${sentimentColor(log.sentiment)}`}
                      >
                        {log.sentiment}
                      </span>
                    </td>
                    <td className="px-2 py-2 hidden lg:table-cell max-w-32">
                      <span className="text-xs text-foreground truncate block max-w-32">
                        {log.intent}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${actionColor(log.actionTaken)}`}
                      >
                        {log.actionTaken.replace(/-/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div
                className="py-12 text-center text-sm text-muted-foreground"
                data-ocid="ai-call-empty"
              >
                No AI call logs match your filters
              </div>
            )}
          </div>
        </div>

        {/* Detail side panel */}
        {selectedLog && (
          <AICallDetailPanel
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── AI WhatsApp Tab ──────────────────────────────────────────────────────────

function AIWaThreadItem({
  thread,
  selected,
  onClick,
  isTyping,
}: {
  thread: WhatsAppAIThread;
  selected: boolean;
  onClick: () => void;
  isTyping?: boolean;
}) {
  const statusDot =
    thread.status === "ai-handling"
      ? "bg-emerald-400"
      : thread.status === "handed-off"
        ? "bg-primary"
        : "bg-muted-foreground";

  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={`aiwa-thread-${thread.id}`}
      className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 border-b border-border transition-colors ${selected ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-muted/40"}`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {initials(thread.contactName)}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${statusDot}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              {thread.contactName}
            </span>
            {thread.status === "ai-handling" && (
              <Bot className="w-3 h-3 text-primary flex-shrink-0" />
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {fmtTime(thread.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          {isTyping ? (
            <span className="text-xs text-primary italic flex items-center gap-1">
              <span
                className="w-1 h-1 rounded-full bg-primary animate-typing-dot inline-block"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-primary animate-typing-dot inline-block"
                style={{ animationDelay: "200ms" }}
              />
              <span
                className="w-1 h-1 rounded-full bg-primary animate-typing-dot inline-block"
                style={{ animationDelay: "400ms" }}
              />
              AI typing…
            </span>
          ) : (
            <span className="text-xs text-muted-foreground truncate">
              {thread.lastMessage}
            </span>
          )}
          {thread.unreadCount > 0 && (
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
              {thread.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

type AIWaMsg = {
  id: string;
  sender: "contact" | "ai" | "agent";
  text: string;
  timestamp: Date;
  isRead: boolean;
  receiptStatus?: WaReceiptStatus;
};

function AIWaConversation({ thread }: { thread: WhatsAppAIThread }) {
  const [localMessages, setLocalMessages] = useState<AIWaMsg[]>(() =>
    thread.messages.map((m) => ({
      ...m,
      receiptStatus:
        m.sender === "ai" || m.sender === "agent"
          ? ("read" as WaReceiptStatus)
          : undefined,
    })),
  );
  const [isTypingAI, setIsTypingAI] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  // Convert to Lead — isolated state
  const [leadConverted, setLeadConverted] = useState(false);
  const [aiWaLeadFormOpen, setAiWaLeadFormOpen] = useState(false);

  function scrollToBottom() {
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  }

  function progressReceipt(msgId: string) {
    setTimeout(() => {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, receiptStatus: "delivered" as WaReceiptStatus }
            : m,
        ),
      );
    }, 800);
    setTimeout(() => {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, receiptStatus: "read" as WaReceiptStatus }
            : m,
        ),
      );
    }, 1600);
  }

  const handleHandoff = () => {
    setToastMsg("Thread handed off to next available agent");
    setTimeout(() => setToastMsg(""), 3000);
  };

  function handleAiWaConvertToLead(lead: Lead) {
    leadsStore.addLeads([lead]);
    leadsStore.addLeads([lead]);
    setLeadConverted(true);
    setAiWaLeadFormOpen(false);
  }

  const handleSend = () => {
    if (!replyText.trim()) return;
    const newId = `agent-${Date.now()}`;
    const newMsg: AIWaMsg = {
      id: newId,
      sender: thread.status === "handed-off" ? "agent" : "contact",
      text: replyText.trim(),
      timestamp: new Date(),
      isRead: false,
      receiptStatus: "sent",
    };
    setReplyText("");
    setLocalMessages((prev) => [...prev, newMsg]);
    scrollToBottom();
    progressReceipt(newId);

    if (thread.status === "ai-handling") {
      // AI will respond
      setTimeout(() => {
        setIsTypingAI(true);
        scrollToBottom();
      }, 1600);
      setTimeout(() => {
        setIsTypingAI(false);
        const aiId = `ai-resp-${Date.now()}`;
        const aiResp: AIWaMsg = {
          id: aiId,
          sender: "ai",
          text: "Thank you for your message! I've noted your request and will ensure our team follows up promptly. Is there anything specific you'd like to highlight?",
          timestamp: new Date(),
          isRead: false,
          receiptStatus: "read",
        };
        setLocalMessages((prev) => [...prev, aiResp]);
        scrollToBottom();
      }, 3200);
    } else if (thread.status === "handed-off") {
      setToastMsg("Reply sent");
      setTimeout(() => setToastMsg(""), 2500);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background relative">
      {toastMsg && (
        <div className="absolute top-3 right-3 z-50 bg-emerald-500/90 text-white text-xs px-3 py-2 rounded shadow-lg">
          {toastMsg}
        </div>
      )}
      {/* Conversation header */}
      <div className="px-4 py-2.5 border-b border-border bg-card flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
          {initials(thread.contactName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">
            {thread.contactName}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span className="font-mono">{thread.contactPhone}</span>
            <span
              className={`px-1.5 py-0.5 rounded border text-xs font-semibold ${thread.status === "ai-handling" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : thread.status === "handed-off" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-muted text-muted-foreground border-border"}`}
            >
              {thread.status.replace(/-/g, " ")}
            </span>
            {isTypingAI && (
              <span className="text-primary italic flex items-center gap-1">
                <span
                  className="w-1 h-1 rounded-full bg-primary animate-typing-dot inline-block"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1 h-1 rounded-full bg-primary animate-typing-dot inline-block"
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className="w-1 h-1 rounded-full bg-primary animate-typing-dot inline-block"
                  style={{ animationDelay: "400ms" }}
                />
                AI typing…
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className={`text-xs px-1.5 py-0.5 rounded border font-semibold ${sentimentColor(thread.sentiment)}`}
          >
            {thread.sentiment}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded border font-semibold bg-muted text-muted-foreground border-border">
            {thread.intent}
          </span>
          {thread.status === "ai-handling" && (
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
              onClick={handleHandoff}
              data-ocid="aiwa-handoff-btn"
            >
              <User className="w-3 h-3" /> Hand off to Agent
            </Button>
          )}
          {/* Convert to Lead */}
          {leadConverted ? (
            <span className="text-xs px-1.5 py-0.5 rounded border font-semibold bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              Lead ✓
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setAiWaLeadFormOpen(true)}
              className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-semibold bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
              data-ocid="aiwa-convert-to-lead-btn"
            >
              <UserPlus className="w-3 h-3" />
              Lead
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        data-ocid="aiwa-messages"
      >
        {localMessages.map((msg) => {
          const isRight = msg.sender === "ai" || msg.sender === "agent";
          const bubbleColor =
            msg.sender === "ai"
              ? "bg-primary/15 border border-primary/30 text-primary"
              : msg.sender === "agent"
                ? "bg-amber-500/15 border border-amber-500/30 text-amber-300"
                : "bg-card border border-border text-foreground";
          const senderLabel =
            msg.sender === "ai"
              ? "AI"
              : msg.sender === "agent"
                ? (thread.handedOffToAgent ?? "Agent")
                : thread.contactName.split(" ")[0];
          return (
            <div
              key={`${msg.id}-${msg.receiptStatus ?? "none"}`}
              className={`flex ${isRight ? "justify-end" : "justify-start"}`}
            >
              {!isRight && (
                <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 text-xs font-bold text-muted-foreground">
                  {thread.contactName[0]}
                </div>
              )}
              <div
                className={`max-w-[72%] flex flex-col gap-0.5 ${isRight ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  {msg.sender === "ai" && (
                    <Bot className="w-3 h-3 text-primary" />
                  )}
                  {msg.sender === "agent" && (
                    <User className="w-3 h-3 text-amber-400" />
                  )}
                  <span
                    className={`text-xs font-semibold ${msg.sender === "ai" ? "text-primary" : msg.sender === "agent" ? "text-amber-400" : "text-muted-foreground"}`}
                  >
                    {senderLabel}
                  </span>
                </div>
                <div
                  className={`px-3 py-2 rounded-lg text-xs leading-relaxed ${bubbleColor}`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">
                    {fmtTime(msg.timestamp)}
                  </span>
                  {isRight && msg.receiptStatus && (
                    <ReceiptIcon status={msg.receiptStatus} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {isTypingAI && <TypingBubble isBot />}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      {thread.status === "resolved" ? (
        <div
          className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center gap-2"
          data-ocid="aiwa-resolved-footer"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-muted-foreground">
            This conversation is resolved
          </span>
        </div>
      ) : (
        <div
          className="px-4 py-2.5 border-t border-border bg-card flex items-center gap-2"
          data-ocid="aiwa-send-footer"
        >
          {thread.status === "ai-handling" && (
            <Bot className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          )}
          <Input
            placeholder={
              thread.status === "ai-handling"
                ? "Simulate incoming message to trigger AI response…"
                : "Type a reply…"
            }
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 h-8 text-xs"
            data-ocid="aiwa-reply-input"
          />
          <Button
            type="button"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={handleSend}
            aria-label="Send reply"
            data-ocid="aiwa-send-btn"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
      {/* Lead entry form for AI WhatsApp thread */}
      <LeadEntryForm
        isOpen={aiWaLeadFormOpen}
        onClose={() => setAiWaLeadFormOpen(false)}
        onSave={handleAiWaConvertToLead}
        title={`Convert to Lead — ${thread.contactName}`}
        prefill={{
          source: "WhatsApp",
          channel: "WhatsApp",
          clientContactPerson: thread.contactName,
          clientMobileNumber: thread.contactPhone,
          requirements: thread.lastMessage,
        }}
      />
    </div>
  );
}

function AIWhatsAppTab({ threads }: { threads: WhatsAppAIThread[] }) {
  const [statusFilter, setStatusFilter] = useState<
    "all" | "ai-handling" | "handed-off" | "resolved"
  >("all");
  const [selected, setSelected] = useState<WhatsAppAIThread>(threads[0]);
  const whatsappAgent = sampleAIAgents.find((a) => a.type === "whatsapp");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return threads;
    return threads.filter((t) => t.status === statusFilter);
  }, [threads, statusFilter]);

  const aiHandlingCount = threads.filter(
    (t) => t.status === "ai-handling",
  ).length;

  return (
    <div className="flex h-full min-h-0">
      {/* Thread list */}
      <div className="w-64 xl:w-72 flex-shrink-0 border-r border-border flex flex-col bg-card">
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-border flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            AI WhatsApp Agent
          </span>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            {aiHandlingCount} active
          </span>
        </div>

        {/* Agent status card */}
        {whatsappAgent && (
          <div className="p-2 border-b border-border">
            <div className="bg-background rounded p-2 flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-card animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">
                  {whatsappAgent.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {whatsappAgent.todayCallCount} messages today ·{" "}
                  {whatsappAgent.successRate}% resolved
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex border-b border-border px-1 py-1 gap-0.5 flex-wrap">
          {(["all", "ai-handling", "handed-off", "resolved"] as const).map(
            (f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-2 py-0.5 text-xs rounded transition-colors font-semibold ${statusFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                data-ocid={`aiwa-filter-${f}`}
              >
                {f === "all"
                  ? "All"
                  : f === "ai-handling"
                    ? "AI"
                    : f === "handed-off"
                      ? "Handed Off"
                      : "Resolved"}
              </button>
            ),
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map((t) => (
            <AIWaThreadItem
              key={t.id}
              thread={t}
              selected={selected.id === t.id}
              onClick={() => setSelected(t)}
            />
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No threads found
            </div>
          )}
        </div>
      </div>

      {/* Conversation panel */}
      <AIWaConversation thread={selected} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "whatsapp" | "sms" | "email" | "ai-call" | "ai-whatsapp";

export default function CommunicationsPage() {
  const [tab, setTab] = useState<Tab>("whatsapp");
  const inboundAgent = sampleAIAgents.find((a) => a.type === "inbound")!;

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    highlight?: boolean;
  }[] = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: MessageSquare,
      count: whatsappThreads.length,
    },
    { key: "sms", label: "SMS", icon: Smartphone, count: smsLogs.length },
    {
      key: "email",
      label: "Marketing Emails",
      icon: Mail,
      count: marketingEmails.length,
    },
    {
      key: "ai-call",
      label: "AI Call Agent",
      icon: Bot,
      count: sampleAICallLogs.length,
      highlight: true,
    },
    {
      key: "ai-whatsapp",
      label: "AI WhatsApp",
      icon: Bot,
      count: sampleWhatsAppAIThreads.length,
      highlight: true,
    },
  ];

  return (
    <div
      className="flex flex-col h-full bg-background"
      data-ocid="communications-page"
    >
      {/* Page header */}
      <div className="px-5 py-3.5 border-b border-border bg-card flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-base font-bold text-foreground font-display tracking-tight">
            Multi-channel Communications
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs gap-1 px-2 py-0">
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              {whatsappThreads.length} WhatsApp
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 px-2 py-0">
              <Smartphone className="w-3 h-3 text-primary" />
              {smsLogs.length} SMS
            </Badge>
            <Badge variant="outline" className="text-xs gap-1 px-2 py-0">
              <Mail className="w-3 h-3 text-accent" />
              {emailCampaigns.length} Email
            </Badge>
            <Badge
              variant="outline"
              className="text-xs gap-1 px-2 py-0 border-emerald-500/30 text-emerald-400"
            >
              <Bot className="w-3 h-3" />
              {sampleAICallLogs.length} AI Calls
            </Badge>
            <Badge
              variant="outline"
              className="text-xs gap-1 px-2 py-0 border-primary/30 text-primary"
            >
              <Bot className="w-3 h-3" />
              {sampleWhatsAppAIThreads.length} AI WA
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="border-b border-border bg-card flex-shrink-0 overflow-x-auto"
        data-ocid="comms-tabs"
      >
        <div className="flex min-w-max">
          {tabs.map(({ key, label, icon: Icon, count, highlight }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                tab === key
                  ? highlight
                    ? "border-emerald-400 text-emerald-400"
                    : "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
              data-ocid={`tab-${key}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {highlight && tab !== key && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-mono ${tab === key ? (highlight ? "bg-emerald-500/15 text-emerald-400" : "bg-primary/15 text-primary") : "bg-muted text-muted-foreground"}`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "whatsapp" && <WhatsAppTab threads={whatsappThreads} />}
        {tab === "sms" && <SmsTab logs={smsLogs} />}
        {tab === "email" && <EmailCampaignsTab />}
        {tab === "ai-call" && (
          <AICallAgentTab agent={inboundAgent} logs={sampleAICallLogs} />
        )}
        {tab === "ai-whatsapp" && (
          <AIWhatsAppTab threads={sampleWhatsAppAIThreads} />
        )}
      </div>
    </div>
  );
}
