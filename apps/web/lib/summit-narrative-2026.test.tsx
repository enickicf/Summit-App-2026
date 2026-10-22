import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { summitNarrative2026, summitStatementShown } from "./summit-narrative-2026";

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
    // Owner (Oct 22): the statement is switched off until Oct 23, 4:45 PM PT; while off it must not appear at all.
    if (summitStatementShown) {
      const about = summit2026.slice(summit2026.indexOf('id="about-summit"'), summit2026.indexOf('id="goals"'));
      expect(summit2026.indexOf('id="about-summit"')).toBeGreaterThan(summit2026.indexOf("-attendees"));
      // Owner (Oct 8): the opening phrase is bold blue; the words themselves stay exactly Ryan's.
      for (const paragraph of summitNarrative2026.intro) expect(about.replace(/<\/?strong[^>]*>/g, "")).toContain(`<p>${esc(paragraph)}</p>`);
      expect(about).toMatch(/<p><strong class="[^"]*narrativeLede[^"]*">Bringing together the people shaping the future of mental health<\/strong>—clinical experts/);
    } else {
      expect(summit2026).not.toContain('id="about-summit"');
      expect(summit2026).not.toContain("Bringing together the people shaping the future of mental health");
    }
    const goals = summit2026.slice(summit2026.indexOf('id="goals"'), summit2026.indexOf('id="jewel-quote"'));
    expect(text(goals)).toContain("Goals " + summitNarrative2026.goals.map((goal, i) => `0${i + 1} ${goal}`).join(" ")); // Oct 8: numbered columns
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
    // Owner (Oct 8, latest): the sentence has its own band right under the hero, before the broadcast band.
    const honor = awards2026.slice(awards2026.indexOf('id="awards-honor"'), awards2026.indexOf('id="broadcast"'));
    expect(awards2026.indexOf('id="awards-honor"')).toBeGreaterThan(awards2026.indexOf('id="awards-program"'));
    expect(awards2026.indexOf('id="awards-honor"')).toBeLessThan(awards2026.indexOf('id="broadcast"'));
    expect(honor.indexOf("Through the Not Alone Awards,")).toBeGreaterThan(-1);
    // Owner (Oct 8): presented like a slide, the opening phrase in bold; the words unchanged.
    expect(honor.replace(/<[^>]+>/g, "")).toContain(esc(summitNarrative2026.awardsSentence));
    // Owner (Oct 8): exact wording (no "everyday" before "warriors").
    expect(summitNarrative2026.awardsSentence).toBe("Through the Not Alone Awards, we honor the pioneers, advocates, and warriors who fight for mental health every day.");
    expect(honor).toMatch(/<p><strong class="[^"]*">Through the Not Alone Awards,<\/strong> we honor the pioneers/);
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

describe("Awards mission wording (owner, Oct 8)", () => {
  it("says \"The awards show was created…\" on the 2026 page", () => {
    const html = renderToStaticMarkup(<OriginalAwardsPage year={2026} />);
    expect(html).toContain("<p>The awards show was created to celebrate the pioneers of human development and mental health");
    expect(html).not.toContain("The award show was created");
  });
});
