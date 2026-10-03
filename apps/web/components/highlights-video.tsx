"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { summit2025Recap } from "../lib/content";
import { RecapPlayer } from "./recap-player";
import styles from "./highlights-video.module.css";

// Owner (Sept 21): the 2025 highlight films also appear further down the pages, big, titled only
// "2025 Highlights". A play button starts the film right here on the page (no trip to YouTube); the
// Villa Bibbiani segments are skipped and subtitles stay off (see RecapPlayer).
const posters = {
  // ICF's recap still without the Villa Bibbiani stage screen (YouTube's default thumbnail shows it).
  summit: summit2025Recap.posterUrl,
  awards: "https://i.ytimg.com/vi/z2NdP-X7_Mc/maxresdefault.jpg"
} as const;

export function HighlightsVideo({ video, tone = "light" }: { video: "summit" | "awards"; tone?: "light" | "dark" }) {
  const [playing, setPlaying] = useState(false);
  const title = video === "summit" ? "2025 Not Alone Summit highlights" : "2025 Not Alone Awards highlights";
  return <section className={`${styles.section} ${tone === "dark" ? styles.dark : ""}`} id="highlights" aria-labelledby="highlights-title">
    <h2 id="highlights-title">2025 Highlights</h2>
    <div className={styles.frame}>
      {playing
        ? <RecapPlayer video={video} title={title} className={styles.player} />
        : <button type="button" className={styles.start} onClick={() => setPlaying(true)} aria-label={`Play the ${title}`}>
          <img src={posters[video]} alt="" loading="lazy" decoding="async" />
          <span className={styles.play} aria-hidden="true"><Play size={40} fill="currentColor" strokeWidth={0} /></span>
        </button>}
    </div>
  </section>;
}
