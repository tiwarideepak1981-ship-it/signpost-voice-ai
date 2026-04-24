/**
 * AI Campaign Results persistence store.
 * Reads/writes campaign state to localStorage under key 'ai_campaign_results'.
 * Uses module-level state + useSyncExternalStore pattern for reactivity.
 */
import { sampleAICampaigns } from "@/data/sampleData";
import type { AICampaign } from "@/types";

const STORAGE_KEY = "ai_campaign_results";

type PersistedMap = Record<string, AICampaign>;
type Listener = () => void;

// ─── Serialization helpers ────────────────────────────────────────────────────

function reviveCampaign(raw: AICampaign): AICampaign {
  return {
    ...raw,
    startTime: raw.startTime ? new Date(raw.startTime) : undefined,
    completedTime: raw.completedTime ? new Date(raw.completedTime) : undefined,
    persistedAt: raw.persistedAt ? new Date(raw.persistedAt) : undefined,
    callLogs: (raw.callLogs ?? []).map((log) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    })),
  };
}

function loadFromStorage(): PersistedMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as PersistedMap;
    const revived: PersistedMap = {};
    for (const [id, c] of Object.entries(parsed)) {
      revived[id] = reviveCampaign(c);
    }
    return revived;
  } catch {
    return {};
  }
}

function saveToStorage(map: PersistedMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // quota exceeded — silently skip
  }
}

// ─── Module state ─────────────────────────────────────────────────────────────

const listeners = new Set<Listener>();
let _persisted: PersistedMap = loadFromStorage();

/** Merge persisted results on top of sampleAICampaigns (persisted wins). */
function buildMergedList(): AICampaign[] {
  const base = sampleAICampaigns.map((c) =>
    _persisted[c.id] ? { ...c, ..._persisted[c.id] } : c,
  );
  // Prepend any persisted campaigns that are not in sampleData (user-launched)
  const sampleIds = new Set(sampleAICampaigns.map((c) => c.id));
  const extras = Object.values(_persisted).filter((c) => !sampleIds.has(c.id));
  return [...extras, ...base];
}

let _campaigns: AICampaign[] = buildMergedList();

function notifyAll() {
  for (const fn of listeners) fn();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const campaignStore = {
  /** Returns current merged AI campaign list. */
  getCampaigns(): AICampaign[] {
    return _campaigns;
  },

  /**
   * Persist one or more updated campaigns.
   * Marks each campaign with persistedAt timestamp before saving.
   */
  saveCampaigns(updates: AICampaign[]): void {
    const now = new Date();
    for (const c of updates) {
      _persisted[c.id] = { ...c, persistedAt: now };
    }
    saveToStorage(_persisted);
    _campaigns = buildMergedList();
    notifyAll();
  },

  /** Persist a single campaign update. */
  saveCampaign(campaign: AICampaign): void {
    campaignStore.saveCampaigns([campaign]);
  },

  /**
   * Bulk-replace the entire campaign list in memory + storage.
   * Used when the page-level list diverges from store (e.g. toggle-pause).
   */
  setAll(list: AICampaign[]): void {
    const now = new Date();
    for (const c of list) {
      _persisted[c.id] = { ...c, persistedAt: now };
    }
    saveToStorage(_persisted);
    _campaigns = buildMergedList();
    notifyAll();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
