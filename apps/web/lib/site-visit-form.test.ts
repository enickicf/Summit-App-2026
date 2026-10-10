import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { handleSiteVisitPost } from "../app/api/site-visit/route";
import { siteVisitWaiver } from "./morning-workshops";
import { memorySubmissionStore, siteVisitCsvColumns, toCsv } from "./staff/store";

// Oct 9: the Tennis & High Tea form at /tennis-high-tea (the ICF designer's page; owner: "use this one").
const post = (body: unknown) => new Request("https://notalonesummit.org/api/site-visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const valid = { id: "a5dc2c51-5db2-43f5-b0ad-b547d53011d0", name: "Test Guest", email: "guest@example.com", phone: "+1 702 555 0100", tennis: true, tea: true, transport: "wynn", waiverAccepted: true, signature: "test guest", waiverVersion: siteVisitWaiver.version, website: "" };

describe("Tennis & High Tea form API", () => {
  it("stores one site-visit sign-up per chosen activity, with contact details, transport and the signed waiver", async () => {
    const store = memorySubmissionStore();
    const response = await handleSiteVisitPost(post(valid), store);
    expect(response.status).toBe(201);
    const rows = await store.list("workshop");
    expect(rows.map(row => row.sessionTitle).sort()).toEqual(["High Tea (ICF Site Visit)", "Tennis (ICF Site Visit)"]);
    for (const row of rows) {
      expect(row).toMatchObject({ category: "siteVisit", name: "Test Guest", email: "guest@example.com", phone: "+1 702 555 0100", transport: "wynn", waiverAccepted: true, signature: "test guest", waiverVersion: siteVisitWaiver.version, sessionDay: "Thursday, November 5" });
    }
    const csv = toCsv(rows, siteVisitCsvColumns);
    expect(csv.split("\r\n")[0]).toContain("email,phone,transport");
    expect(csv).toContain("guest@example.com");
  });

  it("stores only the activity chosen", async () => {
    const store = memorySubmissionStore();
    expect((await handleSiteVisitPost(post({ ...valid, tennis: false, transport: "self" }), store)).status).toBe(201);
    const rows = await store.list("workshop");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ sessionTitle: "High Tea (ICF Site Visit)", transport: "self" });
  });

  it.each([
    ["no activity", { tennis: false, tea: false }, "tennis"],
    ["no transport", { transport: undefined }, "transport"],
    ["an unknown transport", { transport: "bus" }, "transport"],
    ["a bad email", { email: "nope" }, "email"],
    ["a short phone", { phone: "12345" }, "phone"],
    ["no waiver", { waiverAccepted: false }, "waiverAccepted"],
    ["a signature that is not the name", { signature: "Someone Else" }, "signature"]
  ])("refuses a request with %s and stores nothing", async (_label, change, field) => {
    const store = memorySubmissionStore();
    const response = await handleSiteVisitPost(post({ ...valid, ...change }), store);
    expect(response.status).toBe(400);
    expect((await response.json()).field).toBe(field);
    expect(await store.list("workshop")).toHaveLength(0);
  });

  it("pretends success for the honeypot and stores nothing", async () => {
    const store = memorySubmissionStore();
    expect((await handleSiteVisitPost(post({ ...valid, website: "spam" }), store)).status).toBe(201);
    expect(await store.list("workshop")).toHaveLength(0);
  });
});

describe("Tennis & High Tea page (public/tennis-high-tea)", () => {
  const dir = join(__dirname, "..", "public", "tennis-high-tea");
  const html = readFileSync(join(dir, "index.html"), "utf8");
  const js = readFileSync(join(dir, "form.js"), "utf8");

  it("shows the current waiver text and version, and posts to our own endpoint", () => {
    expect(html).toContain(siteVisitWaiver.text);
    expect(html).toContain(`name="waiverVersion" value="${siteVisitWaiver.version}"`);
    expect(js).toContain("fetch('/api/site-visit'");
  });

  it("is not indexed, links no organizer page and loads only its own files", () => {
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">');
    expect(html).not.toContain("/organizer");
    for (const ref of html.match(/(?:src|href)="\/[^"]+"/g) ?? []) expect(ref).toMatch(/="\/tennis-high-tea\//);
  });
});
