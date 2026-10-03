"use client";

import { useEffect, useRef } from "react";
import { awards2025Highlights, summit2025Recap } from "../lib/content";

// Owner direction (Sept 21, 2026): show the 2025 films without Villa Bibbiani. The YouTube files can't be
// edited, so the player avoids the parts where Villa Bibbiani appears. A full frame-by-frame scan
// (Sept 21, every ~0.5s of both films) found it at:
//   Summit recap (3:25): the lit sign 18.3-20.0s, a stage screen 58.7-60.3s, the red-carpet backdrop
//     120.8-130.2s and the closing "Villa Bibbiani Presents" card from 188.6s.
//   Awards highlights (1:38): the red-carpet backdrop 2-20s, the lit sign 20.0-21.1s and the closing
//     card from 94.5s.
type Cut = { start: number; skip: ReadonlyArray<readonly [number, number]>; end: number };
// The on-page player (with controls, started by the visitor) plays the whole film minus those parts.
export const videoCuts: Record<"summit" | "awards", Cut> = {
  summit: { start: 0, skip: [[18.2, 21.6], [58.6, 60.4], [120.8, 130.2]], end: 188.4 },
  awards: { start: 21.2, skip: [], end: 94.3 }
};
// The muted background (hero) film loops ONE continuous section with no Villa Bibbiani at all, so it
// never jumps mid-film: every start or jump makes YouTube draw its pause icon in the middle of the
// picture for about 3.5 seconds (it cannot be turned off in YouTube's embedded player).
// Each starts on a strong shot (owner: no awkward first frame): the guitarist in front of the sunset
// screen (Summit, 62.1s) and Jewel with her guitar (Awards, 23.4s). Stills of exactly those frames
// (public/images/hero-*-start.jpg) show the moment the page opens, and the film fades in over them.
export const heroSegments: Record<"summit" | "awards", readonly [number, number]> = {
  summit: [62.1, 120.6],
  awards: [23.4, 94.2]
};
export const heroStartFrames: Record<"summit" | "awards", string> = {
  summit: "/images/hero-summit-start.jpg",
  awards: "/images/hero-awards-start.jpg"
};
// Owner (Sept 21): the film must be playing right away, with no play/pause icon. The hero opens on a still
// of the exact start frame. YouTube draws its pause icon over the picture about 1-3.5s after autoplay starts
// (measured Sept 21 on the rebuilt site), so the film fades in only once that has cleared. Playback starts
// this far before the section so the frames line up at the hand-off.
export const iconFadeMs = 4000;
const warmUp = iconFadeMs / 1000;
export const recapSkippedSegments = videoCuts.summit.skip;
export const recapEndSeconds = videoCuts.summit.end;

const awardsHighlightsId = new URL(awards2025Highlights.watchUrl).searchParams.get("v")!;

function nextPlayable(time: number, cut: Cut) {
  if (time >= cut.end || time < cut.start - 0.4) return cut.start;
  const segment = cut.skip.find(([start, end]) => time >= start && time < end);
  return segment ? segment[1] : null;
}

export function RecapPlayer({ background = false, className, title, onLoad, onPlaying, onHidden, video = "summit" }: { background?: boolean; className?: string | undefined; title: string; onLoad?: () => void; onPlaying?: () => void; onHidden?: () => void; video?: "summit" | "awards" }) {
  const id = video === "summit" ? summit2025Recap.id : awardsHighlightsId;
  const frame = useRef<HTMLIFrameElement>(null);
  const onPlayingRef = useRef(onPlaying);
  const onHiddenRef = useRef(onHidden);
  onPlayingRef.current = onPlaying;
  onHiddenRef.current = onHidden;

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    const cut = videoCuts[video];
    const [segmentStart, segmentEnd] = heroSegments[video];
    let playing = false, everPlayed = false, visible = false, playingSince = 0, restarting = false;
    const send = (message: object) => iframe.contentWindow?.postMessage(JSON.stringify({ ...message, id: 1, channel: "widget" }), "*");
    const listen = () => send({ event: "listening" });
    const onMessage = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow || typeof event.data !== "string") return;
      let data: { event?: string; info?: { currentTime?: number; playerState?: number } };
      try { data = JSON.parse(event.data); } catch { return; }
      const state = data.info?.playerState;
      if (typeof state === "number") {
        if (state === 1 && !playing) {
          playing = true;
          everPlayed = true;
          playingSince = performance.now();
          // Owner (Sept 21): no subtitles on any of the videos. YouTube turns captions on for muted
          // players, so the captions module is unloaded every time playback (re)starts.
          send({ event: "command", func: "unloadModule", args: ["captions"] });
          send({ event: "command", func: "unloadModule", args: ["cc"] });
        } else if (state !== 1) {
          playing = false;
          // Background (owner, Sept 21): the film is never shown paused. If YouTube stops (blocked or
          // cancelled autoplay, a hidden tab, the end of the film) the color cover returns and playback
          // is asked for again; the film fades back in once it is really moving.
          if (background && (state === 2 || state === 0 || (state === 5 && everPlayed))) {
            if (visible) { visible = false; onHiddenRef.current?.(); }
            send({ event: "command", func: "playVideo", args: [] });
          }
        }
      }
      const time = data.info?.currentTime;
      if (typeof time !== "number") return;
      if (!background) {
        // The on-page player skips the Villa Bibbiani parts and stops at the end instead of looping.
        if (time >= cut.end) { send({ event: "command", func: "seekTo", args: [cut.start, true] }); send({ event: "command", func: "pauseVideo", args: [] }); return; }
        const target = nextPlayable(time, cut);
        if (target !== null) send({ event: "command", func: "seekTo", args: [target, true] });
        return;
      }
      // Background: fade out just before the section ends, restart it hidden, and show it again once
      // YouTube is really playing (owner: no visible play/pause button, no subtitles). Nothing is sent
      // before the first play: a seek while YouTube is still cueing can cancel its autoplay (the film
      // then sits paused after a refresh).
      if (!everPlayed) return;
      if (time >= segmentEnd - 0.4 || time < segmentStart - warmUp - 1.5) {
        if (visible) { visible = false; onHiddenRef.current?.(); }
        if (!restarting) {
          restarting = true;
          playing = false;
          send({ event: "command", func: "seekTo", args: [Math.max(0, segmentStart - warmUp), true] });
        }
        return;
      }
      restarting = false;
      if (!visible && playing && time >= segmentStart && performance.now() - playingSince >= iconFadeMs) {
        visible = true;
        onPlayingRef.current?.();
      }
    };
    window.addEventListener("message", onMessage);
    iframe.addEventListener("load", listen);
    const poll = window.setInterval(listen, 500);
    // Background: if autoplay has not started within a few seconds of loading, ask for playback
    // (muted playback is always allowed); repeat while the player is still not playing.
    const nudge = background ? window.setInterval(() => { if (!playing) send({ event: "command", func: "playVideo", args: [] }); }, 3000) : 0;
    const onVisible = () => { if (background && document.visibilityState === "visible" && !playing) send({ event: "command", func: "playVideo", args: [] }); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { window.removeEventListener("message", onMessage); iframe.removeEventListener("load", listen); window.clearInterval(poll); if (nudge) window.clearInterval(nudge); document.removeEventListener("visibilitychange", onVisible); };
  }, [video, background]);

  const origin = typeof window === "undefined" ? "" : `&origin=${encodeURIComponent(window.location.origin)}`;
  // No loop/playlist parameters: a YouTube playlist adds previous/pause/next buttons over the picture.
  const params = background
    ? `start=${Math.max(0, Math.floor(heroSegments[video][0] - warmUp))}&autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&disablekb=1&iv_load_policy=3&fs=0&cc_load_policy=0&cc_lang_pref=zxx&hl=en`
    : `start=${Math.floor(videoCuts[video].start)}&autoplay=1&rel=0&modestbranding=1&playsinline=1&cc_load_policy=0&cc_lang_pref=zxx&iv_load_policy=3`;
  return <iframe ref={frame} className={className} src={`https://www.youtube-nocookie.com/embed/${id}?${params}&enablejsapi=1${origin}`}
    title={title} onLoad={onLoad} {...(background ? { tabIndex: -1, "aria-hidden": true } : { allowFullScreen: true })}
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" referrerPolicy="strict-origin-when-cross-origin" />;
}
