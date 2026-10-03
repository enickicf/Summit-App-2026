import type { ScheduleItem } from "@not-alone/validation";

// Owner direction (Sept 18, 2026): core programming (Summit sessions, talks, performances, meals,
// the Awards) is on every attendee's day automatically. Optional "experiences" (the activations:
// wellness, sauna, pickleball, pet therapy, rides, tennis, tea, poker) take a name-based sign-up so
// the event team can estimate numbers. Invitation-only items (founders, sponsors, speakers, staff)
// are neither auto-included for the public nor open for sign-up.
const optionalExperiencePatterns = [
  /community ride/i,
  /poker/i,
  /wellness/i,
  /pet partners|therapy dog/i,
  /pickleball|sauna/i,
  /tennis/i,
  /high tea/i,
  /yoga|meditation|breathwork|sound bath|hike|golf|cohort/i
];

export type ScheduleParticipation = "experience" | "included" | "invitation";

const restrictedAudience = /founder|sponsor|speaker|talent|staff|crew|invitation|invite|vip|private/i;

export function isInvitationOnly(item: ScheduleItem): boolean {
  return restrictedAudience.test(item.eligibilityScope.id) || restrictedAudience.test(item.eligibilityScope.label);
}

export function scheduleParticipation(item: ScheduleItem): ScheduleParticipation {
  if (isInvitationOnly(item)) return "invitation";
  return optionalExperiencePatterns.some(pattern => pattern.test(item.title)) ? "experience" : "included";
}

export function isOptionalExperience(item: ScheduleItem): boolean {
  return item.published && item.status !== "canceled" && scheduleParticipation(item) === "experience";
}
