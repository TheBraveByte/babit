import { useState, useCallback } from "react";

/**
 * useRecentLookups — stores recently looked-up record IDs in localStorage,
 * keyed by record type (events, sessions, grants). When a user looks up a
 * record, call `addLookup(id, label)` to persist it. The table displays
 * these as clickable rows so users can revisit records without retyping IDs.
 *
 * Pre-seeded with known demo IDs so the table is never empty on first visit.
 */

export interface RecentEntry {
  id: string;
  label: string;
  ts: number;
}

const SEEDS: Record<string, RecentEntry[]> = {
  events: [
    { id: "BAL-778812", label: "approve_payout · claims/CLM-48102", ts: 0 },
  ],
  sessions: [
    { id: "BAL-538932", label: "Transparency Log · ANCHORED", ts: 0 },
  ],
  grants: [
    { id: "BAL-342070", label: "agt_checkout_agent · browser.click", ts: 0 },
    { id: "BAL-934974", label: "Root grant · Alice, Risk Supervisor", ts: 0 },
  ],
};

const MAX_ENTRIES = 12;

export function useRecentLookups(type: string) {
  const storageKey = `babit:recent:${type}`;

  const [entries, setEntries] = useState<RecentEntry[]>(() => {
    if (typeof window === "undefined") return SEEDS[type] ?? [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentEntry[];
        // Merge seeds with stored (seeds first if not already present)
        const seedIds = new Set((SEEDS[type] ?? []).map((e) => e.id));
        const merged = [
          ...(SEEDS[type] ?? []),
          ...parsed.filter((e) => !seedIds.has(e.id)),
        ];
        return merged.slice(0, MAX_ENTRIES);
      }
    } catch {
      // ignore
    }
    return SEEDS[type] ?? [];
  });

  const addLookup = useCallback((id: string, label: string) => {
    if (!id.trim()) return;
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      const next = [{ id, label, ts: Date.now() }, ...filtered].slice(0, MAX_ENTRIES);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, [storageKey]);

  return { entries, addLookup };
}
