import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { OriginalSummitPage } from "./original-event-page";
import PartnersPage from "../app/partners/2025/page";
import { summitPartnerTiers } from "../lib/summit-partners";
import { SummitVideo, summit2025Video } from "./summit-video";
import { summit2025Recap } from "../lib/content";
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe("Summit-only refresh", () => {
  it("opens on last year's Summit recap (muted, looping, no controls) instead of the photo-frame clips", () => {
    const background = renderToStaticMarkup(<SummitVideo background />);
    // Owner (Sept 21, late): no still frame at all. The hero opens on a plain brand color and the film
    // cross-fades in once it is really playing.
    expect(background).not.toContain("hero-summit-start.jpg");
    expect(background).toContain("background:#4a5faa");
    expect(background).not.toContain("maxres");
    expect(background).toContain('rel="preconnect" href="https://www.youtube-nocookie.com"');
    expect(background).not.toMatch(/hero-(jewel|woz|cherrial)\.mp4/);
    expect(background).not.toContain(summit2025Video);
    expect(background).not.toMatch(/<button|Pause background|Play background/);
  });
  it("keeps the 2025 partners page as ICF's four tiers with a Partner with us link instead of a form", () => {
    const html = renderToStaticMarkup(<PartnersPage />);
    expect(summitPartnerTiers.map(tier => tier.title)).toEqual(["Presenting Sponsor", "Premier Sponsor", "Inaugural Sponsors", "Nonprofit Sponsors"]);
    for (const tier of summitPartnerTiers) for (const partner of tier.partners) expect(html).toContain(`alt="${partner.name.replaceAll("&", "&amp;")}"`);
    expect(html).toContain('href="https://www.inspiringchildren.org/summit-partners"');
    // Owner (Sept 29, 2026): Fury Co withdrew as a sponsor and is not listed.
    expect(summitPartnerTiers.flatMap(tier => tier.partners.map(partner => partner.name))).not.toContain("Fury Co");
    expect(html).not.toContain("Fury");
    expect(html).toContain("Interested in Becoming Our Partner?");
    expect(html).not.toMatch(/<form|<input|<textarea/);
    expect(html).not.toContain("Villa Bibbiani");
    expect(html).not.toMatch(/srsltid|gclid|gad_source/);
  });
  it("gives both years the Awards-style hero over the 2025 recap, with no heart art or video buttons", () => {
    const archive = renderToStaticMarkup(<OriginalSummitPage year={2025} />);
    const current = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />);
    const hero = (html: string) => html.slice(html.indexOf("<section"), html.indexOf("</section>"));
    for (const html of [archive, current]) {
      expect(hero(html)).not.toContain("hero-summit-start.jpg");
      expect(hero(html)).toContain("background:#4a5faa");
      expect(hero(html)).not.toContain(summit2025Recap.posterUrl);
      expect(hero(html)).toContain("summit-logo.png"); // full-resolution hero logo (audit, Sept 21)
      expect(hero(html)).toContain("Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong>");
      expect(hero(html)).not.toMatch(/Highlights<\/a>|heroArt/);
    }
    expect(hero(current)).toContain('href="#schedule">Schedule</a>');
    // Owner (Sept 21): the recap player section is removed for now.
    expect(archive).not.toContain('id="summit-highlights"');
  });
  it("has one main directory and one listing for each curated person, including production and chairs", () => {
    const html = renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />);
    expect(html.match(/id="directory"/g)).toHaveLength(1);
    // Owner (Sept 21): Jewel appears as co-chair, producer and in her other categories (musician, founder).
    expect(html.match(/>Jewel<\/h[34]>/g)!.length).toBeGreaterThanOrEqual(3);
    expect(html.indexOf("<h2>Producers</h2>")).toBeLessThan(html.indexOf("<h2>Executive Producers</h2>"));
    expect(html).not.toContain('id="summit-film"');
    // Owner (Sept 21): the film section is only the recap, large; no extra buttons or copy.
    expect(html).not.toContain('Watch the 2025 Awards highlights');
    expect(html).not.toContain("Davos of Human Development");
    expect(html).toContain("na-summit-logo-black-2.png");

    expect(html).not.toContain("Meet the people");
    expect(html).not.toContain('id="partners"');
    expect(html).not.toContain('id="venue"');
    expect(html).not.toContain("Explore the Summit</nav>");
    expect(html).not.toContain("Bianca Mok");
  });
});

describe("2025 Highlights (owner, Sept 21)", () => {
  it("plays the highlight film on the page, big, under a plain '2025 Highlights' title, on every Original page", () => {
    for (const html of [renderToStaticMarkup(<OriginalSummitPage year={2025} />), renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />)]) {
      const section = html.slice(html.indexOf('id="highlights"'), html.indexOf("</section>", html.indexOf('id="highlights"')));
      expect(section).toContain('<h2 id="highlights-title">2025 Highlights</h2>');
      expect(section).toContain('aria-label="Play the 2025 Not Alone Summit highlights"');
      expect(section).not.toMatch(/href=|youtube\.com\/watch|<iframe/); // no trip off the site before play
      expect(section).not.toContain("maxresdefault"); // YouTube's default still shows Villa Bibbiani
      expect(html.indexOf('id="highlights"')).toBeLessThan(html.indexOf('id="leadership"'));
    }
  });
});
