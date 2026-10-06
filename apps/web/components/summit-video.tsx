"use client";

import { useEffect, useState } from "react";
import { preconnect, preload } from "react-dom";
import styles from "./summit-refresh.module.css";
import { summit2025Recap } from "../lib/content";
import { RecapPlayer } from "./recap-player";

// ICF's pre-event promo film (Villa Bibbiani / Wynn), still used on the 2025 archive page. Not a recap.
export const summit2025Video = "https://static1.squarespace.com/static/628691b65c3a24383d0eac0a/t/6903b537a55efd60f08cd4b5/1761850692502/THE+GRAND+FINALE+2.mp4";
// NAS web meeting (Sept 21): the opening visual plays last year's Summit recap instead of the
// photo-frame clip loop. Muted, looping, no controls; still poster for reduced motion.
// Owner (Sept 21, late): the film must be moving from the moment it is seen: no still frame, no zoom,
// no paused first frame. A YouTube player needs a moment to start (and flashes its pause icon over the
// picture for the first seconds), so the hero opens on a plain brand color and cross-fades into the film
// only once YouTube reports real playback and that flash has passed. The film is never shown paused: on
// every open, refresh or return the color shows first and the moving film fades in over it.
// When the hero's own MP4 cut is present it plays directly instead (instant, muted, looping).
export const heroFiles: Record<"summit" | "awards", string | null> = {
  summit: null,
  awards: null
};
export const heroColors: Record<"summit" | "awards", string> = {
  summit: "#4a5faa", // ICF blue: the Summit accent, dark enough for the white hero text
  awards: "#1c1a2e"  // deep plum-black: the Awards accent under its white and gold text
};

export function HeroRecap({ video = "summit", className }: { video?: "summit" | "awards"; poster?: string | null; className?: string | undefined }) {
  const file = heroFiles[video];
  if (file) preload(file, { as: "video", fetchPriority: "high" });
  else {
    // Warm up the YouTube connections while the page is still loading.
    preconnect("https://www.youtube-nocookie.com");
    preconnect("https://i.ytimg.com");
    preconnect("https://www.google.com");
  }
  // null until the browser says whether the visitor asked for reduced motion.
  const [motion, setMotion] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!reduce.matches);
    update();
    reduce.addEventListener("change", update);
    return () => reduce.removeEventListener("change", update);
  }, []);
  // The film class picks the face focus line for the crop (summit-refresh.module.css .recapSummit / .recapAwards).
  const wrapper = `${styles.backgroundVideo} ${styles.recapBackground} ${video === "summit" ? styles.recapSummit : styles.recapAwards}${className ? ` ${className}` : ""}`;
  if (file) return <div className={wrapper} style={{ background: heroColors[video] }} aria-hidden="true">
    <video className={styles.recapPoster} src={file} autoPlay muted loop playsInline preload="auto" disablePictureInPicture tabIndex={-1} />
  </div>;
  return <div className={wrapper} style={{ background: heroColors[video] }} aria-hidden="true">
    <div className={`${styles.recapCover}${ready ? ` ${styles.recapCoverBehind}` : ""}`} style={{ background: heroColors[video] }} />
    {motion && <RecapPlayer background video={video} className={`${styles.recapFrame}${ready ? ` ${styles.recapFrameReady}` : ""}`} title={video === "summit" ? "2025 Not Alone Summit recap (background)" : "2025 Not Alone Awards highlights (background)"} onPlaying={() => setReady(true)} onHidden={() => setReady(false)} />}
  </div>;
}

export function SummitVideo({ background = false, id }: { background?: boolean; id?: string }) {
  const [failed, setFailed] = useState(false);
  if (background) return <HeroRecap />;
  return <div id={id} className={styles.highlightVideo}>
    <video src={summit2025Video} playsInline controls preload="none" poster="/images/summit-hero.webp" aria-label="2025 Not Alone Summit highlights" onError={() => setFailed(true)} />
    {failed && <p role="status">Video unavailable. <a href={summit2025Video}>Watch the complete 2025 film</a></p>}
  </div>;
}
