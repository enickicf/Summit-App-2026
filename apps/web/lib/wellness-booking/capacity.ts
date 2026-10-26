import { z } from "zod";
import draft from "../../config/wellness-capacity-2026.draft.json";
import { wellnessSessions } from "../wellness-signups-2026";

const ruleSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("unset"), maxPlaces: z.null() }).strict(),
  z.object({ mode: z.literal("limited"), maxPlaces: z.number().int().min(1).max(10_000) }).strict(),
  z.object({ mode: z.literal("unlimited"), maxPlaces: z.null() }).strict(),
]);
export type CapacityRule = z.infer<typeof ruleSchema>;
export type CapacityRules = ReadonlyMap<string, CapacityRule>;
const knownIds = new Set(wellnessSessions.map(session => session.id));

export function capacityRules(input: unknown): CapacityRules {
  const values = z.record(z.string(), ruleSchema).parse(input);
  if (Object.keys(values).some(id => !knownIds.has(id))) throw new Error("Unknown wellness session in capacity settings.");
  return new Map(wellnessSessions.map(session => [session.id, values[session.id] ?? { mode: "unset" as const, maxPlaces: null }]));
}

export const draftCapacityRules = capacityRules(draft.sessions);

// Sample limits can be used by an injected local repository. Only a separately
// reviewed complete policy can pass the runtime activation gate.
export function approvedCapacityRules(input: unknown = draft): CapacityRules {
  const config = z.object({ schemaVersion: z.literal(1), status: z.literal("approved"), enabled: z.literal(true), sessions: z.unknown() }).parse(input);
  const rules = capacityRules(config.sessions);
  if ([...rules.values()].some(rule => rule.mode === "unset")) throw new Error("Every session needs a confirmed capacity policy before activation.");
  return rules;
}
