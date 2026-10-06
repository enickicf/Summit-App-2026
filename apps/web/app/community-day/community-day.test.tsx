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

describe("Community Day page", () => {
  afterEach(() => vi.useRealTimers());

  it("has one focusable main landmark and its own title", async () => {
    const html = await render();
    expect(metadata.title).toBe("Nevada Mental Health Day – Community Day");
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toMatch(/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it("shows the date and time at a glance at the top, over ICF's community photo", async () => {
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
    expect(hero).toContain("Presented by Nevada Mental Health Day Powered by Steven & Alexandra Cohen Foundation Monday, November 2 Encore Theater at Wynn Las Vegas Nevada Mental Health Day 5:45–7:15 PM Not Alone Awards Show 7:30–10:00 PM Request free tickets Info");
    expect(hero).not.toMatch(/Doors open|A free panel/);
  });

  it("has an Info button that scrolls down to \"What is Community Day?\" on the same page", async () => {
    beforeEvent();
    const html = await render();
    expect(html).toMatch(/<a class="[^"]*" href="#what-is-community-day">Info<\/a>/);
    expect(html).toContain('<section class="_mission_');
    expect(html).toMatch(/<section [^>]*id="what-is-community-day"[^>]*aria-labelledby="mission-title"/);
  });

  it("titles the page Nevada Mental Health Day (no Community Day label, owner Oct 6) with the Cohen credit under it", async () => {
    beforeEvent();
    const html = await render();
    const hero = section(html, "community-day-title");
    expect(hero).toContain("Nevada Mental<br/>Health Day");
    expect(hero).not.toContain(">Community Day<");
    expect(hero).toContain("Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong>");
    expect(html.indexOf("Presented by")).toBeLessThan(html.indexOf("Nevada Mental<br/>Health Day"));
    expect(html.indexOf("Nevada Mental<br/>Health Day")).toBeLessThan(html.indexOf("Powered by<strong>"));
  });

  it("opens the explanation without repeating the Nevada Mental Health Day line", async () => {
    beforeEvent();
    const html = await render();
    expect(text(section(html, "mission-title")).trim()).toBe(`aria-labelledby="mission-title"> What is Community Day? ${communityDay2026.about}`);
    expect(communityDay2026.about).toMatch(/^The Not Alone Community Day is /);
    expect(text(html)).not.toContain("Our mission");
  });

  it("puts the explanation, partners, then details under the hero", async () => {
    beforeEvent();
    const html = await render();
    const order = ["community-day-title", "mission-title", "community-day-partners-title", "details-title", "tickets-title"].map(id => html.indexOf(`aria-labelledby="${id}"`));
    expect(order.every(index => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("lists the details in the Awards page's evening format, details only", async () => {
    beforeEvent();
    const details = text(section(await render(), "details-title"));
    expect(details).toContain("The Details Date Monday, Nov 2 Doors Open 5:30 PM Community Day 5:45–7:15 PM Awards Show 7:30 PM Location Encore Theater, Wynn Las Vegas");
    expect(details).not.toMatch(/free|ticket/i);
  });

  it("shows the complete evening without unrelated Awards program content", async () => {
    beforeEvent();
    const html = await render();
    const page = text(html);
    expect(page).not.toContain("Summit");
    expect(page).not.toContain("Who it's for");
    expect(page).not.toMatch(/different|not the Awards/i);
    expect(page).toContain("Awards Show 7:30 PM");
    // Owner (Oct 4): the talent lineup is on this page too; the rest of the Awards program is not.
    // Trent (Oct 6): the Awards Show information (when, where, host, broadcast) IS on this page, after the details.
    for (const other of ["Highlights", "Pre-Show", "pre-show", "No Solicitation"]) expect(page).not.toContain(other);
    expect(text(section(html, "awards-show-title"))).toContain("The Not Alone Awards Show");
    expect(page).toContain("Not Alone Awards Show 7:30–10:00 PM");
    expect(html.indexOf('id="awards-show"')).toBeGreaterThan(html.indexOf('id="schedule"'));
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
    // The hero lockup above the title is the shared "Presented by" component.
    expect(html.indexOf("Presented by")).toBeLessThan(html.indexOf('id="community-day-title"'));
  });

  it("keeps its times in step with the Awards page's evening block", async () => {
    const dash = (value: string) => value.replace(/ ?PM(?=-)/, "").replace("-", "–");
    const awards = Object.fromEntries(awards2026Evening.map(item => [item.label, dash(item.time)]));
    const details = Object.fromEntries(communityDay2026.details.map(item => [item.label, item.value]));
    // Owner (Oct 1-2): Community Day runs 5:45–7:15 PM. The live Awards page still lists 6:00–7:30 until the
    // owner approves changing it; the doors time matches.
    expect(communityDay2026.doors).toBe(awards["Doors Open"]);
    expect(details["Doors Open"]).toBe(awards["Doors Open"]);
    expect(communityDay2026.time).toBe("5:45–7:15 PM");
    expect(details["Community Day"]).toBe("5:45–7:15 PM");
    expect(communityDay2026.heroTime).toBe("5:45–7:15 PM");
  });

  it("sends ticket requests to the live RSVP form and repeats its waiting-list notice word for word", async () => {
    beforeEvent();
    const html = await render();
    expect(html.match(new RegExp(`href="${awards2026Editorial.rsvpUrl}"`, "g"))).toHaveLength(2);
    const page = text(html);
    expect(page).toContain("Submitting this RSVP does not guarantee admission and is not a ticket. Your request will be added to our ticket waiting list. We will email you if your ticket is approved.");
    expect(page).toContain("up to ten per request");
    expect(page).toContain("Enter your organization in the Organization field.");
    expect(page).toContain("Turn on one of the three: both Nevada Mental Health Day and the Awards Show, only Nevada Mental Health Day, or only the Awards Show (and not Nevada Mental Health Day).");
    // No personal contact details on the page; questions go to ICF's contact page.
    expect(html).not.toMatch(/tel:|mailto:/);
    expect(html).toContain('href="/contact"');
  });

  it("drops the ticket request once the event is over", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T08:00:00Z"));
    const html = await render();
    expect(html).not.toContain(awards2026Editorial.rsvpUrl);
    expect(html).not.toContain('id="tickets"');
    expect(text(html)).toContain(postEventLabel);
    expect(text(html)).toContain("What is Community Day?");
  });

  it("keeps ticket links inside a private partner copy of the page (owner, Oct 4)", async () => {
    beforeEvent();
    const html = await render("nami-vip");
    expect(html).toContain('href="https://notaloneawards.org/rsvp/nami-vip-zton04cqu1"');
    expect(html).not.toContain(`href="${communityDay2026.rsvpUrl}"`);
    expect(await render("unknown")).toContain(`href="${communityDay2026.rsvpUrl}"`);
  });
});
