"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { initials, linkLabels, type PodcastEntry, type PodcastLinks } from "../../../lib/podcasts-2026";
import styles from "./podcasts.module.css";

// Owner (Oct 20): click a card for the hosts' bios and the show's links (Spotify, YouTube, socials).
export function PodcastCard({ entry }: { entry: PodcastEntry }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  const hostLine = entry.kind === "interviewer" ? "Social media creator and interviewer" : `with ${entry.hosts.map(host => host.name).join(" and ")}`;
  const links = Object.entries(entry.links ?? {}).filter(([, url]) => url) as [keyof PodcastLinks, string][];
  const media = entry.image
    ? <img src={entry.image} alt={entry.imageKind === "logo" ? `${entry.show} logo` : entry.hosts.map(host => host.name).join(" and ")} className={entry.imageKind === "logo" ? styles.cardLogo : styles.cardImage} loading="lazy" />
    : <span className={styles.monogram} aria-hidden="true">{initials(entry.show)}</span>;
  return <>
    <button type="button" className={styles.card} onClick={() => setOpen(true)} aria-haspopup="dialog">
      <span className={styles.cardMedia}>{media}{entry.accolade && <span className={styles.accolade}>{entry.accolade.short}</span>}</span>
      <span className={styles.cardBody}>
        <span className={styles.cardKicker}>{entry.kind === "interviewer" ? "Interviewer" : "Podcast"}</span>
        <span className={styles.cardTitle}>{entry.show}</span>
        <span className={styles.hosts}>{hostLine}</span>
        {entry.topic && <span className={styles.topic}>{entry.topic}</span>}
        {entry.stats && entry.stats.length > 0 && <span className={styles.stats} style={{ "--stat-count": Math.min(entry.stats.length, 3) } as React.CSSProperties}>{entry.stats.slice(0, 3).map(stat => <span key={stat.label} className={styles.stat}><strong>{stat.value}</strong>{stat.label}</span>)}</span>}
        <span className={styles.roles}>{entry.formats.map(format => <span key={format} className={styles.role}>{format}</span>)}</span>
        <span className={styles.more}>View bio and links →</span>
      </span>
    </button>
    <dialog ref={dialog} className={styles.dialog} onClose={() => setOpen(false)} onClick={event => { if (event.target === dialog.current) setOpen(false); }} aria-labelledby={`${slug(entry.show)}-title`}>
      <div className={styles.dialogPanel}>
        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close">×</button>
        <div className={styles.dialogHead}>
          <span className={styles.dialogMedia}>{media}</span>
          <div>
            <p className={styles.cardKicker}>{entry.kind === "interviewer" ? "Interviewer" : "Podcast"}</p>
            <h2 id={`${slug(entry.show)}-title`}>{entry.show}</h2>
            <p className={styles.hosts}>{hostLine}</p>
            <span className={styles.roles}>{entry.formats.map(format => <span key={format} className={styles.role}>{format}</span>)}</span>
          </div>
        </div>
        {entry.topic && <p className={styles.dialogTopic}>{entry.topic}</p>}
        {entry.accolade && <p className={styles.dialogAccolade}>{entry.accolade.full}</p>}
        {entry.stats && entry.stats.length > 0 && <div className={styles.stats}>{entry.stats.map(stat => <span key={stat.label} className={styles.stat}><strong>{stat.value}</strong>{stat.label}</span>)}</div>}
        {entry.hosts.filter(host => host.bio).map(host => <div key={host.name} className={styles.bio}><h3>{host.name}</h3><p>{host.bio}</p></div>)}
        {links.length > 0 && <div className={styles.links}>{links.map(([kind, url]) => <a key={kind} href={url} target="_blank" rel="noopener noreferrer">{linkLabels[kind]} ↗</a>)}</div>}
      </div>
    </dialog>
  </>;
}

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
