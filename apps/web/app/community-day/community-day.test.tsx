import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { metadata } from "./page";
import { CommunityDayView } from "./community-day-view";
import { partnerSiteByKey } from "../../lib/awards-partner-sites";
import { awards2026Editorial, awards2026Evening } from "../../lib/awards-editorial";
import { communityDay2026 } from "../../lib/community-day-2026";
import { postEventLabel } from "../../lib/event-phase";

const render = async (partner?: string) => renderToStaticMarkup(await CommunityDayView({ partner: partnerSiteByKey(partner) }));
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&rsquo;|’/g, "'").replace(/\s+/g, " ");
const section = (html: string, id: string) => html.slice(html.indexOf(`aria-labelledby="${id}"`), html.indexOf("</section>", html.indexOf(`aria-labelledby="${id}"`)));
const beforeEvent = () => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-28T18:00:00Z")); };

describe("Nevada Mental Health Day page", () => {
  afterEach(() => vi.useRealTimers());

  it("has one focusable main landmark, its own title and a description built from the day's facts", async () => {
    const html = await render();
    expect(metadata.title).toBe("Nevada Mental Health Day – Community Day");
    expect(metadata.description).toBe("Nevada Mental Health Day: Monday, November 2, 2026, 12:00–6:30 PM at Wynn Las Vegas. A free day at the Not Alone Summit dedicated to the Las Vegas organizations making an impact in mental health: wellness rooms and check-in from noon, then panels and conversations that honor the people behind the work.");
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toMatch(/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it("opens on the title, the Cohen credit, the ICF | NAMI lockup and the two buttons only, over ICF's community photo (owner, Oct 7)", async () => {
    beforeEvent();
    const html = await render();
    const heroHtml = section(html, "community-day-title");
    // The photo plus the "Presented by" ICF and NAMI logos (Aphrah, Oct 3).
    expect(heroHtml.match(/<img\b/g)).toHaveLength(3);
    expect(heroHtml).toContain('alt="Inspiring Children Foundation"');
    expect(heroHtml).toContain('alt="NAMI, National Alliance on Mental Illness"');
    expect(heroHtml).not.toContain("Community Day partners");
    expect(heroHtml.replace(/&#x27;/g, "'")).toContain(`alt="${communityDay2026.heroPhotoAlt}"`);
    expect(heroHtml).toContain("encore-theater-community-day");
    const hero = text(heroHtml);
    // Owner (Oct 7): the header was too crowded; the date, venue, times and the Awards Show pointer moved to the Schedule.
    // Owner (Oct 8): the date and place at the top of the header (as on the Summit and Awards), "Full Schedule" replaces "Info".
    // Owner (Oct 11): the date and place moved to the header's bottom-right corner, after the buttons (as on the Summit).
    expect(hero).toContain("Nevada Mental Health Day Powered by Steven & Alexandra Cohen Foundation Presented by × Monday, November 2, 2026 Wynn Las Vegas Request free tickets Full Schedule");
    expect(hero).not.toMatch(/PM|Encore|LaFleur|Margaux|Stay for|Awards Show|Community Day/);
    expect(heroHtml).not.toMatch(/<dl\b/);
  });

  it("has a Full Schedule button that scrolls down to the schedule on the same page (owner, Oct 8)", async () => {
    beforeEvent();
    const html = await render();
    expect(html).toMatch(/<a class="[^"]*" href="#schedule">Full Schedule<\/a>/);
    expect(html).toContain('<section class="_mission_');
    expect(html).toMatch(/<section [^>]*id="what-is-community-day"[^>]*aria-labelledby="mission-title"/);
  });

  it("orders the header title, then the Cohen credit, then the Presented-by lockup directly under it (owner, Oct 7)", async () => {
    beforeEvent();
    const html = await render();
    const hero = section(html, "community-day-title");
    expect(hero).toContain("Nevada Mental<br/>Health Day");
    expect(hero).not.toContain(">Community Day<");
    expect(hero).toContain("Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong>");
    const title = html.indexOf("Nevada Mental<br/>Health Day");
    const powered = html.indexOf("Powered by<strong>");
    const presented = html.indexOf("Presented by");
    expect(title).toBeLessThan(powered);
    expect(powered).toBeLessThan(presented);
    expect(presented).toBeLessThan(html.indexOf('id="community-day-actions"'));
    // Nothing sits between the Cohen credit and the lockup.
    // Nothing sits between the Cohen credit and the lockup (Oct 11: the lockup row wraps the logos and the date corner).
    expect(html.slice(powered, presented)).toMatch(/^Powered by<strong>Steven &amp; Alexandra Cohen Foundation<\/strong><\/p><div class="[^"]*lockupRow[^"]*"><div class="[^"]*"><span class="[^"]*">$/);
  });

  it("opens the explanation without repeating the Nevada Mental Health Day line", async () => {
    beforeEvent();
    const html = await render();
    expect(text(section(html, "mission-title")).trim()).toBe(`aria-labelledby="mission-title"> What is Community Day? ${communityDay2026.about}`);
    expect(communityDay2026.about).toMatch(/^Nevada Mental Health Day is /);
    expect(text(html)).not.toContain("Our mission");
  });

  it("puts the explanation, partners, then the schedule under the hero", async () => {
    beforeEvent();
    const html = await render();
    const order = ["community-day-title", "mission-title", "community-day-partners-title", "schedule-title", "tickets-title"].map(id => html.indexOf(`aria-labelledby="${id}"`));
    expect(order.every(index => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("lists the Schedule in the Awards page's evening format: the date under the heading, one row per part of the day with its room (owner, Oct 7)", async () => {
    beforeEvent();
    const html = await render();
    const scheduleHtml = section(html, "schedule-title");
    const schedule = text(scheduleHtml);
    // Owner (Oct 8): the most basic version — the general events and their locations only.
    expect(schedule).toContain("Schedule Monday, November 2, 2026 12:00–3:00 PM Wellness & Check-In LaFleur 3:00–6:30 PM Summit Sessions Margaux Ballroom 6:30 PM Awards Show Doors Open Encore Theater 7:30–10:00 PM Not Alone Awards Show Encore Theater");
    expect(schedule).not.toMatch(/Attire|Opening Ceremony|Panel|Break|Red Carpet|Pre-Show|Founders|Pet Partners|Pickleball|Speaker Reception/);
    expect(scheduleHtml).toContain('<h2 id="schedule-title">Schedule</h2>');
    expect(scheduleHtml).toContain('<time dateTime="2026-11-02T12:00:00-08:00">Monday, November 2, 2026</time>');
    expect(html).toMatch(/<section [^>]*id="schedule"[^>]*aria-labelledby="schedule-title"/);
    // The Awards Show's name is the link to this copy's Awards page, in a new tab.
    expect(scheduleHtml).toContain('<h3><a href="/awards/2026" target="_blank" rel="noopener">Not Alone Awards Show</a></h3>');
    expect(section(await render("lakelasvegas-vip"), "schedule-title")).toContain('<h3><a href="/lakelasvegas/vip" target="_blank" rel="noopener">Not Alone Awards Show</a></h3>');
    // Owner (Oct 7): rooms are public on this page only (they stay private everywhere else on the site).
    expect(schedule).toContain("LaFleur");
    expect(schedule).toContain("Margaux Ballroom");
    // No separate Date or Location row, no Pre-Show, no 8:00 PM, no ticket-form pointer.
    expect(schedule).not.toMatch(/Date |Location|Pre-Show|8:00|choose it|The Details/);
    expect(schedule).toContain("3:00–6:30 PM Summit Sessions"); // the sessions start at 3:00, not 3:30 (owner, Oct 7)
    expect(schedule).not.toMatch(/free|ticket/i);
  });

  it("shows the complete day without unrelated Awards program content", async () => {
    beforeEvent();
    const html = await render();
    const page = text(html);
    // "Summit" appears only in the Summit Sessions row and the "day at the Not Alone Summit" statement (Oct 7); no Summit menu or content.
    expect(page.replace(/Summit Sessions|Not Alone Summit/g, "")).not.toContain("Summit");
    expect(page).not.toContain("Who it's for");
    expect(page).not.toMatch(/different|not the Awards/i);
    // Owner (Oct 7): the show is 7:30–10:00 PM with doors at 6:30; there is no Pre-Show anywhere any more.
    expect(page).toContain("6:30 PM Awards Show Doors Open");
    expect(page).toContain("7:30–10:00 PM Not Alone Awards Show");
    expect(page).not.toMatch(/Pre-Show|8:00/);
    // Owner (Oct 4): the talent lineup is on this page too; the rest of the Awards program is not.
    // Owner (Oct 6): no Awards Show information block on this page (removed the same day it was added).
    for (const other of ["Highlights", "iHeart", "No Solicitation"]) expect(page).not.toContain(other);
    expect(html).not.toContain('id="awards-show"');
    for (const name of ["The 2026 Lineup", "Jewel", "Steve Wozniak", "Loni Love"]) expect(page).toContain(name);
    expect(html.indexOf("The 2026 Lineup")).toBeGreaterThan(html.indexOf('id="community-day-actions"'));
    expect(html.indexOf("The 2026 Lineup")).toBeLessThan(html.indexOf('id="what-is-community-day"'));
    expect(html).toContain('id="schedule"');
    // Owner (Oct 4): no Founding Partners block under the lineup (the partners section already shows them).
    expect(page).not.toContain("Founding Partners");
    expect(html).not.toMatch(/<(video|iframe)\b/);
  });

  it("credits the partners the owner's way: Cohen powered by, ICF x NAMI presented by in one box, Wynn host venue; never a community partner (owner, Oct 5)", async () => {
    beforeEvent();
    const html = await render();
    const partners = text(section(html, "community-day-partners-title"));
    expect(partners).toContain("Our Partners Powered by Presented by × Host venue");
    expect(html.toLowerCase()).not.toContain("community partner");
    for (const name of ["Inspiring Children Foundation", "Steven & Alexandra Cohen Foundation", "NAMI, National Alliance on Mental Illness", "Wynn Las Vegas"]) expect(html.replace(/&amp;/g, "&")).toContain(`alt="${name}"`);
    // The hero lockup (under the Cohen credit) is the shared "Presented by" component; the partners block repeats it lower down.
    expect(html.indexOf("Presented by")).toBeGreaterThan(html.indexOf('id="community-day-title"'));
    expect(html.indexOf("Presented by")).toBeLessThan(html.indexOf('id="community-day-actions"'));
    expect(html.indexOf("Presented by", html.indexOf('id="community-day-partners"'))).toBeGreaterThan(0);
  });

  it("keeps its Awards Show times in step with the Awards page's evening block", () => {
    const awards = Object.fromEntries(awards2026Evening.map(item => [item.label, item.time]));
    // Owner (Oct 7): no Pre-Show anywhere any more; the Awards page lists Doors Open 6:30 PM and the show 7:30 PM-10:00 PM.
    expect(awards["Pre-Show"]).toBeUndefined();
    const showStart = awards["Awards Show"]!.split(/\s*[-–]\s*/)[0];
    const show = communityDay2026.details.find(item => item.link === "awards")!;
    expect(show.label).toBe("Not Alone Awards Show");
    expect(show.value).toBe(`Doors open ${awards["Doors Open"]} · Show ${showStart}`);
    expect(show.note).toBe("Encore Theater");
    // Aphrah / owner (Oct 7): the day itself runs 12:00–6:30 PM (Wellness & Check-In 12–3, Summit Sessions 3–6:30) at the Wynn.
    expect(communityDay2026.time).toBe("12:00–6:30 PM");
    expect(communityDay2026.venue).toBe("Wynn Las Vegas");
    expect(communityDay2026.date).toBe(awards2026Editorial.date);
    expect(communityDay2026.dateTime).toBe("2026-11-02T12:00:00-08:00");
    expect(communityDay2026.details.map(item => [item.label, item.value])).toEqual([
      ["Wellness & Check-In", "12–3 PM"],
      ["Summit Sessions", "3–6:30 PM"],
      ["Not Alone Awards Show", "Doors open 6:30 PM · Show 7:30 PM"]
    ]);
    for (const item of communityDay2026.details) expect(`${item.label} ${item.value} ${item.note}`).not.toMatch(/Pre-Show|8:00|3:30/);
  });

  it("sends ticket requests to the live RSVP form and repeats its waiting-list notice word for word", async () => {
    beforeEvent();
    const html = await render();
    // Owner (Oct 7): this page's own form, not the Awards Show form.
    expect(communityDay2026.rsvpUrl).toBe("https://notaloneawards.org/rsvp/nevada-mental-health-day");
    expect(html.match(new RegExp(`href="${communityDay2026.rsvpUrl}"`, "g"))).toHaveLength(2);
    expect(html).not.toContain(`href="${awards2026Editorial.rsvpUrl}"`);
    const page = text(html);
    expect(page).toContain("Submitting this RSVP does not guarantee admission and is not a ticket. Your request will be added to our ticket waiting list. We will email you if your ticket is approved.");
    expect(page).toContain("up to ten per request");
    expect(page).toContain("Enter your organization in the Organization field.");
    expect(page).toContain("Turn on one of the three: both Nevada Mental Health Day and the Awards Show, only Nevada Mental Health Day, or only the Awards Show (and not Nevada Mental Health Day).");
    // The ticket steps name no times (the Schedule is the one place for them).
    expect(text(section(html, "tickets-title"))).not.toMatch(/\d(:\d\d)? ?PM/);
    // No personal contact details on the page; questions go to ICF's contact page.
    expect(html).not.toMatch(/tel:|mailto:/);
    expect(html).toContain('href="/contact"');
  });

  it("drops the ticket request once the event is over and announces 2027 in the header", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T08:00:00Z"));
    const html = await render();
    expect(html).not.toContain(communityDay2026.rsvpUrl);
    expect(html).not.toContain('id="tickets"');
    expect(text(section(html, "community-day-title"))).toContain(`Presented by × ${postEventLabel} Full Schedule`); // the corner, Oct 11
    expect(text(html)).toContain("What is Community Day?");
  });

  it("keeps ticket links inside a private partner copy of the page (owner, Oct 4)", async () => {
    beforeEvent();
    const html = await render("nami-vip");
    expect(html).toContain('href="https://notaloneawards.org/rsvp/nami-vip-zton04cqu1"');
    expect(html).not.toContain(`href="${communityDay2026.rsvpUrl}"`);
    expect(html).toContain('href="/nami/vip" target="_blank" rel="noopener">Not Alone Awards Show</a>');
    expect(await render("unknown")).toContain(`href="${communityDay2026.rsvpUrl}"`);
  });
});
