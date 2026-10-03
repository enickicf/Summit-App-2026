import { Link, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { FoundersBadge } from "../../components/summit-ui";
import { ParticipationControl, waitlistNote } from "../../components/signup-controls";
import { scheduleParticipation } from "@not-alone/domain/experiences";
import { displayLocation, isFoundersOnly } from "../../lib/schedule-presentation";
import { cardShadow, font, palette, space } from "../../lib/summit-theme";
import { toEventTimeRange } from "@not-alone/domain";
import { useSummit } from "../../components/summit-context";
import { useResponsiveLayout } from "../../components/responsive-layout";

const steveWozniakHeadshot = require("../../assets/steve-wozniak-headshot.jpg");

export default function SessionDetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[]; startsAtUtc?: string | string[]; title?: string | string[] }>();
  const { snapshot } = useSummit();
  const layout = useResponsiveLayout();
  const id = firstParam(params.id);
  const startsAtUtc = firstParam(params.startsAtUtc);
  const title = firstParam(params.title);
  const titleMatches = title
    ? snapshot.scheduleItems.filter((scheduleItem) => scheduleItem.title === title)
    : [];
  const item = snapshot.scheduleItems.find((scheduleItem) => scheduleItem.id === id)
    ?? titleMatches.find((scheduleItem) => scheduleItem.startUtc === startsAtUtc)
    ?? (titleMatches.length === 1 ? titleMatches[0] : undefined);
  const speakers = snapshot.speakers.filter((speaker) => speaker.published && item?.speakerIds.includes(speaker.id));

  if (!item) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>Session unavailable</Text>
        <Text style={styles.notFoundBody}>Reload the published event data and try again.</Text>
      </View>
    );
  }

  const accessLabelsDiffer = item.eligibilityScope.label !== item.visibilityScope.label;
  const hasExpandedDescription = item.description.trim() !== item.summary.trim();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={layout.contentStyle}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={[styles.hero, layout.paddingStyle]}>
        <Text style={styles.time}>{toEventTimeRange(item, snapshot.event.timeZone)}</Text>
        <Text style={styles.title}>{item.title}</Text>
        {isFoundersOnly(item) ? <FoundersBadge /> : null}
        <ParticipationControl item={item} />
        {scheduleParticipation(item) === "experience" ? <Text style={styles.waitlist}>{waitlistNote}</Text> : null}
        <Text style={styles.summary}>{item.summary}</Text>
      </View>

      {speakers.length > 0 ? (
        <View style={[styles.speakerSection, layout.marginStyle]}>
          <Text style={styles.sectionLabel}>{speakers.length === 1 ? "Speaker" : "Speakers"}</Text>
          {speakers.map((speaker) => {
            const speakerImage = getSpeakerImage(speaker);
            return (
              <View key={speaker.id} style={[styles.speakerPanel, cardShadow, layout.cardPaddingStyle]}>
                {speakerImage ? (
                  <Image accessibilityLabel={`${speaker.name} headshot`} resizeMode="cover" source={speakerImage} style={styles.speakerImage} />
                ) : (
                  <View accessibilityLabel={speaker.name} style={styles.speakerFallback}>
                    <Text style={styles.speakerInitials}>{initials(speaker.name)}</Text>
                  </View>
                )}
                <View style={styles.speakerText}>
                  <Text style={styles.speakerName}>{speaker.name}</Text>
                  <Text style={styles.speakerRole}>{speaker.role}</Text>
                  {speaker.bio ? <Text style={styles.speakerBio}>{speaker.bio}</Text> : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={[styles.panel, cardShadow, layout.marginStyle, layout.cardPaddingStyle]}>
        <Text style={styles.panelTitle}>Session details</Text>
        <DetailRow label="Location" value={displayLocation(item.locationName)} />
        <DetailRow label="Access" value={item.visibilityScope.label} />
        {accessLabelsDiffer ? <DetailRow label="Eligibility" value={item.eligibilityScope.label} /> : null}
        {item.status !== "scheduled" ? <DetailRow label="Status" value={item.status} /> : null}
      </View>

      <View style={[styles.actionGrid, layout.marginStyle]}>
        <Link href="/map" asChild>
          <Pressable accessibilityLabel="Open map and find this room" accessibilityRole="button" style={[styles.actionButton, cardShadow]}>
            <Text style={styles.actionLabel}>Venue</Text>
            <Text style={styles.actionText}>Directions and rooms</Text>
          </Pressable>
        </Link>
        <Link href="/help" asChild>
          <Pressable accessibilityLabel="Ask the summit concierge what to do next" accessibilityRole="button" style={[styles.actionButton, cardShadow]}>
            <Text style={styles.actionLabel}>Ask AI</Text>
            <Text style={styles.actionText}>Ask what to do next</Text>
          </Pressable>
        </Link>
      </View>

      {hasExpandedDescription ? (
        <View style={[styles.panel, cardShadow, layout.marginStyle, layout.cardPaddingStyle]}>
          <Text style={styles.panelTitle}>About this session</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function getSpeakerImage(speaker: { name: string; headshotUrl: string | null }): ImageSourcePropType | undefined {
  if (speaker.headshotUrl) return { uri: speaker.headshotUrl };
  return /steve wozniak/i.test(speaker.name) ? steveWozniakHeadshot : undefined;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: palette.canvas },
  hero: { paddingBottom: space.md, paddingTop: space.md },
  time: { color: palette.violetDeep, fontFamily: font.semibold, fontSize: 15 },
  title: { color: palette.heading, fontFamily: font.semibold, fontSize: 28, lineHeight: 36, marginTop: space.sm },
  summary: { color: palette.body, fontFamily: font.regular, fontSize: 16, lineHeight: 25, marginTop: space.md },
  panel: { backgroundColor: palette.card, borderColor: palette.cardBorder, borderLeftColor: palette.plumMid, borderLeftWidth: 3, borderRadius: 4, borderWidth: 1, marginTop: space.lg, padding: space.lg },
  panelTitle: { color: palette.plum, fontFamily: font.semibold, fontSize: 16, marginBottom: space.xs },
  detailRow: { borderTopColor: palette.hairline, borderTopWidth: 1, flexDirection: "row", gap: space.md, paddingVertical: space.md },
  detailLabel: { color: palette.muted, fontFamily: font.semibold, fontSize: 11, paddingTop: 2, textTransform: "uppercase", width: 92 },
  detailValue: { color: palette.ink, flex: 1, fontFamily: font.medium, fontSize: 14, lineHeight: 21 },
  description: { color: palette.body, fontFamily: font.regular, fontSize: 15, lineHeight: 24, marginTop: space.sm },
  actionGrid: { flexDirection: "row", gap: space.md, marginTop: space.lg },
  actionButton: { backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 6, borderWidth: 1, flex: 1, minHeight: 76, padding: space.md },
  actionLabel: { color: palette.violet, fontFamily: font.semibold, fontSize: 11, textTransform: "uppercase" },
  actionText: { color: palette.heading, fontFamily: font.semibold, fontSize: 14, lineHeight: 19, marginTop: space.sm },
  speakerSection: { gap: space.md, marginTop: space.lg },
  sectionLabel: { color: palette.violet, fontFamily: font.semibold, fontSize: 11, textTransform: "uppercase" },
  speakerPanel: { alignItems: "flex-start", backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 6, borderWidth: 1, flexDirection: "row", gap: space.md, padding: space.lg },
  speakerImage: { backgroundColor: palette.lilac, borderRadius: 4, height: 104, width: 84 },
  speakerFallback: { alignItems: "center", backgroundColor: palette.lilac, borderRadius: 4, height: 104, justifyContent: "center", width: 84 },
  speakerInitials: { color: palette.plum, fontFamily: font.semibold, fontSize: 24 },
  speakerText: { flex: 1 },
  speakerName: { color: palette.heading, fontFamily: font.semibold, fontSize: 17, lineHeight: 23 },
  speakerRole: { color: palette.violetDeep, fontFamily: font.medium, fontSize: 13, lineHeight: 19, marginTop: 2 },
  speakerBio: { color: palette.body, fontFamily: font.regular, fontSize: 13, lineHeight: 20, marginTop: space.sm },
  notFound: { alignItems: "center", backgroundColor: palette.canvas, flex: 1, justifyContent: "center", padding: space.xl },
  notFoundTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 22 },
  notFoundBody: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 21, marginTop: space.sm, textAlign: "center" },
  waitlist: { color: palette.muted, fontFamily: font.regular, fontSize: 12, lineHeight: 18, marginTop: space.sm },
  pressed: { opacity: 0.84 }
});
