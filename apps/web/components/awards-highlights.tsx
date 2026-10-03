"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import styles from "./awards-highlights.module.css";
import { SiteImage } from "./site-image";
import { RecapPlayer } from "./recap-player";

type AwardsHighlightsProps = {
  title: string;
  embedUrl: string;
  watchUrl: string;
  duration: string;
  // Optional overrides so the same player serves the 2025 Summit recap.
  posterUrl?: string;
  posterAlt?: string;
  caption?: string;
  playLabel?: string;
  // The 2025 Summit recap skips its Villa Bibbiani segments (see recap-player.tsx).
  skipVillaBibbiani?: boolean;
};

export function AwardsHighlights({ title, embedUrl, watchUrl, duration, posterUrl, posterAlt, caption, playLabel = "Play 2025 Not Alone Awards highlights", skipVillaBibbiani = false }: AwardsHighlightsProps) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const poster = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (playing) closeButton.current?.focus({ preventScroll: true });
    else if (hasPlayed.current) poster.current?.focus({ preventScroll: true });
  }, [playing]);

  function play() {
    hasPlayed.current = true;
    setFailed(false);
    setPlaying(true);
  }

  return <div className={styles.highlights} onKeyDown={event => {
    if (playing && event.key === "Escape") {
      event.preventDefault();
      setPlaying(false);
    }
  }}>
    <div className={styles.frame}>
      {playing ? <>
        {skipVillaBibbiani ? <RecapPlayer title={title} /> : <iframe src={`${embedUrl}${embedUrl.includes("?") ? "&" : "?"}autoplay=1`} title={title}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
          onError={() => { setPlaying(false); setFailed(true); }} />}
        <button ref={closeButton} type="button" className={styles.close} onClick={() => setPlaying(false)} aria-label="Close highlights video" title="Close video"><X size={18} aria-hidden="true" /></button>
      </> : <button ref={poster} type="button" className={styles.poster} onClick={play} aria-label={playLabel} title={playLabel}>
        {posterUrl ? <img src={posterUrl} alt={posterAlt ?? ""} loading="lazy" decoding="async" width={1280} height={720} /> : <SiteImage src="/images/awards-2025-highlights.jpg" alt="The 2025 Not Alone Awards celebration" sizes="(max-width: 1240px) 95vw, 1180px" />}
        <span className={styles.play}><Play size={30} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></span>
        <span className={styles.duration} aria-hidden="true">{duration}</span>
      </button>}
    </div>
    {!skipVillaBibbiani &&     <div className={styles.caption}>
      <p role="status">{failed ? "The video could not load here. You can watch it on YouTube." : caption ?? "Music, stories, and moments from the 2025 Not Alone Awards."}</p>
      <a href={watchUrl} target="_blank" rel="noreferrer">Watch on YouTube <ExternalLink size={15} aria-hidden="true" /><span className="srOnly"> (opens in a new tab)</span></a>
    </div>}
  </div>;
}
