import { bySize, podcasts2026 } from "./podcasts-2026";

const coverByShow: Readonly<Record<string, string>> = {
  "The Big Silence": "/2026-podcasts/covers/the-big-silence.jpg",
  "Too Late To Pretend": "/2026-podcasts/covers/too-late-to-pretend.jpg",
  "The Mental Game": "/2026-podcasts/covers/the-mental-game.jpg",
  "Parenting With Psychology": "/2026-podcasts/covers/parenting-with-psychology.jpg",
  "The Complex Trauma Podcast": "/2026-podcasts/covers/the-complex-trauma-podcast.jpg",
  "Coping with Ghosting": "/2026-podcasts/covers/coping-with-ghosting.jpg",
  "Psychology Unplugged": "/2026-podcasts/covers/psychology-unplugged.jpg",
};

// Aphrah (Oct 24): keep the current podcast group on the Awards page and show the
// same confirmed podcasts on the Partners page. This derives from the shared public
// collection so withdrawals and additions cannot drift between the two areas.
export const podcastPartners2026 = bySize(podcasts2026)
  .filter(entry => entry.kind === "podcast" && coverByShow[entry.show])
  .map(entry => ({ name: entry.show, cover: coverByShow[entry.show]! }));
