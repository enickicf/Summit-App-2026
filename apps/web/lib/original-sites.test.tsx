import { describe, expect, it, vi } from "vitest";
import { isKeynote, peopleSections } from "./people-sections";
import { withAirtable } from "./airtable-overlay";

// Sept 22 meeting: ranks and tiers come from Airtable, so current pages render with the overlay applied.
const live = await withAirtable(event2026Snapshot);
import { renderToStaticMarkup as renderMarkup } from "react-dom/server";
import source from "./original-sites.json";
import { originalAsset } from "./original-assets";
import { updatedPortrait } from "./person-portraits";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { summit2025Leadership, summit2025Directory, awards2025Highlights } from "./content";
import { publishedAwardsProgram } from "@not-alone/domain";
import { confirmedSummitGuests2026, originalProducerCredit, originalProducerCredits, producerCredit2026 } from "@not-alone/config";
import eventStyles from "../components/original-event-page.module.css";
import { awards2025Winners, awards2025WinnersSource } from "./awards-editorial";
import { awardsDisplayPeople, awardsPeople, awardsGuestCategories } from "./awards-people";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const escape = (value: string) => value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");
const renderToStaticMarkup = (element: Parameters<typeof renderMarkup>[0]) => decodeURIComponent(renderMarkup(element));
const hasPortrait = (html: string, src: string, name: string) => [...html.matchAll(/<img[^>]+>/g)].some(([tag]) => tag.includes(`alt="${escape(name)}"`) && tag.includes(escape(src)));

describe("source-faithful, year-separated event pages", () => {
  it("shares the original portrait presentation and uses the owner-approved current host", () => {
    const archive = renderToStaticMarkup(<OriginalAwardsPage year={2025} />);
    const current = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={live} />);
    const hostSection = /<section[^>]*><h2>Host<\/h2>[\s\S]*?<\/section>/;
    expect(archive.match(hostSection)?.[0]).toContain("Loni Love");
    expect(current.match(hostSection)).toBeNull();
    expect(current).toContain("Loni Love");
    expect(current).toContain(`class="${eventStyles.portraits}" role="group" aria-label="Lineup with portraits"`);
    expect(current.match(/<main[^>]*>/)?.[0]).not.toContain(eventStyles.refined);
    expect(current).toContain("Your 2026 Host");
    expect(current).not.toContain("Explore the 2025 award categories");
    expect(archive).toContain("2025 Award Winners");
  });

  it("uses one current directory and does not convert attendance into historical affiliations or activities", () => {
    const html = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />);
    // Owner (Sept 22): a Hosts section (Summit Host / Awards Host) now sits above the co-chairs by design.
    for (const obsolete of ["Product Launches", "<li>Pitches</li>", "https://www.inspiringchildren.org/summit-loni-love"]) expect(html).not.toContain(obsolete);
    expect(html).toContain('id="hosts"');
    expect(html.slice(html.indexOf('id="hosts"'))).toMatch(/<h3>Jason Kennedy<\/h3><p>Summit Host<\/p>[\s\S]*<h3>Loni Love<\/h3><p>Awards Host<\/p>/);
    expect(html.match(/id="directory"/g)).toHaveLength(1);
    expect(html).not.toContain('id="summit-film"');
    // Owner (Sept 21): only the main Summit dates on the home page.
    expect(html).toContain(escape(event2026Snapshot.event.dateLabel.split(" · ")[0]!.replace(/,?\s*2026\b/, "")));
    expect(html).not.toContain("Additional activities");
    expect(html).toContain("Jason Kennedy");
    expect(html).toContain("Loni Love");
    expect(html).toContain("Co-Chairs");
    expect(html).toContain("Executive Producers");
    const archive = renderToStaticMarkup(<OriginalSummitPage year={2025} />);
    expect(archive).toContain("Summit Host");
    expect(archive).toContain("Awards Host");
    // Owner (Sept 21): the 2025 page drops its 14-item Featuring list with the film section.
    expect(archive).not.toContain("Product Launches");
  });

  it("links the 2026 section navigation to the public Awards RSVP without exposing staff management", () => {
    const url = "https://notaloneawards.org/rsvp";
    for (const html of [renderToStaticMarkup(<OriginalAwardsPage year={2026} />)]) {
      expect(html).toContain(`href="${url}"`);
      expect(html).not.toContain(`${url}admin`);
      expect(html).not.toContain("summit-outreach-ai-20260909");
      expect(html).not.toContain("podcaster-rsvp");
      expect(html).not.toContain("Podcaster RSVP");
    }
    const current = renderToStaticMarkup(<OriginalAwardsPage year={2026} />);
    const program = current.split('id="awards-program"')[1]?.split('</section>')[0];
    expect(program).toContain(`href="${url}" aria-label="RSVP for the Not Alone Awards">RSVP</a>`);
    expect(current.match(new RegExp(`href="${url}"`, "g"))).toHaveLength(1);
    for (const html of [renderToStaticMarkup(<OriginalSummitPage year={2025} />), renderToStaticMarkup(<OriginalAwardsPage year={2025} />)]) {
      expect(html).not.toContain(url);
      expect(html).not.toContain("Awards RSVP");
    }
  });
  it("keeps every original producer credited with their portrait on both 2025 pages", () => {
    const sourceCredits = source.summit.sections[13]!;
    for (const html of [renderToStaticMarkup(<OriginalSummitPage year={2025} />), renderToStaticMarkup(<OriginalAwardsPage year={2025} />)]) {
      const credits = html.match(/<section[^>]*id="producers"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
      expect(html.match(/id="producers"/g)).toHaveLength(1);
      expect(credits.match(/<article>/g)).toHaveLength(originalProducerCredits.length);
      expect([...credits.matchAll(/<h3>(.*?)<\/h3>/g)].map(match => match[1])).toEqual(originalProducerCredits.map(person => escape(person.name)));
      for (const group of summit2025Directory.filter(group => /Producers/.test(group.title))) {
        expect(credits).toContain(`<h2>${group.title}</h2>`);
        for (const person of group.people) expect(credits).toContain(`<h3>${escape(person.name)}</h3><p>${escape(person.role)}</p>`);
      }
      sourceCredits.blocks.filter(block => block.tag === "h4").forEach((person, index) => {
        expect(hasPortrait(credits, originalAsset(sourceCredits.images[index]!.src), person.text)).toBe(true);
      });
    }
  });
  it("uses distinct venue and highlights photography without changing the 2025 archive", () => {
    const current = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} />);
    const hero = current.match(/<section[^>]*aria-labelledby="awards-title"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    expect(current).toContain('aria-labelledby="awards-title"');
    expect(hero).toContain('url=/images/wynn-las-vegas.webp');
    expect(hero).toContain('alt="Wynn Las Vegas overlooking its gardens and waterfall"');
    expect(hero).not.toContain("/images/awards-2025-highlights.jpg");
    // Owner (Sept 21): the highlights play behind the hero, and again further down as "2025 Highlights"
    // (an on-page player with a play button).
    expect(current).not.toContain('url=/images/awards-2025-highlights.jpg');
    expect(current).not.toContain("Jewel at the 2025 Awards");
    expect(current).toContain('id="awards-program"');
    expect(current).toContain('<h2 id="highlights-title">2025 Highlights</h2>');
    expect(current).toContain('aria-label="Play the 2025 Not Alone Awards highlights"');
    expect(current).toContain(">RSVP</a>");
    expect(current).toContain("Steven &amp; Alexandra Cohen Foundation");
    const archive = renderToStaticMarkup(<OriginalAwardsPage year={2025} />);
    expect(archive).not.toContain("/images/awards-2025-highlights.jpg");
  });
  it("preserves every original Summit and Awards portrait, name and affiliation", () => {
    for (const [kind, html] of [["summit", renderToStaticMarkup(<OriginalSummitPage year={2025} />)], ["awards", renderToStaticMarkup(<OriginalAwardsPage year={2025} />)]] as const) {
      const people = source[kind].sections.flatMap(section => section.people);
      expect(people.length).toBe(kind === "summit" ? 66 : 75);
      for (const person of people) {
        expect(html).toContain(escape(person.name));
        expect(html).toContain(escape(person.role));
        // Owner (Sept 21/22): 2025 pages match ICF exactly, including each photo.
        expect(html).toContain(escape(originalAsset(person.image)));
      }
    }
  });
  it("preserves full mission copy, all 18 award descriptions, and original credits", () => {
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2025} />);
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2025} />);
    // Owner (Sept 21): no "Davos" quote anywhere; 2025 uses the simplified intro and drops the
    // ICF program block from the middle of the page.
    expect(summit).not.toContain("Davos of Human Development");
    expect(summit).toContain("bring together leading CEOs, artists, athletes, philanthropists, clinicians, researchers, and youth ambassadors");
    expect(summit).not.toContain("Villa Bibbiani");
    expect(summit).not.toContain("10 pillars of healing");
    // Owner (Sept 21): 2025 uses the 2026 format: tagline plus the core mission paragraph, the full
    // no-solicitation notice (now last) and all 2025 award categories.
    expect(awards).toContain(escape(source.awards.sections[1]!.blocks[1]!.text));
    for (const index of [2, 11]) {
      for (const block of source.awards.sections[index]!.blocks) expect(awards).toContain(escape(block.text));
    }
    expect(awards.indexOf('id="winners"')).toBeLessThan(awards.indexOf('id="directory"'));
    expect(awards.indexOf('id="no-solicitation"')).toBeGreaterThan(awards.indexOf('id="winners"'));
    // Owner request (Sept 21): "Why It Matters" and the closing "Explore the 2025 Summit" block are removed.
    expect(awards).not.toContain("Why It Matters");
    expect(awards).not.toContain("Explore the 2025 Summit");
    expect(awards).not.toContain("<h2>Celebrating Pioneers in Human Development &amp; Mental Health</h2>");
    expect(source.awards.sections[11]!.blocks).toHaveLength(37);
    for (const name of ["Jewel", "Ryan Wolfington", "Trevor Short", "Dr. George Rapier III", "Trent Alenik", "Aphrah Brokaw"]) expect(summit).toContain(name);
  });
  it("keeps the 2026 pages source-faithful without restoring unconfirmed sponsors or people", () => {
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />);
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} />);
    for (const html of [summit, awards]) {
      expect(html).not.toContain("Villa Bibbiani");
      // Sept 21 meeting: ICF's published founders are a standing credit (e.g. Rachel Platten,
      // Dr. George Rapier III), but never a 2026 producer or talent listing.
      expect(html).toMatch(/(data-awards-guest|href)="[^"]*rachel-platten/);
      expect(html).not.toContain("Geoff Ralston");
      const producers = html.slice(html.indexOf('id="producers"'));
      expect(producers.slice(0, producers.indexOf("</section>"))).not.toContain("George Rapier");
      expect(html).toContain("Cherrial Odell");
      expect(html).not.toContain("<h3>Steven Cohen</h3>");
      expect(html).not.toContain("<h3>Alexandra Cohen</h3>");
      expect(html).toContain("Steven &amp; Alexandra Cohen Foundation");
    }
    expect(summit).toContain("Loni Love");
    expect(awards).toContain("Loni Love");
    expect(awards).not.toContain("More details coming soon");
    expect(awards).not.toContain("Access details to be confirmed");
    expect(awards).not.toMatch(/invitation[- ]only/i);
  });
  it("removes withdrawn guests from featured sections, host/chair/producer credits and directory", () => {
    const snapshot = { ...event2026Snapshot, speakers: event2026Snapshot.speakers.filter(person => !["Mike Tyson", "Loni Love", "Steve Wozniak", "Ryan Wolfington"].includes(person.name)) };
    for (const html of [renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />), renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} />)]) {
      expect(html).not.toContain("Mike Tyson");
      expect(html).not.toContain("Loni Love");
      expect(html).not.toContain("Steve Wozniak");
      expect(html).not.toContain("Ryan Wolfington");
      // Sept 22 meeting: Airtable decides the lineup (removal is covered in airtable-live.test); the page still renders.
      expect(html).toContain('id="main-content"');
    }
    for (const offline of [renderToStaticMarkup(<OriginalSummitPage year={2026} />), renderToStaticMarkup(<OriginalAwardsPage year={2026} />)]) {
      expect(offline).not.toContain("Mike Tyson");
      expect(offline).toContain("temporarily unavailable");
      expect(offline).not.toContain("Dr. George Rapier III");
      expect(offline).not.toContain("Loni Love");
      expect(offline).not.toContain('href="#leadership"');
      expect(offline).not.toContain('href="#producers"');
    }
  });
  it("preserves correct portraits for confirmed guests and explicitly owner-approved co-chairs", () => {
    const section = source.summit.sections[13]!;
    const confirmed = new Set<string>(confirmedSummitGuests2026);
    for (const [kind, html] of [["summit", renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />)], ["awards", renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} />)]] as const) {
      section.blocks.filter(block => block.tag === "h4").forEach((block, index) => {
        if (block.text === "Jewel") return;
        expect(hasPortrait(html, originalAsset(section.images[index]!.src), block.text)).toBe(confirmed.has(block.text));
      });
      for (const group of [...summit2025Leadership.filter(group => group.title === "Co-Chairs"), ...summit2025Directory.filter(group => /Producers/.test(group.title))]) {
        for (const person of group.people) {
          const credit = `<h3>${escape(person.name)}</h3><p>${escape(person.role)}</p>`;
          // Sept 21 meeting: Jewel is credited as a 2026 Producer as well as co-chair.
          if (group.title === "Executive Producers" && person.name === "Jewel") expect(html).toContain(credit);
          else if (confirmed.has(person.name) || (group.title === "Co-Chairs" && person.name === "Cherrial Odell")) expect(html).toContain(credit);
          else expect(html).not.toContain(credit);
        }
      }
      expect(html.match(/id="directory"/g)).toHaveLength(1);
    }
  });
  it("omits the redundant program copy without exposing an archive RSVP", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} program={{ id: "program", slug: "awards-2026-program", title: "Approved program", body: "Reviewed copy", published: true, revision: 1 }} />);
    expect(html).not.toContain("Reviewed copy");
    const archive = renderToStaticMarkup(<OriginalAwardsPage year={2025} />);
    expect(archive).not.toContain("Registration for this past event is closed");
    expect(archive).not.toContain("awards-rsvp");
    expect(html).toContain('href="https://notaloneawards.org/rsvp"');
  });
  it("separates confirmed producers below the Awards talent roster without treating fixed credits as attendance", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} />);
    const roster = html.slice(html.indexOf('id="directory"'), html.indexOf('id="awards-host"')); // host and credits sit below the roster (owner, Sept 21 late)
    const production = html.match(/<section[^>]*id="producers"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
    const eligible = awardsPeople(event2026Snapshot).filter(person => awardsGuestCategories.some(category => person.categories.includes(category)));
    // Owner (Sept 21): the owner's sections, each person once (founders may repeat under Founders).
    const cards = peopleSections(awardsDisplayPeople(event2026Snapshot).filter(person => isKeynote(person) || [...awardsGuestCategories, "Hosts", "Attendees"].some(category => person.categories.includes(category as never))), "awards").flatMap(section => section.people);
    expect(roster.match(/data-awards-guest=/g)).toHaveLength(cards.length);
    expect(roster.match(/\?from=awards/g)).toHaveLength(cards.length);
    // Producer (owner, Sept 23): Ryan Oz, Deb Cullen; Producers: Jewel, Ryan Wolfington, Aphrah Brokaw; Executive Producers: Trevor Short, Trent Alenik.
    expect(production.match(/<article>/g)).toHaveLength(7);
    expect(production.indexOf("<h2>Producer</h2>")).toBeLessThan(production.indexOf("<h2>Producers</h2>"));
    expect(production.indexOf("<h2>Producers</h2>")).toBeLessThan(production.indexOf("<h2>Executive Producers</h2>"));
    expect(html.indexOf('id="producers"')).toBeGreaterThan(html.indexOf('id="directory"'));
    expect(renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />)).not.toContain("?from=awards");
    for (const person of event2026Snapshot.speakers) {
      const name = `<h3>${escape(person.name)}</h3>`;
      if (producerCredit2026(person.name)) {
        expect(production).toContain(name);
        if (eligible.some(guest => guest.name === person.name)) expect(roster).toContain(name); else expect(roster).not.toContain(name);
      } else if (["Sean Wolfington", "Ana Wolfington", "Melinda Springer", "Noah Springer"].includes(person.name)) expect(roster).not.toContain(name);
      else if (cards.some(card => card.person.name === person.name)) expect(roster).toContain(name); // Owner (Sept 22): only well-known people and founders on the Awards lineup
      else expect(roster).not.toContain(name);
    }
    expect(production).toContain("Executive Producers");
    expect(production).toContain("<h2>Producers</h2>");
    expect(production).not.toContain("Dr. George Rapier III");
    expect(roster).toContain("More talent and guests to be announced.");
    // Listed only as an ICF founder credit (Sept 21 meeting), never as a producer.
    expect(roster).toContain("Dr. George Rapier III");
    expect(roster).not.toContain("Cherrial Odell");
    expect(roster).not.toContain("TBC");
    expect(roster).not.toContain("Awards appearances, performances, and honorees will be announced separately.");
    const hidden = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={{ ...event2026Snapshot, event: { ...event2026Snapshot.event, directoryEnabled: false } }} />);
    expect(hidden).not.toContain("Anthony Ramos");
    expect(hidden).toContain("temporarily unavailable");
  });
  it("includes the verified 2025 highlights and separates archival categories from the current program", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} program={publishedAwardsProgram(event2026Snapshot)} />);
    expect(html).toContain('aria-labelledby="awards-title"');
    expect(html).not.toContain("autoplay=1");
    expect(html).toContain("Monday, November 2</time>");
    expect(html).not.toContain("Red Carpet");
    expect(html).toContain("<dt>Doors Open</dt><dd>5:30 PM</dd>");
    // Owner (Sept 21, late): "The Evening" is exactly Community Day and the Awards Show.
    expect(html).toContain("<dt>Community Day</dt><dd>6:00 PM-7:30 PM</dd>");
    expect(html).not.toContain("<dt>Pre-Show</dt>");
    expect(html).toContain("<dt>Awards Show</dt><dd>8:00 PM-10:00 PM</dd>");
    expect(html).toContain('id="winners"');
    expect(html).toContain("<h3>Rachel Platten</h3>");
    expect(html).toContain('href="https://www.youtube.com/@iHeartRadio/streams"');
    expect(html).not.toContain("end time to be confirmed");
    expect(html).not.toContain("complete show lineup");
    expect(html).not.toContain('href="/schedule"');
    expect(html).not.toContain(escape(event2026Snapshot.event.dateLabel));
    expect(html).not.toContain("broadcast live on iHeartRadio");
    expect(html).not.toContain("2025 ARCHIVE");
  });
  it("does not display an unpublished show program or a canceled show date", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.map(item => item.title === "Awards Show" ? { ...item, status: "canceled" as const } : item) };
    const program = { ...publishedAwardsProgram(event2026Snapshot)!, published: false, body: "Unapproved award announcement" };
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={program} />);
    expect(html).not.toContain("Unapproved award announcement");
    expect(html).not.toContain("Monday, November 2, 2026");
    expect(html).toContain("Awards Show canceled");
    expect(html).not.toContain("Awards RSVP");
  });
  it("suppresses an active timetable and RSVP for a canceled show even if the program stays published", () => {
    const snapshot = { ...event2026Snapshot, scheduleItems: event2026Snapshot.scheduleItems.map(item => item.title === "Awards Show" ? { ...item, status: "canceled" as const } : item) };
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />);
    expect(html).toContain("Awards Show canceled");
    expect(html).not.toContain("8:00 PM-10:00 PM");
    expect(html).not.toContain(">RSVP</a>");
    expect(html).not.toContain("Date to be confirmed");
    expect(html).toContain('href="/"');
    expect(html).not.toContain('href="/schedule"');
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    expect(summit).not.toContain("Awards RSVP");
    // Sept 21 meeting: the published schedule is shown on the page itself; no duplicate link.
    expect(summit).toContain('id="schedule"');
    expect(summit).not.toContain('href="/schedule"');
  });
  it("uses canonical current venue and access labels without relabeling historical artwork", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.event.venueName = "Updated approved venue";
    snapshot.scheduleItems.find(item => item.title === "Awards Show")!.eligibilityScope.label = "Updated approved access";
    const summit = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />);
    expect(summit).toContain("hosted at <strong>Updated approved venue.</strong>");
    expect(summit).toContain("Updated approved venue");
    expect(summit).not.toContain("hosted at Wynn");
    expect(summit).not.toContain('alt="Wynn Resorts"');
    expect(summit).not.toContain('alt="Wynn Las Vegas"');
    const awards = renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} />);
    expect(awards).toContain("Updated approved access");
    expect(awards).toContain("Wynn Las Vegas · 2025 venue");
    expect(awards).toContain('alt="Wynn Las Vegas overlooking its gardens and waterfall"');
    // Owner (Sept 21): the 2025 film section is just the recap, large.
    expect(renderToStaticMarkup(<OriginalSummitPage year={2025} />)).toContain('id="about"');
  });

  it("adds all eleven sourced 2025 winners without treating award categories as recipients", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2025} />);
    const winners = html.split('id="winners"')[1]!.split("</section>")[0]!;
    expect(winners.match(/<article>/g)).toHaveLength(11);
    for (const winner of awards2025Winners) {
      expect(winners).toContain(escape(winner.recipient));
      expect(winners).toContain(escape(winner.award));
    }
    expect(winners).toContain(awards2025WinnersSource);
    expect(html).toContain('href="/directory/2025-loni-love?from=awards"');
    expect(html).not.toContain('href="https://www.inspiringchildren.org/summit-loni-love"');
  });

  it("lists credited Summit people in their other categories, but not as co-chair or producer cards", () => {
    const html = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={live} />);
    const directory = html.split('id="directory"')[1]!.split('id="producers"')[0]!;
    for (const name of ["Ryan Wolfington", "Trevor Short", "Jewel", "Steve Wozniak"]) expect(html).toContain(`<h3>${name}</h3>`);
    // Jewel and Steve Wozniak are keynotes (owner, Sept 21); producer-only credits stay out of the people sections.
    for (const name of ["Jewel", "Ryan Wolfington", "Steve Wozniak"]) expect(directory).toContain(`>${name}</h4>`);
    expect(directory).not.toContain(">Trevor Short</h4>");
    expect(directory).not.toMatch(/>Co-Chairs<\/h3>|>Producers<\/h3>|>Executive Producers<\/h3>/);
    expect(directory).not.toContain('aria-label="Participant year"');
    expect(directory).toContain("Jason Kennedy");
  });
});
