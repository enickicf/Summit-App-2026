"use client";

import { useEffect, useRef, useState } from "react";
import { initials, linkLabels, type PodcastEntry, type PodcastLinks } from "../../../lib/podcasts-2026";
import styles from "./podcasts.module.css";
import { InterviewBooking } from "./interview-booking";

// Owner (Oct 20): click a card for the hosts' bios and the show's links (Spotify, YouTube, socials).
export function PodcastCard({ entry }: { entry: PodcastEntry }) {
  const [open, setOpen] = useState(false);
  const [openForBooking, setOpenForBooking] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => dialog.current?.focus());
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [open]);
  const showDetails = () => { setOpenForBooking(false); setOpen(true); };
  const showBooking = () => { setOpenForBooking(true); setOpen(true); };
  const close = () => { setOpen(false); setOpenForBooking(false); requestAnimationFrame(() => trigger.current?.focus()); };
  const hostLine = entry.kind === "interviewer" ? "Social media creator and interviewer" : `with ${entry.hosts.map(host => host.name).join(" and ")}`;
  const links = Object.entries(entry.links ?? {}).filter(([, url]) => url) as [keyof PodcastLinks, string][];
  const media = entry.image
    ? <img src={entry.image} alt={entry.imageKind === "logo" ? `${entry.show} logo` : entry.hosts.map(host => host.name).join(" and ")} className={entry.imageKind === "logo" ? styles.cardLogo : styles.cardImage} style={entry.imagePosition ? { objectPosition: entry.imagePosition } : undefined} loading="lazy" />
    : <span className={styles.monogram} aria-hidden="true">{initials(entry.show)}</span>;
  return <>
    <article className={styles.card}>
      <button ref={trigger} type="button" className={styles.cardDetails} onClick={showDetails} aria-haspopup="dialog" aria-expanded={open && !openForBooking}>
        <span className={styles.cardMedia}>{media}</span>
        <span className={styles.cardBody}>
          <span className={styles.cardKicker}>{entry.kind === "interviewer" ? "Interviewer" : "Podcast"}</span>
          <span className={styles.cardTitle}>{entry.show}</span>
          <span className={styles.hosts}>{hostLine}</span>
          {entry.summary && <span className={styles.topic}>{entry.summary}</span>}
          <span className={styles.roles}>{entry.formats.map(format => <span key={format} className={styles.role}>{format}</span>)}</span>
          <span className={styles.more}>View bio and links</span>
        </span>
      </button>
      <button type="button" className={styles.cardBook} onClick={showBooking} aria-haspopup="dialog">Book an interview</button>
    </article>
    {open && <div className={styles.modalBackdrop} onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialog} className={styles.dialogPanel} role="dialog" aria-modal="true" aria-labelledby={`${slug(entry.show)}-title`} tabIndex={-1}>
        <button type="button" className={styles.close} onClick={close}>Close</button>
        <div className={styles.dialogHead}>
          <span className={styles.dialogMedia}>{media}</span>
          <div>
            <p className={styles.cardKicker}>{entry.kind === "interviewer" ? "Interviewer" : "Podcast"}</p>
            <h2 id={`${slug(entry.show)}-title`}>{entry.show}</h2>
            <p className={styles.hosts}>{hostLine}</p>
            <span className={styles.roles}>{entry.formats.map(format => <span key={format} className={styles.role}>{format}</span>)}</span>
          </div>
        </div>
        {entry.topic && <section className={styles.dialogSection}><h3>About the show</h3><p className={styles.dialogTopic}>{entry.topic}</p></section>}
        {entry.stats && entry.stats.length > 0 && <div className={styles.stats}>{entry.stats.map(stat => <span key={stat.label} className={styles.stat}><strong>{stat.value}</strong>{stat.label}</span>)}</div>}
        {entry.hosts.filter(host => host.bio).map(host => <div key={host.name} className={styles.bio}><h3>{host.name}</h3><p>{host.bio}</p></div>)}
        {links.length > 0 && <section className={styles.dialogSection}><h3>Listen and follow</h3><div className={styles.links}>{links.map(([kind, url]) => <a key={kind} href={url} target="_blank" rel="noopener noreferrer">{linkLabels[kind]}</a>)}</div></section>}
        <InterviewBooking entry={entry} startOpen={openForBooking} />
      </div>
    </div>}
  </>;
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
