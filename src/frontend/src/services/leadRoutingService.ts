import { getEnterpriseHeadByRegion } from "@/data/enterpriseHeads";
import type { Lead, LeadRegion } from "@/types";

// ─── Config (API-ready hooks) ─────────────────────────────────────────────────

export const META_WHATSAPP_CONFIG = {
  phoneNumberId: "YOUR_PHONE_NUMBER_ID",
  accessToken: "YOUR_ACCESS_TOKEN",
  templateName: "new_lead_notification",
  languageCode: "en",
};

export const EMAIL_CONFIG = {
  fromEmail: "leads@signpostai.com",
  apiEndpoint: "YOUR_EMAIL_API_ENDPOINT",
};

// ─── City-to-region mapping ───────────────────────────────────────────────────

const WEST_CITIES = new Set([
  "mumbai",
  "pune",
  "ahmedabad",
  "surat",
  "vadodara",
  "baroda",
  "nagpur",
  "nashik",
  "aurangabad",
  "thane",
]);

const NORTH_CITIES = new Set([
  "delhi",
  "new delhi",
  "noida",
  "gurgaon",
  "gurugram",
  "chandigarh",
  "jaipur",
  "lucknow",
  "agra",
  "kanpur",
  "varanasi",
  "indore",
  "bhopal",
  "amritsar",
  "ludhiana",
  "jodhpur",
  "udaipur",
  "faridabad",
  "ghaziabad",
]);

const EAST_CITIES = new Set([
  "kolkata",
  "bhubaneswar",
  "patna",
  "guwahati",
  "ranchi",
  "jamshedpur",
  "cuttack",
  "dhanbad",
  "siliguri",
]);

const SOUTH_CITIES = new Set([
  "bengaluru",
  "bangalore",
  "chennai",
  "hyderabad",
  "kochi",
  "cochin",
  "coimbatore",
  "mysore",
  "mysuru",
  "vizag",
  "visakhapatnam",
  "thiruvananthapuram",
  "madurai",
  "vijayawada",
  "mangalore",
]);

// ─── Company-type detection ───────────────────────────────────────────────────

const AGENCY_KEYWORDS = [
  "ogilvy",
  "ddb",
  "mccann",
  "grey",
  "leo burnett",
  "publicis",
  "tbwa",
  "wunderman",
  "fcb",
  "lowe",
  "mrm",
  "havas",
  "jwt",
  "j. walter",
  "dentsu",
  "bbdo",
  "wpp",
  "omnicom",
  "media agency",
  "advertising agency",
  "creative agency",
  "kinnect",
  "schbang",
  "social beat",
  "mirum",
  "foxymoron",
  "white rivers",
  "creativeland",
];

const TRADING_KEYWORDS = [
  "trading desk",
  "programmatic",
  "xaxis",
  "cadreon",
  "mindshare trading",
  "amnet",
  "accuen",
  "performics",
  "iprospect",
  "matterkind",
  "assembly",
];

function detectCompanyRegion(company: string): LeadRegion | null {
  const c = company.toLowerCase();
  if (TRADING_KEYWORDS.some((kw) => c.includes(kw))) return "Trading";
  if (AGENCY_KEYWORDS.some((kw) => c.includes(kw))) return "Agency";
  return null;
}

function detectCityRegion(location: string): LeadRegion {
  const loc = location.toLowerCase().trim();
  // Try to match from start or as substring for compound city names
  for (const city of WEST_CITIES) {
    if (loc.includes(city)) return "West";
  }
  for (const city of NORTH_CITIES) {
    if (loc.includes(city)) return "North";
  }
  for (const city of EAST_CITIES) {
    if (loc.includes(city)) return "East";
  }
  for (const city of SOUTH_CITIES) {
    if (loc.includes(city)) return "South";
  }
  return "ROM";
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function detectRegion(
  lead: Pick<Lead, "company" | "location" | "city">,
): LeadRegion {
  // 1. Company-type routing takes precedence
  const companyRegion = detectCompanyRegion(lead.company);
  if (companyRegion) return companyRegion;

  // 2. City field if available
  const citySource = lead.city ?? lead.location ?? "";
  return detectCityRegion(citySource);
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export function buildEmailPayload(
  lead: Lead,
  enterpriseHead: ReturnType<typeof getEnterpriseHeadByRegion>,
): EmailPayload {
  return {
    to: enterpriseHead.email,
    subject: `New Lead Routed: ${lead.name} — ${lead.company} [${enterpriseHead.region}]`,
    body: `
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
  <h2 style="color: #1a1a2e;">New Lead Notification — ${enterpriseHead.region} Region</h2>
  <p>Hi ${enterpriseHead.headName},</p>
  <p>A new lead has been routed to you from Signpost Voice AI:</p>
  <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
    <tr><td style="padding: 6px; font-weight: bold;">Name</td><td style="padding: 6px;">${lead.name}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Company</td><td style="padding: 6px;">${lead.company}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Phone</td><td style="padding: 6px;">${lead.phone}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Email</td><td style="padding: 6px;">${lead.email}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Region</td><td style="padding: 6px;">${enterpriseHead.region}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Location</td><td style="padding: 6px;">${lead.location}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">AI Status</td><td style="padding: 6px;">${lead.status.toUpperCase()}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Score</td><td style="padding: 6px;">${lead.score}</td></tr>
    <tr><td style="padding: 6px; font-weight: bold;">Intent</td><td style="padding: 6px;">${lead.intent}</td></tr>
  </table>
  <p style="margin-top: 16px;">Please reach out within 24 hours.</p>
  <p>— Signpost Voice AI</p>
</body>
</html>`,
  };
}

export interface WhatsAppPayload {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components: Array<{
      type: "body";
      parameters: Array<{ type: "text"; text: string }>;
    }>;
  };
}

export function buildWhatsAppPayload(
  lead: Lead,
  enterpriseHead: ReturnType<typeof getEnterpriseHeadByRegion>,
): WhatsAppPayload {
  const number = enterpriseHead.whatsappNumber.replace(/[^0-9]/g, "");
  return {
    messaging_product: "whatsapp",
    to: number,
    type: "template",
    template: {
      name: META_WHATSAPP_CONFIG.templateName,
      language: { code: META_WHATSAPP_CONFIG.languageCode },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: lead.name },
            { type: "text", text: lead.company },
            { type: "text", text: enterpriseHead.region },
            { type: "text", text: lead.phone },
            { type: "text", text: lead.email },
          ],
        },
      ],
    },
  };
}

export function triggerLeadRouting(lead: Lead): Lead {
  const region = detectRegion(lead);
  const head = getEnterpriseHeadByRegion(region);
  const routedAt = new Date().toISOString();

  const updatedLead: Lead = {
    ...lead,
    region,
    routedTo: head.headName,
    routedAt,
    routingStatus: "sent",
  };

  const emailPayload = buildEmailPayload(updatedLead, head);
  const waPayload = buildWhatsAppPayload(updatedLead, head);

  console.log("[LEAD ROUTING] ─────────────────────────────────────────────");
  console.log(`[LEAD ROUTING] Lead: ${lead.name} (${lead.company})`);
  console.log(`[LEAD ROUTING] Region detected: ${region}`);
  console.log(`[LEAD ROUTING] Assigned to: ${head.headName} <${head.email}>`);
  console.log(
    "[LEAD ROUTING] Email payload:",
    JSON.stringify(emailPayload, null, 2),
  );
  console.log(
    "[LEAD ROUTING] WhatsApp payload:",
    JSON.stringify(waPayload, null, 2),
  );
  console.log("[LEAD ROUTING] ─────────────────────────────────────────────");

  return updatedLead;
}
