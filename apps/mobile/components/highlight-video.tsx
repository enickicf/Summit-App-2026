import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Play } from "lucide-react-native";
import { useState } from "react";
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from "react-native";
import { font, liftShadow, palette, space } from "../lib/summit-theme";

// A highlight film bundled with the app: poster first, then native playback (with sound, controls
// and full screen) only when the attendee taps play. Nothing opens outside the app.
export function HighlightVideo({ source, poster, eyebrow, title, duration, aspectRatio = 16 / 9 }: { source: number; poster: ImageSourcePropType; eyebrow: string; title: string; duration?: string; aspectRatio?: number }) {
  const [started, setStarted] = useState(false);
  const player = useVideoPlayer(source, instance => {
    instance.loop = false;
    instance.muted = false;
  });

  return (
    <View style={[styles.card, liftShadow]}>
      {started ? (
        <VideoView allowsPictureInPicture={false} fullscreenOptions={{ enable: true }} contentFit="contain" nativeControls player={player} style={[styles.video, { aspectRatio }]} />
      ) : (
        <Pressable
          accessibilityLabel={`Play ${title}${duration ? `, ${duration}` : ""}`}
          accessibilityRole="button"
          onPress={() => { setStarted(true); player.play(); }}
          style={({ pressed }) => [styles.video, { aspectRatio }, pressed && styles.pressed]}
        >
          <Image resizeMode="cover" source={poster} style={StyleSheet.absoluteFill} />
          <LinearGradient colors={["rgba(47, 37, 66, 0.1)", "rgba(47, 37, 66, 0.8)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.playButton}><Play color={palette.plum} fill={palette.plum} size={20} strokeWidth={2} /></View>
          <View style={styles.caption}>
            <Text style={styles.eyebrow}>{eyebrow}{duration ? ` · ${duration}` : ""}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#1d1629", borderRadius: 12, marginTop: space.md, overflow: "hidden" },
  video: { alignItems: "center", aspectRatio: 16 / 9, justifyContent: "center", width: "100%" },
  playButton: { alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.92)", borderRadius: 999, height: 52, justifyContent: "center", paddingLeft: 3, width: 52 },
  caption: { bottom: 0, left: 0, padding: space.md, position: "absolute", right: 0 },
  eyebrow: { color: palette.blush, fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase" },
  title: { color: palette.white, fontFamily: font.semibold, fontSize: 16, marginTop: 2 },
  pressed: { opacity: 0.88 }
});
