import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { awardsDisplayPeople, awardsPeople, awardsGuestCategories } from "./awards-people";
import { directoryPeople } from "./people";
import { OriginalAwardsPage } from "../components/original-event-page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("curated Awards people", () => {
  it("assigns one highest credit without changing canonical guest data or Summit profiles", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const before = structuredClone(snapshot);
    const selected = awardsPeople(snapshot);
    expect(selected).toHaveLength(60);
    expect(new Set(selected.map(person => person.name)).size).toBe(selected.length);
    expect(selected.every(person => person.categories.length >= 1 && person.bio.trim())).toBe(true);
    // Owner (Sept 21): people are listed in every category they hold, primary credit first.
    expect(selected.find(person => person.name === "Jewel")?.categories).toEqual(expect.arrayContaining(["Co-Chairs", "Musicians"]));
    expect(selected.find(person => person.name === "Jewel")?.categories[0]).toBe("Co-Chairs");
    expect(selected.find(person => person.name === "Jewel")?.categories[0]).toBe("Co-Chairs");
    expect(selected.find(person => person.name === "Ryan Wolfington")?.categories).toEqual(["Producers", "Founders & Entrepreneurs"]);
    expect(selected.find(person => person.name === "Trevor Short")?.categories[0]).toBe("Executive Producers");
    expect(selected.find(person => person.name === "Loni Love")?.categories).toEqual(["Hosts", "Entertainers & Athletes"]);
    expect(selected.find(person => person.name === "Jen Smorgen")?.categories[0]).toBe("Philanthropists");
    expect(selected.find(person => person.name === "Ellie Kanner")?.categories[0]).toBe("Founders & Entrepreneurs");
    expect(selected.filter(person => awardsGuestCategories.some(category => person.categories.includes(category)))).toHaveLength(55); // now includes Jewel, Loni Love and Ryan Wolfington via their other categories
    expect(selected.find(person => person.name === "Sarah Gilman")?.categories[0]).toBe("Entertainers & Athletes");
    // Sept 21 meeting: confirmed talent appears; staff, press and plus-ones never do.
    expect(selected.find(person => person.name === "Sarah Steil")?.categories[0]).toBe("Musicians");
    expect(selected.find(person => person.name === "Kevin Hines")?.categories[0]).toBe("Philanthropists");
    expect(selected.find(person => person.name === "Mike Majlak")?.categories[0]).toBe("Business Leaders");
    // ICF's published founders are a standing credit (meeting: "and last year's").
    expect(selected.find(person => person.name === "John Couch")?.categories[0]).toBe("Founders & Entrepreneurs");
    expect(selected.find(person => person.name === "Steven & Alexandra Cohen")?.categories[0]).toBe("Philanthropists");
    expect(selected.find(person => person.name === "Pam & Duncan Goldie-Morrison")?.categories[0]).toBe("Philanthropists");
    for (const name of ["Nick Dana", "Bianca Mok", "Cathy Olson", "Morgan Marler", "Isabella Wolfington", "Sophie Novak", "Steven Cohen", "Alexandra Cohen"]) expect(selected.map(person => person.name)).not.toContain(name);
    expect(directoryPeople(snapshot)).toHaveLength(47);
    expect(snapshot).toEqual(before);
  });

  it("renders Awards display people once, grouping the Wolfingtons without changing canonical records", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} />);
    // Owner (Oct 5): couples read with "and", not an ampersand.
    const joint = awardsDisplayPeople(event2026Snapshot).find(person => person.name === "Sean and Ana Wolfington")!;
    // Owner (Sept 22): a non-celebrity founder appears in the Founders section only, so the joint card shows once.
    expect(html.split("<h3>Sean and Ana Wolfington</h3>")).toHaveLength(2);
    expect(html).not.toContain("Sean &amp; Ana Wolfington");
    expect(html.split(`href="/directory/${joint.slug}?from=awards"`)).toHaveLength(2);
    expect(html).not.toContain("<h3>Sean Wolfington</h3>");
    expect(html).not.toContain("<h3>Ana Wolfington</h3>");
    expect(awardsPeople(event2026Snapshot).map(person => person.name)).toContain("Sean Wolfington");
    expect(awardsPeople(event2026Snapshot).map(person => person.name)).toContain("Ana Wolfington");
  });

  it("uses the Bryan brothers' requested title on their shared public card and profile", () => {
    const brothers = awardsDisplayPeople(event2026Snapshot).find(person => person.slug === "2026-bob-mike-bryan")!;
    expect(brothers.role).toBe("Winningest Tennis Doubles Team in History");
    expect(Object.values(brothers.categoryRoles ?? {})).toEqual(expect.arrayContaining([brothers.role]));
    expect(brothers.bio).toContain("119 team titles and 16 major doubles titles");
    expect(awardsPeople(event2026Snapshot).some(person => person.name === "Bob Bryan")).toBe(true);
  });

  it("uses preserved historical imagery and designated public headshots for the requested Awards guests", () => {
    const selected = awardsPeople(event2026Snapshot);
    // Owner (Sept 21): every 2026 portrait is a reviewed local crop (lib/portrait-overrides.ts); nothing is hotlinked.
    for (const name of ["Anthony Ramos", "Alana Springsteen", "Caroline Jones", "Lexi Hensler", "Brandon Saho"]) expect(selected.find(person => person.name === name)?.image).toMatch(/^\/2026-headshots\/portraits\//);
    expect(selected.filter(person => person.image).every(person => /^\/(original-2025|2026-headshots)\//.test(person.image!))).toBe(true);
    // Sept 21 late: approved photos found for Bob Bryan and Caroline Silby.
    for (const name of ["Bob Bryan", "Caroline Silby"]) expect(selected.find(person => person.name === name)?.image).toMatch(/^\/2026-headshots\/portraits\//);
    expect(selected.find(person => person.name === "Jen Smorgen")?.image).toBeTruthy();
  });

  it("honors publication, visibility, withdrawal and empty-directory boundaries", () => {
    expect(awardsPeople(null)).toEqual([]);
    expect(awardsPeople({ ...event2026Snapshot, speakers: [] })).toEqual([]);
    expect(awardsPeople({ ...event2026Snapshot, event: { ...event2026Snapshot.event, directoryEnabled: false } })).toEqual([]);
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers = snapshot.speakers.filter(person => person.name !== "Mike Tyson");
    snapshot.speakers.find(person => person.name === "Jewel")!.published = false;
    snapshot.speakers.find(person => person.name === "Loni Love")!.eventId = "other-event";
    for (const name of ["Mike Tyson", "Jewel", "Loni Love"]) expect(awardsPeople(snapshot).map(person => person.name)).not.toContain(name);
  });

  it("preserves staff-published biographies while filling missing Awards bios locally", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers.find(person => person.name === "Mike Tyson")!.bio = "Published biography reviewed by staff.";
    expect(awardsPeople(snapshot).find(person => person.name === "Mike Tyson")?.bio).toBe("Published biography reviewed by staff.");
    expect(directoryPeople(snapshot).find(person => person.name === "Jason Kennedy")?.bio).toBe("");
    expect(awardsPeople(snapshot).find(person => person.name === "Jason Kennedy")?.bio).toBeTruthy();
  });
});
