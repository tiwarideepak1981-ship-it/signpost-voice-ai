import { sampleInboundCalls, sampleOutboundQueue } from "@/data/sampleData";
import type { AIInboundCallEntry, AIOutboundQueueEntry } from "@/types";
/**
 * AI Dialer Store — manages outbound queue and inbound call log for the AI Agent Dialer.
 *
 * Design constraints (no circular deps, no infinite re-render):
 * - Pure Zustand create() with flat state — no cross-component callbacks.
 * - No useEffect inside the store; no derived state triggers.
 * - All mutations are explicit actions — components call actions, never set state directly.
 */
import { create } from "zustand";

export type AIDialerAgentStatus = "active" | "idle" | "on-call" | "paused";

interface AIDialerState {
  outboundQueue: AIOutboundQueueEntry[];
  inboundCalls: AIInboundCallEntry[];
  agentStatus: AIDialerAgentStatus;
  liveCallId: string | null;

  // Actions
  addToQueue: (entry: AIOutboundQueueEntry) => void;
  updateQueueEntry: (id: string, patch: Partial<AIOutboundQueueEntry>) => void;
  removeFromQueue: (id: string) => void;
  addInboundCall: (entry: AIInboundCallEntry) => void;
  setAgentStatus: (status: AIDialerAgentStatus) => void;
  setLiveCallId: (id: string | null) => void;
}

export const useAIDialerStore = create<AIDialerState>((set) => ({
  outboundQueue: sampleOutboundQueue,
  inboundCalls: sampleInboundCalls,
  agentStatus: "active",
  liveCallId: null,

  addToQueue: (entry) =>
    set((state) => ({ outboundQueue: [...state.outboundQueue, entry] })),

  updateQueueEntry: (id, patch) =>
    set((state) => ({
      outboundQueue: state.outboundQueue.map((e) =>
        e.id === id ? { ...e, ...patch } : e,
      ),
    })),

  removeFromQueue: (id) =>
    set((state) => ({
      outboundQueue: state.outboundQueue.filter((e) => e.id !== id),
    })),

  addInboundCall: (entry) =>
    set((state) => ({ inboundCalls: [entry, ...state.inboundCalls] })),

  setAgentStatus: (status) => set({ agentStatus: status }),

  setLiveCallId: (id) => set({ liveCallId: id }),
}));
