import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";

// Keep the real work/live-ops-store.json untouched: the local adapter reads and writes an
// in-memory file for this suite only.
const files = vi.hoisted(() => new Map<string, string>());
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn(async () => undefined),
  readFile: vi.fn(async (path: string) => {
    const value = files.get(String(path));
    if (value === undefined) throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
    return value;
  }),
  writeFile: vi.fn(async (path: string, value: string) => {
    files.set(String(path), value);
  })
}));

const {
  applyExperienceSignupAction,
  applyStaffSignupStatus,
  summarizeExperienceSignups,
  ExperienceSignupError
} = await import("./experience-signups");
const repository = await import("./live-ops-repository");
const { GET: snapshotGet } = await import("../app/api/snapshot/route");

const eventId = event2026Snapshot.event.id;
const installId = "3b0f1f4e-5c3a-4f0e-9a51-2f8d6a1c7e10";
const otherInstall = "4c1f2f5e-6d4b-4f1e-8b62-3f9e7b2d8f21";
const saunaId = "20260000-0000-4000-8001-000000000022";
const pokerId = "20260000-0000-4000-8001-000000000003";
const awardsId = "20260000-0000-4000-8001-000000000013";
const now = "2026-09-18T12:00:00.000Z";

function seedStore(extra: Record<string, unknown> = {}) {
  files.clear();
  const store = {
    eventId,
    draftSessions: [],
    publishedSnapshot: event2026Snapshot,
    revisionHistory: [],
    revision: event2026Snapshot.revision,
    attendeeDevices: [],
    notificationJobs: [],
    activityLog: [{ id: "existing", action: "EXISTING", actorRole: "ADMIN", detail: "kept", createdAt: now }],
    importJobs: [],
    ...extra
  };
  // Path matches live-ops-store's resolve(process.cwd(), "../../work/live-ops-store.json").
  files.set(`${process.cwd().replace(/\/apps\/admin$/, "")}/work/live-ops-store.json`, JSON.stringify(store));
}

function storedJson() {
  const [value] = [...files.values()];
  return JSON.parse(value!) as Record<string, unknown>;
}

beforeEach(() => {
  vi.stubEnv("SUPABASE_URL", "");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("No network in local adapter tests"); }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("experience sign-up rules", () => {
  const join = { installId, name: "Jordan Lee", scheduleItemId: saunaId, action: "join" as const, eventId };

  it("creates, keeps a staff waitlist on re-join, and re-confirms after leaving", () => {
    const first = applyExperienceSignupAction([], join, { nowUtc: now, newId: "a" });
    expect(first.signup).toEqual({ scheduleItemId: saunaId, status: "confirmed" });

    const waitlisted = applyStaffSignupStatus(first.records, { eventId, signupId: "a", status: "waitlisted" }, now);
    const rejoined = applyExperienceSignupAction(waitlisted.records, { ...join, name: "Jordan L." }, { nowUtc: now, newId: "b" });
    expect(rejoined.records).toHaveLength(1);
    expect(rejoined.records[0]).toMatchObject({ status: "waitlisted", attendeeName: "Jordan L." });

    const left = applyExperienceSignupAction(rejoined.records, { ...join, action: "leave" }, { nowUtc: now, newId: "c" });
    expect(left.signup.status).toBe("cancelled");
    expect(() => applyStaffSignupStatus(left.records, { eventId, signupId: "a", status: "confirmed" }, now))
      .toThrow(ExperienceSignupError);
    expect(applyExperienceSignupAction(left.records, join, { nowUtc: now, newId: "d" }).signup.status).toBe("confirmed");
  });

  it("treats leaving without a sign-up as a no-op", () => {
    const outcome = applyExperienceSignupAction([], { ...join, action: "leave" }, { nowUtc: now, newId: "a" });
    expect(outcome).toMatchObject({ changed: false, records: [], signup: { status: "cancelled" } });
  });

  it("summarizes every published experience, including ones with no sign-ups", () => {
    const records = [
      applyExperienceSignupAction([], join, { nowUtc: now, newId: "a" }).records[0]!,
      { ...applyExperienceSignupAction([], { ...join, installId: otherInstall }, { nowUtc: now, newId: "b" }).records[0]!, status: "waitlisted" as const },
      { id: "c", eventId, scheduleItemId: awardsId, installId, attendeeName: "Legacy Row", status: "confirmed" as const, createdAt: now, updatedAt: now }
    ];
    const summaries = summarizeExperienceSignups(records, event2026Snapshot, eventId);
    const sauna = summaries.find((summary) => summary.scheduleItemId === saunaId)!;
    expect(sauna).toMatchObject({ title: "Late Night Pickleball and Sauna", listed: true, counts: { confirmed: 1, waitlisted: 1, cancelled: 0 } });
    expect(sauna.attendees.map((attendee) => attendee.name)).toEqual(["Jordan Lee", "Jordan Lee"]);
    expect(summaries.find((summary) => summary.scheduleItemId === pokerId)).toMatchObject({ listed: true, counts: { confirmed: 0 } });
    expect(summaries.at(-1)).toMatchObject({ scheduleItemId: awardsId, listed: false });
  });
});

describe("local adapter experience sign-ups", () => {
  it("stores sign-ups additively without disturbing existing store records", async () => {
    seedStore();
    await expect(repository.upsertExperienceSignup({ installId, name: "Jordan Lee", scheduleItemId: saunaId, action: "join" }))
      .resolves.toEqual({ scheduleItemId: saunaId, status: "confirmed" });

    const stored = storedJson();
    expect(stored.activityLog).toEqual([expect.objectContaining({ id: "existing" })]);
    expect(stored.experienceSignups).toEqual([expect.objectContaining({ installId, attendeeName: "Jordan Lee", status: "confirmed" })]);
    expect(await repository.listSignupsForInstall(installId)).toEqual([{ scheduleItemId: saunaId, status: "confirmed" }]);
    expect(await repository.listSignupsForInstall(otherInstall)).toEqual([]);
  });

  it("tolerates stores written before sign-ups existed", async () => {
    seedStore();
    expect(storedJson().experienceSignups).toBeUndefined();
    expect(await repository.listSignupsForInstall(installId)).toEqual([]);
  });

  it("rejects non-experience and unknown items without writing", async () => {
    seedStore();
    const before = storedJson();
    await expect(repository.upsertExperienceSignup({ installId, name: "Jordan Lee", scheduleItemId: awardsId, action: "join" }))
      .rejects.toMatchObject({ status: 422 });
    await expect(repository.upsertExperienceSignup({ installId, name: "Jordan Lee", scheduleItemId: "99999999-9999-4999-8999-999999999999", action: "join" }))
      .rejects.toMatchObject({ status: 404 });
    expect(storedJson()).toEqual(before);
  });

  it("lets staff waitlist an attendee with an audited, role-guarded change", async () => {
    seedStore();
    await repository.upsertExperienceSignup({ installId, name: "Jordan Lee", scheduleItemId: saunaId, action: "join" });
    const staffView = await repository.listExperienceSignupsForStaff({ role: "VIEWER", mode: "local-adapter" });
    const signupId = staffView.experiences.find((experience) => experience.scheduleItemId === saunaId)!.attendees[0]!.signupId;

    await expect(repository.setExperienceSignupStatus({ signupId, status: "waitlisted" }, { role: "EDITOR", mode: "local-adapter" }))
      .rejects.toMatchObject({ status: 403 });
    await expect(repository.setExperienceSignupStatus({ signupId, status: "waitlisted" }, { role: "PUBLISHER", mode: "local-adapter" }))
      .resolves.toMatchObject({ status: "waitlisted" });

    const stored = storedJson() as { activityLog: Array<{ action: string; detail: string }> };
    expect(stored.activityLog[0]).toMatchObject({ action: "SET_EXPERIENCE_SIGNUP_STATUS" });
    expect(stored.activityLog[0]!.detail).not.toContain("Jordan");
    expect(await repository.listSignupsForInstall(installId)).toEqual([{ scheduleItemId: saunaId, status: "waitlisted" }]);
  });

  it("never exposes attendee names or install ids in the public snapshot", async () => {
    seedStore();
    await repository.upsertExperienceSignup({ installId, name: "Zebulon Quartermaine", scheduleItemId: saunaId, action: "join" });
    const response = await snapshotGet();
    const text = await response.text();
    expect(response.status).toBe(200);
    expect(text).not.toContain("Zebulon");
    expect(text).not.toContain(installId);
    expect(text).not.toContain("experienceSignups");
  });
});
