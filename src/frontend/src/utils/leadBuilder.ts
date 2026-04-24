import type { Lead, LeadRegion } from "@/types";

export interface LeadFormData {
  source: string;
  channel: string;
  clientContactPerson: string;
  clientMobileNumber: string;
  clientEmailId: string;
  clientCompanyName: string;
  category: string;
  headOffice: string;
  requirements: string;
  duration: string;
  budget: string;
  reportingManager: string;
  salesperson: string;
  remarks: string;
  detailsRequestedViaWhatsApp: boolean;
  enquiryForwardedThrough: string;
  typeOfInquiry: string;
  connectedStatus: string;
  stage: string;
  campaignLocation: string;
  region: string;
  ehRegion: string;
  revenueDisplayAmount: string;
}

export function buildLeadFromFormData(data: LeadFormData): Lead {
  const now = new Date().toISOString();
  const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const budgetNum = data.budget ? Number.parseFloat(data.budget) : undefined;
  const revenueNum = data.revenueDisplayAmount
    ? Number.parseFloat(data.revenueDisplayAmount)
    : undefined;

  return {
    id,
    // Core mapped fields
    name: data.clientContactPerson || "Unknown",
    phone: data.clientMobileNumber || "",
    email: data.clientEmailId || "",
    company: data.clientCompanyName || "",
    // Defaults
    status: "warm",
    score: 50,
    intent: data.typeOfInquiry || "Inquiry",
    lastContact: now.slice(0, 10),
    followUpDate: "",
    assignedAgent: "Unassigned",
    campaignSource: data.source || "Manual",
    notes: data.remarks || "",
    callCount: 0,
    location: data.campaignLocation || "",
    // Region
    region: (data.region as LeadRegion) || undefined,
    // Custom fields
    source: data.source || undefined,
    channel: data.channel || undefined,
    clientContactPerson: data.clientContactPerson || undefined,
    clientMobileNumber: data.clientMobileNumber || undefined,
    clientEmailId: data.clientEmailId || undefined,
    clientCompanyName: data.clientCompanyName || undefined,
    category: data.category || undefined,
    headOffice: data.headOffice || undefined,
    requirements: data.requirements || undefined,
    duration: data.duration || undefined,
    budget: budgetNum,
    reportingManager: data.reportingManager || undefined,
    salesperson: data.salesperson || undefined,
    remarks: data.remarks || undefined,
    detailsRequestedViaWhatsApp: data.detailsRequestedViaWhatsApp,
    enquiryForwardedThrough: data.enquiryForwardedThrough || undefined,
    typeOfInquiry: data.typeOfInquiry || undefined,
    connectedStatus: data.connectedStatus || undefined,
    stage: data.stage || undefined,
    campaignLocation: data.campaignLocation || undefined,
    ehRegion: (data.ehRegion as LeadRegion) || undefined,
    revenueDisplayAmount: revenueNum,
  };
}
