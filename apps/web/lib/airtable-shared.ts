import type { EventSnapshot } from "@not-alone/validation";

// Browser-safe accessor for the Airtable overlay (no server code or credentials here).
export type AirtableOverlayPerson = { tier?: "A" | "B" | "C" | "D" | "F"; topRank?: number;
  recordId: string; name: string; status: string; groups: string[]; occupation: string; organization: string;
  title: string; bio: string; hasHeadshot: boolean; speakerId: string; categories: string[]; featured: boolean;
  // Position in Airtable's list (the owner's ranking): within a category A-Talent comes first, then this order.
  rank: number;
};
export type AirtableOverlayPartner = { recordId: string; name: string; item: string; group: string; status: string };
export type AirtableOverlay = { people: Map<string, AirtableOverlayPerson> | null; partners: AirtableOverlayPartner[] | null; schedule: boolean };
// Kept beside the snapshot (not on it) so the snapshot stays a plain object that React can pass to
// client components. Readers use the same snapshot object that withAirtable() returned.
const overlays = new WeakMap<object, AirtableOverlay>();

export function setAirtableOverlay(snapshot: EventSnapshot, overlay: AirtableOverlay): void {
  overlays.set(snapshot, overlay);
}

export function airtableOverlay(snapshot: EventSnapshot | null | undefined): AirtableOverlay | undefined {
  return snapshot ? overlays.get(snapshot) : undefined;
}
