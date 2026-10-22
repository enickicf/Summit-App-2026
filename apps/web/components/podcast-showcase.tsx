import { bySize, podcasts2026, type PodcastEntry } from "../lib/podcasts-2026";
import styles from "./podcast-showcase.module.css";

// Oct 20, 2026 (Aphrah: the full Podcast Interviewers page "feels like something private we'd send & then we should add
// logos & about the podcast to the website"; owner: build it on a separate branch to review). A public band on the
// Awards page: each show's official cover art (Apple Podcasts artwork; Mackenzie Sol, an interviewer, by her photo), its
// name, host, a short "about" and one Listen link. The private /awards/podcasts page stays as it is for guests.
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const showcaseCover = (entry: PodcastEntry) => entry.kind === "interviewer" ? entry.image ?? "" : `/2026-podcasts/covers/${slug(entry.show)}.jpg`;
export function listenLink(entry: PodcastEntry): { href: string; label: string } | null {
  const links = entry.links ?? {};
  if (links.spotify) return { href: links.spotify, label: "Listen on Spotify" };
  if (links.apple) return { href: links.apple, label: "Listen on Apple Podcasts" };
  if (links.youtube) return { href: links.youtube, label: "Watch on YouTube" };
  if (links.instagram) return { href: links.instagram, label: "Follow on Instagram" };
  if (links.tiktok) return { href: links.tiktok, label: "Follow on TikTok" };
  if (links.website) return { href: links.website, label: "Visit website" };
  return null;
}

export function PodcastShowcase() {
  const entries = bySize(podcasts2026);
  return <section className={styles.section} id="podcasts" aria-labelledby="podcasts-title">
    <h2 id="podcasts-title">Podcasts and Interviewers</h2>
    <p className={styles.announcement}>Recording at the Not Alone Awards. More to be announced.</p>
    <ul className={styles.grid}>{entries.map(entry => {
      const listen = listenLink(entry);
      const hosts = entry.kind === "interviewer" ? "Social media creator and interviewer" : `with ${entry.hosts.map(host => host.name).join(" and ")}`;
      return <li key={entry.show} className={styles.tile}>
        <img className={styles.cover} src={showcaseCover(entry)} alt={entry.kind === "interviewer" ? entry.show : `${entry.show} podcast cover`} loading="lazy" width={600} height={600} />
        <div className={styles.body}>
          <h3>{entry.show}</h3>
          <p className={styles.hosts}>{hosts}</p>
          {entry.topic && <p className={styles.about}>{entry.topic}</p>}
          {listen && <a className={styles.listen} href={listen.href} target="_blank" rel="noopener noreferrer">{listen.label} ↗</a>}
        </div>
      </li>;
    })}</ul>
  </section>;
}
