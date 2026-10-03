import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { originalProducerCredits } from "@not-alone/config";
import source from "../../../lib/original-sites.json";
import { summit2025Directory, summit2025Leadership } from "../../../lib/content";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { archiveProfile } from "./archive-profile";
import PersonPage from "./page";
import ProfileNotFound from "./not-found";
import { ProfilePortrait } from "./portrait";

vi.mock("../../../lib/snapshot", () => ({ getSiteSnapshot: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));

const snapshot = vi.mocked(getSiteSnapshot);
const slugFor = (name: string) => `2025-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
const renderProfile = async (slug: string, from?: string | string[]) => renderToStaticMarkup(await PersonPage({
  params: Promise.resolve({ slug }), searchParams: Promise.resolve(from === undefined ? {} : { from })
}));

beforeEach(() => { snapshot.mockReset(); snapshot.mockResolvedValue(event2026Snapshot); });

describe("source-faithful archive profiles", () => {
  it("preserves every captured name, exact role, and category in each event's archive", () => {
    for (const context of ["summit", "awards"] as const) {
      for (const section of source[context].sections) {
        for (const person of section.people) {
          const profile = archiveProfile(slugFor(person.name), context);
          expect(profile?.name).toBe(person.name);
          expect(profile?.role).toContain(person.role);
          expect(profile?.categories).toContain(section.title);
          expect(profile?.year).toBe(2025);
          expect(profile?.bio).toBe("");
          // Owner-updated portraits (e.g. Rachel Platten, Sept 21) replace the ICF photo.
          expect(profile?.image).toMatch(/^\/original-2025\//);
        }
      }
    }
  });

  it("retains historical leadership and the original producer list without replacing other archive facts", () => {
    for (const group of summit2025Leadership) {
      for (const person of group.people) {
        const profile = archiveProfile(slugFor(person.name), "summit");
        expect(profile?.role).toContain(person.role);
        expect(profile?.categories).toContain(group.title);
      }
    }
    for (const context of ["summit", "awards"] as const) {
      for (const person of originalProducerCredits) {
        const profile = archiveProfile(slugFor(person.name), context);
        expect(profile?.role).toContain(person.role);
        expect(profile?.categories).toContain(person.category);
      }
      for (const group of summit2025Directory.filter(group => /Producers/.test(group.title))) {
        for (const person of group.people) expect(archiveProfile(slugFor(person.name), context)?.role).toContain(person.role);
      }
    }
    expect(archiveProfile("2025-jewel", "summit")?.categories).toEqual(expect.arrayContaining(["Founders", "Musicians", "Executive Producers"]));
    expect(archiveProfile("2025-sara-alajbegovic", "summit")?.categories).toEqual(["ICF Alumni"]);
  });

  it("does not mix conflicting Summit and Awards affiliations or invent Awards-only Summit entries", () => {
    expect(archiveProfile("2025-paul-dalio", "summit")?.role).toBe("Filmmaker, Author, Musician");
    expect(archiveProfile("2025-paul-dalio", "awards")?.role).toBe("Lived Experience Expert");
    expect(archiveProfile("2025-bishop-briggs", "awards")?.name).toBe("Bishop Briggs");
    expect(archiveProfile("2025-bishop-briggs", "summit")).toBeUndefined();
  });

  it("renders without requesting current data, including during a current-directory outage", async () => {
    snapshot.mockResolvedValue(null as never);
    const html = await renderProfile("2025-sara-alajbegovic");
    expect(snapshot).not.toHaveBeenCalled();
    expect(html).toContain("2025 Summit archive");
    expect(html).toContain('href="/2025#directory"');
    expect(html).toContain("ICF Alumni");
    expect(html).not.toContain("Attendees");
    expect(html).not.toContain("2026 Summit");
  });

  it("keeps an Awards archive back link and resolves Awards-only profiles", async () => {
    const html = await renderProfile("2025-bishop-briggs", "awards");
    expect(html).toContain("2025 Awards archive");
    expect(html).toContain('href="/awards/2025"');
    expect(html).not.toContain("Confirmed Summit attendance");
    expect(snapshot).not.toHaveBeenCalled();
  });

  it("returns a real not-found for unknown archive slugs even if current data is unavailable", async () => {
    snapshot.mockResolvedValue(null as never);
    await expect(renderProfile("2025-does-not-exist")).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(snapshot).not.toHaveBeenCalled();
  });
});

describe("reviewed 2026 profiles", () => {
  const guest = event2026Snapshot.speakers.find(person => person.name === "Mike Tyson")!;
  const producer = event2026Snapshot.speakers.find(person => person.name === "Ryan Wolfington")!;

  it("returns approved current producers to Awards production, without changing Summit or archive navigation", async () => {
    const confirmedProducers = event2026Snapshot.speakers.filter(person => originalProducerCredits.some(credit => credit.name === person.name));
    expect(confirmedProducers).toContainEqual(producer);
    for (const person of confirmedProducers.filter(person => person.name !== "Jewel")) {
      const html = await renderProfile(person.id, "awards");
      expect(html).toContain('href="/awards/2026#producers"');
      expect(html).toContain("Back to 2026 Awards production");
      expect(html).not.toContain('href="/awards/2026#directory"');
    }
    const chair = event2026Snapshot.speakers.find(person => person.name === "Jewel")!;
    expect(await renderProfile(chair.id, "awards")).toContain('href="/awards/2026#leadership"');
    const summit = await renderProfile(producer.id);
    expect(summit).toContain('href="/#directory"');
    expect(summit).toContain("Back to 2026 directory");
    const archive = await renderProfile("2025-ryan-wolfington", "awards");
    expect(archive).toContain('href="/awards/2025"');
    expect(archive).toContain("Back to 2025 Awards archive");
  });

  it("uses approved producer identity, not a generic or unapproved published role, for the return destination", async () => {
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...producer, role: "Confirmed 2026 summit guest", directoryCategories: ["Attendees"] }] });
    expect(await renderProfile(producer.id, "awards")).toContain('href="/awards/2026#producers"');
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...guest, role: "Executive Producer", directoryCategories: ["Executive Producers"] }] });
    const nonProducer = await renderProfile(guest.id, "awards");
    expect(nonProducer).toContain('href="/awards/2026#directory"');
    expect(nonProducer).not.toContain('href="/awards/2026#producers"');
  });

  it("suppresses only categories that repeat the role, including plural, case and whitespace variants", async () => {
    for (const role of ["Executive Producer", " executive   producers "]) {
      snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...producer, role, directoryCategories: ["Executive Producers", "Experts"] }] });
      const html = await renderProfile(producer.id);
      expect(html).not.toContain("Executive Producers");
      expect(html).toContain(">Experts</p>");
      expect(html).toContain(`<p class="profileRole">${role}</p>`);
    }
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...producer, role: "Producer", directoryCategories: ["Executive Producers", "Producers"] }] });
    expect(await renderProfile(producer.id)).toContain(">Executive Producers</p>");
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...producer, role: "Executive Producer and Founder", directoryCategories: ["Executive Producers"] }] });
    expect(await renderProfile(producer.id)).toContain(">Executive Producers</p>");
  });

  it("renders only published data and keeps Awards attendance distinct from Awards roles", async () => {
    const html = await renderProfile(guest.id, "awards");
    expect(html).toContain("Mike Tyson");
    expect(html).toContain("Hall of Fame Boxer");
    expect(html).toContain('class="profileBio"');
    expect(html).toContain('href="/awards/2026#directory"');
    expect(html).toContain("Confirmed Summit attendance does not confirm an Awards appearance, performance, or honor.");
    expect(html).not.toContain("2025 Awards archive");
  });

  it("does not use archived entries to fill an unpublished or unconfirmed current profile", async () => {
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: event2026Snapshot.speakers.map(person => ({ ...person, published: false })) });
    await expect(renderProfile(guest.id)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...guest, name: "Unconfirmed guest" }] });
    await expect(renderProfile(guest.id)).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("distinguishes a disabled or unavailable directory from a missing guest", async () => {
    for (const unavailable of [null, { ...event2026Snapshot, event: { ...event2026Snapshot.event, directoryEnabled: false } }]) {
      snapshot.mockResolvedValue(unavailable as never);
      const html = await renderProfile(guest.id, "awards");
      expect(html).toContain("Guest details temporarily unavailable");
      expect(html).toContain(`href="/directory/${encodeURIComponent(guest.id)}?from=awards"`);
      expect(html).toContain('href="/awards/2026#directory"');
      expect(html).not.toContain("Mike Tyson");
      expect(html).not.toContain('href="/schedule"');
      expect(html).not.toContain("Current event updates");
    }
  });

  it("uses the sourced public summary when the published biography is empty", async () => {
    snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...guest, bio: "  " }] });
    const html = await renderProfile(guest.id);
    expect(html).toContain('class="profileBio"');
    expect(html).toContain('href="/#directory"');
  });

  it("ignores arbitrary or repeated return contexts instead of accepting a return URL", async () => {
    for (const from of ["https://example.com", ["awards", "summit"]]) {
      const html = await renderProfile(guest.id, from);
      expect(html).toContain('href="/#directory"');
      expect(html).not.toContain("https://example.com");
      expect(html).not.toContain('href="/awards/2026#directory"');
    }
  });

  it("provides working edition choices for a missing profile", () => {
    const html = renderToStaticMarkup(<ProfileNotFound />);
    for (const href of ["/#directory", "/awards/2026#directory", "/2025#directory", "/awards/2025"]) expect(html).toContain(`href="${href}"`);
    expect(html).toContain("Profile not found");
  });

  it("exposes exactly one focusable skip-link target in every profile state", async () => {
    const current = await renderProfile(guest.id);
    const archive = await renderProfile("2025-jewel");
    snapshot.mockResolvedValue(null as never);
    const unavailable = await renderProfile(guest.id);
    const notFound = renderToStaticMarkup(<ProfileNotFound />);
    for (const html of [current, archive, unavailable, notFound]) {
      expect(html.match(/<main\b/g)).toHaveLength(1);
      expect(html.match(/id="main-content"/g)).toHaveLength(1);
      expect(html).toContain('id="main-content" tabindex="-1"');
    }
  });

  it("uses a decorative portrait or initials without repeating the adjacent name", () => {
    const fallback = renderToStaticMarkup(<ProfilePortrait name="Mike Tyson" />);
    expect(fallback).toContain("MT");
    expect(fallback).toContain('aria-hidden="true"');
    expect(fallback).not.toContain("<img");
    const image = renderToStaticMarkup(<ProfilePortrait name="Mike Tyson" image="/headshot.jpg" />);
    expect(image).toContain('alt=""');
    expect(image).toContain('width="500" height="500"');
  });
});
