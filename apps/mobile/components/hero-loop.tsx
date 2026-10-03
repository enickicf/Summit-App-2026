import { useFocusEffect } from "expo-router";
import { useVideoPlayer, VideoView, type VideoPlayer } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import { AccessibilityInfo, AppState, Image, StyleSheet, View } from "react-native";

// The website's owner-approved hero loop (apps/web/components/summit-video.tsx), bundled so it
// starts instantly and works offline: Jewel and Steve Wozniak from the 2025 film, then Cherrial.
const clips = [
  // App-only Jewel clip: the guitar close-up only (0-1.35 s of the website clip, original framing); the
  // standing shot that framed her chest on the wide home card is cut. The website keeps the full clip.
  require("../assets/videos/hero-jewel-app.mp4"),
  require("../assets/videos/hero-woz.mp4"),
  require("../assets/videos/hero-cherrial.mp4")
] as const;
const poster = require("../assets/hero-poster-app.jpg");

function setup(player: VideoPlayer) {
  player.muted = true;
  player.loop = false;
  player.audioMixingMode = "mixWithOthers";
}

export function HeroLoop() {
  const [focused, setFocused] = useState(true);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    return () => setFocused(false);
  }, []));
  const [active, setActive] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const players = [useVideoPlayer(clips[0], setup), useVideoPlayer(clips[1], setup), useVideoPlayer(clips[2], setup)];

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(enabled => { if (mounted) setReduceMotion(enabled); });
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    const app = AppState.addEventListener("change", state => setAppActive(state === "active"));
    return () => { mounted = false; motion.remove(); app.remove(); };
  }, []);

  useEffect(() => {
    const subscriptions = players.map((player, index) => player.addListener("playToEnd", () => {
      const following = (index + 1) % players.length;
      players[following]!.currentTime = 0;
      setActive(following);
    }));
    return () => subscriptions.forEach(subscription => subscription.remove());
    // Players are stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playing = focused && appActive && !reduceMotion;
  useEffect(() => {
    players.forEach((player, index) => {
      if (playing && index === active) player.play();
      else player.pause();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, playing]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={poster} resizeMode="cover" style={StyleSheet.absoluteFill} />
      {players.map((player, index) => (
        <VideoView
          key={index}
          player={player}
          contentFit="cover"
          nativeControls={false}
          allowsPictureInPicture={false}
          style={[StyleSheet.absoluteFill, { opacity: reduceMotion ? 0 : index === active ? 1 : 0 }]}
        />
      ))}
    </View>
  );
}
