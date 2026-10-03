import { LinearGradient } from "expo-linear-gradient";
import { Lock, X } from "lucide-react-native";
import { useState, type ReactNode } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { font, gradients, liftShadow, palette, space } from "../lib/summit-theme";
import { initials, type SummitGuest } from "../lib/summit-people";
import { headshots } from "../lib/headshots.generated";

export function ScreenHeader({ eyebrow, title, subtitle, style }: { eyebrow: string; title: string; subtitle?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.header, style]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionTitleText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function FoundersBadge() {
  return (
    <View style={styles.foundersBadge}>
      <Lock color={palette.plum} size={13} strokeWidth={2.4} />
      <Text style={styles.foundersText}>Founders only event</Text>
    </View>
  );
}

export function Portrait({ person, size }: { person: SummitGuest; size: number }) {
  const [failed, setFailed] = useState(false);
  const frame = [styles.portraitFrame, { borderRadius: Math.round(size * 0.12), height: size, width: size }];
  // Portraits are bundled with the app ("local:<slug>"); a remote URL is only a fallback.
  const source = person.image?.startsWith("local:") ? headshots[person.image.slice(6)] : person.image ? { uri: person.image } : undefined;
  if (!source || failed) {
    return (
      <LinearGradient colors={["#e7def4", "#f4d4e2"]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[frame, styles.portraitFallback]}>
        <Text style={[styles.portraitInitials, { fontSize: Math.round(size * 0.28) }]}>{initials(person.name)}</Text>
      </LinearGradient>
    );
  }
  return (
    <View style={frame}>
      <Image
        accessibilityIgnoresInvertColors
        onError={() => setFailed(true)}
        resizeMode="cover"
        source={source}
        // Top-anchored zoom matches the website's face framing for wide source photos.
        style={{ height: size * person.zoom, marginLeft: -(size * (person.zoom - 1)) / 2, width: size * person.zoom }}
      />
    </View>
  );
}

/** Even grid of same-size portraits (three across on phones), rows centered like the website. */
export function PeopleGrid({ people, width, onSelect }: { people: SummitGuest[]; width: number; onSelect: (person: SummitGuest) => void }) {
  const columns = width >= 560 ? 5 : width >= 420 ? 4 : 3;
  const gap = 12;
  const tile = Math.floor((width - gap * (columns - 1)) / columns);
  // Photos stay modest and identical in size; the tile keeps its full width for names.
  const photo = Math.min(tile - 16, 88);
  return (
    <View style={[styles.grid, { columnGap: gap }]}>
      {people.map(person => (
        <Pressable
          accessibilityLabel={`${person.name}${person.role ? `, ${person.role}` : ""}. Open profile`}
          accessibilityRole="button"
          key={person.name}
          onPress={() => onSelect(person)}
          style={({ pressed }) => [styles.tile, { width: tile }, pressed && styles.pressed]}
        >
          <Portrait person={person} size={photo} />
          <View style={styles.tileText}>
            <Text numberOfLines={2} style={styles.tileName}>{person.name}</Text>
            {person.role ? <Text numberOfLines={2} style={styles.tileRole}>{person.role}</Text> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export function GuestProfileSheet({ person, onClose }: { person: SummitGuest | null; onClose: () => void }) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet" visible={Boolean(person)}>
      {person ? (
        <SafeAreaView edges={["bottom"]} style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.sheetContent}>
            <View style={styles.sheetTop}>
              <Text style={styles.eyebrow}>{person.category === "Co-Chairs" ? "Co-Chair" : person.category === "Hosts" ? "Host" : person.category}</Text>
              <Pressable accessibilityLabel="Close profile" accessibilityRole="button" hitSlop={10} onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <X color={palette.plum} size={18} strokeWidth={2.4} />
              </Pressable>
            </View>
            <View style={styles.sheetPortrait}>
              <Portrait person={person} size={132} />
            </View>
            <Text accessibilityRole="header" style={styles.sheetName}>{person.name}</Text>
            {person.role ? <Text style={styles.sheetRole}>{person.role}</Text> : null}
            {person.bio ? <Text style={styles.sheetBio}>{person.bio}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

export function PlumButton({ label, onPress, accessibilityLabel, icon }: { label: string; onPress: () => void; accessibilityLabel?: string; icon?: ReactNode }) {
  return (
    <Pressable accessibilityLabel={accessibilityLabel ?? label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <LinearGradient colors={[...gradients.plum]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.plumButton, liftShadow]}>
        {icon}
        <Text style={styles.plumButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export const summitUi = StyleSheet.create({
  pressed: { opacity: 0.82 }
});

const styles = StyleSheet.create({
  header: { borderBottomColor: palette.rule, borderBottomWidth: 1, paddingBottom: space.lg, paddingTop: space.lg },
  eyebrow: { color: palette.violet, fontFamily: font.semibold, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase" },
  title: { color: palette.ink, fontFamily: font.semibold, fontSize: 30, lineHeight: 38, marginTop: 6 },
  subtitle: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 22, marginTop: 4 },
  sectionTitleRow: { alignItems: "flex-end", flexDirection: "row", justifyContent: "space-between", marginBottom: space.md },
  sectionTitleText: { flex: 1, paddingRight: space.md },
  sectionTitle: { color: palette.violet, fontFamily: font.semibold, fontSize: 22, lineHeight: 30, marginTop: 2 },
  foundersBadge: { alignItems: "center", alignSelf: "flex-start", backgroundColor: palette.lilac, borderRadius: 999, flexDirection: "row", gap: 6, marginTop: 8, paddingHorizontal: 11, paddingVertical: 4 },
  foundersText: { color: palette.plum, fontFamily: font.bold, fontSize: 12 },
  portraitFrame: { backgroundColor: palette.lilac, borderColor: "rgba(201, 190, 219, 0.7)", borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  portraitFallback: { alignItems: "center", justifyContent: "center" },
  portraitInitials: { color: palette.plum, fontFamily: font.semibold, letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", rowGap: 18 },
  tile: { alignItems: "center" },
  tileText: { alignItems: "center", marginTop: 8, minHeight: 62 },
  tileName: { color: palette.heading, fontFamily: font.semibold, fontSize: 12.5, lineHeight: 17, textAlign: "center" },
  tileRole: { color: palette.muted, fontFamily: font.regular, fontSize: 10.5, lineHeight: 14, marginTop: 2, textAlign: "center" },
  sheet: { backgroundColor: palette.pearl, flex: 1 },
  sheetContent: { padding: space.lg, paddingBottom: space.xxl },
  sheetTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  closeButton: { alignItems: "center", backgroundColor: palette.lilac, borderRadius: 999, height: 36, justifyContent: "center", width: 36 },
  sheetPortrait: { alignSelf: "center", marginTop: space.lg },
  sheetName: { color: palette.heading, fontFamily: font.semibold, fontSize: 26, lineHeight: 34, marginTop: space.lg, textAlign: "center" },
  sheetRole: { color: palette.violetDeep, fontFamily: font.medium, fontSize: 14, lineHeight: 20, marginTop: 4, textAlign: "center" },
  sheetBio: { color: palette.body, fontFamily: font.regular, fontSize: 15, lineHeight: 25, marginTop: space.lg },
  plumButton: { alignItems: "center", alignSelf: "flex-start", borderRadius: 999, flexDirection: "row", gap: 8, minHeight: 46, paddingHorizontal: 22 },
  plumButtonText: { color: palette.white, fontFamily: font.semibold, fontSize: 14 },
  pressed: { opacity: 0.82 }
});
