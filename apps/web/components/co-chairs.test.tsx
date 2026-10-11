import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { confirmedSummitGuests2026 } from "@not-alone/config";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import type { EventSnapshot } from "@not-alone/validation";
import { directoryPeople } from "../lib/people";
import { OriginalAwardsPage, OriginalSummitPage } from "./original-event-page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

describe.each([
  { site: "Awards", Page: OriginalAwardsPage },
  { site: "Summit", Page: OriginalSummitPage }
])("$site co-chair credits", ({ Page }) => {
  const render = (snapshot: EventSnapshot | null = event2026Snapshot) => decodeURIComponent(renderToStaticMarkup(<Page year={2026} snapshot={snapshot} />));

  it("includes Cherrial once alongside the existing chairs with her owner-supplied portrait and credit", () => {
    const snapshot = structuredClone(event2026Snapshot);
    const before = structuredClone(snapshot);
    const html = render(snapshot);
    const section = html.match(/<section[^>]*id="leadership"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "";
    expect([...section.matchAll(/<h3>(.*?)<\/h3>/g)].map(match => match[1])).toEqual(["Steve Wozniak", "Jewel", "Cherrial Odell"]);
    expect(section).toContain("<h2>Co-Chairs</h2>");
    expect(section).toContain("<h3>Cherrial Odell</h3><p>ICF Alumni<br/>Stanford Graduate, and Founder of Wellness Buddies</p>"); // owner, Oct 11: ICF alumni read "ICF Alumni" with their title underneath
    // Owner-supplied photo (Sept 21) replaces the ICF cutout.
    expect(section.match(/<img[^>]*alt="Cherrial Odell"[^>]*>/)?.[0]).toContain("cherrial-odell-2-c.jpg");
    expect(html.replace(section, "")).not.toContain("Cherrial Odell");
    expect(directoryPeople(snapshot).map(person => person.name)).not.toContain("Cherrial Odell");
    expect(confirmedSummitGuests2026).not.toContain("Cherrial Odell");
    expect(snapshot).toEqual(before);
  });

  it.each(["unavailable", "disabled", "empty"])("does not bypass an %s directory", state => {
    const snapshot = structuredClone(event2026Snapshot);
    if (state === "disabled") snapshot.event.directoryEnabled = false;
    if (state === "empty") snapshot.speakers = [];
    expect(render(state === "unavailable" ? null : snapshot)).not.toContain("Cherrial Odell");
  });

  it("honors an explicitly unpublished current record", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers.push({ ...snapshot.speakers[0]!, id: "co-chair-odell", name: "Cherrial Odell", published: false });
    expect(render(snapshot)).not.toContain("Cherrial Odell");
  });

  it("does not mistake another event's hidden record for a current withdrawal", () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers.push({ ...snapshot.speakers[0]!, id: "co-chair-odell", name: "Cherrial Odell", eventId: "another-event", published: false });
    expect(render(snapshot)).toContain("<h3>Cherrial Odell</h3>");
  });
});
