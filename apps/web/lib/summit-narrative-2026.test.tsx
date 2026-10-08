import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { summitNarrative2026 } from "./summit-narrative-2026";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Owner (Oct 7, 2026): Ryan's approved narrative, Goals list and Jewel quote on the Summit 2026 home page only.
const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/'/g, "&#x27;").replace(/"/g, "&quot;");
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

describe("Summit 2026 narrative (Ryan, Oct 7)", () => {
  const summit2026 = renderToStaticMarkup(<OriginalSummitPage year={2026} />);
  const summit2025 = renderToStaticMarkup(<OriginalSummitPage year={2025} />);
  const awards2026 = renderToStaticMarkup(<OriginalAwardsPage year={2026} />);

  it("Ryan (Oct 8): the headline alone up top, then the paragraph and the Goals band after Who's Coming", () => {
    const intro = summit2026.slice(summit2026.indexOf('id="about"'), summit2026.indexOf('id="directory"'));
    expect(intro).toContain("A National Convening for");
    expect(intro).not.toContain("Powered by<strong>"); // the repeated credit and the logo are gone
    expect(intro).not.toContain("<p>");
    expect(summit2026).not.toContain("Building on the success of");
    const about = summit2026.slice(summit2026.indexOf('id="about-summit"'), summit2026.indexOf('id="goals"'));
    expect(summit2026.indexOf('id="about-summit"')).toBeGreaterThan(summit2026.indexOf("-attendees"));
    for (const paragraph of summitNarrative2026.intro) expect(about).toContain(`<p>${esc(paragraph)}</p>`);
    const goals = summit2026.slice(summit2026.indexOf('id="goals"'), summit2026.indexOf('id="jewel-quote"'));
    expect(text(goals)).toContain("Goals " + summitNarrative2026.goals.join(" "));
    expect(goals.match(/<li>/g)?.length).toBe(5);
    // The Awards sentence left the Summit page.
    expect(summit2026).not.toContain(esc(summitNarrative2026.awardsSentence));
  });

  it("features Jewel's quote right after the Goals band and before Our Partners; the no-solicitation notice is at the bottom", () => {
    const quote = summit2026.indexOf('id="jewel-quote"');
    expect(quote).toBeGreaterThan(summit2026.indexOf('id="goals"'));
    expect(quote).toBeLessThan(summit2026.indexOf('id="summit-partners"'));
    expect(summit2026.indexOf('id="no-solicitation"')).toBeGreaterThan(summit2026.indexOf('id="not-alone-program"'));
    const block = summit2026.slice(quote, summit2026.indexOf('id="no-solicitation"'));
    expect(block).toContain(`“${esc(summitNarrative2026.quote.text)}”`);
    expect(block).toContain("<footer>—Jewel</footer>");
  });

  it("Ryan (Oct 8): only the Awards sentence goes on the Awards page, right after the broadcast band; never the Goals or the quote; 2025 untouched", () => {
    const honor = awards2026.slice(awards2026.indexOf('id="awards-honor"'), awards2026.indexOf('id="mission"'));
    expect(awards2026.indexOf('id="awards-honor"')).toBeGreaterThan(awards2026.indexOf('id="broadcast"'));
    expect(honor).toContain(`<p>${esc(summitNarrative2026.awardsSentence)}</p>`);
    expect(awards2026).not.toContain('id="awards-narrative"');
    expect(awards2026).not.toContain("Celebrate mental-health warriors.");
    for (const paragraph of summitNarrative2026.intro) expect(awards2026).not.toContain(esc(paragraph));
    expect(awards2026).not.toContain('id="jewel-quote"');
    expect(awards2026).not.toContain(summitNarrative2026.quote.text.slice(0, 30));
    expect(summit2025).not.toContain('id="jewel-quote"');
    expect(summit2025).not.toContain("Bringing together the people shaping the future of mental health");
    expect(summit2025).toContain("Building on the success of");
  });
});
