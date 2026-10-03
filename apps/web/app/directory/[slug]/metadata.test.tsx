import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { existingOwnerSiteUrl } from "../../../lib/site-metadata";
import { archiveProfile } from "./archive-profile";
import PersonPage, { generateMetadata } from "./page";

// Simulate the request boundary for direct function tests; Next supplies this
// React cache scope to generateMetadata and the page during a real render.
const requestScope = vi.hoisted(() => ({ values: new Map<unknown, unknown>() }));
vi.mock("react", async importOriginal => ({
  ...await importOriginal<typeof import("react")>(),
  cache: (read: () => unknown) => () => {
    if (!requestScope.values.has(read)) requestScope.values.set(read, read());
    return requestScope.values.get(read);
  }
}));
vi.mock("../../../lib/snapshot", () => ({ getSiteSnapshot: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }), notFound: () => { throw new Error("NEXT_HTTP_ERROR_FALLBACK;404"); } }));

const snapshot = vi.mocked(getSiteSnapshot);
const guest = event2026Snapshot.speakers.find(person => person.id === "20260000-0000-4000-8003-000000000007")!;
const propsFor = (slug: string, from?: string | string[]) => ({
  params: Promise.resolve({ slug }), searchParams: Promise.resolve(from === undefined ? {} : { from })
});

beforeEach(() => {
  requestScope.values.clear();
  snapshot.mockReset();
  snapshot.mockResolvedValue(event2026Snapshot);
  vi.stubEnv("SITE_URL", existingOwnerSiteUrl);
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("VERCEL_ENV", "production");
});
afterEach(() => { vi.unstubAllEnvs(); });

describe("Published profile metadata", () => {
  it("reflects the owner-approved Loni Love hosting credit only in current Awards context", async () => {
    const host = event2026Snapshot.speakers.find(person => person.name === "Loni Love")!;
    const props = propsFor(host.id, "awards");
    expect((await generateMetadata(props)).title).toEqual({ absolute: "Loni Love | Not Alone Awards 2026 Host" });
    expect((await generateMetadata(props)).alternates?.canonical).toContain("?from=awards");
    const html = renderToStaticMarkup(await PersonPage(props));
    expect(html).toContain("Host, Not Alone Awards 2026");
    expect(html).not.toContain("attendance does not confirm");
    expect(html).toContain('href="/awards/2026#directory"');
    expect((await generateMetadata(propsFor(host.id))).description).toContain("Summit attendance does not confirm");
  });
  it("replaces the reported generic title while keeping Awards entry context truthful", async () => {
    expect(guest).toBeDefined();
    const metadata = await generateMetadata(propsFor(guest.id, "awards"));
    expect(metadata.title).toEqual({ absolute: `${guest.name} | Not Alone Awards 2026` });
    expect(metadata.description).toContain("biography in the 2026 Not Alone Awards directory");
    expect(metadata.alternates?.canonical).toBe(`${existingOwnerSiteUrl}/directory/${guest.id}?from=awards`);
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({ title: `${guest.name} | Not Alone Awards 2026`, url: `${existingOwnerSiteUrl}/directory/${guest.id}?from=awards` });
    expect(metadata.twitter).toMatchObject({ title: `${guest.name} | Not Alone Awards 2026` });
  });

  it("shares one snapshot read with rendering and does not reuse it on the next request", async () => {
    const props = propsFor(guest.id, "awards");
    const [metadata, page] = await Promise.all([generateMetadata(props), PersonPage(props)]);
    expect(metadata.title).toEqual({ absolute: `${guest.name} | Not Alone Awards 2026` });
    expect(renderToStaticMarkup(page)).toContain(guest.name);
    expect(snapshot).toHaveBeenCalledOnce();
    requestScope.values.clear();
    snapshot.mockResolvedValue(null as never);
    const unavailable = await generateMetadata(propsFor(guest.id));
    expect(snapshot).toHaveBeenCalledTimes(2);
    expect(unavailable.robots).toMatchObject({ index: false });
    expect(JSON.stringify(unavailable)).not.toContain(guest.name);
  });

  it.each([null, { ...event2026Snapshot, event: { ...event2026Snapshot.event, directoryEnabled: false } }])("never indexes an unavailable or disabled profile", async unavailable => {
    snapshot.mockResolvedValue(unavailable as never);
    const props = propsFor(guest.id, "awards");
    const [metadata, page] = await Promise.all([generateMetadata(props), PersonPage(props)]);
    expect(metadata.title).toEqual({ absolute: "Guest details temporarily unavailable | Not Alone Summit" });
    expect(metadata.robots).toMatchObject({ index: false });
    expect(metadata.alternates?.canonical).toBeNull();
    expect(metadata.openGraph).toBeNull();
    expect(metadata.twitter).toBeNull();
    expect(renderToStaticMarkup(page)).toContain("Guest details temporarily unavailable");
    expect(JSON.stringify(metadata)).not.toContain(guest.name);
    expect(snapshot).toHaveBeenCalledOnce();
  });

  it("does not name or index unpublished or unconfirmed guests", async () => {
    for (const person of [{ ...guest, published: false }, { ...guest, name: "Unconfirmed person" }]) {
      requestScope.values.clear();
      snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [person] });
      const metadata = await generateMetadata(propsFor(guest.id));
      expect(metadata.title).toEqual({ absolute: "Profile not found | Not Alone Summit" });
      expect(metadata.robots).toMatchObject({ index: false });
      expect(metadata.alternates?.canonical).toBeNull();
      expect(JSON.stringify(metadata)).not.toContain(person.name);
    }
  });

  it("preserves preview noindex even for a published guest", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect((await generateMetadata(propsFor(guest.id))).robots).toEqual({ index: false, follow: false });
  });

  it.each(["https://unapproved.example/", ["awards", "summit"]])("does not reflect arbitrary return contexts into metadata: %j", async from => {
    const metadata = await generateMetadata(propsFor(guest.id, from));
    expect(metadata.alternates?.canonical).toBe(`${existingOwnerSiteUrl}/directory/${guest.id}`);
    expect(JSON.stringify(metadata)).not.toContain("unapproved.example");
  });

  it("omits unsafe portraits without guessing an image or breaking metadata", async () => {
    for (const headshotUrl of ["javascript:alert(1)", "data:image/png;base64,test", "https://user:secret@images.example/photo.jpg", "http://images.example/photo.jpg"]) {
      requestScope.values.clear();
      snapshot.mockResolvedValue({ ...event2026Snapshot, speakers: [{ ...guest, headshotUrl }] });
      expect((await generateMetadata(propsFor(guest.id))).openGraph).toMatchObject({ images: [] });
    }
  });
});

describe("Source-shared archive profile metadata", () => {
  it("keeps distinct 2025 Summit and Awards facts and canonical URLs without a live read", async () => {
    for (const context of ["summit", "awards"] as const) {
      const metadata = await generateMetadata(propsFor("2025-paul-dalio", context));
      const person = archiveProfile("2025-paul-dalio", context)!;
      expect(metadata.title).toEqual({ absolute: `Paul Dalio | Not Alone ${context === "awards" ? "Awards" : "Summit"} 2025 Archive` });
      expect(metadata.description).toContain(person.role);
      expect(metadata.description).not.toContain("2026");
      expect(metadata.alternates?.canonical).toBe(`${existingOwnerSiteUrl}/directory/2025-paul-dalio${context === "awards" ? "?from=awards" : ""}`);
      expect(metadata.openGraph).toMatchObject({ images: [{ url: `${existingOwnerSiteUrl}${person.image}`, alt: person.name }] });
    }
    expect(snapshot).not.toHaveBeenCalled();
  });

  it("keeps Awards-only profiles canonical to their real archive context", async () => {
    const awards = await generateMetadata(propsFor("2025-bishop-briggs", "awards"));
    expect(awards.title).toEqual({ absolute: "Bishop Briggs | Not Alone Awards 2025 Archive" });
    expect(awards.alternates?.canonical).toBe(`${existingOwnerSiteUrl}/directory/2025-bishop-briggs?from=awards`);
    const missing = await generateMetadata(propsFor("2025-bishop-briggs"));
    expect(missing.robots).toMatchObject({ index: false });
    expect(missing.title).toEqual({ absolute: "Profile not found | Not Alone Summit" });
    expect(missing.alternates?.canonical).toBeNull();
    expect(snapshot).not.toHaveBeenCalled();
  });
});
