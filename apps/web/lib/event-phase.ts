// Owner (Sept 23): the site switches itself after the event. From November 6, 2026 (midnight, Pacific
// time, the event's own time zone) the hero date/venue lines on the 2026 Summit and Awards pages read
// "2027 — To Be Announced Soon." Nothing has to be changed by hand on the day; the pages render on
// every request and check the clock.
export const postEventAtUtc = Date.UTC(2026, 10, 6, 7, 0, 0); // 2026-11-06T00:00 America/Los_Angeles (PST, UTC-8)
export const postEventLabel = "2027 — To Be Announced Soon.";

export function isPostEvent(now: Date | number = Date.now()): boolean {
  const time = typeof now === "number" ? now : now.getTime();
  return time >= postEventAtUtc;
}
