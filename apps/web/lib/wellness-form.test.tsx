import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { handleWellnessPost } from "../app/api/wellness/route";
import { StaffPortal } from "../components/staff-portal";
import { viewForHash } from "../components/portal-views";
import { siteVisitWaiver } from "./morning-workshops";
import { memorySubmissionStore, toCsv, wellnessCsvColumns } from "./staff/store";
import { wellnessClash, wellnessSessions } from "./wellness-signups-2026";

// Oct 12 (Kristin via owner): the morning wellness class sign-up at /wellness, listed in the portal's Wellness view.
const post = (body: unknown) => new Request("https://notalonesummit.org/api/wellness", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const valid = { name: "Test Guest", email: "guest@example.com", phone: "+1 702 555 0100", sessions: ["wellness-nov3-pilates-1", "wellness-nov3-pickleball", "wellness-nov4-fitness-2"], waiverAccepted: true, signature: "test guest", waiverVersion: siteVisitWaiver.version, website: "" };

describe("wellness form API", () => {
  it("stores one wellness sign-up per class with contact details and the signed waiver", async () => {
    const store = memorySubmissionStore();
    expect((await handleWellnessPost(post(valid), store)).status).toBe(201);
    const rows = await store.list("workshop");
    expect(rows.map(row => `${row.sessionDay} ${row.sessionTitle}`).sort()).toEqual(["Tuesday, November 3 Pickleball Clinic", "Tuesday, November 3 Reformer Pilates with Olympian Yvette Baker", "Wednesday, November 4 Fitness with Kelly Richardson"]);
    for (const row of rows) expect(row).toMatchObject({ category: "wellness", email: "guest@example.com", phone: "+1 702 555 0100", waiverAccepted: true, signature: "test guest" });
    expect(toCsv(rows, wellnessCsvColumns)).toContain("guest@example.com");
  });

  it("refuses overlapping classes, unknown classes, no class, and a missing or mismatched signature", async () => {
    const store = memorySubmissionStore();
    for (const body of [
      { ...valid, sessions: ["wellness-nov3-breathwork", "wellness-nov3-pilates-1"] },
      { ...valid, sessions: ["wellness-nov4-chiro-1", "wellness-nov4-pilates-1"] },
      { ...valid, sessions: ["wellness-nov4-movement-breathwork"] }, // Oct 20: not offered on Wednesday any more (Airtable)
      { ...valid, sessions: ["wellness-nov3-yoga"] },
      { ...valid, sessions: [] },
      { ...valid, waiverAccepted: false },
      { ...valid, signature: "Someone Else" }
    ]) expect((await handleWellnessPost(post(body), store)).status).toBe(400);
    expect(await store.list("workshop")).toHaveLength(0);
  });

  it("lets the same class on different mornings and drop-in pickleball sit beside anything", () => {
    expect(wellnessClash(["wellness-nov3-pilates-1", "wellness-nov4-pilates-1"])).toBeNull();
    expect(wellnessClash(["wellness-nov3-pickleball", "wellness-nov3-pilates-1", "wellness-nov3-pilates-2"])).toBeNull();
    expect(wellnessClash(["wellness-nov3-breathwork", "wellness-nov3-pilates-2"])).not.toBeNull(); // 8:00-8:45 overlaps 8:30
  });
});

describe("wellness page (public/wellness)", () => {
  const dir = join(__dirname, "..", "public", "wellness");
  const html = readFileSync(join(dir, "index.html"), "utf8");
  it("lists every current activity by time, the current waiver, no rooms, and posts to our endpoint", () => {
    for (const session of wellnessSessions) expect(html).toContain(`value="${session.id}"`);
    expect(html).toContain(siteVisitWaiver.text);
    expect(html).toContain(`name="waiverVersion" value="${siteVisitWaiver.version}"`);
    for (const room of ["Montrachet", "LaFleur", "Margaux"]) expect(html).not.toContain(room);
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).toContain('class="time-picker"');
    expect(html).toContain("Move Together, Breathe Together with Karena Dawn");
    expect(html).toContain("Reformer Pilates with Aleina Lasker");
    expect(html).not.toContain("Pet Partners");
    const script = readFileSync(join(dir, "form.js"), "utf8");
    expect(script).toContain("fetch('/api/wellness'");
    expect(script).toContain("setSlot");
  });
});

describe("staff portal Wellness view", () => {
  it("has its own tab and lists sign-ups per class, separate from the Summit workshops", async () => {
    const store = memorySubmissionStore();
    await handleWellnessPost(post(valid), store);
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[]} workshops={await store.list("workshop")} lineup={[]} generatedAt="2026-10-12T00:00:00Z" />);
    expect(html).toContain('data-view-tab="wellness"');
    expect(html).toContain("/api/staff/export?kind=wellness");
    expect(html).toContain("Reformer Pilates with Olympian Yvette Baker");
    expect(html).toContain("No workshop sign-ups yet.");
    expect(viewForHash("#wellness")).toBe("wellness");
  });
});

describe("wellness link on the schedule", () => {
  it("sits on the Nov 2, Nov 3 and Nov 4 wellness entries", async () => {
    const { isWellnessSignupEntry } = await import("./wellness-signups-2026");
    expect(isWellnessSignupEntry("Wellness Activity")).toBe(true);
    expect(isWellnessSignupEntry("Wellness Activities & Check-In")).toBe(true); // Oct 21: the Monday wellness afternoon is on the form too
    expect(isWellnessSignupEntry("Wellness Room Open")).toBe(true);
    expect(isWellnessSignupEntry("Wellness Rooms Open (Approved Hours)")).toBe(true);
    expect(isWellnessSignupEntry("Wellness Room: Drop-In")).toBe(true);
    expect(isWellnessSignupEntry("Tennis (ICF Site Visit)")).toBe(false);
    expect(readFileSync(join(__dirname, "..", "components", "schedule-browser.tsx"), "utf8")).toContain("Sign up for wellness classes");
  });
});
