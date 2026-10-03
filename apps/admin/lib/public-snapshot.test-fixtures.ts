import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";

const id = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, "0")}`;

export function mixedPublicSnapshot() {
  const snapshot = structuredClone(event2026Snapshot);
  const person = snapshot.speakers[0]!;
  snapshot.speakers = [
    { ...person, roleSource: "private-editorial-marker" },
    { ...snapshot.speakers[1]!, published: false },
    { ...snapshot.speakers[2]!, eventId: "other-event" },
    { ...person, id: id(1), name: "Unconfirmed Person" }
  ];
  snapshot.event.featuredPeople = snapshot.speakers.map(speaker => ({ name: speaker.name, role: speaker.role, group: "Attendees" }));
  const session = snapshot.scheduleItems[0]!;
  snapshot.scheduleItems = [
    { ...session, speakerIds: snapshot.speakers.map(speaker => speaker.id), eligibilityScope: { id: "founders", label: "Founders only" } },
    { ...session, id: id(2), title: "private-session-marker", visibilityScope: { id: "staff", label: "Staff only" } },
    { ...session, id: id(3), title: "unpublished-session-marker", published: false },
    { ...session, id: id(4), title: "foreign-session-marker", eventId: "other-event" }
  ];
  snapshot.locations.push({ ...snapshot.locations[0]!, id: id(5), eventId: "other-event", name: "foreign-location-marker" });
  snapshot.faqs.push({ ...snapshot.faqs[0]!, id: id(6), question: "unpublished-faq-marker", published: false });
  snapshot.sponsors.push({ ...snapshot.sponsors[0]!, id: id(7), name: "unpublished-sponsor-marker", published: false });
  const media = { id: id(8), title: "Public media", type: "link" as const, url: "https://example.test/public", altText: "", published: true };
  snapshot.media = [media, { ...media, id: id(9), title: "unpublished-media-marker", published: false }];
  const notice = { id: id(10), eventId: snapshot.event.id, title: "Public notice", body: "Public information", severity: "info" as const, startsAtUtc: snapshot.serverTimeUtc, endsAtUtc: null, published: true };
  snapshot.notices = [notice, { ...notice, id: id(11), title: "unpublished-notice-marker", published: false }, { ...notice, id: id(12), title: "foreign-notice-marker", eventId: "other-event" }];
  snapshot.contentPages.push({ ...snapshot.contentPages[0]!, id: id(13), body: "unpublished-page-marker", published: false });
  return snapshot;
}
