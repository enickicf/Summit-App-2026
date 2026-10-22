import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { publishedAwardsProgram } from "@not-alone/domain";
import { OriginalAwardsPage, OriginalSummitPage } from "../components/original-event-page";
import { withAirtable } from "./airtable-overlay";
import { speakerViewsNotice2026 } from "./speaker-views-notice-2026";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

// Ryan (Oct 22, 2026): the Summit's nonpartisan notice, in his own words, "Underneath associate producers".
describe("speaker views notice (Ryan, Oct 22)", async () => {
  const snapshot = await withAirtable(event2026Snapshot);
  const pages = {
    summit: renderToStaticMarkup(<OriginalSummitPage year={2026} snapshot={snapshot} />),
    awards: renderToStaticMarkup(<OriginalAwardsPage year={2026} snapshot={snapshot} program={publishedAwardsProgram(snapshot)} />)
  };
  const readable = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&apos;|&#39;/g, "'").replace(/\s+/g, " ");

  for (const [page, html] of Object.entries(pages)) {
    it(`carries all three of Ryan's paragraphs word for word on the ${page} page`, () => {
      for (const paragraph of speakerViewsNotice2026.paragraphs) expect(readable(html)).toContain(paragraph);
    });

    it(`places it under the producer credits on the ${page} page, not above them`, () => {
      const lastCredit = html.lastIndexOf("Associate Producers");
      expect(lastCredit).toBeGreaterThan(-1);
      expect(html.indexOf(speakerViewsNotice2026.paragraphs[0]!)).toBeGreaterThan(lastCredit);
    });

    it(`reads as a notice on the ${page} page: a label and the views sentence set apart`, () => {
      expect(readable(html)).toContain(speakerViewsNotice2026.label);
      expect(html).toContain("speakerNoticeLead");
    });
  }

  it("never softens Ryan's wording", () => {
    const text = readable(pages.summit);
    expect(text).toContain("The Summit is nonpartisan.");
    expect(text).toContain("does not constitute endorsement of any individual's political views, affiliations, candidates, or activities.");
  });
});
