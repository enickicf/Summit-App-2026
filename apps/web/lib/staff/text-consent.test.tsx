import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { handleWellnessPost } from "../../app/api/wellness/route";
import { memorySubmissionStore, rsvpCsvColumns, rsvpPayloadSchema, toCsv, withRsvpForm } from "./store";
import { siteVisitWaiver } from "../morning-workshops";
import { textConsentStatus, textConsentWording } from "./text-consent";

// Owner (Oct 12): opt-in checkbox for text updates on every form; a phone alone = ticket/event texts only.
describe("text message consent", () => {
  it("classifies box, phone-only and no phone", () => {
    expect(textConsentStatus({ phone: "702-555-0100", textConsent: true, submittedAt: "2026-10-12T20:00:00Z" })).toBe("checkbox");
    expect(textConsentStatus({ phone: "702-555-0100", submittedAt: "2026-10-01T20:00:00Z" })).toBe("phone");
    expect(textConsentStatus({ phone: "702-555-0100", textConsent: false, submittedAt: "2026-10-12T20:00:00Z" })).toBe("phone");
    expect(textConsentStatus({ phone: "", textConsent: true, submittedAt: "2026-10-12T20:00:00Z" })).toBe("none");
  });
  it("stores the RSVP checkbox and writes the spreadsheet columns", () => {
    const parsed = rsvpPayloadSchema.parse({ name: "Test Guest", email: "t@example.com", phone: "7025550100", attendanceStatus: "attending", textConsent: "yes" });
    expect(parsed.textConsent).toBe(true);
    expect(rsvpPayloadSchema.parse({ name: "Test Guest", email: "t@example.com", attendanceStatus: "attending" }).textConsent).toBeUndefined();
    const csv = toCsv(withRsvpForm([{ ...parsed, id: "1", submittedAt: "2026-10-12T20:00:00Z", source: "form" }]), rsvpCsvColumns);
    expect(csv.split("\r\n")[0]).toContain("textMessageConsent,textConsentDate,textConsentProtocol");
    expect(csv).toContain("Yes: gave consent");
    expect(csv).toContain("2026-10-12");
  });
  it("keeps the wellness sign-up's checkbox", async () => {
    const store = memorySubmissionStore();
    const body = { name: "Test Guest", email: "t@example.com", phone: "7025550100", sessions: ["wellness-nov3-pilates-1"], waiverAccepted: true, signature: "Test Guest", waiverVersion: siteVisitWaiver.version, textConsent: true };
    await handleWellnessPost(new Request("https://notalonesummit.org/api/wellness", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }), store);
    expect((await store.list("workshop"))[0]?.textConsent).toBe(true);
  });
  it("shows the same wording on the Tennis & High Tea and Wellness forms, unticked", () => {
    for (const dir of ["tennis-high-tea", "wellness"]) {
      const html = readFileSync(join(__dirname, "..", "..", "public", dir, "index.html"), "utf8");
      expect(html).toContain(textConsentWording.replace("&", "&amp;"));
      expect(html).toMatch(/<input type="checkbox" name="textConsent"(?![^>]*checked)/);
    }
  });
});

describe("text opt-outs and the text-updates page", () => {
  it("an opt-out overrides a ticked box, and a later yes overrides an opt-out", async () => {
    const { textConsentStatus, textContactRows } = await import("./text-consent");
    const rsvp = { phone: "(702) 555-0100", email: "g@example.com", textConsent: true, submittedAt: "2026-10-12T20:00:00Z" };
    const no = { phone: "702-555-0100", choice: "no" as const, submittedAt: "2026-10-13T20:00:00Z" };
    expect(textConsentStatus(rsvp, [no])).toBe("optedOut");
    expect(textConsentStatus(rsvp, [no, { ...no, choice: "yes" as const, submittedAt: "2026-10-14T20:00:00Z" }])).toBe("checkbox");
    expect(textConsentStatus({ phone: "", email: "g@example.com", submittedAt: "2026-10-12T20:00:00Z" }, [{ phone: "7025550100", email: "G@example.com", choice: "no", submittedAt: "2026-10-13T00:00:00Z" }])).toBe("optedOut");
    const rows = textContactRows([{ name: "Guest", email: "g@example.com", phone: "702 555 0100", submittedAt: rsvp.submittedAt, textConsent: false, source: "RSVP" }], [no]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.textMessageConsent).toContain("OPTED OUT");
  });
  it("stores a choice from the text-updates page and refuses one without a phone", async () => {
    const { handleTextPreferencePost } = await import("../../app/api/text-preferences/route");
    const store = memorySubmissionStore();
    const post = (body: unknown) => new Request("https://notalonesummit.org/api/text-preferences", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    expect((await handleTextPreferencePost(post({ phone: "7025550100", choice: "no" }), store)).status).toBe(201);
    expect((await handleTextPreferencePost(post({ phone: "", choice: "yes" }), store)).status).toBe(400);
    expect(await store.list("textPreference")).toMatchObject([{ phone: "7025550100", choice: "no", via: "page" }]);
    const html = readFileSync(join(__dirname, "..", "..", "public", "text-updates", "index.html"), "utf8");
    expect(html).toContain("Reply STOP to opt out");
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
  });
});
