import { describe, expect, it, vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { privateSchedulePath, publicLocation, roomsPublic, venueGuidePath } from "./room-privacy";
import { ScheduleBrowser } from "../components/schedule-browser";
import { groupPublishedProgramByDay } from "@not-alone/domain";

function files(dir: string): string[] { return readdirSync(dir).flatMap(name => { const p = join(dir, name); return statSync(p).isDirectory() ? files(p) : [p]; }); }

describe("rooms inside Wynn are private (owner / Ryan, Sept 29, 2026)", () => {
  it("hides every room from public display and keeps the private guide unguessable", () => {
    expect(roomsPublic).toBe(false);
    expect(publicLocation("Margaux Ballroom")).toBe("");
    expect(venueGuidePath).toMatch(/^\/venue\/guide-[a-z0-9]{10,}$/);
  });
  it("renders the public schedule without any room name", () => {
    const days = groupPublishedProgramByDay(event2026Snapshot);
    const html = renderToStaticMarkup(<ScheduleBrowser days={days} eventTimeZone={event2026Snapshot.event.timeZone} initialNowUtc="2026-11-02T15:00:00.000Z" />);
    expect(html).not.toContain(">Location<");
    for (const item of event2026Snapshot.scheduleItems) if (item.locationName.trim()) expect(html).not.toContain(item.locationName.trim());
    const guide = renderToStaticMarkup(<ScheduleBrowser days={days} eventTimeZone={event2026Snapshot.event.timeZone} initialNowUtc="2026-11-02T15:00:00.000Z" showRooms />);
    expect(guide).toContain(">Location<");
  });
  it("never links the private guide from any page, menu or component", () => {
    const sources = [...files(join(__dirname, "../app")), ...files(join(__dirname, "../components"))].filter(p => /\.(tsx?|css)$/.test(p) && !p.includes("/venue/guide-") && !p.endsWith(".test.tsx") && !p.endsWith(".test.ts"));
    for (const p of sources) expect(readFileSync(p, "utf8"), p).not.toContain(venueGuidePath);
    expect(privateSchedulePath).toMatch(/^\/privateschedule-[a-z0-9]{8,}$/);
    for (const p of sources) if (!p.includes("room-privacy.ts")) expect(readFileSync(p, "utf8"), p).not.toContain(privateSchedulePath);
    expect(readFileSync(join(__dirname, "../app/sitemap.ts"), "utf8")).not.toContain("guide-");
  });
});

describe("room names never reach the public pages' data (Oct 20)", () => {
  it("blanks every room in the copies passed to the browser and keeps only what live notices need", async () => {
    const { withoutRooms, noticeOnlySnapshot } = await import("./room-privacy");
    const snapshot = { event: { name: "Summit" }, notices: [{ id: "n" }], scheduleItems: [{ title: "Dinner", locationId: "l1", locationName: "Margaux" }], locations: [{ name: "LaFleur" }], infoPages: [{ body: "Margaux is listed for the dinner" }] };
    const text = JSON.stringify(noticeOnlySnapshot(snapshot)) + JSON.stringify(withoutRooms([{ items: [{ locationName: "Sinatra" }] }]));
    expect(text).not.toMatch(/Margaux|LaFleur|Sinatra/);
    expect(noticeOnlySnapshot(snapshot).scheduleItems).toHaveLength(1);
    expect(noticeOnlySnapshot(null)).toBeNull();
  });
});
