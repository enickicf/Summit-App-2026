import { Link } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getSessionTemporalState } from "@not-alone/domain";
import type { ScheduleItem } from "@not-alone/validation";
import { FoundersBadge } from "./summit-ui";
import { ParticipationControl } from "./signup-controls";
import { sessionHref } from "../lib/session-link";
import { displayLocation, isFoundersOnly, publicPendingProgramBlocks, sessionDisplaySummary, splitClock } from "../lib/schedule-presentation";
import { cardShadow, font, palette, space } from "../lib/summit-theme";

// Website-style schedule cards (apps/web/app/schedule): one outlined card per start time,
// plum left edge, "Until" end time, Location label, founders badge. Shared by Your Day and Schedule.

export function groupItemsByStart(items: ScheduleItem[]) {
  return items.reduce<ScheduleItem[][]>((timeGroups, item) => {
    const currentGroup = timeGroups[timeGroups.length - 1];
    if (currentGroup?.[0]?.startUtc === item.startUtc) currentGroup.push(item);
    else timeGroups.push([item]);
    return timeGroups;
  }, []);
}

export function TimeGroupCard({ items, nowUtc, showParticipation = true }: { items: ScheduleItem[]; nowUtc: string; showParticipation?: boolean }) {
  const first = items[0]!;
  const start = splitClock(first.startUtc, first.eventTimeZone);
  return (
    <View style={[styles.group, cardShadow]}>
      <View style={styles.groupTimeRow}>
        <Text style={styles.groupTime}>{start.time}</Text>
        <Text style={styles.groupTime}> {start.period}</Text>
      </View>
      {items.map((item, index) => <SessionEntry first={index === 0} item={item} key={item.id} nowUtc={nowUtc} showParticipation={showParticipation} />)}
    </View>
  );
}

function SessionEntry({ first, item, nowUtc, showParticipation }: { first: boolean; item: ScheduleItem; nowUtc: string; showParticipation: boolean }) {
  const end = splitClock(item.endUtc, item.eventTimeZone);
  const state = getSessionTemporalState(item, nowUtc);
  const labels = [
    ...(item.featured ? ["Featured"] : []),
    ...(item.status !== "scheduled" ? [item.status[0]!.toUpperCase() + item.status.slice(1)] : []),
    ...(state === "current" ? ["Scheduled now"] : state === "completed" && item.status !== "completed" ? ["Ended"] : [])
  ];
  const summary = sessionDisplaySummary(item);
  const foundersOnly = isFoundersOnly(item);
  const canceled = item.status === "canceled";

  return (
    <View style={[styles.session, !first && styles.sessionDivider, state === "completed" && styles.sessionPast]}>
      <Link href={sessionHref(item)} asChild>
        <Pressable
          accessibilityLabel={`${labels.length ? `${labels.join(". ")}. ` : ""}${item.title}. Until ${end.time} ${end.period}. ${foundersOnly ? "Founders only event. " : ""}Location ${displayLocation(item.locationName)}`}
          accessibilityRole="link"
        >
          <View>
            <View style={styles.topline}>
              <Text style={styles.until}>Until {end.time} {end.period}</Text>
              {labels.map(label => <Text key={label} style={[styles.tag, canceled && styles.tagCanceled, label === "Scheduled now" && styles.tagNow]}>{label}</Text>)}
            </View>
            <View style={styles.titleRow}>
              <Text style={[styles.sessionTitle, canceled && styles.canceled]}>{item.title}</Text>
              <ChevronRight color={palette.muted} size={16} strokeWidth={2.2} />
            </View>
            {foundersOnly ? <FoundersBadge /> : null}
            {summary ? <Text numberOfLines={3} style={styles.body}>{summary}</Text> : null}
            <Text style={styles.location}><Text style={styles.locationLabel}>LOCATION   </Text>{displayLocation(item.locationName)}</Text>
          </View>
        </Pressable>
      </Link>
      {showParticipation ? <ParticipationControl item={item} /> : null}
    </View>
  );
}

export function PendingNotes({ notes }: { notes: Array<{ id: string; title: string; body: string }> }) {
  return <>{notes.map(note => (
    <View accessibilityLabel={note.title} key={note.id}>
      {publicPendingProgramBlocks(note.body).map((block, index) => block.start ? (
        <View key={index} style={[styles.group, cardShadow]}>
          <Text style={styles.groupTime}>{block.start}</Text>
          <Text style={[styles.sessionTitle, styles.pendingTitle]}>{block.title}</Text>
          {block.detail ? <Text style={styles.body}>{block.detail}</Text> : null}
        </View>
      ) : <Text key={index} style={styles.pending}>{block.detail}</Text>)}
    </View>
  ))}</>;
}

export const scheduleCardStyles = StyleSheet.create({
  pending: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 22, marginBottom: 14, paddingHorizontal: 4 }
});

const styles = StyleSheet.create({
  group: { backgroundColor: palette.card, borderColor: palette.cardBorder, borderLeftColor: palette.plumMid, borderLeftWidth: 3, borderRadius: 4, borderWidth: 1, marginBottom: 14, paddingBottom: space.sm, paddingHorizontal: 18, paddingTop: space.lg },
  groupTimeRow: { flexDirection: "row" },
  groupTime: { color: palette.plum, fontFamily: font.semibold, fontSize: 15, lineHeight: 22 },
  session: { paddingBottom: space.lg, paddingTop: space.sm },
  sessionDivider: { borderTopColor: palette.hairline, borderTopWidth: 1, paddingTop: space.lg },
  sessionPast: { opacity: 0.62 },
  topline: { alignItems: "center", flexDirection: "row", flexWrap: "wrap", gap: 8 },
  until: { color: palette.muted, fontFamily: font.regular, fontSize: 13 },
  tag: { borderColor: "#cfc5e0", borderRadius: 2, borderWidth: 1, color: palette.plumMid, fontFamily: font.semibold, fontSize: 10, overflow: "hidden", paddingHorizontal: 6, paddingVertical: 1, textTransform: "uppercase" },
  tagNow: { backgroundColor: palette.plum, borderColor: palette.plum, color: palette.white },
  tagCanceled: { borderColor: "#e2b8be", color: palette.danger },
  titleRow: { alignItems: "flex-start", flexDirection: "row", gap: space.sm, marginTop: 4 },
  sessionTitle: { color: palette.heading, flex: 1, fontFamily: font.semibold, fontSize: 18, lineHeight: 25 },
  pendingTitle: { marginBottom: space.md },
  canceled: { textDecorationColor: "#a12636", textDecorationLine: "line-through" },
  body: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 22, marginTop: 6 },
  location: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 21, marginTop: 8 },
  locationLabel: { color: palette.muted, fontFamily: font.semibold, fontSize: 11 },
  pending: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 22, marginBottom: 14, paddingHorizontal: 4 }
});
