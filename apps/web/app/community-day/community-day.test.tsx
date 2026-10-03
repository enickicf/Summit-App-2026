import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CommunityDayPage, { metadata } from "./page";
import { awards2026Editorial, awards2026Evening } from "../../lib/awards-editorial";
import { communityDay2026 } from "../../lib/community-day-2026";
import { postEventLabel } from "../../lib/event-phase";

const render = () => renderToStaticMarkup(<CommunityDayPage />);
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;|&rsquo;|’/g, "'").replace(/\s+/g, " ");
const section = (html: string, id: string) => html.slice(html.indexOf(`aria-labelledby="${id}"`), html.indexOf("</section>", html.indexOf(`aria-labelledby="${id}"`)));
const beforeEvent = () => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-09-28T18:00:00Z")); };

describe("Community Day page", () => {
  afterEach(() => vi.useRealTimers());

  it("has one focusable main landmark and its own title", () => {
    const html = render();
    expect(metadata.title).toBe("Community Day");
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html).toMatch(/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
  });

  it("shows the date and time at a glance at the top, over ICF's community photo", () => {
    beforeEvent();
    const html = render();
    const heroHtml = section(html, "community-day-title");
    // The photo plus the "Presented by" ICF and NAMI logos (Aphrah, Oct 3).
    expect(heroHtml.match(/<img\b/g)).toHaveLength(3);
    expect(heroHtml).toContain('alt="Inspiring Children Foundation"');
    expect(heroHtml).toContain('alt="NAMI, National Alliance on Mental Illness"');
    expect(heroHtml).not.toContain("Community Day partners");
    expect(heroHtml.replace(/&#x27;/g, "'")).toContain(`alt="${communityDay2026.heroPhotoAlt}"`);
    expect(heroHtml).toContain("encore-theater-community-day");
    const hero = text(heroHtml);
    expect(hero).toContain("Presented by Community Day Monday, November 2 5:45–7:15 PM Encore Theater at Wynn Las Vegas Request free tickets Info");
    expect(hero).not.toContain("Not Alone");
    expect(hero).not.toMatch(/Doors open|A free panel/);
  });

  it("has an Info button that scrolls down to \"What is Community Day?\" on the same page", () => {
    beforeEvent();
    const html = render();
    expect(html).toMatch(/<a class="[^"]*" href="#what-is-community-day">Info<\/a>/);
    expect(html).toContain('<section class="_mission_');
    expect(html).toMatch(/<section [^>]*id="what-is-community-day"[^>]*aria-labelledby="mission-title"/);
  });

  it("opens the explanation with Nevada Mental Health Day", () => {
    beforeEvent();
    const html = render();
    expect(text(section(html, "mission-title")).trim()).toBe(`aria-labelledby="mission-title"> What is Community Day? In honor of Nevada Mental Health Day ${communityDay2026.about}`);
    expect(communityDay2026.about).toMatch(/^The Not Alone Community Day is /);
    expect(text(html)).not.toContain("Our mission");
  });

  it("puts the explanation, partners, then details under the hero", () => {
    beforeEvent();
    const html = render();
    const order = ["community-day-title", "mission-title", "community-partners-title", "details-title", "tickets-title"].map(id => html.indexOf(`aria-labelledby="${id}"`));
    expect(order.every(index => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("lists the details in the Awards page's evening format, details only", () => {
    beforeEvent();
    const details = text(section(render(), "details-title"));
    expect(details).toContain("The Details Date Monday, Nov 2 Doors Open 5:30 PM Community Day 5:45–7:15 PM Awards Show 7:30 PM Location Encore Theater, Wynn Las Vegas");
    expect(details).not.toMatch(/free|ticket/i);
  });

  it("shows the complete evening without unrelated Awards program content", () => {
    beforeEvent();
    const html = render();
    const page = text(html);
    expect(page).not.toContain("Summit");
    expect(page).not.toContain("Who it's for");
    expect(page).not.toMatch(/different|not the Awards/i);
    expect(page).toContain("Awards Show 7:30 PM");
    for (const other of ["Highlights", "Loni Love", "iHeart", "Jewel", "Pre-Show", "pre-show", "No Solicitation", "lineup"]) expect(page).not.toContain(other);
    expect(html).not.toMatch(/<(video|iframe)\b/);
  });

  it("features ICF and the approved community partners", () => {
    beforeEvent();
    const partners = text(section(render(), "community-partners-title"));
    expect(partners).toContain("Presented With Our Community Partners Powered by Presented by Community partner Host venue");
    for (const name of ["Inspiring Children Foundation", "Steven & Alexandra Cohen Foundation", "NAMI, National Alliance on Mental Illness", "Wynn Las Vegas"]) expect(render().replace(/&amp;/g, "&")).toContain(`alt="${name}"`);
  });

  it("keeps its times in step with the Awards page's evening block", () => {
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

  it("sends ticket requests to the live RSVP form and repeats its waiting-list notice word for word", () => {
    beforeEvent();
    const html = render();
    expect(html.match(new RegExp(`href="${awards2026Editorial.rsvpUrl}"`, "g"))).toHaveLength(2);
    const page = text(html);
    expect(page).toContain("Submitting this RSVP does not guarantee admission and is not a ticket. Your request will be added to our ticket waiting list. We will email you if your ticket is approved.");
    expect(page).toContain("up to ten per request");
    expect(page).toContain("Enter your organization in the Organization field.");
    expect(page).toContain("Yes, I plan to attend Community Day before the Awards Show");
    // No personal contact details on the page; questions go to ICF's contact page.
    expect(html).not.toMatch(/tel:|mailto:/);
    expect(html).toContain('href="/contact"');
  });

  it("drops the ticket request once the event is over", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-06T08:00:00Z"));
    const html = render();
    expect(html).not.toContain(awards2026Editorial.rsvpUrl);
    expect(html).not.toContain('id="tickets"');
    expect(text(html)).toContain(postEventLabel);
    expect(text(html)).toContain("What is Community Day?");
  });
});
