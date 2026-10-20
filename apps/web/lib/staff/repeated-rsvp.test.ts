import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { handleRsvpPost } from "../../app/api/rsvp/route";
import { handleClosingDinnerPost } from "../../app/api/closing-dinner/route";
import { eventWaiverVersion } from "../event-waiver";
import { memorySubmissionStore } from "./store";

const accepted = (name: string) => ({ status: "accepted" as const, version: eventWaiverVersion, signature: name, adultSelf: true as const, liabilityAccepted: true as const, mediaAccepted: true as const, ticketTextConsent: true as const, electronicConsent: true as const });
const body = (requestId: string, requestedAt: string) => ({ requestId, requestedAt, name: "Repeat Guest", email: "repeat@example.com", phone: "7025550100", organization: "Example", professionalRole: "Guest", invitedBy: "Host", attendanceStatus: "attending", attending: "awards", guestCount: 1, guests: [], eventWaiver: accepted("Repeat Guest") });
const post = (payload: unknown) => new Request("https://notaloneawards.org/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });

describe("retry-safe RSVP storage", () => {
  it("stores a retry once and a separate submission as a separate ledger row", async () => {
    const store = memorySubmissionStore();
    let receipts = 0;
    const sender = async () => { receipts += 1; };
    const firstId = randomUUID(), firstAt = new Date().toISOString();
    expect((await handleRsvpPost(post(body(firstId, firstAt)), store, async () => {}, sender)).status).toBe(200);
    expect((await handleRsvpPost(post(body(firstId, firstAt)), store, async () => {}, sender)).status).toBe(200);
    expect(await store.list("rsvp")).toHaveLength(1);
    expect(receipts).toBe(1);

    const secondId = randomUUID(), secondAt = new Date(Date.now() + 1).toISOString();
    expect((await handleRsvpPost(post(body(secondId, secondAt)), store, async () => {}, sender)).status).toBe(200);
    const rows = await store.list("rsvp");
    expect(rows).toHaveLength(2);
    expect(rows.map(row => row.id)).toEqual(expect.arrayContaining([firstId, secondId]));
    expect(rows.every(row => row.attending === "awards")).toBe(true);
    expect(receipts).toBe(2);
  });

  it("keeps closing-dinner retries idempotent and separate requests distinct", async () => {
    const store = memorySubmissionStore();
    const dinner = (requestId: string, requestedAt: string) => ({ requestId, requestedAt, name: "Dinner Guest", email: "dinner@example.com", phone: "7025550199", organization: "Example", professionalRole: "Guest", eventWaiver: accepted("Dinner Guest"), bringingGuest: false });
    const postDinner = (payload: unknown) => new Request("https://notaloneawards.org/api/closing-dinner", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const firstId = randomUUID(), firstAt = new Date().toISOString();
    expect((await handleClosingDinnerPost(postDinner(dinner(firstId, firstAt)), store, null)).status).toBe(201);
    expect((await handleClosingDinnerPost(postDinner(dinner(firstId, firstAt)), store, null)).status).toBe(201);
    expect(await store.list("closingDinner")).toHaveLength(1);
    const secondId = randomUUID(), secondAt = new Date(Date.now() + 1).toISOString();
    expect((await handleClosingDinnerPost(postDinner(dinner(secondId, secondAt)), store, null)).status).toBe(201);
    expect(await store.list("closingDinner")).toHaveLength(2);
  });
});
