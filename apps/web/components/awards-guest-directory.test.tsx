import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { originalProducerCredit } from "@not-alone/config";
import { directoryPeople } from "../lib/people";
import { awardsPeople, awardsGuestCategories } from "../lib/awards-people";
import { AwardsGuestDirectory, orderAwardsGuests } from "./awards-guest-directory";
import { isKeynote, peopleSectionTitles, peopleSections } from "../lib/people-sections";
import { withAirtable } from "../lib/airtable-overlay";

// Sept 22 meeting: ranks and tiers come from Airtable, so the gallery is tested with the overlay applied.
const live = await withAirtable(event2026Snapshot);

const people = directoryPeople(live);
const guests = awardsPeople(live).filter(person => awardsGuestCategories.some(category => person.categories.includes(category)));
const producers = people.filter(person => originalProducerCredit(person.name));

describe("Awards guest gallery", () => {
  it("lists the people in the owner's sections, each once (founders may repeat under Founders)", () => {
    const html = renderToStaticMarkup(<AwardsGuestDirectory people={awardsPeople(live)} />);
    const eligible = awardsPeople(live).filter(person => isKeynote(person) || [...awardsGuestCategories, "Hosts", "Attendees"].some(category => person.categories.includes(category as never)));
    const sections = peopleSections(eligible, "awards");
    // Owner (Sept 21, late): Keynotes, Musicians, Speakers, in that order.
    const headings = [...html.matchAll(/<h2>([^<]+)<\/h2>/g)].map(match => match[1]!.replaceAll("&amp;", "&")).filter(title => (peopleSectionTitles as readonly string[]).includes(title));
    expect(headings).toEqual(sections.filter(section => section.heading !== null).map(section => section.title)); // the keynote group has no heading
    expect(headings).toEqual(["Founders"]); // Owner (Sept 22): the lineup has no heading; only Founders does
    expect(html.match(/data-awards-guest=/g)).toHaveLength(sections.reduce((total, section) => total + section.people.length, 0));
    for (const person of eligible) {
      const appearances = sections.filter(section => section.people.some(entry => entry.person.slug === person.slug));
      expect(appearances.length).toBeLessThanOrEqual(2);
      if (appearances.length === 2) expect(appearances.map(section => section.title)).toContain("Founders");
      if (appearances.length) expect(html).toContain(`href="/directory/${person.slug}?from=awards"`);
    }
    expect(html).not.toContain("Confirmed 2026 guest</p>");
    expect(html).not.toContain("Executive Producer</p>");
    expect(html).toContain("More talent and guests to be announced.");
    expect(html).not.toContain("<input");
    expect(html).not.toContain("<button");
  });

  it("hides every guest and search control when the directory is unavailable", () => {
    const html = renderToStaticMarkup(<AwardsGuestDirectory people={people} available={false} />);
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("data-awards-guest");
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain("Jewel");
  });

  it("handles empty directories and renders the supplied public portraits", () => {
    const empty = renderToStaticMarkup(<AwardsGuestDirectory people={[]} />);
    expect(empty).toContain("after event-team approval");
    expect(empty).not.toContain("data-awards-guest");
    const namesOnly = renderToStaticMarkup(<AwardsGuestDirectory people={people.filter(person => ["Anthony Ramos", "Alana Springsteen", "Caroline Jones"].includes(person.name))} />);
    expect(namesOnly.match(/data-awards-guest=/g)).toHaveLength(3);
    expect(namesOnly.match(/<img /g)).toHaveLength(3);
    expect(namesOnly).not.toContain("Also joining the gathering");
  });

  it("is one lineup, ranking order first, with no sub-heading (owner, Sept 22)", () => {
    const html = renderToStaticMarkup(<AwardsGuestDirectory people={awardsPeople(live)} />);
    expect(html).not.toMatch(/<h2>(Keynotes|Musicians|Speakers)<\/h2>/);
    expect(html.indexOf('aria-label="Lineup"')).toBeLessThan(html.indexOf('aria-label="Founders"'));
    const keynotes = html.slice(html.indexOf('aria-label="Lineup"'), html.indexOf("</section>", html.indexOf('aria-label="Lineup"')));
    const withPortraits = keynotes.slice(0, keynotes.indexOf('aria-label="Lineup names"') > -1 ? keynotes.indexOf('aria-label="Lineup names"') : undefined);
    const shown = [...withPortraits.matchAll(/<h3>([^<]+)<\/h3>/g)].map(match => match[1]);
    expect(shown.length).toBeGreaterThan(0);
    // Sept 22 meeting: the Top 12 come first in Airtable's rank order (1-12), then the A-F tiers.
    const ranked = awardsPeople(live).filter(person => person.rank !== undefined);
    const order = shown.map(name => ranked.find(person => person.name === name)?.rank).filter((rank): rank is number => rank !== undefined);
    expect(order.length).toBeGreaterThan(0);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("shows producers in the people sections only by their other roles, never as producers", () => {
    const genericProducers = producers.map(person => ({ ...person, role: "Confirmed 2026 guest", categories: ["Attendees" as const] }));
    const html = renderToStaticMarkup(<AwardsGuestDirectory people={genericProducers} />);
    expect(producers).toHaveLength(6); // Oct 11: Dr. George Rapier III (a 2025 ICF producer credit) is now a 2026 Founder
    // Jewel is a musician; the others are attendees here (their producer credits have their own section).
    expect(html.slice(html.indexOf('aria-label="Lineup"'))).toContain("<h3>Jewel</h3>");
    expect(html).not.toMatch(/Producer<\/p>/);
  });

  it("only reorders supplied confirmed guests, without modifying the canonical list or adding featured names", () => {
    const before = people.map(person => person.slug);
    const results = orderAwardsGuests(people);
    expect(results).toHaveLength(people.length);
    expect(people.map(person => person.slug)).toEqual(before);
    const nonFeatured = people.filter(person => person.name === "Aphrah Brokaw");
    expect(orderAwardsGuests(nonFeatured)).toEqual(nonFeatured);
    expect(orderAwardsGuests([])).toEqual([]);
  });
});
