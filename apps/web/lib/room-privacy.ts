// Owner / Ryan (Sept 29, 2026): the rooms used inside Wynn Las Vegas are not announced on the public
// website. The room map, the walking directions and the room named under each schedule session are
// shown only on a private venue guide that is reached by an unguessable link, never linked from the
// site, marked no-index and left out of the sitemap. The public pages name only the resort.
export const roomsPublic = false;

// The private venue guide's path. Change the suffix to rotate the link (the old one then 404s).
export const venueGuidePath = "/venue/guide-y7pkm22tc4dp";
// Owner (Oct 20): the private full schedule with rooms, for confirmed guests (app/privateschedule-49rrieyh/page.tsx). Same rules as the guide.
export const privateSchedulePath = "/privateschedule-49rrieyh";

/** A session's room for public display: nothing while rooms are private. */
export function publicLocation(locationName: string): string {
  return roomsPublic ? locationName : "";
}

// Oct 20: the public schedule hid the room line on screen, but the room names still travelled to the browser inside the
// page data (the client schedule component received every session's locationName and the whole snapshot). Public
// pages now pass these room-free copies; only the private schedule passes the real rooms.
export function withoutRooms<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (key, field) => (key === "locationName" || key === "locationId" ? "" : key === "locations" && Array.isArray(field) ? [] : field))) as T;
}
/** The live-notice components only need the event, its notices and its sessions; everything else (info pages such as
 *  the staff app's "2026 venue guide", which names rooms) is left out and the rooms are blanked. */
export function noticeOnlySnapshot<T>(snapshot: T): T {
  if (!snapshot || typeof snapshot !== "object") return snapshot;
  const kept = Object.fromEntries(Object.entries(snapshot).map(([key, value]) => [key, Array.isArray(value) && key !== "notices" && key !== "scheduleItems" ? [] : value]));
  return withoutRooms(kept as T);
}

// Owner (Oct 20, 2026): "u can actually put full summit schedule meaning plus locations on the main summit website now".
// The public Summit schedule (/schedule and the schedule block on the Summit home) shows each session's room again; this
// lifts Ryan's Sept 29 rule for the schedule only (the venue page, Ask AI and the live companion still name no rooms).
export const summitScheduleShowsRooms = true;
