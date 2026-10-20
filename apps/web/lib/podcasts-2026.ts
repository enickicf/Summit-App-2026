// Owner (Oct 20, 2026): a Podcasts page for the Awards site, from the owner's list of confirmed podcast involvement,
// plus Mackenzie Sol as a social media creator and interviewer. Public wording only: internal notes from the owner's
// list (bookings still to be made, replies still outstanding) stay off the page. Rooms are never named (room-privacy rule).
// The Oct 7 podcast meeting: Monday, November 2 is podcast day (daytime recordings, and red carpet interviews before the
// Awards Show); every show says it is recorded at the Not Alone Summit & Awards.

export type PodcastRole = "Daytime recording" | "Full-length interviews" | "Short interviews" | "Red carpet" | "Podcast recording" | "Social media" | "Interviews";

export type PodcastEntry = {
  show: string;
  hosts: string[];
  kind: "podcast" | "creator";
  roles: PodcastRole[];
  /** Portrait already on the site (site-image inventory); otherwise the card shows the show's initials. */
  image?: string;
  /** Owner's own note, kept for the staff and never rendered. */
  internalNote?: string;
};

export const podcasts2026: PodcastEntry[] = [
  { show: "The Big Silence", hosts: ["Karena Dawn"], kind: "podcast", roles: ["Daytime recording"], image: "/2026-headshots/portraits/karena-dawn-2.jpg", internalNote: "Red carpet participation still to be settled." },
  { show: "The Mental Game", hosts: ["Brandon Saho"], kind: "podcast", roles: ["Full-length interviews", "Short interviews"], image: "/2026-headshots/portraits/brandon-saho.jpg" },
  { show: "Psychology Unplugged", hosts: ["Dr. Corey Nigro", "Julie Catineau"], kind: "podcast", roles: ["Podcast recording", "Red carpet"], internalNote: "Full-length guest still to be booked." },
  { show: "Parenting With Psychology", hosts: ["Dr. Lindsay Emmerson"], kind: "podcast", roles: ["Daytime recording", "Red carpet"], internalNote: "Guest and time still to be booked." },
  { show: "Coping with Ghosting", hosts: ["Gretta Perlmutter"], kind: "podcast", roles: ["Red carpet"] },
  { show: "Too Late To Pretend", hosts: ["Dr. Cecelia Baldwin"], kind: "podcast", roles: ["Red carpet"], internalNote: "Travel confirmed, media kit received; full-length interview depends on securing a guest." },
  { show: "Jst Us", hosts: ["Amber Wagner", "Jacob Willis"], kind: "podcast", roles: ["Red carpet"], internalNote: "Confirmed on the call; Mike has not yet replied to the written confirmation request." },
  { show: "Inner Cosmos", hosts: ["David Eagleman"], kind: "podcast", roles: ["Podcast recording"], image: "/2026-headshots/portraits/david-eagleman.jpg", internalNote: "Recording format still to be pinned down." },
  { show: "Mackenzie Sol", hosts: ["Mackenzie Sol"], kind: "creator", roles: ["Social media", "Interviews"] }
];

export const podcastPagePath = "/awards/podcasts";

export function initials(show: string): string {
  return show.replace(/^The\s+/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]?.toUpperCase() ?? "").join("");
}
