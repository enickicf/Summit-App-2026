import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PodcastsPage, { metadata } from "../app/awards/podcasts/page";
import { bySize, podcastFormats, podcasts2026 } from "./podcasts-2026";

// Owner (Oct 20): Podcasts page draft from the owner's confirmed list + Mackenzie Sol.
describe("Podcasts page", () => {
  const html = renderToStaticMarkup(<PodcastsPage />);
  it("lists every confirmed show and Mackenzie Sol as a creator", () => {
    for (const entry of podcasts2026) expect(html).toContain(entry.show.replace("&", "&amp;"));
    expect(html).toContain("Social media creator and interviewer");
    expect(podcasts2026.filter(entry => entry.kind === "podcast")).toHaveLength(7); // Inner Cosmos and Jst Us withdrawn; The Complex Trauma Podcast added
    expect(podcasts2026.map(entry => entry.show)).not.toContain("Inner Cosmos");
    expect(podcasts2026.find(entry => entry.show === "The Complex Trauma Podcast")?.hosts[0]?.name).toBe("Sarah Herstich");
    expect(podcasts2026.find(entry => entry.show === "The Complex Trauma Podcast")?.imagePosition).toBe("50% 24%");
    expect(html).toContain('object-position:50% 24%');
    expect(podcasts2026.some(entry => entry.show === "Jst Us")).toBe(false);
  });
  it("uses only the two formats and orders biggest first", () => {
    for (const entry of podcasts2026) for (const format of entry.formats) expect(podcastFormats).toContain(format);
    expect(bySize([{ show: "a", hosts: [], kind: "podcast", formats: [], audience: 5 }, { show: "b", hosts: [], kind: "podcast", formats: [], audience: 50 }, { show: "c", hosts: [], kind: "podcast", formats: [] }]).map(e => e.show)).toEqual(["b", "a", "c"]);
    const ranked = bySize(podcasts2026).map(entry => entry.show);
    expect(ranked.indexOf("Parenting With Psychology")).toBeLessThan(ranked.indexOf("The Complex Trauma Podcast"));
    expect(ranked.indexOf("The Complex Trauma Podcast")).toBeLessThan(ranked.indexOf("Coping with Ghosting"));
  });
  it("never shows the owner's internal notes and is not indexed", () => {
    for (const entry of podcasts2026) if (entry.internalNote) expect(html).not.toContain(entry.internalNote);
    expect(html).not.toMatch(/not yet replied|still to be booked/i);
    expect(metadata.robots).toMatchObject({ index: false });
  });
  it("links Dr. Cecelia's larger Instagram profile", () => {
    expect(podcasts2026.find(entry => entry.show === "Too Late To Pretend")?.links?.instagram).toBe("https://www.instagram.com/dr.cecelia/");
  });
  it("uses concise complete card summaries and no emoji-like decoration", () => {
    for (const entry of podcasts2026) {
      expect(entry.summary?.trim().endsWith(".")).toBe(true);
      expect(html).toContain(entry.summary!);
    }
    expect(html).not.toMatch(/[★→↗×]/u);
  });
  it("offers interview booking directly from every card", () => {
    expect(html.match(/>Request an interview<\/button>/g)).toHaveLength(podcasts2026.length);
    expect(html.match(/>View bio and links<\/span>/g)).toHaveLength(podcasts2026.length);
  });
});
