// Owner / Ryan (Sept 29, 2026): the rooms used inside Wynn Las Vegas are not announced on the public
// website. The room map, the walking directions and the room named under each schedule session are
// shown only on a private venue guide that is reached by an unguessable link, never linked from the
// site, marked no-index and left out of the sitemap. The public pages name only the resort.
export const roomsPublic = false;

// The private venue guide's path. Change the suffix to rotate the link (the old one then 404s).
export const venueGuidePath = "/venue/guide-y7pkm22tc4dp";

/** A session's room for public display: nothing while rooms are private. */
export function publicLocation(locationName: string): string {
  return roomsPublic ? locationName : "";
}
