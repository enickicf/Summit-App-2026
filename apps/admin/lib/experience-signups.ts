import { isOptionalExperience } from "@not-alone/domain/experiences";
import type {
  EventSnapshot,
  ExperienceSignupRequest,
  ExperienceSignupStatus,
  ScheduleItem
} from "@not-alone/validation";
import { projectPublicSnapshot } from "./public-snapshot";

// Staff-only attendee sign-up records. Never merged into a published snapshot.
export type ExperienceSignupRecord = {
  id: string;
  eventId: string;
  scheduleItemId: string;
  installId: string;
  attendeeName: string;
  status: ExperienceSignupStatus;
  createdAt: string;
  updatedAt: string;
};

export type AttendeeSignupView = {
  scheduleItemId: string;
  status: ExperienceSignupStatus;
};

export type ExperienceSignupSummary = {
  scheduleItemId: string;
  title: string;
  startUtc: string | null;
  eventTimeZone: string | null;
  // False when sign-ups exist for an item that is no longer a published optional experience.
  listed: boolean;
  counts: Record<ExperienceSignupStatus, number>;
  attendees: Array<{
    signupId: string;
    name: string;
    status: ExperienceSignupStatus;
    createdAt: string;
    updatedAt: string;
  }>;
};

export class ExperienceSignupError extends Error {
  constructor(
    public readonly status: 404 | 409 | 422,
    message: string
  ) {
    super(message);
    this.name = "ExperienceSignupError";
  }
}

// Sign-ups are accepted only for items attendees can actually see in the public projection of
// the current published snapshot and that the shared classifier marks as optional experiences.
export function assertSignupEligibleItem(snapshot: EventSnapshot, scheduleItemId: string): ScheduleItem {
  const item = projectPublicSnapshot(snapshot).scheduleItems.find((candidate) => candidate.id === scheduleItemId);
  if (!item) {
    throw new ExperienceSignupError(404, "This experience is not in the published schedule.");
  }
  if (!isOptionalExperience(item)) {
    throw new ExperienceSignupError(422, "This schedule item does not take sign-ups.");
  }
  return item;
}

export function applyExperienceSignupAction(
  records: ExperienceSignupRecord[],
  input: ExperienceSignupRequest & { eventId: string },
  options: { nowUtc: string; newId: string }
): { records: ExperienceSignupRecord[]; signup: AttendeeSignupView; changed: boolean } {
  const index = records.findIndex((record) =>
    record.scheduleItemId === input.scheduleItemId && record.installId === input.installId
  );
  const existing = index >= 0 ? records[index] : undefined;

  if (input.action === "leave") {
    if (!existing || existing.eventId !== input.eventId || existing.status === "cancelled") {
      return { records, signup: { scheduleItemId: input.scheduleItemId, status: "cancelled" }, changed: false };
    }
    const updated: ExperienceSignupRecord = { ...existing, status: "cancelled", updatedAt: options.nowUtc };
    return { records: replaceAt(records, index, updated), signup: toAttendeeView(updated), changed: true };
  }

  if (existing && existing.eventId !== input.eventId) {
    throw new ExperienceSignupError(409, "This sign-up belongs to a different event.");
  }

  if (!existing) {
    const created: ExperienceSignupRecord = {
      id: options.newId,
      eventId: input.eventId,
      scheduleItemId: input.scheduleItemId,
      installId: input.installId,
      attendeeName: input.name,
      status: "confirmed",
      createdAt: options.nowUtc,
      updatedAt: options.nowUtc
    };
    return { records: [...records, created], signup: toAttendeeView(created), changed: true };
  }

  // Re-joining keeps a staff-assigned waitlist status; only a cancelled row is re-confirmed.
  const updated: ExperienceSignupRecord = {
    ...existing,
    attendeeName: input.name,
    status: existing.status === "cancelled" ? "confirmed" : existing.status,
    updatedAt: options.nowUtc
  };
  return { records: replaceAt(records, index, updated), signup: toAttendeeView(updated), changed: true };
}

export function applyStaffSignupStatus(
  records: ExperienceSignupRecord[],
  input: { eventId: string; signupId: string; status: "confirmed" | "waitlisted" },
  nowUtc: string
): { records: ExperienceSignupRecord[]; previous: ExperienceSignupRecord; updated: ExperienceSignupRecord } {
  const index = records.findIndex((record) => record.id === input.signupId && record.eventId === input.eventId);
  const previous = index >= 0 ? records[index] : undefined;
  if (!previous) {
    throw new ExperienceSignupError(404, "Sign-up not found.");
  }
  if (previous.status === "cancelled") {
    throw new ExperienceSignupError(409, "The attendee cancelled this sign-up.");
  }
  const updated: ExperienceSignupRecord = { ...previous, status: input.status, updatedAt: nowUtc };
  return { records: replaceAt(records, index, updated), previous, updated };
}

export function signupsForInstall(records: ExperienceSignupRecord[], eventId: string, installId: string): AttendeeSignupView[] {
  return records
    .filter((record) => record.eventId === eventId && record.installId === installId)
    .map(toAttendeeView);
}

export function summarizeExperienceSignups(
  records: ExperienceSignupRecord[],
  snapshot: EventSnapshot,
  eventId: string
): ExperienceSignupSummary[] {
  const experiences = projectPublicSnapshot(snapshot).scheduleItems.filter(isOptionalExperience);
  const allItems = new Map(snapshot.scheduleItems.map((item) => [item.id, item]));
  const summaries = new Map<string, ExperienceSignupSummary>();

  for (const item of experiences) {
    summaries.set(item.id, emptySummary(item.id, item, true));
  }

  for (const record of records) {
    if (record.eventId !== eventId) continue;
    let summary = summaries.get(record.scheduleItemId);
    if (!summary) {
      summary = emptySummary(record.scheduleItemId, allItems.get(record.scheduleItemId), false);
      summaries.set(record.scheduleItemId, summary);
    }
    summary.counts[record.status] += 1;
    summary.attendees.push({
      signupId: record.id,
      name: record.attendeeName,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    });
  }

  return [...summaries.values()]
    .map((summary) => ({
      ...summary,
      attendees: summary.attendees.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    }))
    .sort((a, b) =>
      Number(b.listed) - Number(a.listed) ||
      (a.startUtc ?? "￿").localeCompare(b.startUtc ?? "￿") ||
      a.title.localeCompare(b.title)
    );
}

function emptySummary(scheduleItemId: string, item: ScheduleItem | undefined, listed: boolean): ExperienceSignupSummary {
  return {
    scheduleItemId,
    title: item?.title ?? "Schedule item no longer published",
    startUtc: item?.startUtc ?? null,
    eventTimeZone: item?.eventTimeZone ?? null,
    listed,
    counts: { confirmed: 0, waitlisted: 0, cancelled: 0 },
    attendees: []
  };
}

function toAttendeeView(record: ExperienceSignupRecord): AttendeeSignupView {
  return { scheduleItemId: record.scheduleItemId, status: record.status };
}

function replaceAt<T>(items: T[], index: number, value: T) {
  return items.map((item, position) => (position === index ? value : item));
}
