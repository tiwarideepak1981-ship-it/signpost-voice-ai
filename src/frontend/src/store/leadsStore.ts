import { leads as sampleLeads } from "@/data/sampleData";
import { triggerLeadRouting } from "@/services/leadRoutingService";
/**
 * Lightweight module-level leads store shared across pages.
 * LeadsPage reads from this; ProspectFinderPage pushes to this.
 * Using React 18 useSyncExternalStore for reactive updates.
 */
import type { Lead, LeadComment } from "@/types";

// ─── Leads Store ──────────────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

const STORAGE_KEY = "signpost_leads_v1";

function loadFromStorage(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Lead[];
  } catch {
    // ignore parse errors
  }
  return [...sampleLeads];
}

function saveToStorage(leads: Lead[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    // ignore quota errors
  }
}

let _leads: Lead[] = loadFromStorage();

function notifyAll() {
  for (const fn of listeners) fn();
}

export const leadsStore = {
  getLeads(): Lead[] {
    return _leads;
  },

  addLeads(newLeads: Lead[]): void {
    const routed = newLeads.map((lead) => triggerLeadRouting(lead));
    _leads = [..._leads, ...routed];
    saveToStorage(_leads);
    notifyAll();
  },

  addComment(leadId: string, comment: LeadComment): void {
    _leads = _leads.map((lead) => {
      if (lead.id !== leadId) return lead;
      return {
        ...lead,
        comments: [comment, ...(lead.comments ?? [])],
      };
    });
    saveToStorage(_leads);
    notifyAll();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
