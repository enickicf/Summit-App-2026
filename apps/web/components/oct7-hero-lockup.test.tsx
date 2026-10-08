import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "./original-event-page";
import { PresentedBy } from "./presented-by";
import { awards2026Editorial, awards2026Evening } from "../lib/awards-editorial";
import { awardsDoorsOpen2026, awardsShowStart2026 } from "../lib/event-partners-2026";
import { rsvpConfirmationEmail } from "../lib/staff/rsvp-email";
import styles from "./presented-by.module.css";

// The Summit page mounts the live-updates client component, which reads the app router.
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Owner directions from the Oct 7, 2026 meeting (track A): the "Presented by" lockup joins its logos with a ×, sits
// directly under the Cohen "Powered by" credit in both heroes, the Awards mission opens with the presenters, and the
// public Awards evening is Doors Open 6:30 PM / Awards Show 7:30–10:00 PM with no Pre-Show anywhere.
const program = publishedAwardsProgram(event2026Snapshot)!;
const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} program={program} />);
const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />);
const hero = (html: string, title: string) => html.match(new RegExp(`<section[^>]*aria-labelledby="${title}"[^>]*>([\\s\\S]*?)<\\/section>`))![1]!;
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const times = `<span class="${styles.times}" aria-hidden="true">×</span>`;
// Powered by -> the lockup (label, ICF logo, ×, NAMI logo) -> the next paragraph (the date line).
// Ryan (Oct 8): on the Awards pages the lockup sits in the hero's right-hand aside, after the Cohen credit.
const awardsLockupAside = /Powered by<strong>[^]*?<\/p><\/div><div class="[^"]*heroAside[^"]*"><div class="[^"]*presentedBy[^"]*/;
const underPoweredBy = new RegExp(`<p class="[^"]*">Powered by<strong>Steven &amp; Alexandra<br/>Cohen Foundation</strong></p><div class="${escape(styles.presentedBy!)} ${escape(styles.heroSize!)} ">[^]*?>Presented by</span><span class="[^"]*"><img[^>]*alt="Inspiring Children Foundation"[^>]*>${escape(times)}<img[^>]*alt="NAMI, National Alliance on Mental Illness"[^>]*></span></div>`); // Ryan (Oct 8): the Summit date line now sits in the hero's bottom-right aside, after the lockup

describe("Oct 7 meeting: Presented-by lockup, hero order, mission and Awards times", () => {
  it("joins the Presented-by logos with a × instead of a divider line, in every size and tone", () => {
    for (const props of [{}, { size: "hero" }, { tone: "light" }, { size: "hero", tone: "light" }] as const) {
      const html = renderToStaticMarkup(<PresentedBy {...props} />);
      expect(html).toContain(times);
      expect(html).not.toContain("divider");
      expect(html.indexOf('alt="Inspiring Children Foundation"')).toBeLessThan(html.indexOf(times));
      expect(html.indexOf(times)).toBeLessThan(html.indexOf('alt="NAMI, National Alliance on Mental Illness"'));
      expect(html.match(/<img /g)).toHaveLength(2);
    }
    expect(renderToStaticMarkup(<PresentedBy tone="light" />)).toContain(styles.onLight);
  });

  it("stacks event logo, Powered by, then Presented by in both 2026 heroes, with the date line after the lockup", () => {
    const awardsHero = hero(awards, "awards-title");
    const summitHero = hero(summit, "summit-title");
    expect(summitHero).toMatch(underPoweredBy);
    // Ryan (Oct 8): on the Awards page the lockup sits in the hero's right-hand aside, still after the Cohen credit.
    expect(awardsHero).toMatch(awardsLockupAside);
    for (const html of [awardsHero, summitHero]) {
      expect(html.match(/Presented by/g)).toHaveLength(1);
      expect(html.indexOf("<h1 ")).toBeLessThan(html.indexOf("Powered by<strong>"));
      expect(html.indexOf("Powered by<strong>")).toBeLessThan(html.indexOf("Presented by"));
      expect(html).not.toMatch(/Presented by[^]*<h1 /);
    }
    // Awards: lockup, then the date/venue line, then doors and the show time.
    // Ryan (Oct 8): the date/venue line, then doors and the show time, live in the details band under the hero.
    const details = awards.slice(awards.indexOf('id="broadcast"'), awards.indexOf('id="awards-honor"'));
    expect(details.indexOf("Monday, November 2</time>")).toBeGreaterThan(-1);
    expect(details.indexOf("</time>")).toBeLessThan(details.indexOf("<dl"));
    // Owner (Oct 8): date + venue eyebrow above the logo; the hero ends on the lockup; no schedule button up top and
    // the headline band holds the headline alone.
    expect(summitHero).toMatch(/<div class="[^"]*heroCopy[^"]*"><p class="[^"]*heroEyebrow[^"]*">November 2–4, 2026<span class="[^"]*"> · Wynn Las Vegas<\/span><\/p><h1 /); // Oct 8: dates up top
    expect(summitHero).toMatch(/alt="NAMI, National Alliance on Mental Illness"[^>]*><\/span><\/div><\/div>$/);
    const intro = summit.slice(summit.indexOf('id="about"'), summit.indexOf('id="directory"'));
    expect(intro).not.toMatch(/introDateLine|November 2/); // the band holds the headline alone
    expect(intro).not.toMatch(/href="#schedule"|introDetails/);
    expect(summit).not.toContain('id="summit-dates"');
    expect(summitHero).not.toContain("heroAside");
    // The 2025 archive heroes carry no lockup.
    expect(hero(renderToStaticMarkup(<OriginalSummitPage year={2025} snapshot={event2026Snapshot} />), "summit-title")).not.toContain("Presented by");
    expect(hero(renderToStaticMarkup(<OriginalAwardsPage year={2025} snapshot={event2026Snapshot} program={program} />), "awards-title")).not.toContain("Presented by");
    // The private partner copies render the same hero.
    expect(hero(renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} program={program} rsvpUrl="https://notaloneawards.org/rsvp/nami-9wvfjfkt40dd" />), "awards-title")).toMatch(awardsLockupAside);
  });

  it("opens the Awards mission with the presenters, in the owner's exact words", () => {
    expect(awards).toContain("<p>Inspiring Children Foundation × NAMI present the Not Alone Awards Show, powered by the <strong>Steven &amp; Alexandra Cohen Foundation</strong>.</p>");
    expect(awards).not.toMatch(/Presenting the Not Alone Awards Show|hosted by <strong>Wynn Resorts|broadcast live on <strong>iHeartRadio/);
    const mission = awards.slice(awards.indexOf('id="mission"'), awards.indexOf('id="evening"'));
    // The owner's sentence is the first paragraph; the second (ICF's own statement, awards[1].blocks[1]) stays.
    expect(mission.indexOf("<p>")).toBe(mission.indexOf("<p>Inspiring Children Foundation × NAMI present"));
    expect(mission.slice(0, mission.indexOf('id="awards-narrative"')).match(/<p>/g)).toHaveLength(2); // the narrative block (Oct 7 evening) follows
  });

  it("shows Doors Open 6:30 PM and Awards Show 7:30 PM up top, the 7:30-10:00 run in The Evening, and no Pre-Show anywhere", () => {
    expect(awardsDoorsOpen2026).toBe("6:30 PM");
    expect(awardsShowStart2026).toBe("7:30 PM");
    expect(awards2026Evening).toEqual([{ label: "Doors Open", time: "6:30 PM" }, { label: "Awards Show", time: "7:30 PM-10:00 PM" }]);
    expect(awards2026Editorial.eveningTimes.map(entry => entry.label)).toEqual(["Doors Open", "Awards Show"]);
    expect(awards2026Editorial.eveningTimes.find(entry => entry.label === "Awards Show")!.time).toBe("7:30-10:00 PM");
    expect(awards.slice(awards.indexOf('id="broadcast"'), awards.indexOf('id="awards-honor"'))).toContain("<div><dt>Doors Open</dt><dd>6:30 PM</dd></div><div><dt>Awards Show</dt><dd>7:30 PM</dd></div>");
    const evening = awards.match(/<section[^>]*id="evening"[^>]*>[\s\S]*?<dl>([\s\S]*?)<\/dl>/)![1]!;
    expect(evening).toBe("<div><dt>Doors Open</dt><dd>6:30 PM</dd></div><div><dt>Awards Show</dt><dd>7:30 PM-10:00 PM</dd></div>");
    expect(awards).not.toMatch(/Pre-Show|Pre Show|8:00 PM|8:00–10:00|8:00-10:00/);
  });

  it("drops the Pre-Show from every RSVP confirmation email and uses the 7:30 show time", () => {
    const guest = { name: "Sample Guest", email: "guest@example.com", guestCount: 2, communityDay: false, attendanceStatus: "attending" as const };
    const showOnly = rsvpConfirmationEmail(guest);
    const both = rsvpConfirmationEmail({ ...guest, communityDay: true });
    const dayOnly = rsvpConfirmationEmail({ ...guest, attending: "community-day" });
    expect(showOnly.text).toContain("Doors 6:30 PM · Awards Show 7:30–10:00 PM");
    expect(both.text).toContain("Wellness & Check-In 12–3 PM · Summit Sessions 3–6:30 PM · Doors 6:30 PM · Awards Show 7:30–10:00 PM");
    expect(dayOnly.text).toContain("Wellness & Check-In 12–3 PM · Summit Sessions 3–6:30 PM");
    expect(dayOnly.text).not.toContain("Awards Show 7:30");
    for (const email of [showOnly, both, dayOnly]) expect(`${email.text}\n${email.html}`).not.toMatch(/Pre-Show|8:00/);
  });
});
