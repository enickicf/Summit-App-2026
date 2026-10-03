import { describe, expect, it, vi } from "vitest";
import { backfillRsvpConfirmations, mailerFromEnv, rsvpConfirmationEmail, sendRsvpConfirmation, wantsConfirmation } from "./rsvp-email";
import { memorySubmissionStore, newSubmission, type RsvpSubmission } from "./store";
import { handleRsvpPost } from "../../app/api/rsvp/route";

const rsvp = (over: Partial<RsvpSubmission> = {}): RsvpSubmission => ({ ...newSubmission({ name: "Lisa Lundt", email: "lisa@example.com", phone: "", organization: "", professionalRole: "", attendanceStatus: "attending", communityDay: true, guestCount: 3, notes: "" }), ...over });

describe("RSVP confirmation email (owner, Sept 28)", () => {
  it("thanks the guest, says the RSVP is not a ticket, puts them on the waiting list and promises follow-up", () => {
    const m = rsvpConfirmationEmail(rsvp());
    expect(m.subject).toBe("Thank you for your RSVP – Not Alone Awards Show");
    for (const part of ["Hi Lisa,", "Thank you for RSVPing to the Not Alone Awards Show", "does not confirm your ticket", "ticket waiting list", "reach out to you by email with information about your ticket", "Party size: 3 guests", "Community Day (before the show): Yes", "Monday, November 2, 2026", "Encore Theater at Wynn Las Vegas", "Doors open 5:30 PM", "This ticket is free. Your support makes it possible.", "https://www.inspiringchildren.org/donate"]) expect(m.text).toContain(part);
    for (const part of ["Hi Lisa,", "does not confirm your ticket", "ticket waiting list", "Lisa Lundt &middot; 3 guests &middot; Community Day: Yes", "na-awards-logo-white.png", "inspiringchildren.org/donate"]) expect(m.html).toContain(part);
    expect(m.html).not.toMatch(/confirmed|your ticket is confirmed/i);
    expect(rsvpConfirmationEmail(rsvp({ guestCount: 1, communityDay: false })).text).toContain("Party size: 1 guest (you)");
    expect(rsvpConfirmationEmail(rsvp({ name: "<b>Evil</b>" })).html).toContain("&lt;b&gt;Evil&lt;/b&gt;");
  });

  it("only guests who plan to attend get the waiting-list email", () => {
    expect(wantsConfirmation(rsvp())).toBe(true);
    expect(wantsConfirmation(rsvp({ attendanceStatus: "needs_follow_up" }))).toBe(false);
    expect(wantsConfirmation(rsvp({ attendanceStatus: "declined" }))).toBe(false);
  });

  it("is inert without SMTP settings and builds a Gmail sender from them", () => {
    expect(mailerFromEnv({})).toBeNull();
    expect(mailerFromEnv({ RSVP_EMAIL_SMTP_USER: "music@inspiringchildren.org" })).toBeNull();
    expect(mailerFromEnv({ RSVP_EMAIL_SMTP_USER: "music@inspiringchildren.org", RSVP_EMAIL_SMTP_PASS: "app-password" })).toEqual({ host: "smtp.gmail.com", port: 465, user: "music@inspiringchildren.org", pass: "app-password", from: "Not Alone Awards <music@inspiringchildren.org>", replyTo: "music@inspiringchildren.org" });
  });

  it("sends once per stored RSVP and records it; failures never surface", async () => {
    const store = memorySubmissionStore();
    const sent: string[] = [];
    const sender = vi.fn(async (m: { to: string }) => { sent.push(m.to); });
    const record = rsvp();
    expect(await sendRsvpConfirmation(record, store, sender)).toBe("sent");
    expect((await store.list("rsvpEmail")).map(r => [r.id, r.email])).toEqual([[record.id, "lisa@example.com"]]);
    expect(await sendRsvpConfirmation(rsvp({ attendanceStatus: "declined" }), store, sender)).toBe("skipped");
    expect(await sendRsvpConfirmation(record, store, null)).toBe("no-mailer");
    expect(await sendRsvpConfirmation(record, store, async () => { throw new Error("smtp down"); })).toBe("failed");
    expect(sent).toEqual(["lisa@example.com"]);
  });

  it("the RSVP endpoint stores first, then emails, and still answers ok when email fails", async () => {
    const store = memorySubmissionStore();
    const sender = vi.fn(async () => { throw new Error("smtp down"); });
    const request = new Request("https://notalonesummit.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json", origin: "https://not-alone-awards-rsvp-2026.netlify.app" }, body: JSON.stringify({ name: "Natasha Buonanno", email: "natasha@example.com", attendanceStatus: "attending", guestCount: 2 }) });
    const response = await handleRsvpPost(request, store, async () => undefined, sender);
    expect(response.status).toBe(200);
    expect((await store.list("rsvp")).map(r => r.name)).toEqual(["Natasha Buonanno"]);
    expect(sender).toHaveBeenCalledWith(expect.objectContaining({ to: "natasha@example.com", subject: "Thank you for your RSVP – Not Alone Awards Show" }));
  });

  it("backfill emails each earlier guest once (latest attending request per address), skipping those already emailed", async () => {
    const older = rsvp({ email: "lisa@example.com", submittedAt: "2026-09-22T19:00:00.000Z", guestCount: 1 });
    const newer = rsvp({ email: "LISA@example.com", submittedAt: "2026-09-22T19:14:00.000Z", guestCount: 3 });
    const done = rsvp({ email: "done@example.com", submittedAt: "2026-09-23T10:00:00.000Z" });
    const unable = rsvp({ email: "no@example.com", attendanceStatus: "declined" });
    const store = memorySubmissionStore({ rsvp: [older, newer, done, unable], rsvpEmail: [{ ...newSubmission({ email: "done@example.com", subject: "x", rsvpId: done.id }), id: done.id }] });
    const sent: { to: string; text: string }[] = [];
    const result = await backfillRsvpConfirmations(store, async m => { sent.push({ to: m.to, text: m.text }); });
    expect(result).toMatchObject({ sent: ["LISA@example.com"], skipped: 1, failed: [], noMailer: false });
    expect(sent[0]!.text).toContain("Party size: 3 guests");
    expect((await store.list("rsvpEmail")).length).toBe(2);
    expect(await backfillRsvpConfirmations(store, null)).toMatchObject({ noMailer: true });
  });
});
