import { confirmedSummitGuests2026 } from "@not-alone/config";
import { eventSnapshotSchema, type EventSnapshot } from "@not-alone/validation";

const nameKey = (name: string) => name.normalize("NFC").trim().replace(/\s+/g, " ").toLowerCase();
const confirmedNames = new Set(confirmedSummitGuests2026.map(nameKey));

// Apply only at public read boundaries. Staff state and publications stay whole.
export function projectPublicSnapshot(value: EventSnapshot): EventSnapshot {
  const snapshot = eventSnapshotSchema.parse(value);
  const eventId = snapshot.event.id;
  const speakers = snapshot.event.directoryEnabled ? snapshot.speakers
    .filter(person => person.published && person.eventId === eventId && confirmedNames.has(nameKey(person.name)))
    .map(({ roleSource: _roleSource, ...person }) => person) : [];
  const speakerIds = new Set(speakers.map(person => person.id));
  const speakerNames = new Set(speakers.map(person => nameKey(person.name)));

  return {
    ...snapshot,
    event: { ...snapshot.event, featuredPeople: snapshot.event.featuredPeople.filter(person => speakerNames.has(nameKey(person.name))) },
    scheduleItems: snapshot.scheduleItems
      .filter(item => item.published && item.eventId === eventId && item.visibilityScope.id === "public")
      .map(item => ({ ...item, speakerIds: item.speakerIds.filter(id => speakerIds.has(id)) })),
    speakers,
    // Locations have no publication/visibility flag. Keep reviewed venue
    // essentials for this event, including locations without timed sessions.
    locations: snapshot.locations.filter(location => location.eventId === eventId),
    notices: snapshot.notices.filter(notice => notice.published && notice.eventId === eventId),
    faqs: snapshot.faqs.filter(faq => faq.published),
    sponsors: snapshot.sponsors.filter(sponsor => sponsor.published),
    media: snapshot.media.filter(item => item.published),
    contentPages: snapshot.contentPages.filter(page => page.published)
  };
}
