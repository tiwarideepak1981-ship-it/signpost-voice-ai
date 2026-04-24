import { leads as sampleLeads } from "@/data/sampleData";
import { triggerLeadRouting } from "@/services/leadRoutingService";
/**
 * Lightweight module-level leads store shared across pages.
 * LeadsPage reads from this; ProspectFinderPage pushes to this.
 * Using React 18 useSyncExternalStore for reactive updates.
 */
import type { Lead } from "@/types";

// ─── Leads Store ──────────────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();
let _leads: Lead[] = [...sampleLeads];

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
    notifyAll();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
