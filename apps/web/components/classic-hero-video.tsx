"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import styles from "./classic-summit.module.css";

// The live ICF Summit hero: a full-screen looping film (landscape on desktop, the vertical cut on
// phones), muted by default with a sound toggle in the corner, exactly as inspiringchildren.org/summit.
// Owner (Sept 21): it must go straight into the video. Both cuts are listed as <source> elements in
// the server HTML, so the browser picks the right one and starts loading before the page's scripts
// run (no frozen poster while waiting for hydration).
export function ClassicHeroVideo({ desktop, mobile, poster }: { desktop: string; mobile: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { element.pause(); return; }
    if (element.paused) void element.play().catch(() => {});
  }, []);

  return <>
    <video ref={video} className={styles.heroVideo} poster={poster} muted={muted} loop playsInline autoPlay preload="auto" aria-hidden="true" tabIndex={-1}>
      <source media="(max-width: 767px)" src={mobile} type="video/mp4" />
      <source src={desktop} type="video/mp4" />
    </video>
    <button type="button" className={styles.soundToggle} aria-pressed={!muted} aria-label={muted ? "Turn sound on" : "Turn sound off"} onClick={() => {
      const next = !muted;
      setMuted(next);
      if (video.current) { video.current.muted = next; if (!next) void video.current.play().catch(() => {}); }
    }}>{muted ? <VolumeX size={56} fill="currentColor" strokeWidth={1.6} aria-hidden="true" /> : <Volume2 size={56} fill="currentColor" strokeWidth={1.6} aria-hidden="true" />}</button>
  </>;
}
