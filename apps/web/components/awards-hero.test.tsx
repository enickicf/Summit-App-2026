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
// Owner (Oct 7, Aphrah's times): the hero shows Doors Open 6:30 PM and the Awards Show start 8:00 PM; the rest of the evening sits below it.
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

  it("shows doors and the Awards Show start in the hero and the rest of the evening below, without the red carpet", () => {
    expect(times()).toEqual([
      { label: "Red Carpet", time: "6:15 PM-7:30 PM" },
      { label: "Doors Open", time: "6:30 PM" },
      { label: "Pre-Show", time: "7:30-8:00 PM" },
      { label: "Awards Show", time: "8:00 PM-10:00 PM" }
    ]);
    const html = hero();
    // Owner (Sept 21, late): no "2026" label in the hero; the date omits the year.
    expect(html).not.toContain(">2026</span>");
    expect(html).toContain("Monday, November 2</time>");
    expect(html).not.toContain("Monday, November 2, 2026");
    // Owner (Oct 7): the hero's timing line is Doors Open 6:30 and the Awards Show start 8:00; the full evening sits in "The Evening".
    expect(html).toContain('<dl class="' + styles.heroScheduleTimes + '" aria-label="Doors and Awards Show start"><div><dt>Doors Open</dt><dd>6:30 PM</dd></div><div><dt>Awards Show</dt><dd>8:00 PM</dd></div></dl>');
    expect(html).not.toMatch(/Nevada Day|Community Day|Pre-Show|8:00 PM-10:00 PM/);
    // Aphrah (Oct 7): "The Evening" shows exactly three lines; Community Day is no longer part of it.
    const evening = schedule();
    expect(evening).toContain("<dt>Doors Open</dt><dd>6:30 PM</dd>");
    expect(evening).toContain("<dt>Pre-Show</dt><dd>7:30 PM</dd>");
    expect(evening).toContain("<dt>Awards Show</dt><dd>8:00 PM-10:00 PM</dd>");
    expect(evening).not.toContain("Community Day");
    expect(evening.match(/<dt>/g)).toHaveLength(3);
    expect(page()).not.toContain("Red Carpet");
    expect(page()).toContain('<h2 id="evening-title">The Evening</h2>');
    expect(page().indexOf('id="awards-program"')).toBeLessThan(page().indexOf('id="evening"'));
    expect(html.indexOf("</time>")).toBeLessThan(html.indexOf("<dl"));
    expect(html.indexOf("</dl>")).toBeLessThan(html.indexOf(">RSVP</a>"));
    expect(page().match(/Monday, November 2</g)).toHaveLength(1);
  });

  it("opens with RSVP and Info, and gives the iHeartRadio broadcast its own band right before the lineup (owner, Oct 4)", () => {
    const html = decodeURIComponent(hero());
    expect(html).not.toContain("/images/cohen-foundation.webp");
    // Sept 21 meeting: the foundation credit sits directly under the ICF Awards logo, larger than before.
    expect(html).toContain("/images/na-awards-logo-white.png");
    expect(html).toMatch(/na-awards-logo-white[^]*<\/h1><p class="[^"]*">Powered by<strong>Steven &amp; Alexandra Cohen Foundation<\/strong><\/p>/);
    // The Wynn photo (reduced motion only), the "Presented by" ICF and NAMI logos (owner, Oct 5) and the
    // Awards logo; no still of the film: the hero opens on a plain color and the film cross-fades in once
    // it is really playing.
    expect(html.match(/<img /g)).toHaveLength(4);
    expect(html).toMatch(/Presented by[^]*alt="Inspiring Children Foundation"[^]*alt="NAMI, National Alliance on Mental Illness"[^]*<h1 id="awards-title"/);
    expect(html).not.toContain("hero-awards-start.jpg");
    expect(html).toContain("background:#1c1a2e");
    // The hero's second button is Info (scrolls to the mission + schedule); a smaller schedule link sits under it.
    expect(html).toMatch(/>RSVP<\/a><a class="[^"]*" href="#mission">Info<\/a><\/div><a class="[^"]*" href="#evening">View full schedule/);
    expect(html).not.toMatch(/iHeart|Stream live/);
    const whole = page();
    const band = whole.slice(whole.indexOf('id="broadcast"'), whole.indexOf('id="directory"'));
    expect(band).toContain('src="/images/iheartradio-logo-white.svg" alt="iHeartRadio"');
    expect(band).toContain('href="https://www.youtube.com/@iHeartRadio/streams" target="_blank" rel="noreferrer"');
    expect(band).toContain("Stream live on iHeartRadio</a>");
    expect(band).toContain('aria-label="Stream live on iHeartRadio&#x27;s YouTube channel (opens in a new tab)"');
    // Lineup right after the hero and the broadcast band; the mission and the schedule follow it, together.
    const order = ['id="awards-program"', 'id="broadcast"', 'id="directory"', 'id="mission"', 'id="evening"', 'id="awards-host"'].map(part => whole.indexOf(part));
    expect(order.every(index => index >= 0)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    expect(whole).not.toMatch(/live now|watch live|live stream/i);
  });

  it("points every RSVP button of a private partner copy at that group's form (owner, Oct 4)", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} program={program} snapshot={event2026Snapshot} rsvpUrl="https://notaloneawards.org/rsvp/nami-9wvfjfkt40dd" />);
    // Owner (Oct 5): the RSVP form opens in a new tab.
    expect(html).toContain('href="https://notaloneawards.org/rsvp/nami-9wvfjfkt40dd" target="_blank" rel="noopener" aria-label="RSVP for the Not Alone Awards (opens in a new tab)">RSVP</a>');
    expect(html).not.toContain('href="https://notaloneawards.org/rsvp"');
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
    expect(withoutProgram).toContain("8:00 PM-10:00 PM");
    expect(withoutProgram).not.toMatch(/<dt>(Community Day|Red Carpet)<\/dt>/); // Aphrah (Oct 7): The Evening opens with Doors Open 6:30
    expect(hero(event2026Snapshot, false)).toContain("<dt>Doors Open</dt><dd>6:30 PM</dd></div><div><dt>Awards Show</dt><dd>8:00 PM</dd>");
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
