import type { LeadRegion } from "@/types";

export interface EnterpriseHead {
  id: string;
  region: LeadRegion;
  headName: string;
  email: string;
  whatsappNumber: string;
  title: string;
}

export const ENTERPRISE_HEADS: EnterpriseHead[] = [
  {
    id: "eh-north",
    region: "North",
    headName: "Rajesh Kumar",
    email: "rajesh.kumar@signpostai.com",
    whatsappNumber: "+91-9810000001",
    title: "Enterprise Head – North",
  },
  {
    id: "eh-east",
    region: "East",
    headName: "Priya Das",
    email: "priya.das@signpostai.com",
    whatsappNumber: "+91-9830000001",
    title: "Enterprise Head – East",
  },
  {
    id: "eh-west",
    region: "West",
    headName: "Amit Shah",
    email: "amit.shah@signpostai.com",
    whatsappNumber: "+91-9820000001",
    title: "Enterprise Head – West",
  },
  {
    id: "eh-south",
    region: "South",
    headName: "Lakshmi Nair",
    email: "lakshmi.nair@signpostai.com",
    whatsappNumber: "+91-9840000001",
    title: "Enterprise Head – South",
  },
  {
    id: "eh-rom",
    region: "ROM",
    headName: "Vikram Mehta",
    email: "vikram.mehta@signpostai.com",
    whatsappNumber: "+91-9850000001",
    title: "Enterprise Head – Rest of Market",
  },
  {
    id: "eh-trading",
    region: "Trading",
    headName: "Neha Sharma",
    email: "neha.sharma@signpostai.com",
    whatsappNumber: "+91-9860000001",
    title: "Enterprise Head – Trading Desk",
  },
  {
    id: "eh-agency",
    region: "Agency",
    headName: "Arjun Patel",
    email: "arjun.patel@signpostai.com",
    whatsappNumber: "+91-9870000001",
    title: "Enterprise Head – Agency",
  },
];

export function getEnterpriseHeadByRegion(region: LeadRegion): EnterpriseHead {
  return (
    ENTERPRISE_HEADS.find((h) => h.region === region) ?? ENTERPRISE_HEADS[4]
  ); // fallback ROM
}
