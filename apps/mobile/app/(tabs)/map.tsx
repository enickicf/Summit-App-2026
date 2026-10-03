import { HelpCircle } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSummit } from "../../components/summit-context";
import { useResponsiveLayout } from "../../components/responsive-layout";
import { ScreenHeader } from "../../components/summit-ui";
import { WynnPerspectiveMap } from "../../components/wynn-perspective-map";
import { cardShadow, font, palette, space } from "../../lib/summit-theme";

// One clean, zoomable view of the Wynn meeting wing as you walk in from the casino. No live location
// (indoor GPS is unreliable here and guests shouldn't have to share it) and no turn-by-turn steps.
export default function MapScreen() {
  const { snapshot } = useSummit();
  const layout = useResponsiveLayout();
  const published = snapshot.locations.map(location => location.name.trim()).filter(name => !/to be confirmed/i.test(name));
  const highlighted = new Set(published.map(name => name.toLowerCase()));
  const mapWidth = Math.min(layout.width, 720) - layout.gutter * 2 - 2;
  const askFor = published[0] ? `${published[0]}, just off the Sunset Promenade` : "the Sunset Promenade";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={layout.contentStyle} contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
        <View style={layout.paddingStyle}>
          <ScreenHeader eyebrow="Wynn Las Vegas · Meeting wing" title="Map" />

          <View style={[styles.mapCard, cardShadow]}>
            <ScrollView bouncesZoom centerContent maximumZoomScale={3} minimumZoomScale={1} pinchGestureEnabled showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
              <WynnPerspectiveMap highlighted={highlighted} width={mapWidth} />
            </ScrollView>
          </View>

          <View style={[styles.lost, cardShadow]}>
            <HelpCircle color={palette.plum} size={20} strokeWidth={2.1} />
            <Text style={styles.lostText}>
              <Text style={styles.lostStrong}>Lost? </Text>Ask any Wynn team member for <Text style={styles.lostStrong}>{askFor}</Text> in the convention area.
            </Text>
          </View>
          <Text style={styles.source}>Wynn Las Vegas · 3131 Las Vegas Blvd. South · Drawn from Wynn's published meeting-space map.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.canvas, flex: 1 },
  screen: { backgroundColor: palette.canvas },
  mapCard: { backgroundColor: "#f7f5f9", borderColor: palette.cardBorder, borderRadius: 14, borderWidth: 1, marginTop: space.lg, overflow: "hidden" },
  lost: { alignItems: "center", backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: space.md, marginTop: space.lg, padding: space.md },
  lostText: { color: palette.body, flex: 1, fontFamily: font.regular, fontSize: 14, lineHeight: 21 },
  lostStrong: { color: palette.plum, fontFamily: font.semibold },
  source: { color: palette.muted, fontFamily: font.regular, fontSize: 11, lineHeight: 17, marginTop: space.md, textAlign: "center" }
});
