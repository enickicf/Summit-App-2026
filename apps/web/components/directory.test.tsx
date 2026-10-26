import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { originalProducerCredit } from "@not-alone/config";
import { directoryPeople, people2025 } from "../lib/people";
import { Directory } from "./directory";

const people = directoryPeople(event2026Snapshot);

describe("current Summit directory", () => {
  it("links each reviewed guest using an encoded stable identity without speculative profile fetches", () => {
    const html = renderToStaticMarkup(<Directory people2026={people} />);
    for (const person of people) expect(html).toContain(`href="/directory/${encodeURIComponent(person.slug)}"`);
    expect(html.match(/class="personCard"/g)).toHaveLength(people.length);
    expect(html).toContain(`${people.length} guests`);
    expect(html).toContain('type="search"');
    expect(html).toContain('aria-label="Guest categories"');
    expect(html).toContain("<h4");
    const resultId = html.match(/aria-controls="([^"]+)"/)?.[1];
    expect(resultId).toBeTruthy();
    expect(html).toContain(`id="${resultId}"`);
    for (const match of html.matchAll(/href="#([^"]+)"/g)) expect(html).toContain(`id="${match[1]}"`);
  });

  it("hides supplied names and search when the directory is unavailable", () => {
    const html = renderToStaticMarkup(<Directory people2026={people} available={false} />);
    expect(html).toContain("temporarily unavailable");
    expect(html).not.toContain("Mike Tyson");
    expect(html).not.toContain('class="personCard"');
    expect(html).not.toContain('type="search"');
  });

  it("requests full portrait-card images rather than tiny list thumbnails", () => {
    const html = renderToStaticMarkup(<Directory people2026={people} />);
    expect(html).toContain('sizes="(max-width: 600px) 44vw, (max-width: 900px) 30vw, (max-width: 1240px) 22vw, 280px"');
    expect(html).not.toContain('sizes="(max-width: 600px) 66px, 76px"');
  });

  it("keeps a square initials fallback without inventing a guest photo", () => {
    const person = { ...people[0]!, name: "Unpictured Guest" };
    delete person.image;
    const html = renderToStaticMarkup(<Directory people2026={[person]} />);
    expect(html).toContain('<div class="portrait" data-person="Unpictured Guest" aria-hidden="true"><span>UG</span></div>');
    expect(html).not.toContain("<img");
  });

  it("never carries archive profiles into the current directory", () => {
    const html = renderToStaticMarkup(<Directory people2026={people2025} />);
    expect(html).toContain("after event-team approval");
    expect(html).not.toContain('class="personCard"');
    expect(html).not.toContain("Rachel Platten");
  });

  it("renders uncategorized guests and escapes route delimiters in their identity", () => {
    const person = { ...people[0]!, slug: "guest/id?from=awards", categories: [] };
    const html = renderToStaticMarkup(<Directory people2026={[person]} />);
    expect(html).toContain("Attendees");
    expect(html).toContain("1 guest");
    expect(html).toContain('href="/directory/guest%2Fid%3Ffrom%3Dawards"');
  });

  it("keeps the compatibility Awards path search-free and excludes separately credited producers", () => {
    const html = renderToStaticMarkup(<Directory people2026={people} context="awards" />);
    expect(html).not.toContain('type="search"');
    expect(html).not.toContain('aria-label="Guest categories"');
    // Producers without another public category are not listed as guests.
    for (const person of people.filter(person => ["Trevor Short", "Trent Alenik", "Aphrah Brokaw"].includes(person.name))) expect(html).not.toContain(`href="/directory/${person.slug}?from=awards"`);
    expect(html).not.toContain("Awards appearances, performances, and honorees will be announced separately.");
  });
});
