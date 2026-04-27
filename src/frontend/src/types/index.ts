export type CallStatus =
  | "success"
  | "failure"
  | "pending"
  | "missed"
  | "inprogress";
export type CallDirection = "inbound" | "outbound";
export type LeadStatus = "hot" | "warm" | "cold" | "converted" | "lost";
export type LeadRegion =
  | "North"
  | "East"
  | "West"
  | "South"
  | "ROM"
  | "Trading"
  | "Agency";
export type RoutingStatus = "pending" | "sent" | "failed" | "unsent";
export type CampaignStatus = "active" | "paused" | "completed" | "draft";
export type MessageStatus = "delivered" | "read" | "failed" | "sent";

export interface CallRecord {
  id: string;
  callerId: string;
  timestamp: string;
  campaign: string;
  campaignId: string;
  agent: string;
  agentId: string;
  duration: string;
  durationSeconds: number;
  sentiment: "positive" | "neutral" | "negative";
  status: CallStatus;
  direction: CallDirection;
  intent: string;
  notes: string;
  leadId?: string;
}

export interface LeadComment {
  id: string;
  text: string;
  timestamp: string;
  author: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  status: LeadStatus;
  intent: string;
  score: number;
  lastContact: string;
  followUpDate: string;
  assignedAgent: string;
  campaignSource: string;
  notes: string;
  callCount: number;
  location: string;
  // Optional enriched location fields (populated via AI Contact Import)
  country?: string;
  state?: string;
  city?: string;
  designation?: string;
  industry?: string;
  // Lead routing fields
  region?: LeadRegion;
  routedTo?: string;
  routedAt?: string;
  routingStatus?: RoutingStatus;
  // ─── Custom lead entry fields (from enquiry form) ─────────────────────────
  source?: string;
  channel?: string;
  clientContactPerson?: string;
  clientMobileNumber?: string;
  clientEmailId?: string;
  clientCompanyName?: string;
  category?: string;
  headOffice?: string;
  requirements?: string;
  duration?: string;
  budget?: number;
  reportingManager?: string;
  salesperson?: string;
  remarks?: string;
  detailsRequestedViaWhatsApp?: boolean;
  enquiryForwardedThrough?: string;
  typeOfInquiry?: string;
  connectedStatus?: string;
  stage?: string;
  campaignLocation?: string;
  ehRegion?: LeadRegion;
  revenueDisplayAmount?: number;
  comments?: LeadComment[];
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  targetCount: number;
  completedCalls: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  startDate: string;
  endDate: string;
  agent: string;
  description: string;
  avgDuration: string;
  totalMinutes: number;
}

export interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "offline";
  totalCalls: number;
  successRate: number;
  avgDuration: string;
  activeCallId?: string;
  campaigns: string[];
}

export interface BillingRecord {
  month: string;
  year: number;
  minutesUsed: number;
  minutesAllocated: number;
  amount: number;
  status: "paid" | "pending" | "overdue";
  invoiceId: string;
}

export interface BillingOverview {
  currentMinutesUsed: number;
  currentMinutesAllocated: number;
  currentSpend: number;
  nextInvoiceDate: string;
  plan: string;
  pricePerMinute: number;
  records: BillingRecord[];
}

export interface WhatsAppThread {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: MessageStatus;
  campaignId?: string;
}

export interface SmsLog {
  id: string;
  recipient: string;
  phone: string;
  message: string;
  timestamp: string;
  status: MessageStatus;
  campaignId?: string;
  direction: "inbound" | "outbound";
}

export interface MarketingEmail {
  id: string;
  subject: string;
  recipient: string;
  email: string;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  status: "sent" | "opened" | "clicked" | "bounced" | "unsubscribed";
  campaignId?: string;
}

export interface AnalyticsDayPoint {
  date: string;
  calls: number;
  successRate: number;
  avgDuration: number;
}

export interface HourlyPoint {
  hour: number;
  calls: number;
}

export interface AnalyticsData {
  dailyTrends: AnalyticsDayPoint[];
  hourlyDistribution: HourlyPoint[];
  intentBreakdown: { intent: string; count: number; rate: number }[];
  topCampaigns: { name: string; calls: number; rate: number }[];
  conversionFunnel: { stage: string; count: number }[];
}

// ─── Revenue / Closed Deals ──────────────────────────────────────────────────

export interface ClosedDeal {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  leadSource: "inbound" | "outbound";
  leadReceivedDate: Date;
  firstContactDate: Date;
  closeDate: Date;
  daysToClose: number;
  revenueAmount: number;
  assignedAgent: string;
  campaignName?: string;
  industry?: string;
}

// ─── AI Call Agent ───────────────────────────────────────────────────────────

export interface AICallLog {
  id: string;
  callerName: string;
  callerPhone: string;
  callerCompany?: string;
  direction: "inbound" | "outbound";
  timestamp: Date;
  duration: number;
  sentiment: "positive" | "neutral" | "negative";
  intent: string;
  summary: string;
  transcript: Array<{
    speaker: "AI" | "CALLER";
    text: string;
    timestamp: number;
  }>;
  actionTaken:
    | "scheduled-callback"
    | "gathered-info"
    | "transferred-to-agent"
    | "resolved"
    | "voicemail";
  campaignId?: string;
  isHandedOff: boolean;
}

export interface AIAgentStatus {
  agentId: string;
  name: string;
  phoneNumber: string;
  type: "inbound" | "outbound" | "whatsapp";
  status: "active" | "idle" | "on-call" | "paused" | "offline";
  currentCallId?: string;
  todayCallCount: number;
  successRate: number;
  avgCallDuration: number;
  lastActive: Date;
}

export interface AICampaign {
  id: string;
  name: string;
  status: "draft" | "running" | "paused" | "completed";
  scriptTemplate: string;
  totalLeads: number;
  dialed: number;
  connected: number;
  voicemails: number;
  failed: number;
  avgDuration: number;
  startTime?: Date;
  completedTime?: Date;
  callLogs: AICallLog[];
  conversionRate: number;
  followUpsScheduled: number;
  /** Set by campaignStore when the campaign has been persisted to localStorage. */
  persistedAt?: Date;
}

// ─── WhatsApp receipt/typing ──────────────────────────────────────────────────

export type WaReceiptStatus = "sent" | "delivered" | "read";

// ─── WhatsApp AI ─────────────────────────────────────────────────────────────

export interface WhatsAppAIThread {
  id: string;
  contactName: string;
  contactPhone: string;
  leadId?: string;
  status: "ai-handling" | "handed-off" | "resolved";
  messages: Array<{
    id: string;
    sender: "contact" | "ai" | "agent";
    text: string;
    timestamp: Date;
    isRead: boolean;
    receiptStatus?: WaReceiptStatus;
  }>;
  intent: string;
  sentiment: "positive" | "neutral" | "negative";
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  handedOffAt?: Date;
  handedOffToAgent?: string;
  resolvedAt?: Date;
}

// ─── Follow-up Scheduler ─────────────────────────────────────────────────────

export interface FollowUpSchedule {
  id: string;
  leadIds: string[];
  scheduledDate: Date;
  assignedAgent: string;
  notes: string;
  createdAt: Date;
}

// ─── AI Dialer ────────────────────────────────────────────────────────────────

export type AIOutboundQueueStatus =
  | "queued"
  | "calling"
  | "completed"
  | "failed";

export interface AIOutboundQueueEntry {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  phone: string;
  status: AIOutboundQueueStatus;
  attemptCount: number;
  outcome?: string;
  transcript?: Array<{
    speaker: "AI" | "LEAD";
    text: string;
    timestamp: number;
  }>;
  startedAt?: Date;
  endedAt?: Date;
  durationSecs?: number;
}

export type AIInboundCallStatus = "answered" | "missed" | "transferred";

export interface AIInboundCallEntry {
  id: string;
  callerNumber: string;
  callerName: string;
  callerCompany?: string;
  receivedAt: Date;
  duration: number;
  status: AIInboundCallStatus;
  intent: string;
  transcript: Array<{
    speaker: "AI" | "CALLER";
    text: string;
    timestamp: number;
  }>;
  actionTaken: string;
  sentiment: "positive" | "neutral" | "negative";
}
