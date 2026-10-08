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

  it("shows the two intro paragraphs word for word, then the Goals list in order, inside the intro column", () => {
    const about = summit2026.slice(summit2026.indexOf('id="about"'), summit2026.indexOf('id="jewel-quote"'));
    for (const paragraph of summitNarrative2026.intro) expect(about).toContain(`<p>${esc(paragraph)}</p>`);
    expect(about).not.toContain("Building on the success of");
    expect(about).not.toContain("premier national convening");
    expect(text(about)).toContain("Goals " + summitNarrative2026.goals.join(" "));
    expect(about.match(/<li>/g)?.length).toBe(5);
    // The Cohen credit beside the intro is untouched.
    expect(about).toContain("Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong>");
  });

  it("features Jewel's quote as a pull-quote right under the introduction, before the no-solicitation notice", () => {
    const quote = summit2026.indexOf('id="jewel-quote"');
    expect(quote).toBeGreaterThan(summit2026.indexOf('id="about"'));
    expect(quote).toBeLessThan(summit2026.indexOf('id="no-solicitation"'));
    const block = summit2026.slice(quote, summit2026.indexOf('id="no-solicitation"'));
    expect(block).toContain(`“${esc(summitNarrative2026.quote.text)}”`);
    expect(block).toContain("<footer>—Jewel</footer>");
  });

  it("leaves the 2025 archive and the Awards page without the new text", () => {
    for (const html of [summit2025, awards2026]) {
      expect(html).not.toContain('id="jewel-quote"');
      expect(html).not.toContain("Bringing together the people shaping the future of mental health");
      expect(html).not.toContain("Celebrate mental-health warriors.");
    }
    expect(summit2025).toContain("Building on the success of");
  });
});
