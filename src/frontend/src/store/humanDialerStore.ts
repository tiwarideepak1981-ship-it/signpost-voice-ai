/**
 * Human Dialer Store — manages state for the human agent phone dialer.
 *
 * Architecture rules (prevent React error #185 infinite loops):
 * - Pure Zustand create() with flat primitive state — no nested objects in selectors.
 * - All mutations are explicit actions; components call actions, never set state directly.
 * - localStorage persistence via store.subscribe(), NOT via useEffect in components.
 * - State transitions are strictly one-way:
 *   idle → ringing → connected → idle (outbound)
 *   idle → incoming → connected (accept) or idle (reject)
 */
import { create } from "zustand";

export type HumanCallState = "idle" | "ringing" | "connected" | "incoming";
export type HumanCallType = "outbound" | "inbound";

export interface HumanCallHistoryEntry {
  id: string;
  phone: string;
  name: string;
  company: string;
  type: HumanCallType;
  durationSecs: number;
  timestamp: string; // ISO string for serialization
  outcome: "completed" | "rejected" | "missed" | "no-answer";
}

interface HumanDialerState {
  // Primitive values — safe for individual Zustand selectors
  dialedNumber: string;
  callState: HumanCallState;
  currentCallerPhone: string;
  currentCallerName: string;
  currentCallerCompany: string;
  muteActive: boolean;
  holdActive: boolean;
  incomingPhone: string;
  incomingName: string;
  incomingCompany: string;
  callHistory: HumanCallHistoryEntry[];

  // Actions
  setDialedNumber: (num: string) => void;
  appendDialedDigit: (digit: string) => void;
  backspaceDialedNumber: () => void;
  clearDialedNumber: () => void;
  initiateCall: (phone: string, name?: string, company?: string) => void;
  acceptIncomingCall: () => void;
  rejectIncomingCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  endCall: () => void;
  addToHistory: (entry: HumanCallHistoryEntry) => void;
  clearHistory: () => void;
  setClickToCallTarget: (phone: string, name: string, company: string) => void;
  setClickToCallTargetObj: (target: {
    phone: string;
    name: string;
    company: string;
  }) => void;
  simulateIncomingCall: (phone: string, name: string, company: string) => void;
}

const HISTORY_KEY = "human_dialer_history";
const MAX_HISTORY = 100;

function loadHistory(): HumanCallHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HumanCallHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(entries: HumanCallHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage errors
  }
}

export const useHumanDialerStore = create<HumanDialerState>((set, get) => ({
  dialedNumber: "",
  callState: "idle",
  currentCallerPhone: "",
  currentCallerName: "",
  currentCallerCompany: "",
  muteActive: false,
  holdActive: false,
  incomingPhone: "",
  incomingName: "",
  incomingCompany: "",
  callHistory: loadHistory(),

  setDialedNumber: (num) => set({ dialedNumber: num }),

  appendDialedDigit: (digit) =>
    set((s) => ({ dialedNumber: s.dialedNumber + digit })),

  backspaceDialedNumber: () =>
    set((s) => ({ dialedNumber: s.dialedNumber.slice(0, -1) })),

  clearDialedNumber: () => set({ dialedNumber: "" }),

  initiateCall: (phone, name = "", company = "") => {
    const state = get().callState;
    if (state !== "idle") return;
    set({
      callState: "ringing",
      currentCallerPhone: phone,
      currentCallerName: name || phone,
      currentCallerCompany: company,
      muteActive: false,
      holdActive: false,
    });
  },

  acceptIncomingCall: () => {
    const s = get();
    if (s.callState !== "incoming") return;
    set({
      callState: "connected",
      currentCallerPhone: s.incomingPhone,
      currentCallerName: s.incomingName,
      currentCallerCompany: s.incomingCompany,
      muteActive: false,
      holdActive: false,
    });
  },

  rejectIncomingCall: () => {
    const s = get();
    if (s.callState !== "incoming") return;
    const entry: HumanCallHistoryEntry = {
      id: `hcall-${Date.now()}`,
      phone: s.incomingPhone,
      name: s.incomingName,
      company: s.incomingCompany,
      type: "inbound",
      durationSecs: 0,
      timestamp: new Date().toISOString(),
      outcome: "rejected",
    };
    const updated = [entry, ...s.callHistory].slice(0, MAX_HISTORY);
    saveHistory(updated);
    set({
      callState: "idle",
      incomingPhone: "",
      incomingName: "",
      incomingCompany: "",
      callHistory: updated,
    });
  },

  toggleMute: () => set((s) => ({ muteActive: !s.muteActive })),
  toggleHold: () => set((s) => ({ holdActive: !s.holdActive })),

  endCall: () => {
    // Called by the page after recording duration; just resets call state.
    set({
      callState: "idle",
      currentCallerPhone: "",
      currentCallerName: "",
      currentCallerCompany: "",
      muteActive: false,
      holdActive: false,
    });
  },

  addToHistory: (entry) => {
    const updated = [entry, ...get().callHistory].slice(0, MAX_HISTORY);
    saveHistory(updated);
    set({ callHistory: updated });
  },

  clearHistory: () => {
    saveHistory([]);
    set({ callHistory: [] });
  },

  setClickToCallTarget: (phone, name, company) => {
    set({
      dialedNumber: phone,
      currentCallerName: name,
      currentCallerCompany: company,
    });
  },

  setClickToCallTargetObj: (target) => {
    set({
      dialedNumber: target.phone,
      currentCallerName: target.name,
      currentCallerCompany: target.company,
    });
  },

  simulateIncomingCall: (phone, name, company) => {
    if (get().callState !== "idle") return;
    set({
      callState: "incoming",
      incomingPhone: phone,
      incomingName: name,
      incomingCompany: company,
    });
  },
}));

// Named export for imperative access (e.g. LeadsPage click-to-call without hook subscription)
export const humanDialerStore = useHumanDialerStore;
