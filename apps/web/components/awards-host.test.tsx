import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { withAirtable } from "../lib/airtable-overlay";

// Sept 22 meeting: the lineup (ranks, tiers) comes from Airtable, so the current page is rendered with the overlay.
const live = await withAirtable(event2026Snapshot);
import { publishedAwardsProgram } from "@not-alone/domain";
import type { EventSnapshot } from "@not-alone/validation";
import { OriginalAwardsPage } from "./original-event-page";
import styles from "./original-event-page.module.css";

const render = (snapshot: EventSnapshot | null = event2026Snapshot) => renderToStaticMarkup(
  <OriginalAwardsPage year={2026} snapshot={snapshot} program={snapshot ? publishedAwardsProgram(snapshot) : null} />
);
const hostSection = (html: string) => html.match(/<section[^>]*id="awards-host"[^>]*>([\s\S]*?)<\/section>/)?.[1];

describe("Awards host feature", () => {
  it("presents one portrait, nameplate and current profile link in a dedicated host section", () => {
    const html = render(live);
    const host = hostSection(html)!;
    const profile = event2026Snapshot.speakers.find(person => person.name === "Loni Love")!;
    expect(host).toContain('<h2 id="awards-host-title">Your 2026 Host</h2>');
    expect(host).toContain(`class="${styles.hostProfile}"`);
    expect(host).toContain(`href="/directory/${profile.id}?from=awards"`);
    expect(host).toContain('aria-label="Meet Loni Love, your 2026 host"');
    expect(host.match(/<img[^>]*alt="Loni Love"/g)).toHaveLength(1);
    expect(host).toContain("<h3>Loni Love</h3>");
    expect(host).toContain("Comedian &amp; TV Host");
    // Host feature plus her Entertainers & Athletes card (owner, Sept 21: every category).
    expect(html.match(/<h3>Loni Love<\/h3>/g)).toHaveLength(2);
  });

  it("keeps the opening schedule, venue and single RSVP out of the host feature", () => {
    const html = render();
    const hero = html.match(/<section[^>]*id="awards-program"[^>]*>([\s\S]*?)<\/section>/)?.[1]!;
    expect(hero).toContain('id="awards-title"');
    expect(hero).toContain(">RSVP</a>");
    expect(html.match(/href="https:\/\/notaloneawards\.org\/rsvp"/g)).toHaveLength(1);
    for (const text of ["Encore Theater at Wynn Las Vegas", "Monday, November 2</time>"]) {
      expect(hero).toContain(text);
      expect(html.slice(html.indexOf("</section>", html.indexOf('id="awards-program"')))).not.toContain(text);
    }
    // Owner (Sept 21): only doors in the hero; the rest of the evening in its own section below.
    expect(hero).toContain("<dt>Doors Open</dt><dd>5:30 PM</dd>");
    const evening = html.match(/<section[^>]*id="evening"[^>]*>([\s\S]*?)<\/section>/)?.[1]!;
    for (const text of ["Community Day", "7:30 PM-10:00 PM"]) {
      expect(evening).toContain(text);
      expect(hero).not.toContain(text);
    }
    expect(hostSection(html)).not.toMatch(/RSVP|Pacific|Monday|PM/);
    expect(html).not.toMatch(/More details coming soon|id="program-title"/);
  });

  it.each(["withdrawn", "unpublished", "other event", "directory disabled", "canceled"])("hides the feature when %s", state => {
    const snapshot = structuredClone(event2026Snapshot);
    const host = snapshot.speakers.find(person => person.name === "Loni Love")!;
    if (state === "withdrawn") snapshot.speakers = snapshot.speakers.filter(person => person !== host);
    if (state === "unpublished") host.published = false;
    if (state === "other event") host.eventId = "83000000-0000-4000-8000-000000000099";
    if (state === "directory disabled") snapshot.event.directoryEnabled = false;
    if (state === "canceled") snapshot.scheduleItems.find(item => item.title === "Awards Show")!.status = "canceled";
    const html = render(snapshot);
    expect(hostSection(html)).toBeUndefined();
    expect(html).not.toContain("Your 2026 Host");
    // A canceled show hides the host feature; she stays listed as a confirmed guest.
    if (state !== "canceled") expect(html).not.toContain("Loni Love");
  });

  it("does not restore a static host feature when the snapshot is unavailable", () => {
    expect(hostSection(render(null))).toBeUndefined();
    expect(render(null)).not.toContain("Loni Love");
  });

  it("uses the public ICF portrait for the Awards presentation", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers.find(person => person.name === "Loni Love")!.headshotUrl = "https://example.test/approved-host.jpg";
    expect(hostSection(render(snapshot))).not.toContain('src="https://example.test/approved-host.jpg"');
    // Owner (Sept 21): the reviewed portrait (ICF's own card photo, re-cropped) is used everywhere.
    expect(decodeURIComponent(hostSection(render(snapshot))!)).toContain("/2026-headshots/portraits/loni-love-2.jpg");
  });
});
