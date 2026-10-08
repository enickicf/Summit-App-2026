import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "./original-event-page";
import { PoweredBy, stackedFoundationName } from "./powered-by";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Owner (Oct 8, 2026): the Cohen credit is stacked — "Powered by" as a small label over "Steven & Alexandra" /
// "Cohen Foundation" — in the 2026 Summit and Awards heroes, so it no longer runs as one long line on wide screens.
describe("stacked Powered by credit (owner, Oct 8)", () => {
  const stacked = "Powered by<strong>Steven &amp; Alexandra<br/>Cohen Foundation</strong>";
  const hero = (html: string, title: string) => html.match(new RegExp(`<section[^>]*aria-labelledby="${title}"[^>]*>([\\s\\S]*?)<\\/section>`))![1]!;

  it("breaks the foundation's name into two balanced lines without changing the words", () => {
    expect(stackedFoundationName()).toEqual(["Steven & Alexandra", "Cohen Foundation"]);
    expect(stackedFoundationName("Some Other Foundation")).toEqual(["Some Other Foundation"]);
    const html = renderToStaticMarkup(<PoweredBy className="credit" />);
    expect(html).toBe(`<p class="credit">${stacked}</p>`);
    expect(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()).toBe("Powered by Steven &amp; Alexandra Cohen Foundation");
  });

  it("is the credit under the logo in both 2026 heroes and on every Awards copy; the 2025 Awards hero is unchanged", () => {
    const program = publishedAwardsProgram(event2026Snapshot)!;
    const summit = hero(renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={event2026Snapshot} />), "summit-title");
    const awards = hero(renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} program={program} />), "awards-title");
    const nami = hero(renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={event2026Snapshot} program={program} rsvpUrl="https://notaloneawards.org/rsvp/nami-9wvfjfkt40dd" />), "awards-title");
    for (const html of [summit, awards, nami]) {
      expect(html).toContain(stacked);
      expect(html.match(/Powered by/g)).toHaveLength(1);
      expect(html.indexOf("</h1>")).toBeLessThan(html.indexOf("Powered by<strong>"));
    }
    const archive = hero(renderToStaticMarkup(<OriginalAwardsPage year={2025} snapshot={event2026Snapshot} program={program} />), "awards-title");
    expect(archive).toContain("Powered by<strong>Steven &amp; Alexandra Cohen Foundation</strong>");
  });
});
