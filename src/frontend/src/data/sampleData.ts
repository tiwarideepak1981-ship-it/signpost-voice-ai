import { detectRegion } from "../services/leadRoutingService";
import type {
  AIAgentStatus,
  AICallLog,
  AICampaign,
  AIInboundCallEntry,
  AIOutboundQueueEntry,
  Agent,
  AnalyticsData,
  BillingOverview,
  CallRecord,
  Campaign,
  ClosedDeal,
  Lead,
  MarketingEmail,
  SmsLog,
  WhatsAppAIThread,
  WhatsAppThread,
} from "../types";

// ─── Agents ──────────────────────────────────────────────────────────────────
export const agents: Agent[] = [
  {
    id: "a1",
    name: "GenAI Agent Alpha",
    status: "active",
    totalCalls: 4821,
    successRate: 78.4,
    avgDuration: "2m 34s",
    campaigns: ["c1", "c2", "c3"],
  },
  {
    id: "a2",
    name: "GenAI Agent Beta",
    status: "active",
    totalCalls: 3966,
    successRate: 81.2,
    avgDuration: "2m 18s",
    campaigns: ["c2", "c4"],
  },
  {
    id: "a3",
    name: "GenAI Agent Gamma",
    status: "active",
    totalCalls: 3241,
    successRate: 74.6,
    avgDuration: "2m 52s",
    campaigns: ["c1", "c5"],
  },
  {
    id: "a4",
    name: "GenAI Agent Delta",
    status: "idle",
    totalCalls: 2188,
    successRate: 82.9,
    avgDuration: "2m 07s",
    campaigns: ["c3", "c6"],
  },
  {
    id: "a5",
    name: "GenAI Agent Epsilon",
    status: "offline",
    totalCalls: 1594,
    successRate: 69.3,
    avgDuration: "3m 01s",
    campaigns: ["c4", "c7"],
  },
];

// ─── Campaigns ───────────────────────────────────────────────────────────────
export const campaigns: Campaign[] = [
  {
    id: "c1",
    name: "Q2 Brand Awareness Drive",
    status: "active",
    targetCount: 1200,
    completedCalls: 987,
    successCount: 779,
    failureCount: 208,
    successRate: 78.9,
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    agent: "GenAI Agent Alpha",
    description:
      "Boost brand visibility for FMCG clients via digital and OOH channels",
    avgDuration: "2m 41s",
    totalMinutes: 2648,
  },
  {
    id: "c2",
    name: "Social Media Performance Campaign",
    status: "active",
    targetCount: 800,
    completedCalls: 612,
    successCount: 521,
    failureCount: 91,
    successRate: 85.1,
    startDate: "2024-04-10",
    endDate: "2024-05-31",
    agent: "GenAI Agent Beta",
    description:
      "Meta + Instagram ads for D2C brands targeting 18-35 urban audience",
    avgDuration: "3m 02s",
    totalMinutes: 1860,
  },
  {
    id: "c3",
    name: "OTT Pre-Roll Advertising",
    status: "active",
    targetCount: 650,
    completedCalls: 431,
    successCount: 318,
    failureCount: 113,
    successRate: 73.8,
    startDate: "2024-03-15",
    endDate: "2024-05-15",
    agent: "GenAI Agent Alpha",
    description:
      "Video ad placements on streaming platforms for entertainment brands",
    avgDuration: "2m 22s",
    totalMinutes: 1022,
  },
  {
    id: "c4",
    name: "Programmatic Display Outreach",
    status: "paused",
    targetCount: 2000,
    completedCalls: 1456,
    successCount: 1094,
    failureCount: 362,
    successRate: 75.1,
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    agent: "GenAI Agent Delta",
    description: "Automated display ad buying for e-commerce seasonal sales",
    avgDuration: "1m 54s",
    totalMinutes: 2766,
  },
  {
    id: "c5",
    name: "Influencer Marketing Push",
    status: "completed",
    targetCount: 500,
    completedCalls: 500,
    successCount: 413,
    failureCount: 87,
    successRate: 82.6,
    startDate: "2024-01-10",
    endDate: "2024-03-10",
    agent: "GenAI Agent Gamma",
    description: "Micro and nano influencer campaigns for new product launches",
    avgDuration: "2m 08s",
    totalMinutes: 1066,
  },
  {
    id: "c6",
    name: "Google Search Ads Activation",
    status: "active",
    targetCount: 450,
    completedCalls: 210,
    successCount: 147,
    failureCount: 63,
    successRate: 70.0,
    startDate: "2024-04-15",
    endDate: "2024-06-15",
    agent: "GenAI Agent Delta",
    description: "SEM campaign launch for B2B SaaS and EdTech clients",
    avgDuration: "2m 33s",
    totalMinutes: 536,
  },
  {
    id: "c7",
    name: "Content Marketing Retainer",
    status: "draft",
    targetCount: 1100,
    completedCalls: 0,
    successCount: 0,
    failureCount: 0,
    successRate: 0,
    startDate: "2024-05-01",
    endDate: "2024-07-31",
    agent: "GenAI Agent Epsilon",
    description: "Long-form content, blogs, and SEO for tech startups",
    avgDuration: "—",
    totalMinutes: 0,
  },
  {
    id: "c8",
    name: "Regional Language Campaigns",
    status: "completed",
    targetCount: 300,
    completedCalls: 300,
    successCount: 261,
    failureCount: 39,
    successRate: 87.0,
    startDate: "2023-12-01",
    endDate: "2024-01-31",
    agent: "GenAI Agent Beta",
    description:
      "Vernacular ad campaigns for Tier 2 and Tier 3 market penetration",
    avgDuration: "1m 48s",
    totalMinutes: 540,
  },
  {
    id: "c9",
    name: "Performance Marketing Audit",
    status: "paused",
    targetCount: 750,
    completedCalls: 322,
    successCount: 224,
    failureCount: 98,
    successRate: 69.6,
    startDate: "2024-03-01",
    endDate: "2024-05-01",
    agent: "GenAI Agent Gamma",
    description:
      "CTR optimisation and ROAS improvement for underperforming accounts",
    avgDuration: "2m 14s",
    totalMinutes: 720,
  },
  {
    id: "c10",
    name: "Brand Relaunch Campaign",
    status: "active",
    targetCount: 600,
    completedCalls: 198,
    successCount: 154,
    failureCount: 44,
    successRate: 77.8,
    startDate: "2024-04-20",
    endDate: "2024-06-30",
    agent: "GenAI Agent Alpha",
    description:
      "Full 360-degree campaign for established brands entering new categories",
    avgDuration: "2m 47s",
    totalMinutes: 551,
  },
];

// ─── Call Records (100+) ─────────────────────────────────────────────────────
const callStatuses: CallRecord["status"][] = [
  "success",
  "success",
  "success",
  "failure",
  "pending",
  "missed",
];
const sentiments: CallRecord["sentiment"][] = [
  "positive",
  "positive",
  "neutral",
  "negative",
];
const intents = [
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
const durations = [
  "0:43",
  "1:12",
  "1:34",
  "1:58",
  "2:15",
  "2:34",
  "2:41",
  "2:52",
  "3:04",
  "3:18",
  "3:35",
  "3:43",
  "4:01",
  "4:22",
  "0:00",
];
const durationSecs = [
  43, 72, 94, 118, 135, 154, 161, 172, 184, 198, 215, 223, 241, 262, 0,
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function fmtDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const callerBases = [
  "201-396",
  "207-398",
  "201-388",
  "207-786",
  "207-769",
  "201-398",
  "207-701",
];

export const callRecords: CallRecord[] = Array.from({ length: 120 }, (_, i) => {
  const base = callerBases[i % callerBases.length];
  const suffix = String(400 + i * 7).padStart(3, "0");
  const campIdx = i % campaigns.length;
  const agentIdx = i % agents.length;
  const statusIdx = i % callStatuses.length;
  const durIdx = i % durations.length;
  const directionArr: CallRecord["direction"][] = [
    "outbound",
    "outbound",
    "inbound",
  ];
  const d = new Date(2024, 3, 1 + (i % 30), 9 + (i % 9), i % 60);
  return {
    id: `call-${i + 1}`,
    callerId: `${base}${suffix}`,
    timestamp: fmtDate(d),
    campaign: campaigns[campIdx].name,
    campaignId: campaigns[campIdx].id,
    agent: agents[agentIdx].name,
    agentId: agents[agentIdx].id,
    duration: callStatuses[statusIdx] === "missed" ? "0:00" : durations[durIdx],
    durationSeconds:
      callStatuses[statusIdx] === "missed" ? 0 : durationSecs[durIdx],
    sentiment: sentiments[i % sentiments.length],
    status: callStatuses[statusIdx],
    direction: directionArr[i % directionArr.length],
    intent: intents[i % intents.length],
    notes:
      i % 5 === 0 ? "Follow-up scheduled" : i % 7 === 0 ? "DND requested" : "",
    leadId: i % 3 === 0 ? `lead-${(i % 80) + 1}` : undefined,
  };
});

// ─── Leads (80+) ─────────────────────────────────────────────────────────────
const firstNames = [
  "Arjun",
  "Priya",
  "Rahul",
  "Ananya",
  "Vikram",
  "Deepa",
  "Suresh",
  "Kavya",
  "Nikhil",
  "Meera",
  "Rohan",
  "Sneha",
  "Aditya",
  "Divya",
  "Kiran",
  "Pooja",
  "Amit",
  "Lakshmi",
  "Sanjay",
  "Nisha",
  "Rajesh",
  "Sunita",
  "Manoj",
  "Geeta",
  "Sunil",
  "Smita",
  "Vijay",
  "Rekha",
  "Anil",
  "Asha",
];
const lastNames = [
  "Sharma",
  "Patel",
  "Kumar",
  "Singh",
  "Reddy",
  "Nair",
  "Iyer",
  "Mehta",
  "Joshi",
  "Gupta",
  "Shah",
  "Verma",
  "Pillai",
  "Bose",
  "Rao",
  "Malhotra",
  "Chopra",
  "Das",
  "Khanna",
  "Tiwari",
];
const companies = [
  "Dentsu India",
  "GroupM",
  "Ogilvy India",
  "Publicis Sapient",
  "WPP India",
  "BBDO India",
  "Leo Burnett",
  "Grey India",
  "McCann India",
  "Lowe Lintas",
  "Wunderman Thompson",
  "Omnicom Media Group",
  "Havas India",
  "Madison World",
  "iProspect",
  "Kinnect",
  "Schbang",
  "Social Beat",
  "Mirum India",
  "DDB Mudra",
  "Creativeland Asia",
  "Foxymoron",
  "White Rivers Media",
  "Hindustan Unilever",
  "Nestle India",
  "Marico",
  "Dabur India",
  "ITC Limited",
  "Godrej Consumer Products",
  "Zomato",
  "Swiggy",
  "Nykaa",
  "Myntra",
  "Meesho",
  "Flipkart",
];
const leadRoles = [
  "Media Director",
  "Brand Manager",
  "Performance Marketing Lead",
  "Digital Marketing Head",
  "Creative Director",
  "Account Director",
  "VP Marketing",
  "Head of Growth",
  "CMO",
  "Content Strategy Lead",
  "Paid Media Manager",
  "Campaign Manager",
];
const locations = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Visakhapatnam",
  "Indore",
];
const leadStatuses: Lead["status"][] = [
  "hot",
  "hot",
  "warm",
  "warm",
  "cold",
  "converted",
  "lost",
];

export const leads: Lead[] = Array.from({ length: 85 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[i % lastNames.length];
  const campIdx = i % campaigns.length;
  const agentIdx = i % agents.length;
  const statusIdx = i % leadStatuses.length;
  const score =
    leadStatuses[statusIdx] === "hot"
      ? 80 + (i % 20)
      : leadStatuses[statusIdx] === "warm"
        ? 50 + (i % 30)
        : 10 + (i % 40);
  const d = new Date(2024, 3, 1 + (i % 28));
  const fd = new Date(2024, 3, 5 + (i % 25));
  const role = leadRoles[i % leadRoles.length];
  const company = companies[i % companies.length];
  const location = locations[i % locations.length];
  const partialLead = {
    id: `lead-${i + 1}`,
    name: `${fn} ${ln}`,
    phone: `+91-9${String(800000000 + i * 1234).slice(0, 9)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${company.toLowerCase().replace(/[\s&]/g, "").replace(/\./g, "")}.com`,
    company,
    status: leadStatuses[statusIdx],
    intent: intents[i % intents.length],
    score,
    lastContact: fmtDate(d),
    followUpDate: `${fd.getFullYear()}-${pad(fd.getMonth() + 1)}-${pad(fd.getDate())}`,
    assignedAgent: agents[agentIdx].name,
    campaignSource: campaigns[campIdx].name,
    notes:
      i % 4 === 0
        ? `${role} — keen on Q3 media planning proposal`
        : i % 6 === 0
          ? "Requested agency credentials deck"
          : "Needs follow-up on campaign brief",
    callCount: 1 + (i % 6),
    location,
  };
  const region = detectRegion(partialLead);
  const headNames: Record<string, string> = {
    North: "Rajesh Kumar",
    East: "Priya Das",
    West: "Amit Shah",
    South: "Lakshmi Nair",
    ROM: "Vikram Mehta",
    Trading: "Neha Sharma",
    Agency: "Arjun Patel",
  };
  return {
    ...partialLead,
    region,
    routedTo: headNames[region] ?? "Vikram Mehta",
    routedAt: "2025-01-10T09:00:00Z",
    routingStatus: "sent" as const,
  };
});

// ─── Billing ─────────────────────────────────────────────────────────────────
export const billingOverview: BillingOverview = {
  currentMinutesUsed: 1847,
  currentMinutesAllocated: 2000,
  currentSpend: 20.0,
  nextInvoiceDate: "June 11, 2024",
  plan: "Professional",
  pricePerMinute: 0.0108,
  records: [
    {
      month: "May",
      year: 2024,
      minutesUsed: 1847,
      minutesAllocated: 2000,
      amount: 19.94,
      status: "pending",
      invoiceId: "INV-2024-005",
    },
    {
      month: "April",
      year: 2024,
      minutesUsed: 1982,
      minutesAllocated: 2000,
      amount: 21.41,
      status: "paid",
      invoiceId: "INV-2024-004",
    },
    {
      month: "March",
      year: 2024,
      minutesUsed: 2000,
      minutesAllocated: 2000,
      amount: 21.6,
      status: "paid",
      invoiceId: "INV-2024-003",
    },
    {
      month: "February",
      year: 2024,
      minutesUsed: 1763,
      minutesAllocated: 2000,
      amount: 19.04,
      status: "paid",
      invoiceId: "INV-2024-002",
    },
    {
      month: "January",
      year: 2024,
      minutesUsed: 1641,
      minutesAllocated: 2000,
      amount: 17.72,
      status: "paid",
      invoiceId: "INV-2024-001",
    },
    {
      month: "December",
      year: 2023,
      minutesUsed: 1524,
      minutesAllocated: 2000,
      amount: 16.46,
      status: "paid",
      invoiceId: "INV-2023-012",
    },
  ],
};

// ─── WhatsApp Threads ─────────────────────────────────────────────────────────
export const whatsappThreads: WhatsAppThread[] = leads
  .slice(0, 25)
  .map((l, i) => ({
    id: `wa-${i + 1}`,
    contactName: l.name,
    contactPhone: l.phone,
    lastMessage:
      i % 3 === 0
        ? "Can you share the updated creative brief for Q3?"
        : i % 3 === 1
          ? "Approved! Please proceed with the media buy."
          : "What's the CTR on the Instagram campaign so far?",
    lastMessageTime: fmtDate(new Date(2024, 3, 28 - i, 10 + (i % 10), i % 60)),
    unreadCount: i % 4 === 0 ? 2 : i % 5 === 0 ? 1 : 0,
    status: i % 5 === 0 ? "delivered" : "read",
    campaignId: campaigns[i % campaigns.length].id,
  }));

// ─── SMS Logs ─────────────────────────────────────────────────────────────────
export const smsLogs: SmsLog[] = leads.slice(0, 40).map((l, i) => ({
  id: `sms-${i + 1}`,
  recipient: l.name,
  phone: l.phone,
  message:
    i % 3 === 0
      ? `Hi ${l.name.split(" ")[0]}, your Q2 ad campaign is live! Current CTR: 4.2%, Impressions: 125K. Review your dashboard now.`
      : i % 3 === 1
        ? `${l.name.split(" ")[0]}, your media plan for Q3 is ready for review. Schedule a call with your account manager.`
        : "Campaign update: Your brand awareness drive has reached 500K impressions. Reply YES for the full report.",
  timestamp: fmtDate(new Date(2024, 3, 25 - (i % 25), 8 + (i % 10), i % 60)),
  status: i % 6 === 0 ? "failed" : i % 3 === 0 ? "read" : "delivered",
  campaignId: campaigns[i % campaigns.length].id,
  direction: i % 5 === 0 ? "inbound" : "outbound",
}));

// ─── Marketing Emails ─────────────────────────────────────────────────────────
const emailSubjects = [
  "Your Q2 Campaign Performance Report Is Ready",
  "Media Planning for Upcoming Brand Launch",
  "Creative Package — Exclusive Q3 Offer",
  "Programmatic Buying: New Inventory Available",
  "Influencer Marketing: Top Creators for Your Brand",
  "Google Ads: Optimize Your ROAS Now",
  "OTT Advertising: Premium Placement for Q4",
  "Regional Campaign Brief — Vernacular Expansion",
  "Performance Audit: Boost Your CTR by 30%",
  "Brand Relaunch: Full 360° Campaign Strategy",
];

export const marketingEmails: MarketingEmail[] = leads
  .slice(0, 50)
  .map((l, i) => ({
    id: `email-${i + 1}`,
    subject: emailSubjects[i % emailSubjects.length],
    recipient: l.name,
    email: l.email,
    sentAt: fmtDate(new Date(2024, 3, 20 - (i % 20), 9 + (i % 8), i % 60)),
    openedAt:
      i % 3 !== 0
        ? fmtDate(new Date(2024, 3, 20 - (i % 20), 14, i % 50))
        : undefined,
    clickedAt:
      i % 5 === 0
        ? fmtDate(new Date(2024, 3, 21 - (i % 20), 10, i % 40))
        : undefined,
    status:
      i % 10 === 0
        ? "bounced"
        : i % 5 === 0
          ? "clicked"
          : i % 3 === 0
            ? "sent"
            : "opened",
    campaignId: campaigns[i % campaigns.length].id,
  }));

// ─── Analytics ────────────────────────────────────────────────────────────────
const callVolumeBase = [
  98, 110, 134, 121, 145, 162, 178, 141, 155, 169, 182, 175, 148, 163, 177, 189,
  201, 193, 177, 168, 182, 198, 210, 196, 204, 215, 198, 187, 202, 218,
];
export const analyticsData: AnalyticsData = {
  dailyTrends: callVolumeBase.map((calls, i) => {
    const d = new Date(2024, 3, 1 + i);
    return {
      date: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`,
      calls,
      successRate: 68 + (i % 18),
      avgDuration: 120 + (i % 80),
    };
  }),
  hourlyDistribution: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    calls:
      h < 8 || h > 20
        ? Math.floor(Math.random() * 5)
        : 20 + Math.floor(Math.abs(Math.sin(h / 3)) * 80),
  })),
  intentBreakdown: intents.map((intent, i) => ({
    intent,
    count: 180 - i * 14,
    rate: 85 - i * 3,
  })),
  topCampaigns: campaigns.slice(0, 5).map((c) => ({
    name: c.name,
    calls: c.completedCalls,
    rate: c.successRate,
  })),
  conversionFunnel: [
    { stage: "Calls Made", count: 5196 },
    { stage: "Connected", count: 4420 },
    { stage: "Interested", count: 2876 },
    { stage: "Follow-up Set", count: 1644 },
    { stage: "Converted", count: 948 },
  ],
};

// ─── Overview stats ───────────────────────────────────────────────────────────
export const overviewStats = {
  totalCallsToday: 1245,
  callsChangePercent: +12,
  avgCallDuration: "2m 15s",
  conversionRate: 18.3,
  activeCampaigns: 5,
  apiUsagePercent: 68,
  intentAccuracy: 88,
  totalLeads: leads.length,
  hotLeads: leads.filter((l) => l.status === "hot").length,
};

// ─── Closed Deals ─────────────────────────────────────────────────────────────
export const sampleClosedDeals: ClosedDeal[] = [
  // Inbound deals (12-15 days, ₹40k-₹80k)
  {
    id: "deal-1",
    leadId: "lead-3",
    leadName: "Vikram Reddy",
    company: "Ogilvy India",
    leadSource: "inbound",
    leadReceivedDate: new Date("2026-01-08"),
    firstContactDate: new Date("2026-01-08"),
    closeDate: new Date("2026-01-21"),
    daysToClose: 13,
    revenueAmount: 62000,
    assignedAgent: "Priya Sharma",
    campaignName: "Inbound Inquiry Flow",
    industry: "FMCG Advertising",
  },
  {
    id: "deal-2",
    leadId: "lead-7",
    leadName: "Ananya Nair",
    company: "Kinnect",
    leadSource: "inbound",
    leadReceivedDate: new Date("2026-01-10"),
    firstContactDate: new Date("2026-01-10"),
    closeDate: new Date("2026-01-24"),
    daysToClose: 14,
    revenueAmount: 45000,
    assignedAgent: "Arjun Mehta",
    campaignName: "Inbound Inquiry Flow",
    industry: "E-commerce Advertising",
  },
  {
    id: "deal-3",
    leadId: "lead-12",
    leadName: "Suresh Iyer",
    company: "Social Beat",
    leadSource: "inbound",
    leadReceivedDate: new Date("2026-01-15"),
    firstContactDate: new Date("2026-01-15"),
    closeDate: new Date("2026-01-27"),
    daysToClose: 12,
    revenueAmount: 78000,
    assignedAgent: "Kavya Nair",
    campaignName: "Inbound Inquiry Flow",
    industry: "EdTech Advertising",
  },
  {
    id: "deal-4",
    leadId: "lead-18",
    leadName: "Meera Gupta",
    company: "Havas India",
    leadSource: "inbound",
    leadReceivedDate: new Date("2026-01-20"),
    firstContactDate: new Date("2026-01-20"),
    closeDate: new Date("2026-02-03"),
    daysToClose: 14,
    revenueAmount: 55000,
    assignedAgent: "Rahul Singh",
    campaignName: "Inbound Inquiry Flow",
    industry: "OTT Advertising",
  },
  {
    id: "deal-5",
    leadId: "lead-24",
    leadName: "Rohan Shah",
    company: "White Rivers Media",
    leadSource: "inbound",
    leadReceivedDate: new Date("2026-01-25"),
    firstContactDate: new Date("2026-01-25"),
    closeDate: new Date("2026-02-06"),
    daysToClose: 12,
    revenueAmount: 42000,
    assignedAgent: "Deepika Rao",
    campaignName: "Inbound Inquiry Flow",
    industry: "Retail Advertising",
  },
  {
    id: "deal-6",
    leadId: "lead-31",
    leadName: "Sneha Joshi",
    company: "Foxymoron",
    leadSource: "inbound",
    leadReceivedDate: new Date("2026-02-01"),
    firstContactDate: new Date("2026-02-01"),
    closeDate: new Date("2026-02-14"),
    daysToClose: 13,
    revenueAmount: 68000,
    assignedAgent: "Priya Sharma",
    campaignName: "Inbound Inquiry Flow",
    industry: "BFSI Advertising",
  },
  // Outbound deals (18-25 days, ₹80k-₹1.5L)
  {
    id: "deal-7",
    leadId: "lead-5",
    leadName: "Aditya Verma",
    company: "Dentsu India",
    leadSource: "outbound",
    leadReceivedDate: new Date("2025-12-20"),
    firstContactDate: new Date("2025-12-22"),
    closeDate: new Date("2026-01-10"),
    daysToClose: 21,
    revenueAmount: 125000,
    assignedAgent: "Arjun Mehta",
    campaignName: "Q4 Brand Outreach Campaign",
    industry: "Automotive Marketing",
  },
  {
    id: "deal-8",
    leadId: "lead-9",
    leadName: "Kiran Pillai",
    company: "GroupM",
    leadSource: "outbound",
    leadReceivedDate: new Date("2025-12-22"),
    firstContactDate: new Date("2025-12-24"),
    closeDate: new Date("2026-01-13"),
    daysToClose: 22,
    revenueAmount: 110000,
    assignedAgent: "Kavya Nair",
    campaignName: "Q4 Brand Outreach Campaign",
    industry: "FMCG Advertising",
  },
  {
    id: "deal-9",
    leadId: "lead-14",
    leadName: "Pooja Malhotra",
    company: "Publicis Sapient",
    leadSource: "outbound",
    leadReceivedDate: new Date("2026-01-03"),
    firstContactDate: new Date("2026-01-05"),
    closeDate: new Date("2026-01-25"),
    daysToClose: 22,
    revenueAmount: 145000,
    assignedAgent: "Rahul Singh",
    campaignName: "Performance Marketing Upgrade",
    industry: "Healthcare Advertising",
  },
  {
    id: "deal-10",
    leadId: "lead-19",
    leadName: "Amit Chopra",
    company: "Madison World",
    leadSource: "outbound",
    leadReceivedDate: new Date("2026-01-08"),
    firstContactDate: new Date("2026-01-10"),
    closeDate: new Date("2026-01-28"),
    daysToClose: 20,
    revenueAmount: 92000,
    assignedAgent: "Deepika Rao",
    campaignName: "Performance Marketing Upgrade",
    industry: "Travel & Hospitality Marketing",
  },
  {
    id: "deal-11",
    leadId: "lead-26",
    leadName: "Vijay Bose",
    company: "McCann India",
    leadSource: "outbound",
    leadReceivedDate: new Date("2026-01-12"),
    firstContactDate: new Date("2026-01-14"),
    closeDate: new Date("2026-02-05"),
    daysToClose: 24,
    revenueAmount: 138000,
    assignedAgent: "Priya Sharma",
    campaignName: "Performance Marketing Upgrade",
    industry: "Real Estate Marketing",
  },
  {
    id: "deal-12",
    leadId: "lead-33",
    leadName: "Lakshmi Das",
    company: "Schbang",
    leadSource: "outbound",
    leadReceivedDate: new Date("2026-01-18"),
    firstContactDate: new Date("2026-01-20"),
    closeDate: new Date("2026-02-10"),
    daysToClose: 23,
    revenueAmount: 115000,
    assignedAgent: "Arjun Mehta",
    campaignName: "Q4 Brand Outreach Campaign",
    industry: "E-commerce Advertising",
  },
];

// ─── AI Call Logs ─────────────────────────────────────────────────────────────
const now = new Date("2026-04-13T10:00:00");
function daysAgo(d: number, h = 0, m = 0): Date {
  const dt = new Date(now);
  dt.setDate(dt.getDate() - d);
  dt.setHours(h, m, 0, 0);
  return dt;
}

export const sampleAICallLogs: AICallLog[] = [
  // Inbound calls (12)
  {
    id: "ai-call-1",
    callerName: "Rakesh Sharma",
    callerPhone: "+91-9812340001",
    callerCompany: "Dentsu India",
    direction: "inbound",
    timestamp: daysAgo(0, 9, 15),
    duration: 185,
    sentiment: "positive",
    intent: "Media Plan Inquiry",
    summary:
      "Media Director at Dentsu exploring AI-driven outreach for their FMCG client's Q3 media planning.",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for calling Signpost Voice AI. How can I help you today?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Hi, I'm Rakesh from Dentsu India. We manage media planning for several FMCG clients and I wanted to explore your AI voice platform.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Great! We help media agencies automate outbound prospecting calls to brand clients — ideal for pitching media plans and quarterly reviews. Are you looking to automate client outreach or inbound brief collection?",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "Primarily outbound. We pitch media plans to 50+ brand managers every quarter.",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "Perfect fit. I'll have one of our solutions specialists schedule a personalised demo. Can I get your email address?",
        timestamp: 28,
      },
      {
        speaker: "CALLER",
        text: "Sure, it's rakesh.sharma@dentsu.com.",
        timestamp: 36,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-2",
    callerName: "Divya Reddy",
    callerPhone: "+91-9823450002",
    callerCompany: "Nykaa",
    direction: "inbound",
    timestamp: daysAgo(0, 10, 30),
    duration: 142,
    sentiment: "positive",
    intent: "Ad Budget Allocation",
    summary:
      "Performance Marketing Lead at Nykaa requested pricing for 20-seat plan to manage influencer and paid social outreach.",
    transcript: [
      {
        speaker: "AI",
        text: "Welcome to Signpost Voice AI. How may I assist you?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I need pricing information for your platform. We're a D2C beauty brand scaling our performance marketing team.",
        timestamp: 4,
      },
      {
        speaker: "AI",
        text: "Sure! Our plans start at ₹15,000/month for up to 10 seats. For 20 seats managing influencer outreach and paid media follow-ups, we have a Professional plan at ₹27,000/month. Shall I email you the full pricing deck?",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "Yes please. Email is divya.r@nykaa.com.",
        timestamp: 24,
      },
      {
        speaker: "AI",
        text: "Done! You'll receive the pricing deck in a few minutes. Would you like me to schedule a call with our D2C specialist?",
        timestamp: 30,
      },
    ],
    actionTaken: "gathered-info",
    isHandedOff: false,
  },
  {
    id: "ai-call-3",
    callerName: "Sanjay Mehta",
    callerPhone: "+91-9834560003",
    callerCompany: "GroupM",
    direction: "inbound",
    timestamp: daysAgo(0, 11, 45),
    duration: 260,
    sentiment: "neutral",
    intent: "Campaign Performance Review",
    summary:
      "Account Director at GroupM exploring AI calling for campaign performance review calls with brand clients. Transferred to enterprise team.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello! You've reached Signpost Voice AI. How can I help?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We're GroupM and we're looking at AI solutions for our monthly campaign performance review calls. We manage 300+ brand accounts.",
        timestamp: 6,
      },
      {
        speaker: "AI",
        text: "That's an enterprise-scale use case. We do support high-volume deployments for agency networks. Let me connect you with our enterprise solutions team who can discuss custom pricing.",
        timestamp: 15,
      },
      {
        speaker: "CALLER",
        text: "Sure, that would be helpful.",
        timestamp: 25,
      },
      {
        speaker: "AI",
        text: "Transferring you now. Please hold for a moment.",
        timestamp: 28,
      },
    ],
    actionTaken: "transferred-to-agent",
    isHandedOff: true,
  },
  {
    id: "ai-call-4",
    callerName: "Neha Kulkarni",
    callerPhone: "+91-9845670004",
    callerCompany: "Hindustan Unilever",
    direction: "inbound",
    timestamp: daysAgo(1, 9, 0),
    duration: 95,
    sentiment: "negative",
    intent: "Campaign Performance Review",
    summary:
      "Brand Manager at HUL frustrated with delayed campaign reports. Escalated to account support.",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for calling Signpost Voice AI support. What can I help you with today?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Our campaign performance reports have been delayed three weeks in a row. This is unacceptable!",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "I sincerely apologise for the inconvenience. I'm flagging this as a high-priority issue and connecting you with our account support team immediately.",
        timestamp: 13,
      },
      {
        speaker: "CALLER",
        text: "Please make sure someone actually fixes the reporting pipeline this time.",
        timestamp: 22,
      },
    ],
    actionTaken: "transferred-to-agent",
    isHandedOff: true,
  },
  {
    id: "ai-call-5",
    callerName: "Ravi Tiwari",
    callerPhone: "+91-9856780005",
    callerCompany: "Swiggy",
    direction: "inbound",
    timestamp: daysAgo(1, 11, 20),
    duration: 175,
    sentiment: "positive",
    intent: "Brand Proposal Presentation",
    summary:
      "Strategic partnership inquiry from Swiggy for integrating AI calling into their advertising agency outreach.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, Signpost Voice AI. How may I help you?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Hi, I'm from Swiggy's marketing team. We want to explore using your platform to pitch our advertising solutions to restaurant brand partners.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Wonderful! That's a great use case — AI-driven outreach to brand partners for co-advertising proposals. I'll schedule a meeting with our business development team. What's a good time this week?",
        timestamp: 14,
      },
      { speaker: "CALLER", text: "Thursday 3 PM works great.", timestamp: 22 },
      {
        speaker: "AI",
        text: "Confirmed — Thursday at 3 PM with our BD team. You'll receive a calendar invite at your registered email.",
        timestamp: 26,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-6",
    callerName: "Priti Sharma",
    callerPhone: "+91-9867890006",
    callerCompany: "Mirum India",
    direction: "inbound",
    timestamp: daysAgo(2, 10, 5),
    duration: 130,
    sentiment: "neutral",
    intent: "Digital Ad Spend Optimization",
    summary:
      "Digital Head at Mirum India asking about WhatsApp AI integration for campaign brief collection alongside voice calling.",
    transcript: [
      {
        speaker: "AI",
        text: "Welcome to Signpost Voice AI! How can I assist you?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Do you guys also handle WhatsApp automation for collecting creative briefs along with calling?",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Yes, we offer a unified multi-channel AI platform covering voice calls, WhatsApp, and SMS — all from a single dashboard. Ideal for agencies collecting briefs and sharing campaign updates.",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "Interesting. Can you send more details on the WhatsApp module?",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "Absolutely! I've noted your inquiry. Our team will reach out within 24 hours with detailed product information.",
        timestamp: 25,
      },
    ],
    actionTaken: "gathered-info",
    isHandedOff: false,
  },
  {
    id: "ai-call-7",
    callerName: "Mohit Aggarwal",
    callerPhone: "+91-9878900007",
    callerCompany: "Marico",
    direction: "inbound",
    timestamp: daysAgo(2, 14, 30),
    duration: 210,
    sentiment: "positive",
    intent: "Influencer Collaboration Request",
    summary:
      "Head of Digital Marketing at Marico wants a demo for AI-powered influencer outreach and campaign briefing calls.",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for contacting Signpost Voice AI. How can I help?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I head digital marketing at Marico. We're scaling our influencer programme and need AI to reach out to creators with campaign briefs and negotiate rates.",
        timestamp: 6,
      },
      {
        speaker: "AI",
        text: "That's a great use case! Our AI can personalise outreach scripts based on creator category, past performance, and brand fit. Would you like a live demo?",
        timestamp: 15,
      },
      {
        speaker: "CALLER",
        text: "Definitely. Can we do it this Friday?",
        timestamp: 24,
      },
      {
        speaker: "AI",
        text: "Friday works! I'm booking a demo slot for Friday at 11 AM. You'll receive a confirmation email shortly.",
        timestamp: 29,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-8",
    callerName: "Kavitha Rao",
    callerPhone: "+91-9889010008",
    callerCompany: "Myntra",
    direction: "inbound",
    timestamp: daysAgo(3, 9, 45),
    duration: 88,
    sentiment: "negative",
    intent: "Ad Budget Allocation",
    summary:
      "Performance Marketing Lead at Myntra requested cancellation — budget reallocation to in-house team. Offered discount, customer insisted on cancellation.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, Signpost Voice AI. How can I help you today?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I want to cancel our subscription. We're moving performance marketing in-house and don't need the platform anymore.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "I'm sorry to hear that. We do have a budget-friendly plan that many in-house teams use alongside their own tools. Would a 20% discount for the next 6 months change your mind?",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "No, we've already made the decision. Please process the cancellation.",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "Understood. I'm escalating this to our retention team to process your request. You'll hear from them within 2 hours.",
        timestamp: 26,
      },
    ],
    actionTaken: "transferred-to-agent",
    isHandedOff: true,
  },
  {
    id: "ai-call-9",
    callerName: "Arun Khanna",
    callerPhone: "+91-9890120009",
    callerCompany: "Publicis Sapient",
    direction: "inbound",
    timestamp: daysAgo(3, 15, 0),
    duration: 155,
    sentiment: "neutral",
    intent: "Campaign ROI Analysis",
    summary:
      "Senior Account Director at Publicis Sapient requested custom enterprise pricing for 100+ seat deployment across multiple client accounts.",
    transcript: [
      {
        speaker: "AI",
        text: "Welcome! How can I help you today?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We need pricing for a 100+ seat deployment across 3 major client verticals — FMCG, e-commerce, and automotive.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "For enterprise deployments of that scale across agency verticals, we offer custom pricing with dedicated support and white-label options. Can I connect you with our enterprise sales team?",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "Yes, please. But also send me a ballpark estimate.",
        timestamp: 21,
      },
      {
        speaker: "AI",
        text: "Enterprise plans typically start at ₹2.5L/month for 100 seats. Our team will contact you with a tailored agency proposal.",
        timestamp: 28,
      },
    ],
    actionTaken: "gathered-info",
    isHandedOff: false,
  },
  {
    id: "ai-call-10",
    callerName: "Seema Verma",
    callerPhone: "+91-9901230010",
    callerCompany: "Dabur India",
    direction: "inbound",
    timestamp: daysAgo(4, 10, 15),
    duration: 200,
    sentiment: "positive",
    intent: "Audience Targeting Strategy",
    summary:
      "VP Marketing at Dabur India exploring AI-powered outreach to regional distributors and retail partners for vernacular ad campaigns.",
    transcript: [
      {
        speaker: "AI",
        text: "Good morning! Signpost Voice AI, how can I help?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We run regional vernacular campaigns and need AI to outreach to 5,000+ retail partners about upcoming promotions in their local language.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "We're built for exactly that. Our AI supports 12 regional Indian languages and can personalise outreach based on geography, product category, and partner tier — all in real time.",
        timestamp: 13,
      },
      {
        speaker: "CALLER",
        text: "Can it integrate with our existing marketing automation tools?",
        timestamp: 24,
      },
      {
        speaker: "AI",
        text: "Yes, we support integrations with HubSpot, Salesforce, and custom CRM via API. I'll send you our integration documentation.",
        timestamp: 30,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-11",
    callerName: "Deepak Nair",
    callerPhone: "+91-9912340011",
    callerCompany: "Schbang",
    direction: "inbound",
    timestamp: daysAgo(5, 11, 0),
    duration: 120,
    sentiment: "neutral",
    intent: "Creative Brief Discussion",
    summary:
      "Creative Director at Schbang exploring AI calling for creator and influencer brief distribution across pan-India campaigns.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, Signpost Voice AI. What can I do for you?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We want to distribute creative briefs to influencers across regional languages. Would your AI support calls in Hindi, Tamil, and Marathi?",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Yes! We support 12 Indian regional languages including Hindi, Tamil, Telugu, Marathi, and Bengali. Each AI agent can be configured for specific languages and campaign scripts.",
        timestamp: 14,
      },
      {
        speaker: "CALLER",
        text: "That's very interesting. Let me discuss internally and get back.",
        timestamp: 24,
      },
      {
        speaker: "AI",
        text: "Of course! I've noted your inquiry. Feel free to call back anytime or visit signpostai.com for more details.",
        timestamp: 29,
      },
    ],
    actionTaken: "resolved",
    isHandedOff: false,
  },
  {
    id: "ai-call-12",
    callerName: "Tanya Singh",
    callerPhone: "+91-9923450012",
    callerCompany: "ITC Limited",
    direction: "inbound",
    timestamp: daysAgo(6, 14, 45),
    duration: 170,
    sentiment: "positive",
    intent: "Brand Proposal Presentation",
    summary:
      "CMO at ITC Limited wants a demo for AI-assisted brand proposal delivery to advertising agency partners.",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for calling Signpost Voice AI. How can I help?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We want to use AI to deliver brand strategy proposals to our 20+ agency partners and collect feedback efficiently.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Perfect use case! Our AI can deliver personalised brand briefs, collect agency responses, and score intent — all automatically. Shall I schedule a demo?",
        timestamp: 13,
      },
      {
        speaker: "CALLER",
        text: "Yes, next Tuesday works for us.",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "Tuesday is confirmed. Sending a calendar invite to your registered email now.",
        timestamp: 27,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  // Outbound calls (8)
  {
    id: "ai-call-13",
    callerName: "Harish Patel",
    callerPhone: "+91-9934560013",
    callerCompany: "Godrej Consumer Products",
    direction: "outbound",
    timestamp: daysAgo(0, 10, 0),
    duration: 195,
    sentiment: "positive",
    intent: "Media Plan Inquiry",
    summary:
      "Outbound AI connected with Godrej's media head — strong interest in AI-driven media planning calls to agency partners.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, is this Harish Patel from Godrej Consumer Products?",
        timestamp: 0,
      },
      { speaker: "CALLER", text: "Yes, speaking.", timestamp: 4 },
      {
        speaker: "AI",
        text: "Hi Harish, I'm calling from Signpost Voice AI. We help FMCG brands automate their media agency outreach — from plan approvals to campaign review calls. Would you have 2 minutes?",
        timestamp: 6,
      },
      {
        speaker: "CALLER",
        text: "Yes, I'm actually looking for something to streamline our quarterly media plan reviews with our 8 agency partners.",
        timestamp: 16,
      },
      {
        speaker: "AI",
        text: "Excellent! Our platform can automate those review calls, collect agency feedback, and flag bottlenecks — saving 40+ hours per quarter. I'd love to have our specialist walk you through a demo. Would Friday work?",
        timestamp: 24,
      },
      { speaker: "CALLER", text: "Friday afternoon is fine.", timestamp: 32 },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-14",
    callerName: "Supriya Iyer",
    callerPhone: "+91-9945670014",
    callerCompany: "Leo Burnett",
    direction: "outbound",
    timestamp: daysAgo(1, 11, 30),
    duration: 85,
    sentiment: "negative",
    intent: "Brand Proposal Presentation",
    summary:
      "Account Director at Leo Burnett declined — said they already use a competitor solution for client outreach.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello Supriya, calling from Signpost Voice AI. We're reaching out to leading creative agencies about our AI platform for client outreach and campaign brief automation.",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We already have a calling solution in place for client communications.",
        timestamp: 9,
      },
      {
        speaker: "AI",
        text: "I understand. Are you satisfied with the current solution, or would you be open to a comparison demo focused on campaign brief automation?",
        timestamp: 13,
      },
      {
        speaker: "CALLER",
        text: "Not at this time, thank you.",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "No problem at all. I'll note that you're already sorted and we won't call again for 3 months. Have a great day!",
        timestamp: 23,
      },
    ],
    actionTaken: "gathered-info",
    isHandedOff: false,
  },
  {
    id: "ai-call-15",
    callerName: "Nikhil Chopra",
    callerPhone: "+91-9956780015",
    callerCompany: "Ogilvy India",
    direction: "outbound",
    timestamp: daysAgo(1, 15, 10),
    duration: 230,
    sentiment: "positive",
    intent: "Performance Metrics Consultation",
    summary:
      "VP at Ogilvy India interested in pricing for 30-seat subscription to automate client performance review calls. Follow-up booked.",
    transcript: [
      {
        speaker: "AI",
        text: "Hi Nikhil, this is an AI assistant from Signpost Voice AI. Do you have a moment?",
        timestamp: 0,
      },
      { speaker: "CALLER", text: "Sure, go ahead.", timestamp: 5 },
      {
        speaker: "AI",
        text: "We help agencies like Ogilvy automate monthly performance review calls to brand clients — sharing CTR, ROAS, and CPM metrics automatically. Interested in learning more?",
        timestamp: 8,
      },
      {
        speaker: "CALLER",
        text: "Actually yes — what's the pricing for about 30 client managers?",
        timestamp: 18,
      },
      {
        speaker: "AI",
        text: "For 30 seats on our Professional plan, it's ₹72,000 per month with unlimited calls and campaign analytics dashboards. We also offer a free 14-day trial.",
        timestamp: 24,
      },
      {
        speaker: "CALLER",
        text: "That sounds reasonable. Can someone from your team call me tomorrow?",
        timestamp: 35,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-16",
    callerName: "Radhika Singh",
    callerPhone: "+91-9967890016",
    callerCompany: "BBDO India",
    direction: "outbound",
    timestamp: daysAgo(2, 9, 30),
    duration: 110,
    sentiment: "neutral",
    intent: "Creative Brief Discussion",
    summary:
      "Voicemail left for Creative Director at BBDO India — AI left detailed message about campaign brief automation with callback number.",
    transcript: [
      {
        speaker: "AI",
        text: "Hi, this is an AI assistant from Signpost Voice AI calling for Radhika Singh. We'd love to show you how our platform can help BBDO India automate creative brief distribution and campaign performance calls to clients. Please call us back at 8291190000 or visit signpostai.com. Thank you!",
        timestamp: 0,
      },
    ],
    actionTaken: "gathered-info",
    isHandedOff: false,
  },
  {
    id: "ai-call-17",
    callerName: "Vineet Kumar",
    callerPhone: "+91-9978900017",
    callerCompany: "Performics India",
    direction: "outbound",
    timestamp: daysAgo(3, 10, 45),
    duration: 275,
    sentiment: "positive",
    intent: "Digital Ad Spend Optimization",
    summary:
      "Head of Performance Marketing at Performics very interested in AI for ad spend review calls and ROAS reporting to clients.",
    transcript: [
      {
        speaker: "AI",
        text: "Hello Vineet, calling from Signpost Voice AI. We help performance marketing agencies automate their client ROAS and ad spend review calls. Is now a good time?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Yes, actually I've been looking for a solution to automate our weekly performance review calls — we have 60+ client accounts.",
        timestamp: 7,
      },
      {
        speaker: "AI",
        text: "That's exactly what we do best. Our AI can call clients weekly with their CTR, CPC, ROAS, and impression data — all personalised — and collect feedback automatically.",
        timestamp: 15,
      },
      {
        speaker: "CALLER",
        text: "Can it handle that volume? We'd need 240+ calls per month.",
        timestamp: 26,
      },
      {
        speaker: "AI",
        text: "Absolutely. We process millions of calls monthly with 99.9% uptime. Let me schedule a demo with a live performance agency example.",
        timestamp: 32,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-18",
    callerName: "Ashok Pillai",
    callerPhone: "+91-9989010018",
    callerCompany: "Grey India",
    direction: "outbound",
    timestamp: daysAgo(4, 14, 0),
    duration: 160,
    sentiment: "neutral",
    intent: "Campaign ROI Analysis",
    summary:
      "Account Director at Grey India exploring AI for automated campaign ROI reporting calls to FMCG clients.",
    transcript: [
      {
        speaker: "AI",
        text: "Hi Ashok, this is Signpost Voice AI. We specialise in AI calling for advertising agencies — specifically automating client campaign ROI calls. Do you have 2 minutes?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Sure, what do you offer exactly?",
        timestamp: 6,
      },
      {
        speaker: "AI",
        text: "We automate monthly campaign ROI review calls to your brand clients — sharing personalised ROAS, reach, and engagement metrics. Saves 3-4 hours of manual reporting calls per account manager per week.",
        timestamp: 10,
      },
      {
        speaker: "CALLER",
        text: "Interesting. Can you send us a case study from another agency?",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "Absolutely, sending a relevant agency case study to your email right away. May I have your email address?",
        timestamp: 27,
      },
    ],
    actionTaken: "gathered-info",
    isHandedOff: false,
  },
  {
    id: "ai-call-19",
    callerName: "Pallavi Desai",
    callerPhone: "+91-9990120019",
    callerCompany: "Wunderman Thompson",
    direction: "outbound",
    timestamp: daysAgo(5, 9, 15),
    duration: 240,
    sentiment: "positive",
    intent: "Brand Proposal Presentation",
    summary:
      "Head of Strategy at Wunderman Thompson wants AI to handle initial brand brief qualification calls — demo booked.",
    transcript: [
      {
        speaker: "AI",
        text: "Good morning Pallavi! Calling from Signpost Voice AI regarding AI-assisted brand brief qualification for advertising agencies. Is this a good time?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Yes, I'm looking for solutions to handle initial brief qualification calls. We receive 80+ new brand briefs per month.",
        timestamp: 6,
      },
      {
        speaker: "AI",
        text: "We're a perfect fit. Our AI can qualify briefs, ask the right scoping questions, score them by budget and complexity, and route hot leads to your strategy team — 24/7.",
        timestamp: 15,
      },
      {
        speaker: "CALLER",
        text: "I'd like to see this in action. When can we have a demo?",
        timestamp: 25,
      },
      {
        speaker: "AI",
        text: "I can book you for Wednesday at 2 PM with our agency specialist who has case studies from similar creative networks.",
        timestamp: 31,
      },
    ],
    actionTaken: "scheduled-callback",
    isHandedOff: false,
  },
  {
    id: "ai-call-20",
    callerName: "Gaurav Mittal",
    callerPhone: "+91-9991230020",
    callerCompany: "Isobar India",
    direction: "outbound",
    timestamp: daysAgo(6, 11, 0),
    duration: 75,
    sentiment: "negative",
    intent: "Digital Ad Spend Optimization",
    summary:
      "Digital Head at Isobar India asked to be removed from call list — marked as DND.",
    transcript: [
      {
        speaker: "AI",
        text: "Hi Gaurav, calling from Signpost Voice AI. Do you have a moment to discuss AI calling solutions for your digital ad spend reporting?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Please stop calling. I've been called three times already.",
        timestamp: 6,
      },
      {
        speaker: "AI",
        text: "I sincerely apologise for the inconvenience, Gaurav. I've immediately added you to our Do Not Call list. You won't receive any more calls from us.",
        timestamp: 12,
      },
      { speaker: "CALLER", text: "Thank you.", timestamp: 22 },
    ],
    actionTaken: "resolved",
    isHandedOff: false,
  },
];

// ─── AI Campaigns ─────────────────────────────────────────────────────────────
export const sampleAICampaigns: AICampaign[] = [
  {
    id: "ai-camp-1",
    name: "Q4 Brand Outreach Campaign",
    status: "completed",
    scriptTemplate:
      "Hi {{name}}, calling from Signpost Voice AI to introduce our AI campaign management platform launched this quarter. We've helped agencies like {{similar_company}} achieve 3x client engagement. Would you be open to a 15-minute demo?",
    totalLeads: 120,
    dialed: 95,
    connected: 68,
    voicemails: 12,
    failed: 15,
    avgDuration: 195,
    startTime: new Date("2026-01-10T09:00:00"),
    completedTime: new Date("2026-01-20T18:00:00"),
    conversionRate: 28,
    followUpsScheduled: 18,
    callLogs: sampleAICallLogs.filter((l) =>
      [
        "ai-call-13",
        "ai-call-15",
        "ai-call-17",
        "ai-call-19",
        "ai-call-1",
        "ai-call-5",
      ].includes(l.id),
    ),
  },
  {
    id: "ai-camp-2",
    name: "Performance Marketing Upgrade",
    status: "running",
    scriptTemplate:
      "Hello {{name}}, this is Signpost Voice AI reaching out to performance marketing teams. We've released powerful new features including multi-channel ROAS tracking and automated CTR reporting. Would you like a quick walkthrough?",
    totalLeads: 80,
    dialed: 45,
    connected: 32,
    voicemails: 8,
    failed: 5,
    avgDuration: 182,
    startTime: new Date("2026-03-01T09:00:00"),
    conversionRate: 22,
    followUpsScheduled: 11,
    callLogs: sampleAICallLogs.filter((l) =>
      [
        "ai-call-14",
        "ai-call-16",
        "ai-call-18",
        "ai-call-2",
        "ai-call-6",
      ].includes(l.id),
    ),
  },
  {
    id: "ai-camp-3",
    name: "Q1 Agency Prospecting Drive",
    status: "draft",
    scriptTemplate:
      "Hi {{name}}, wishing you a great start to the new quarter from Signpost Voice AI! As a growing media agency, we have an exclusive onboarding offer — 3 months of our Pro plan at the Starter price. Would you like to know more?",
    totalLeads: 200,
    dialed: 0,
    connected: 0,
    voicemails: 0,
    failed: 0,
    avgDuration: 0,
    conversionRate: 0,
    followUpsScheduled: 0,
    callLogs: [],
  },
];

// ─── AI Agent Statuses ────────────────────────────────────────────────────────
export const sampleAIAgents: AIAgentStatus[] = [
  {
    agentId: "ai-inbound-1",
    name: "VoiceAI Inbound",
    phoneNumber: "8291190000",
    type: "inbound",
    status: "active",
    todayCallCount: 34,
    successRate: 87,
    avgCallDuration: 185,
    lastActive: new Date(now.getTime() - 2 * 60 * 1000),
  },
  {
    agentId: "ai-outbound-1",
    name: "VoiceAI Outbound",
    phoneNumber: "8291190001",
    type: "outbound",
    status: "on-call",
    todayCallCount: 22,
    successRate: 71,
    avgCallDuration: 210,
    lastActive: new Date(now.getTime() - 30 * 1000),
  },
  {
    agentId: "ai-whatsapp-1",
    name: "WhatsAI Agent",
    phoneNumber: "WA-8291190000",
    type: "whatsapp",
    status: "active",
    todayCallCount: 47,
    successRate: 92,
    avgCallDuration: 0,
    lastActive: new Date(now.getTime() - 5 * 60 * 1000),
  },
];

// ─── WhatsApp AI Threads ──────────────────────────────────────────────────────
function waDate(daysBack: number, hour: number, min: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - daysBack);
  d.setHours(hour, min, 0, 0);
  return d;
}

export const sampleWhatsAppAIThreads: WhatsAppAIThread[] = [
  // ai-handling (3)
  {
    id: "wa-ai-1",
    contactName: "Kiran Desai",
    contactPhone: "+91-9811000101",
    leadId: "lead-4",
    status: "ai-handling",
    intent: "Media Plan Inquiry",
    sentiment: "positive",
    lastMessage:
      "That sounds great! Can you share the Q3 media plan template you use for FMCG brands?",
    lastMessageTime: waDate(0, 9, 45),
    unreadCount: 1,
    messages: [
      {
        id: "wm-1-1",
        sender: "contact",
        text: "Hi, I head media planning at a mid-size agency. We manage 15 FMCG brands and I heard about Signpost Voice AI.",
        timestamp: waDate(0, 9, 30),
        isRead: true,
      },
      {
        id: "wm-1-2",
        sender: "ai",
        text: "Hello Kiran! 👋 Signpost Voice AI is an intelligent calling and messaging platform for advertising agencies. We help automate client outreach for media plan approvals, campaign reviews, and performance reporting.",
        timestamp: waDate(0, 9, 31),
        isRead: true,
      },
      {
        id: "wm-1-3",
        sender: "contact",
        text: "Interesting. We currently call each brand client manually for monthly reviews. Can AI do those calls in regional languages too?",
        timestamp: waDate(0, 9, 38),
        isRead: true,
      },
      {
        id: "wm-1-4",
        sender: "ai",
        text: "Yes! We support 12 regional Indian languages including Hindi, Tamil, Telugu, Kannada, Marathi, and Bengali. Each AI agent can be configured per campaign and client language preference.",
        timestamp: waDate(0, 9, 39),
        isRead: true,
      },
      {
        id: "wm-1-5",
        sender: "contact",
        text: "That sounds great! Can you share the Q3 media plan template you use for FMCG brands?",
        timestamp: waDate(0, 9, 45),
        isRead: false,
      },
    ],
  },
  {
    id: "wa-ai-2",
    contactName: "Prashant Kulkarni",
    contactPhone: "+91-9822000202",
    status: "ai-handling",
    intent: "Ad Budget Allocation",
    sentiment: "neutral",
    lastMessage: "What is the pricing for managing 50 brand accounts?",
    lastMessageTime: waDate(0, 10, 15),
    unreadCount: 2,
    messages: [
      {
        id: "wm-2-1",
        sender: "contact",
        text: "Hello, I'm the VP Accounts at an integrated marketing agency. We're evaluating AI tools for client communication.",
        timestamp: waDate(0, 10, 0),
        isRead: true,
      },
      {
        id: "wm-2-2",
        sender: "ai",
        text: "Hi Prashant! Great to hear from you. Signpost Voice AI is widely used by agency account teams. What's your primary use case — campaign brief collection, performance review calls, or both?",
        timestamp: waDate(0, 10, 1),
        isRead: true,
      },
      {
        id: "wm-2-3",
        sender: "contact",
        text: "Both — we run about 300 client calls per month across campaign reviews and approvals.",
        timestamp: waDate(0, 10, 8),
        isRead: true,
      },
      {
        id: "wm-2-4",
        sender: "ai",
        text: "At 300 calls/month across 50 accounts, our Professional plan would be ideal. It includes unlimited calling, AI brief collection, real-time analytics, and dedicated agency support.",
        timestamp: waDate(0, 10, 9),
        isRead: true,
      },
      {
        id: "wm-2-5",
        sender: "contact",
        text: "What is the pricing for managing 50 brand accounts?",
        timestamp: waDate(0, 10, 15),
        isRead: false,
      },
    ],
  },
  {
    id: "wa-ai-3",
    contactName: "Anita Shetty",
    contactPhone: "+91-9833000303",
    leadId: "lead-11",
    status: "ai-handling",
    intent: "Influencer Collaboration Request",
    sentiment: "positive",
    lastMessage: "Tuesday 11 AM works perfectly for me.",
    lastMessageTime: waDate(0, 11, 30),
    unreadCount: 1,
    messages: [
      {
        id: "wm-3-1",
        sender: "contact",
        text: "Hi! I manage influencer partnerships for a D2C skincare brand and we need help scaling our creator outreach calls.",
        timestamp: waDate(0, 11, 10),
        isRead: true,
      },
      {
        id: "wm-3-2",
        sender: "ai",
        text: "Hi Anita! D2C brands love our AI for influencer outreach — we handle campaign brief delivery, rate negotiation calls, and post-campaign performance reviews automatically. Want to see a live demo?",
        timestamp: waDate(0, 11, 11),
        isRead: true,
      },
      {
        id: "wm-3-3",
        sender: "contact",
        text: "Yes! When can we do it?",
        timestamp: waDate(0, 11, 18),
        isRead: true,
      },
      {
        id: "wm-3-4",
        sender: "ai",
        text: "Our specialists are available Tuesday 11 AM or Wednesday 3 PM. Which works better for you?",
        timestamp: waDate(0, 11, 19),
        isRead: true,
      },
      {
        id: "wm-3-5",
        sender: "contact",
        text: "Tuesday 11 AM works perfectly for me.",
        timestamp: waDate(0, 11, 30),
        isRead: false,
      },
    ],
  },
  // resolved (3)
  {
    id: "wa-ai-4",
    contactName: "Siddharth Nair",
    contactPhone: "+91-9844000404",
    leadId: "lead-8",
    status: "resolved",
    intent: "Campaign Performance Review",
    sentiment: "positive",
    lastMessage: "Thank you, the campaign data is syncing correctly now!",
    lastMessageTime: waDate(1, 16, 45),
    unreadCount: 0,
    resolvedAt: waDate(1, 16, 50),
    messages: [
      {
        id: "wm-4-1",
        sender: "contact",
        text: "Our AI calls are not pulling the correct campaign performance data for Tier-2 city clients. The CTR figures look wrong.",
        timestamp: waDate(1, 15, 30),
        isRead: true,
      },
      {
        id: "wm-4-2",
        sender: "ai",
        text: "Hi Siddharth, I understand the issue. This is typically caused by a regional data pipeline sync delay. Let me check your account's data configuration.",
        timestamp: waDate(1, 15, 31),
        isRead: true,
      },
      {
        id: "wm-4-3",
        sender: "ai",
        text: "I've refreshed your campaign data sync and updated the regional analytics pipeline. Please test the performance report for a Tier-2 campaign now.",
        timestamp: waDate(1, 16, 0),
        isRead: true,
      },
      {
        id: "wm-4-4",
        sender: "contact",
        text: "Testing... yes the CTR and impression data looks correct now! What was the issue?",
        timestamp: waDate(1, 16, 30),
        isRead: true,
      },
      {
        id: "wm-4-5",
        sender: "ai",
        text: "Great! The regional analytics pipeline had a 4-hour lag in syncing Tier-2 campaign data. It's now set to real-time sync. You should have accurate metrics going forward.",
        timestamp: waDate(1, 16, 35),
        isRead: true,
      },
      {
        id: "wm-4-6",
        sender: "contact",
        text: "Thank you, the campaign data is syncing correctly now!",
        timestamp: waDate(1, 16, 45),
        isRead: true,
      },
    ],
  },
  {
    id: "wa-ai-5",
    contactName: "Ruchika Agarwal",
    contactPhone: "+91-9855000505",
    status: "resolved",
    intent: "Digital Ad Spend Optimization",
    sentiment: "neutral",
    lastMessage: "Got it. I'll discuss with my media team and get back to you.",
    lastMessageTime: waDate(2, 12, 0),
    unreadCount: 0,
    resolvedAt: waDate(2, 12, 5),
    messages: [
      {
        id: "wm-5-1",
        sender: "contact",
        text: "What's the difference between your Starter and Professional plans for managing ad campaign calls?",
        timestamp: waDate(2, 11, 30),
        isRead: true,
      },
      {
        id: "wm-5-2",
        sender: "ai",
        text: "Hi Ruchika! Great question. Starter (₹8,000/month) gives you 5 AI agents and 500 campaign calls/day. Professional (₹22,000/month) gives 20 agents, unlimited calls, advanced ROAS analytics, and CRM integration.",
        timestamp: waDate(2, 11, 31),
        isRead: true,
      },
      {
        id: "wm-5-3",
        sender: "contact",
        text: "Does the Professional plan support automated creative approval follow-ups?",
        timestamp: waDate(2, 11, 45),
        isRead: true,
      },
      {
        id: "wm-5-4",
        sender: "ai",
        text: "Yes! Creative approval workflows are available on the Professional plan — the AI can call brand managers with approval reminders, collect go-ahead confirmations, and log all responses automatically.",
        timestamp: waDate(2, 11, 46),
        isRead: true,
      },
      {
        id: "wm-5-5",
        sender: "contact",
        text: "Got it. I'll discuss with my media team and get back to you.",
        timestamp: waDate(2, 12, 0),
        isRead: true,
      },
    ],
  },
  {
    id: "wa-ai-6",
    contactName: "Mohan Krishnan",
    contactPhone: "+91-9866000606",
    leadId: "lead-15",
    status: "resolved",
    intent: "Campaign Performance Review",
    sentiment: "positive",
    lastMessage:
      "Appreciate the quick response. The CPM figures are correct now. Thank you!",
    lastMessageTime: waDate(3, 14, 20),
    unreadCount: 0,
    resolvedAt: waDate(3, 14, 25),
    messages: [
      {
        id: "wm-6-1",
        sender: "contact",
        text: "Our AI agent is quoting wrong CPM rates to our OTT advertising clients. It's causing confusion in client meetings!",
        timestamp: waDate(3, 13, 0),
        isRead: true,
      },
      {
        id: "wm-6-2",
        sender: "ai",
        text: "Mohan, I sincerely apologise for this. Incorrect CPM data should not happen. Can you share the campaign ID or the incorrect figures it quoted?",
        timestamp: waDate(3, 13, 2),
        isRead: true,
      },
      {
        id: "wm-6-3",
        sender: "contact",
        text: "It quoted ₹180 CPM for OTT pre-roll when our rate card shows ₹240. Here's the campaign ID: camp-ott-789.",
        timestamp: waDate(3, 13, 15),
        isRead: true,
      },
      {
        id: "wm-6-4",
        sender: "ai",
        text: "Thank you for the details. I've updated your OTT rate card in the knowledge base and re-synced the AI agent's pricing data. The correction is live now. Would you like to run a test call to verify the CPM quote?",
        timestamp: waDate(3, 14, 0),
        isRead: true,
      },
      {
        id: "wm-6-5",
        sender: "contact",
        text: "Yes, I tested it. Correct CPM now — ₹240.",
        timestamp: waDate(3, 14, 15),
        isRead: true,
      },
      {
        id: "wm-6-6",
        sender: "contact",
        text: "Appreciate the quick response. The CPM figures are correct now. Thank you!",
        timestamp: waDate(3, 14, 20),
        isRead: true,
      },
    ],
  },
  // handed-off (2)
  {
    id: "wa-ai-7",
    contactName: "Vandana Sharma",
    contactPhone: "+91-9877000707",
    status: "handed-off",
    intent: "Campaign Performance Review",
    sentiment: "negative",
    lastMessage:
      "I want to speak to a human account manager. This AI is not helpful.",
    lastMessageTime: waDate(1, 10, 0),
    unreadCount: 0,
    handedOffAt: waDate(1, 10, 5),
    handedOffToAgent: "Priya Sharma",
    messages: [
      {
        id: "wm-7-1",
        sender: "contact",
        text: "I want to cancel our subscription immediately. The campaign performance reports have been wrong for two months.",
        timestamp: waDate(1, 9, 30),
        isRead: true,
      },
      {
        id: "wm-7-2",
        sender: "ai",
        text: "Hi Vandana, I understand your concern about inaccurate performance reports. I'm sorry this has been ongoing. May I check your account and identify which metrics are incorrect?",
        timestamp: waDate(1, 9, 31),
        isRead: true,
      },
      {
        id: "wm-7-3",
        sender: "contact",
        text: "The ROAS figures have been off and we've complained twice. Nothing has changed.",
        timestamp: waDate(1, 9, 40),
        isRead: true,
      },
      {
        id: "wm-7-4",
        sender: "ai",
        text: "I completely understand your frustration. Let me offer a complimentary audit of your ROAS tracking setup and a 2-month credit while we resolve this?",
        timestamp: waDate(1, 9, 41),
        isRead: true,
      },
      {
        id: "wm-7-5",
        sender: "contact",
        text: "I want to speak to a human account manager. This AI is not helpful.",
        timestamp: waDate(1, 10, 0),
        isRead: true,
      },
      {
        id: "wm-7-6",
        sender: "ai",
        text: "Absolutely, Vandana. I'm handing you over to our senior account specialist Priya Sharma right now. She'll be with you in 2 minutes.",
        timestamp: waDate(1, 10, 5),
        isRead: true,
      },
    ],
  },
  {
    id: "wa-ai-8",
    contactName: "Ajay Bhandari",
    contactPhone: "+91-9888000808",
    leadId: "lead-22",
    status: "handed-off",
    intent: "Brand Proposal Presentation",
    sentiment: "positive",
    lastMessage:
      "Looking forward to speaking with the BD team about the white-label option!",
    lastMessageTime: waDate(2, 15, 30),
    unreadCount: 0,
    handedOffAt: waDate(2, 15, 35),
    handedOffToAgent: "Arjun Mehta",
    messages: [
      {
        id: "wm-8-1",
        sender: "contact",
        text: "Hi, I'm the CEO of a media buying agency with 40 brand clients. We want to white-label your AI calling platform under our brand.",
        timestamp: waDate(2, 15, 0),
        isRead: true,
      },
      {
        id: "wm-8-2",
        sender: "ai",
        text: "Hello Ajay! A white-label partnership is definitely something we can discuss. We have a partner programme for media agencies. What scale are you looking at?",
        timestamp: waDate(2, 15, 1),
        isRead: true,
      },
      {
        id: "wm-8-3",
        sender: "contact",
        text: "We'd want to onboard all 40 clients on our branded version with custom campaign dashboards.",
        timestamp: waDate(2, 15, 10),
        isRead: true,
      },
      {
        id: "wm-8-4",
        sender: "ai",
        text: "That's a significant partnership opportunity! This needs our BD team to discuss custom commercial terms and the white-label roadmap. I'm connecting you with Arjun Mehta, our partnerships lead.",
        timestamp: waDate(2, 15, 20),
        isRead: true,
      },
      {
        id: "wm-8-5",
        sender: "contact",
        text: "Looking forward to speaking with the BD team about the white-label option!",
        timestamp: waDate(2, 15, 30),
        isRead: true,
      },
    ],
  },
];

// ─── AI Dialer — Outbound Queue ───────────────────────────────────────────────
export const sampleOutboundQueue: AIOutboundQueueEntry[] = [
  {
    id: "ob-1",
    leadId: "lead-3",
    leadName: "Vikram Reddy",
    company: "Ogilvy India",
    phone: "+91-9800001001",
    status: "completed",
    attemptCount: 1,
    outcome: "Demo scheduled for Friday 3 PM — Q3 media plan automation",
    startedAt: daysAgo(0, 9, 10),
    endedAt: daysAgo(0, 9, 13),
    durationSecs: 198,
    transcript: [
      {
        speaker: "AI",
        text: "Hello Vikram, calling from Signpost Voice AI. I wanted to reach out regarding AI-powered campaign management automation. Is this a good time?",
        timestamp: 0,
      },
      {
        speaker: "LEAD",
        text: "Yes, I've actually been evaluating tools for automating our client campaign review calls. Go ahead.",
        timestamp: 8,
      },
      {
        speaker: "AI",
        text: "Great! We help creative agencies like Ogilvy automate their monthly campaign review calls — sharing CTR, ROAS, and media performance data to brand clients automatically. Would you be open to a quick demo?",
        timestamp: 13,
      },
      {
        speaker: "LEAD",
        text: "That sounds useful. Can we do a demo this week?",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "Absolutely! I have a slot on Friday at 3 PM with our agency specialist who has case studies from similar integrated agencies. Does that work for you?",
        timestamp: 27,
      },
      { speaker: "LEAD", text: "Friday 3 PM works perfectly.", timestamp: 34 },
    ],
  },
  {
    id: "ob-2",
    leadId: "lead-7",
    leadName: "Ananya Nair",
    company: "Kinnect",
    phone: "+91-9800001002",
    status: "completed",
    attemptCount: 2,
    outcome: "Prospect requested agency pricing deck via email",
    startedAt: daysAgo(0, 10, 20),
    endedAt: daysAgo(0, 10, 22),
    durationSecs: 145,
    transcript: [
      {
        speaker: "AI",
        text: "Good morning Ananya! Calling from Signpost Voice AI regarding AI voice automation for digital advertising agencies. Do you have 2 minutes?",
        timestamp: 0,
      },
      { speaker: "LEAD", text: "Yes, sure. What do you offer?", timestamp: 7 },
      {
        speaker: "AI",
        text: "We help digital agencies automate their client performance review calls, creative approval follow-ups, and campaign brief collection using AI voice agents. Saves 5+ hours of manual client calls per account manager per week.",
        timestamp: 11,
      },
      {
        speaker: "LEAD",
        text: "That's interesting. Can you email me the agency pricing details?",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "Of course! I've noted your email from our CRM. You'll receive a personalised agency pricing deck within the hour. Would you like to schedule a follow-up call too?",
        timestamp: 28,
      },
      {
        speaker: "LEAD",
        text: "Let me review the pricing first, then we can talk.",
        timestamp: 38,
      },
    ],
  },
  {
    id: "ob-3",
    leadId: "lead-12",
    leadName: "Suresh Iyer",
    company: "Social Beat",
    phone: "+91-9800001003",
    status: "completed",
    attemptCount: 1,
    outcome:
      "Strong interest in influencer outreach automation — follow-up call booked for Monday",
    startedAt: daysAgo(1, 11, 5),
    endedAt: daysAgo(1, 11, 9),
    durationSecs: 234,
    transcript: [
      {
        speaker: "AI",
        text: "Hello Suresh, this is an AI assistant from Signpost Voice AI. We specialise in AI calling solutions for digital marketing agencies. Is now a good time?",
        timestamp: 0,
      },
      {
        speaker: "LEAD",
        text: "Yes, I'm the Head of Growth at Social Beat. What specifically do you do for digital agencies?",
        timestamp: 6,
      },
      {
        speaker: "AI",
        text: "We automate influencer outreach calls, campaign brief delivery to creators, and client performance review calls. Our clients see a 40% improvement in influencer response rates.",
        timestamp: 12,
      },
      {
        speaker: "LEAD",
        text: "We run 500+ influencer campaigns per month. Can your platform handle that scale?",
        timestamp: 23,
      },
      {
        speaker: "AI",
        text: "Absolutely — we support up to 100,000 concurrent calls per day on our enterprise plan. Let me book a call with our digital agency specialist for a detailed walkthrough.",
        timestamp: 29,
      },
      { speaker: "LEAD", text: "Monday 10 AM works for us.", timestamp: 40 },
    ],
  },
  {
    id: "ob-4",
    leadId: "lead-18",
    leadName: "Meera Gupta",
    company: "Havas India",
    phone: "+91-9800001004",
    status: "calling",
    attemptCount: 1,
    startedAt: daysAgo(0, 9, 58),
  },
  {
    id: "ob-5",
    leadId: "lead-24",
    leadName: "Rohan Shah",
    company: "White Rivers Media",
    phone: "+91-9800001005",
    status: "calling",
    attemptCount: 1,
    startedAt: daysAgo(0, 10, 1),
  },
  {
    id: "ob-6",
    leadId: "lead-31",
    leadName: "Sneha Joshi",
    company: "Foxymoron",
    phone: "+91-9800001006",
    status: "queued",
    attemptCount: 0,
  },
  {
    id: "ob-7",
    leadId: "lead-5",
    leadName: "Aditya Verma",
    company: "Dentsu India",
    phone: "+91-9800001007",
    status: "queued",
    attemptCount: 0,
  },
  {
    id: "ob-8",
    leadId: "lead-9",
    leadName: "Kiran Pillai",
    company: "GroupM",
    phone: "+91-9800001008",
    status: "failed",
    attemptCount: 3,
    outcome: "Number not reachable after 3 attempts — marked for manual review",
    startedAt: daysAgo(1, 14, 30),
    endedAt: daysAgo(1, 14, 30),
    durationSecs: 0,
  },
];

// ─── AI Dialer — Inbound Calls (8291190000) ───────────────────────────────────
export const sampleInboundCalls: AIInboundCallEntry[] = [
  {
    id: "ib-1",
    callerNumber: "+91-9812340101",
    callerName: "Rahul Singhania",
    callerCompany: "Dentsu India",
    receivedAt: daysAgo(0, 9, 22),
    duration: 212,
    status: "answered",
    intent: "Lead interested — wants media planning platform walkthrough",
    sentiment: "positive",
    actionTaken:
      "Scheduled product demo for Wednesday 2 PM — Q3 media planning focus",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for calling Signpost Voice AI on 8291190000. How can I help you today?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Hi, I saw your platform on LinkedIn. I run a 30-person media planning team at Dentsu India and I'm very interested.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Wonderful! Dentsu would be a great fit — we work with several large agency networks for their client outreach automation. What's your biggest challenge right now?",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "Our account managers spend 70% of their time on client update calls that add little value. I want AI to handle routine campaign status updates.",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "That's exactly what we solve. Our AI makes routine campaign update calls automatically and only routes strategic conversations to your account managers. Want a live demo this week?",
        timestamp: 30,
      },
      {
        speaker: "CALLER",
        text: "Yes, Wednesday afternoon works for me.",
        timestamp: 42,
      },
    ],
  },
  {
    id: "ib-2",
    callerNumber: "+91-9823450202",
    callerName: "Pooja Agarwal",
    callerCompany: "Hindustan Unilever",
    receivedAt: daysAgo(0, 10, 45),
    duration: 168,
    status: "answered",
    intent: "Pricing inquiry — enterprise plan for multi-brand management",
    sentiment: "neutral",
    actionTaken:
      "Sent enterprise pricing proposal for multi-brand campaign management",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, you've reached Signpost Voice AI. How may I assist you?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I need pricing for an enterprise deployment. We have 500 brand managers across multiple product categories.",
        timestamp: 4,
      },
      {
        speaker: "AI",
        text: "For 500-seat deployments across multiple brand categories, we offer a custom enterprise plan with dedicated infrastructure and SLA guarantees. Can I have your email to send a tailored proposal?",
        timestamp: 11,
      },
      {
        speaker: "CALLER",
        text: "It's pooja.agarwal@hul.com. Can you also ballpark the cost?",
        timestamp: 20,
      },
      {
        speaker: "AI",
        text: "Enterprise plans for 500 brand managers typically range from ₹8L to ₹12L per month depending on call volume and campaign analytics requirements. Full proposal in your inbox within 2 hours.",
        timestamp: 27,
      },
    ],
  },
  {
    id: "ib-3",
    callerNumber: "+91-9834560303",
    callerName: "Ajit Menon",
    callerCompany: "Omnicom Media Group",
    receivedAt: daysAgo(0, 11, 10),
    duration: 94,
    status: "transferred",
    intent: "Callback requested — escalation needed for agency partnership",
    sentiment: "neutral",
    actionTaken:
      "Transferred to senior sales rep for agency partnership discussion",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for calling Signpost Voice AI. How can I help?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I called yesterday about an agency partnership and was promised a callback. It never happened. I need to speak to someone senior.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "I sincerely apologise for the missed callback, Ajit. Let me connect you with a senior partnerships executive right now. Please hold for 30 seconds.",
        timestamp: 13,
      },
      { speaker: "CALLER", text: "Okay, fine.", timestamp: 22 },
    ],
  },
  {
    id: "ib-4",
    callerNumber: "+91-9845670404",
    callerName: "Sunita Krishnamurthy",
    callerCompany: "Madison World",
    receivedAt: daysAgo(1, 9, 5),
    duration: 188,
    status: "answered",
    intent: "Lead interested — multi-year agency contract discussion",
    sentiment: "positive",
    actionTaken: "Booked executive briefing call with agency head for Thursday",
    transcript: [
      {
        speaker: "AI",
        text: "Good morning! Signpost Voice AI, how can I assist?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Hi, I'm the CEO of Madison World. We're planning to deploy AI campaign automation across our 3 agency verticals and looking for a long-term technology partner.",
        timestamp: 4,
      },
      {
        speaker: "AI",
        text: "That's a significant initiative! We have enterprise-grade deployments running across large media agencies. For a multi-vertical rollout, we'd propose a phased implementation with dedicated agency support. Would an executive briefing with our CEO be useful?",
        timestamp: 14,
      },
      {
        speaker: "CALLER",
        text: "Yes, that would be ideal. Can we do it this Thursday?",
        timestamp: 26,
      },
      {
        speaker: "AI",
        text: "Thursday is available. I'm booking an executive briefing at 11 AM with our CEO and your team. Calendar invite to follow.",
        timestamp: 31,
      },
    ],
  },
  {
    id: "ib-5",
    callerNumber: "+91-9856780505",
    callerName: "Deepak Oberoi",
    callerCompany: "iProspect India",
    receivedAt: daysAgo(1, 14, 30),
    duration: 72,
    status: "answered",
    intent: "Objection — already using competitor for campaign automation",
    sentiment: "negative",
    actionTaken: "Logged objection, scheduled nurture sequence in 90 days",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, Signpost Voice AI. How can I help?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We already use a different platform for our performance campaign automation. I don't understand why you keep reaching out.",
        timestamp: 4,
      },
      {
        speaker: "AI",
        text: "Understood, Deepak. Unlike generic automation platforms, Signpost Voice AI uses generative AI to have real campaign conversations — understanding client intent, capturing briefs, and reporting ROAS — not just making dial attempts. Would a no-obligation comparison be worth 20 minutes?",
        timestamp: 10,
      },
      {
        speaker: "CALLER",
        text: "Not right now. We have a 2-year contract with our current provider.",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "Perfectly reasonable! I'll note this and reach back in 90 days as your renewal approaches. Thank you for your time, Deepak.",
        timestamp: 28,
      },
    ],
  },
  {
    id: "ib-6",
    callerNumber: "+91-9867890606",
    callerName: "Neeta Bhatt",
    callerCompany: "Schbang",
    receivedAt: daysAgo(2, 10, 0),
    duration: 155,
    status: "answered",
    intent: "Pricing inquiry — starter plan for small agency",
    sentiment: "positive",
    actionTaken:
      "Offered 14-day free trial, sent activation link for agency onboarding",
    transcript: [
      {
        speaker: "AI",
        text: "Welcome to Signpost Voice AI! How may I assist?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I run a boutique digital agency with 8 account managers. What's your most affordable plan for managing client campaign calls?",
        timestamp: 4,
      },
      {
        speaker: "AI",
        text: "Our Starter plan is ₹8,000 per month — perfect for up to 10 account managers with 500 AI campaign calls per day. It also comes with a 14-day free trial so you can test it risk-free with your real client accounts.",
        timestamp: 10,
      },
      {
        speaker: "CALLER",
        text: "A free trial sounds great. How do I sign up?",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "I'll send an activation link to your registered email right away. You'll be up and running in under 15 minutes. No credit card required.",
        timestamp: 27,
      },
    ],
  },
  {
    id: "ib-7",
    callerNumber: "+91-9878900707",
    callerName: "Ramesh Balasubramaniam",
    callerCompany: "Leo Burnett India",
    receivedAt: daysAgo(2, 15, 15),
    duration: 0,
    status: "missed",
    intent: "Unknown — call not answered",
    sentiment: "neutral",
    actionTaken: "Auto-SMS sent with callback link and agency brochure",
    transcript: [],
  },
  {
    id: "ib-8",
    callerNumber: "+91-9889010808",
    callerName: "Priya Venkatesh",
    callerCompany: "Grey India",
    receivedAt: daysAgo(3, 9, 40),
    duration: 201,
    status: "answered",
    intent: "Not interested — media planning budget frozen until Q3",
    sentiment: "neutral",
    actionTaken:
      "Added to Q3 agency nurture sequence with campaign trend reports",
    transcript: [
      {
        speaker: "AI",
        text: "Thank you for calling Signpost Voice AI. How can I help you today?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "I got a call from your team last week. I'm interested in the platform but our technology budget for media automation is frozen until Q3.",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "That's completely understandable, Priya. Many agencies are planning Q3 technology upgrades right now. Can I add you to our newsletter with the latest campaign automation trends so you stay informed when Q3 planning starts?",
        timestamp: 13,
      },
      {
        speaker: "CALLER",
        text: "Yes, that works. My email is priya.v@greyindia.com.",
        timestamp: 24,
      },
      {
        speaker: "AI",
        text: "Perfect! I've added you to our Q3 agency insights programme. You'll receive relevant case studies and industry benchmarks. We'll reach out in early Q3 to reconnect.",
        timestamp: 29,
      },
    ],
  },
  {
    id: "ib-9",
    callerNumber: "+91-9890120909",
    callerName: "Siddharth Rao",
    callerCompany: "DDB Mudra",
    receivedAt: daysAgo(3, 11, 55),
    duration: 178,
    status: "answered",
    intent: "Lead interested — pilot program for campaign brief automation",
    sentiment: "positive",
    actionTaken:
      "Pilot programme proposal sent — campaign brief automation focus; follow-up in 2 business days",
    transcript: [
      {
        speaker: "AI",
        text: "Hello, Signpost Voice AI. How can I help you?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "We'd like to run a pilot with your AI platform specifically for automating creative brief collection from brand clients before committing to a full rollout. Is that possible?",
        timestamp: 5,
      },
      {
        speaker: "AI",
        text: "Absolutely! We offer structured 30-day pilots for agency clients with full access to all campaign automation features, dedicated onboarding support, and a pilot success review at the end.",
        timestamp: 12,
      },
      {
        speaker: "CALLER",
        text: "That sounds ideal. What's the cost for the pilot?",
        timestamp: 22,
      },
      {
        speaker: "AI",
        text: "Pilots are offered at 50% of standard pricing — approximately ₹1.2L for your team size. I'll send a detailed pilot proposal document with a campaign brief automation demo to your email today.",
        timestamp: 28,
      },
    ],
  },
  {
    id: "ib-10",
    callerNumber: "+91-9901231010",
    callerName: "Kavitha Sundaram",
    callerCompany: "Creativeland Asia",
    receivedAt: daysAgo(4, 10, 30),
    duration: 130,
    status: "answered",
    intent:
      "Callback requested — Creative Head not available for demo scheduling",
    sentiment: "neutral",
    actionTaken:
      "Scheduled demo callback for next morning at 10 AM with Creative Head",
    transcript: [
      {
        speaker: "AI",
        text: "Good morning! You've reached Signpost Voice AI on 8291190000. How may I assist?",
        timestamp: 0,
      },
      {
        speaker: "CALLER",
        text: "Hi, I'm the EA of our Creative Head. She asked me to call and schedule a product demo for the agency team.",
        timestamp: 4,
      },
      {
        speaker: "AI",
        text: "Of course! Happy to set that up. What dates and times work best for your Creative Head?",
        timestamp: 10,
      },
      {
        speaker: "CALLER",
        text: "Tomorrow morning at 10 AM is best.",
        timestamp: 18,
      },
      {
        speaker: "AI",
        text: "Tomorrow at 10 AM is confirmed. I'm sending a calendar invite with a meeting link to the email on file. Our agency specialist will be ready with a customised demo focused on creative workflow automation.",
        timestamp: 22,
      },
    ],
  },
];
