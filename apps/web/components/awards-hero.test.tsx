import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, YearNavigation } from "./original-event-page";
import { awardsHeroTimes, awardsPromotionalProgram } from "../lib/awards-program";
import styles from "./original-event-page.module.css";

const program = publishedAwardsProgram(event2026Snapshot)!;
const times = (snapshot = event2026Snapshot) => awardsHeroTimes(awardsPromotionalProgram(program.body, snapshot), snapshot);
const page = (snapshot = event2026Snapshot, published = true) => renderToStaticMarkup(
  <OriginalAwardsPage year={2026} snapshot={snapshot} program={{ ...program, published }} />
);
const hero = (snapshot = event2026Snapshot, published = true) => page(snapshot, published)
  .match(/<section[^>]*aria-labelledby="awards-title"[^>]*>([\s\S]*?)<\/section>/)![1]!;
// Owner (Sept 21): the hero shows only "Doors Open 6:00 PM"; the rest of the evening sits below it.
const schedule = (snapshot = event2026Snapshot, published = true) => page(snapshot, published)
  .match(/<section[^>]*id="evening"[^>]*>[\s\S]*?<dl>([\s\S]*?)<\/dl>/)?.[1] ?? "";

describe("Awards opening presentation", () => {
  it.each([2025, 2026] as const)("leaves navigation to the shared header on Awards %s", year => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={year} snapshot={event2026Snapshot} program={program} />);
    expect(html).not.toContain('aria-label="Awards year"');
    expect(html).not.toContain('aria-label="Awards navigation"');
  });

  it("leaves Summit navigation and its archive distinction unchanged", () => {
    const html = renderToStaticMarkup(<YearNavigation year={2026} />);
    expect(html.indexOf('href="/"')).toBeLessThan(html.indexOf('href="/2025"'));
    expect(html).toContain("2025 archive");
  });

  it("shows only doors in the hero and the rest of the evening below, without the red carpet", () => {
    expect(times()).toEqual([
      { label: "Red Carpet", time: "6:15 PM-7:30 PM" },
      { label: "Doors Open", time: "5:30 PM" },
      { label: "Nevada Day", time: "5:45-7:15 PM" },
      { label: "Pre-Show", time: "7:30-8:00 PM" },
      { label: "Awards Show", time: "8:00 PM-10:00 PM" }
    ]);
    const html = hero();
    // Owner (Sept 21, late): no "2026" label in the hero; the date omits the year.
    expect(html).not.toContain(">2026</span>");
    expect(html).toContain("Monday, November 2</time>");
    expect(html).not.toContain("Monday, November 2, 2026");
    expect(html).toContain('<dl class="' + styles.heroScheduleTimes + '" aria-label="Doors open"><div><dt>Doors Open</dt><dd>5:30 PM</dd></div></dl>');
    expect(html).not.toMatch(/Nevada Day|Pre-Show|8:00 PM-10:00 PM/);
    // Owner (Sept 21, late): "The Evening" shows exactly two lines.
    const evening = schedule();
    expect(evening).toContain("<dt>Doors Open</dt><dd>5:30 PM</dd>");
    expect(evening).toContain("<dt>Community Day</dt><dd>5:45 PM-7:15 PM</dd>");
    expect(evening).toContain("<dt>Awards Show</dt><dd>7:30 PM-10:00 PM</dd>");
    expect(evening).not.toContain("Pre-Show");
    expect(evening.match(/<dt>/g)).toHaveLength(3);
    expect(page()).not.toContain("Red Carpet");
    expect(page()).toContain('<h2 id="evening-title">The Evening</h2>');
    expect(page().indexOf('id="awards-program"')).toBeLessThan(page().indexOf('id="evening"'));
    expect(html.indexOf("</time>")).toBeLessThan(html.indexOf("<dl"));
    expect(html.indexOf("</dl>")).toBeLessThan(html.indexOf(">RSVP</a>"));
    expect(page().match(/Monday, November 2</g)).toHaveLength(1);
  });

  it("emphasizes streaming with a compact button under the ICF Awards logo and its foundation credit", () => {
    const html = decodeURIComponent(hero());
    expect(html).not.toContain("/images/iheartradio-primary.png");
    expect(html).not.toContain("/images/cohen-foundation.webp");
    // Sept 21 meeting: the foundation credit sits directly under the ICF Awards logo, larger than before.
    expect(html).toContain("/images/na-awards-logo-white.png");
    expect(html).toMatch(/na-awards-logo-white[^]*<\/h1><p class="[^"]*">Powered by<strong>Steven &amp; Alexandra Cohen Foundation<\/strong><\/p>/);
    // The logo and the Wynn photo (reduced motion only); no still of the film: the hero opens on a
    // plain color and the film cross-fades in once it is really playing.
    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).not.toContain("hero-awards-start.jpg");
    expect(html).toContain("background:#1c1a2e");
    expect(html).toContain('href="https://www.youtube.com/@iHeartRadio/streams" target="_blank" rel="noreferrer"');
    expect(html).toContain(`class="${styles.streamButton}"`);
    expect(html).toContain(`class="${styles.streamLabel}">Stream live on</span>`);
    expect(html).toContain(`class="${styles.streamName}">iHeartRadio</span>`);
    expect(html).toContain('aria-label="Stream live on iHeartRadio&#x27;s YouTube channel (opens in a new tab)"');
    expect(html).not.toMatch(/live now|watch live|live stream/i);
  });

  it("keeps canceled, unpublished and unavailable times out of the hero's timing line", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.scheduleItems.find(item => item.title === "Awards Show")!.status = "canceled";
    expect(times(snapshot)).toEqual([]);
    expect(hero(snapshot)).toContain("Awards Show canceled");
    expect(hero(snapshot)).not.toMatch(/<dl|>RSVP<\/a>|Monday, November 2/);
    expect(schedule(snapshot)).toBe("");
    expect(page(snapshot)).not.toContain('id="evening"');
    expect(awardsHeroTimes(null, null)).toEqual([]);
    const withoutProgram = schedule(event2026Snapshot, false);
    expect(withoutProgram).toContain("7:30 PM-10:00 PM");
    expect(withoutProgram).not.toMatch(/<dt>(Pre-Show|Red Carpet)<\/dt>/); // Owner (Sept 22): The Evening opens with Doors Open 5:30
    expect(hero(event2026Snapshot, false)).toContain("<dt>Doors Open</dt><dd>5:30 PM</dd>");
  });

  it("omits an empty timetable when the published snapshot is unavailable", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} program={program} />);
    expect(html).not.toContain('aria-label="Awards evening schedule"');
    expect(html).toContain("Date to be confirmed");
  });

  it("follows subsequent publication changes instead of freezing a second schedule", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const show = snapshot.scheduleItems.find(item => item.title === "Awards Show")!;
    show.startUtc = "2026-11-04T05:00:00Z";
    show.endUtc = "2026-11-04T07:00:00Z";
    expect(times(snapshot)).toContainEqual({ label: "Awards Show", time: "9:00 PM-11:00 PM" });
    expect(times(snapshot).some(item => item.label === "Pre-Show" || item.label === "Doors Open")).toBe(false);
    expect(times(snapshot).find(item => item.label === "Red Carpet")?.time).toContain("Monday, November 2, 2026");
    expect(hero(snapshot)).toContain("Tuesday, November 3</time>");
  });

  it("does not restore a withdrawn red carpet or override a later complete pre-show", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const show = snapshot.scheduleItems.find(item => item.title === "Awards Show")!;
    snapshot.scheduleItems = snapshot.scheduleItems.filter(item => item.title !== "Red Carpet");
    snapshot.scheduleItems.push({ ...show, id: "pre-show", title: "Pre-Show", startUtc: "2026-11-03T03:15:00Z", endUtc: "2026-11-03T03:45:00Z" });
    expect(times(snapshot).some(item => item.label === "Red Carpet")).toBe(false);
    expect(times(snapshot)).toContainEqual({ label: "Pre-Show", time: "7:15 PM-7:45 PM" });
  });
});
