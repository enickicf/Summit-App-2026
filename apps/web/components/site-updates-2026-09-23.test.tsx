import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "./original-event-page";
import { SummitNavigation } from "./summit-navigation";
import { AskAiWidget } from "./ask-ai-widget";
import { withAirtable } from "../lib/airtable-overlay";
import { isPostEvent, postEventAtUtc, postEventLabel } from "../lib/event-phase";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => route.pathname, useSearchParams: () => new URLSearchParams() }));

const live = await withAirtable(event2026Snapshot);
const summit = () => renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={live} />);
const awards = () => renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={live} program={publishedAwardsProgram(live)} />);

afterEach(() => { vi.useRealTimers(); });

// Owner (Sept 23): navigation rebuild, Donate sticker, floating Ask AI, one-line hero date, Founding
// Partners under Founders, "more to be announced" under Who's Coming, and the automatic post-event line.
describe("Sept 23 site updates", () => {
  it("Summit menu: Summit (2026 / 2025), Schedule, Directory (Who's Coming / Partners / Philanthropists), Venue, Awards, Donate sticker", () => {
    const html = renderToStaticMarkup(<SummitNavigation year={2026} pathname="/" />);
    const links = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(match => [match[1], match[2]!.replace(/<svg[\s\S]*?<\/svg>/, "")]);
    expect(links).toEqual([
      ["/", "Summit"], ["/", "2026"], ["/2025", "2025"],
      ["/schedule", "Schedule"],
      ["/partners", "Directory"], ["/#directory", "Who’s Coming"], ["/partners", "Partners"], ["/partners#philanthropists", "Philanthropists"],
      ["/venue", "Venue"], ["/awards/2026", "Awards"],
      ["https://www.inspiringchildren.org/donate", "Donate"]
    ]);
    expect(html).not.toContain("Ask AI");
    expect(html).toMatch(/class="[^"]*donateButton[^"]*"/); // ICF-style sticker, far right
    const archive = renderToStaticMarkup(<SummitNavigation year={2025} pathname="/2025" />);
    expect(archive).toContain('href="/2025#directory"');
    expect(archive).toContain('href="/partners/2025"');
    expect(archive.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("floating Ask AI widget shows on Summit and Awards pages, with an obvious launcher", () => {
    route.pathname = "/";
    const home = renderToStaticMarkup(<AskAiWidget />);
    expect(home).toContain('data-analytics-id="ask-ai-launcher"');
    expect(home).toContain("Ask AI");
    expect(home).toContain('aria-expanded="false"');
    route.pathname = "/ask-ai";
    expect(renderToStaticMarkup(<AskAiWidget />)).toBe("");
    route.pathname = "/awards/2026";
    expect(renderToStaticMarkup(<AskAiWidget />)).toContain('data-analytics-id="ask-ai-launcher"');
    route.pathname = "/";
  });

  it("Summit hero puts the date and venue on one line, Awards-style", () => {
    const html = summit();
    // Owner (Oct 8): date and venue are the subtitle under the headline band's headline.
    expect(html).toMatch(/<p class="[^"]*heroEyebrow[^"]*"><span class="[^"]*heroEyebrowDate[^"]*">November 2–4, 2026<\/span><span class="[^"]*heroDateVenue[^"]*">Wynn Las Vegas<\/span><\/p>/); // Oct 8: dates up top again
    expect(html).not.toContain("heroVenue");
  });

  // Owner (Oct 5): the Sept 23 "Founding Partners" block is replaced by "Our Partners" (components/event-partners.tsx):
  // Powered by (Cohen Foundation), Presented by (ICF x NAMI in one card) and Host venue (Wynn), in the same spot.
  it("Our Partners (Powered by Cohen / Presented by ICF x NAMI / Host venue Wynn) sit right under Founders on both sites", () => {
    const s = summit();
    const foundersAt = s.indexOf("-founders");
    const partnersAt = s.indexOf('id="summit-partners"');
    const attendeesAt = s.indexOf("-attendees");
    expect(foundersAt).toBeGreaterThan(-1);
    // Ryan (Oct 8): Attendees follow Founders; the partner block comes after the narrative, the Goals band and Jewel's quote.
    expect(attendeesAt).toBeGreaterThan(foundersAt);
    expect(s.indexOf('id="about-summit"')).toBeGreaterThan(attendeesAt);
    expect(s.indexOf('id="goals"')).toBeGreaterThan(s.indexOf('id="about-summit"'));
    expect(s.indexOf('id="jewel-quote"')).toBeGreaterThan(s.indexOf('id="goals"'));
    expect(partnersAt).toBeGreaterThan(s.indexOf('id="jewel-quote"'));
    expect(s).toContain("cohen-foundation-give.png");
    expect(s).toContain("/2026-partners/nami.png");
    expect(s).toContain("/images/icf-logo.webp");
    expect(s).toContain("/images/wynn-las-vegas-logo.png");
    const a = awards();
    const founders = a.indexOf('aria-label="Founders"');
    const partners = a.indexOf('id="awards-partners"');
    expect(founders).toBeGreaterThan(-1);
    expect(partners).toBeGreaterThan(founders);
    expect(partners).toBeLessThan(a.indexOf('id="awards-host"'));
    expect(a).toContain("cohen-foundation-give-white.png");
    expect(a).toContain("nami-white.png");
    expect(a).toContain("/images/wynn-las-vegas-logo.png");
    for (const html of [s, a]) {
      const block = html.slice(html.indexOf('id="summit-partners"') >= 0 ? html.indexOf('id="summit-partners"') : html.indexOf('id="awards-partners"'));
      expect(block).toMatch(/>Our Partners<\/h[23]>/);
      expect(block).toMatch(/>Powered by<\/span>[^]*?>Presented by<\/span>[^]*?alt="Inspiring Children Foundation"[^]*?>×<\/span>[^]*?alt="NAMI, National Alliance on Mental Illness"[^]*?>Host venue<\/span>/);
      expect(html).not.toMatch(/Founding Partners|community partner/i);
      expect(html).not.toContain('id="founding-partners"');
    }
  });

  it("says more talent and guests are to be announced right under Who's Coming, as on the Awards site", () => {
    const s = summit();
    const heading = s.indexOf("Who&#x27;s Coming</h2>");
    expect(heading).toBeGreaterThan(-1);
    const after = s.slice(heading, heading + 400);
    expect(after).toContain("More talent and guests to be announced.");
    expect(s.match(/More talent and guests to be announced\./g)).toHaveLength(1);
    expect(awards()).toContain("More talent and guests to be announced.");
  });

  it("Awards page: 'Producer' (Ryan Oz, Deb Cullen) sits above 'Producers', and Deb is not repeated below", () => {
    const a = awards();
    const producers = a.slice(a.indexOf('id="producers"'));
    const producer = producers.indexOf("<h2>Producer</h2>");
    const producersHeading = producers.indexOf("<h2>Producers</h2>");
    expect(producer).toBeGreaterThan(-1);
    expect(producersHeading).toBeGreaterThan(producer);
    const block = producers.slice(producer, producersHeading);
    expect(block).toContain("<h3>Ryan Oz</h3>");
    expect(block).toContain("<h3>Deb Cullen</h3>");
    expect(producers.slice(producersHeading).match(/Deb Cullen/g)).toBeNull();
    expect(summit()).not.toContain("<h2>Producer</h2>"); // Summit page unchanged
  });

  it("Awards gallery: everyone, photo or not, is one equal square in the same grid (no separate name list)", () => {
    const a = awards();
    expect(a).not.toContain('aria-label="Founders names"');
    expect(a).not.toContain('aria-label="Lineup names"');
    const founders = a.slice(a.indexOf('aria-label="Founders"'), a.indexOf('id="awards-partners"'));
    // Owner (Oct 5): the McGraws are two individual Founder cards; Oct 7: each with the owner's own headshot, never a composite.
    expect(founders).toMatch(/jay-mcgraw-2\.jpg[^]*?<h3>Jay McGraw<\/h3>/);
    expect(founders).toMatch(/erica-mcgraw-2\.jpg[^]*?<h3>Erica McGraw<\/h3>/);
    expect(founders).not.toMatch(/aria-hidden="true">(JM|EM)<\/span>/);
    expect(founders).not.toMatch(/Jay &amp; Erica McGraw|jay-erica-mcgraw/);
    expect(founders.match(/data-awards-guest=/g)?.length).toBeGreaterThan(10);
  });

  it("switches both 2026 heroes to the 2027 line from November 6, 2026 (Pacific) without a deploy", () => {
    expect(isPostEvent(postEventAtUtc - 1)).toBe(false);
    expect(isPostEvent(postEventAtUtc)).toBe(true);
    expect(new Date(postEventAtUtc).toISOString()).toBe("2026-11-06T07:00:00.000Z");
    vi.useFakeTimers({ now: new Date("2026-11-05T12:00:00Z") });
    expect(summit()).not.toContain(postEventLabel);
    expect(awards()).not.toContain(postEventLabel);
    vi.useFakeTimers({ now: new Date("2026-11-06T15:00:00Z") });
    const s = summit(); const a = awards();
    expect(s).toContain("2027 — To Be Announced Soon.");
    expect(a).toContain("2027 — To Be Announced Soon.");
    expect(s.match(/<p class="[^"]*heroEyebrow[^"]*">([\s\S]*?)<\/p>/)?.[1]).toBe("2027 — To Be Announced Soon.");
  });
});
