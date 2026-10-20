import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PodcastsPage, { metadata } from "../app/awards/podcasts/page";
import { podcasts2026 } from "./podcasts-2026";

// Owner (Oct 20): Podcasts page draft from the owner's confirmed list + Mackenzie Sol.
describe("Podcasts page", () => {
  const html = renderToStaticMarkup(<PodcastsPage />);
  it("lists every confirmed show and Mackenzie Sol as a creator", () => {
    for (const entry of podcasts2026) expect(html).toContain(entry.show.replace("&", "&amp;"));
    expect(html).toContain("Social media creator and interviewer");
    expect(podcasts2026.filter(entry => entry.kind === "podcast")).toHaveLength(8);
  });
  it("never shows the owner's internal notes and is not indexed", () => {
    for (const entry of podcasts2026) if (entry.internalNote) expect(html).not.toContain(entry.internalNote);
    expect(html).not.toMatch(/not yet replied|still to be booked/i);
    expect(metadata.robots).toMatchObject({ index: false });
  });
});
