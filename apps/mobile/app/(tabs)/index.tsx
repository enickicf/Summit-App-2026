import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getActiveOperationalNotices, getEventPhase, getJumpToNowItem, groupPublishedProgramByDay, type OperationalNotice } from "@not-alone/domain";
import type { ScheduleItem } from "@not-alone/validation";
import { useSummit } from "../../components/summit-context";
import { OpeningGreeting } from "../../components/opening-greeting";
import { HeroLoop } from "../../components/hero-loop";
import { useResponsiveLayout } from "../../components/responsive-layout";
import { groupItemsByStart, PendingNotes, TimeGroupCard } from "../../components/schedule-cards";
import { waitlistNote } from "../../components/signup-controls";
import { sessionHref } from "../../lib/session-link";
import { cardShadow, font, gradients, liftShadow, palette, space } from "../../lib/summit-theme";

// Home is the attendee's portal: the website's hero loop, a one-line orientation, then the full
// Event Schedule (with activation sign-ups). Map, Ask AI and Info live in their own tabs.
export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const layout = useResponsiveLayout();
  const { snapshot, nowUtc, lastRevisionUpdateAt, syncing, syncError, refreshPublishedSnapshot } = useSummit();
  const groups = useMemo(() => groupPublishedProgramByDay(snapshot), [snapshot]);
  const eventPhase = getEventPhase(snapshot, nowUtc);
  const operationalNotices = getActiveOperationalNotices(snapshot, nowUtc);
  const hasSelectedInitialDay = useRef(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const selectedGroup = groups[Math.min(selectedDayIndex, Math.max(groups.length - 1, 0))];
  const eventLocalDate = new Intl.DateTimeFormat("en-CA", { timeZone: snapshot.event.timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(nowUtc));
  const videoWidth = Math.min(layout.width, 720) - layout.gutter * 2;
  const videoHeight = Math.round(Math.min(videoWidth * 0.62, 320));

  useEffect(() => {
    if (groups.length === 0) {
      setSelectedDayIndex(0);
      return;
    }
    if (!hasSelectedInitialDay.current) {
      // Open on today during the event, on the first day before it, otherwise on the next published item.
      const target = getJumpToNowItem(snapshot.scheduleItems, nowUtc);
      const targetIndex = target ? groups.findIndex((group) => group.items.some((item) => item.id === target.id)) : 0;
      const currentDay = groups.findIndex(group => group.date === eventLocalDate);
      setSelectedDayIndex(currentDay >= 0 ? currentDay : eventLocalDate < groups[0]!.date ? 0 : Math.max(targetIndex, 0));
      hasSelectedInitialDay.current = true;
      return;
    }
    if (selectedDayIndex >= groups.length) setSelectedDayIndex(0);
  }, [groups, nowUtc, eventLocalDate, selectedDayIndex, snapshot.scheduleItems]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshPublishedSnapshot();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <OpeningGreeting />
      <ScrollView
        contentContainerStyle={layout.contentStyle}
        contentInsetAdjustmentBehavior="never"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} tintColor={palette.violet} />}
        style={styles.screen}
      >
        <View style={layout.paddingStyle}>
          <View style={[styles.video, liftShadow, { height: videoHeight }]}>
            <HeroLoop />
            <LinearGradient colors={["transparent", "rgba(47, 37, 66, 0.82)"]} locations={[0.4, 1]} style={StyleSheet.absoluteFill} />
            <View style={styles.videoCopy}>
              <Text accessibilityRole="header" style={styles.videoTitle}>Not Alone Summit <Text style={styles.videoYear}>2026</Text></Text>
              <Text style={styles.videoMeta}>{snapshot.event.dateLabel.split(" · ")[0]} · {snapshot.event.venueName}</Text>
            </View>
          </View>

          {syncing || syncError ? (
            <View style={styles.syncStrip}>
              <View style={[styles.syncDot, syncError ? styles.syncDotWarn : styles.syncDotReady]} />
              <Text style={styles.syncText}>{syncing ? "Checking for the latest schedule." : "Using the saved schedule while reconnecting."}</Text>
            </View>
          ) : null}
          {operationalNotices.length > 0 ? <NoticeStack notices={operationalNotices} scheduleItems={snapshot.scheduleItems} /> : null}

          <Text style={styles.intro}>
            Welcome. This is your portal for the Summit: the full event schedule, the venue map and everything you need to know.
            {" "}Activations have limited space, so tap <Text style={styles.introStrong}>Sign up</Text> on the ones you'd like to join.
          </Text>

          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Event Schedule</Text>
            {lastRevisionUpdateAt ? <Text style={styles.updated}>Updated {formatSyncTime(lastRevisionUpdateAt)}</Text> : null}
          </View>

          {eventPhase === "after" ? (
            <View style={styles.completeBanner}>
              <Text style={styles.eyebrow}>Event complete</Text>
              <Text style={styles.completeTitle}>Thank you for being part of the Summit.</Text>
              <Text style={styles.body}>The full agenda remains available for reference.</Text>
            </View>
          ) : null}

          {groups.length === 0 ? (
            <View style={[styles.empty, cardShadow]}>
              <Text style={styles.emptyTitle}>No sessions published yet</Text>
              <Text style={styles.body}>Times will appear here once the event team publishes the schedule.</Text>
            </View>
          ) : (
            <>
              <View accessibilityRole="tablist" style={styles.dayRail}>
                {groups.map((group, index) => {
                  const selected = selectedDayIndex === index;
                  const label = <>
                    <Text style={[styles.dayName, selected && styles.dayNameActive]}>{group.date === eventLocalDate ? "Today" : group.weekday}</Text>
                    <Text style={[styles.dayDate, selected && styles.dayDateActive]}>{group.shortDate}</Text>
                  </>;
                  return (
                    <Pressable
                      accessibilityLabel={`${group.weekday}, ${group.shortDate}, ${group.items.length} events`}
                      accessibilityRole="tab"
                      accessibilityState={{ selected }}
                      key={group.dayLabel}
                      onPress={() => {
                        hasSelectedInitialDay.current = true;
                        setSelectedDayIndex(index);
                      }}
                      style={({ pressed }) => [styles.dayTabSlot, pressed && styles.pressed]}
                    >
                      {selected
                        ? <LinearGradient colors={[...gradients.plum]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.dayTab, styles.dayTabActive, liftShadow]}>{label}</LinearGradient>
                        : <View style={styles.dayTab}>{label}</View>}
                    </Pressable>
                  );
                })}
              </View>

              {selectedGroup ? (
                <View key={selectedGroup.dayLabel} style={styles.day}>
                  <Text accessibilityRole="header" style={styles.dayTitle}>{selectedGroup.dayLabel}</Text>
                  {groupItemsByStart(selectedGroup.items).map(items => <TimeGroupCard items={items} key={items[0]!.startUtc} nowUtc={nowUtc} />)}
                  <PendingNotes notes={selectedGroup.notes} />
                  {selectedGroup.items.length === 0 && selectedGroup.notes.length === 0 ? <Text style={styles.body}>No published sessions for this day.</Text> : null}
                </View>
              ) : null}
              <Text style={styles.footnote}>{waitlistNote}</Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NoticeStack({ notices, scheduleItems }: { notices: OperationalNotice[]; scheduleItems: ScheduleItem[] }) {
  return (
    <View accessibilityLabel="Important event updates" style={styles.noticeStack}>
      {notices.map((notice) => {
        const body = <View style={[styles.notice, notice.severity === "urgent" && styles.noticeUrgent]}>
          <Text style={[styles.noticeLabel, notice.severity === "urgent" && styles.noticeLabelUrgent]}>{notice.severity === "urgent" ? "Urgent notice" : notice.severity === "change" ? "Schedule update" : "Event notice"}</Text>
          <Text style={styles.noticeTitle}>{notice.title}</Text>
          <Text style={styles.noticeBody}>{notice.body}</Text>
        </View>;
        const item = notice.scheduleItemId ? scheduleItems.find((candidate) => candidate.id === notice.scheduleItemId) : undefined;
        return notice.scheduleItemId ? <Link href={item ? sessionHref(item) : { pathname: "/session/[id]", params: { id: notice.scheduleItemId } }} asChild key={notice.id}><Pressable accessibilityRole="button">{body}</Pressable></Link> : <View key={notice.id}>{body}</View>;
      })}
    </View>
  );
}

function formatSyncTime(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.canvas, flex: 1 },
  screen: { backgroundColor: palette.canvas },
  video: { backgroundColor: "#9b98d8", borderRadius: 14, marginTop: space.sm, overflow: "hidden" },
  videoCopy: { bottom: 0, left: 0, padding: space.lg, position: "absolute", right: 0 },
  videoTitle: { color: palette.white, fontFamily: font.semibold, fontSize: 26, lineHeight: 32, textShadowColor: "rgba(47, 37, 66, 0.35)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 },
  videoYear: { color: palette.gold, fontFamily: font.semibold },
  videoMeta: { color: "rgba(255, 255, 255, 0.9)", fontFamily: font.regular, fontSize: 12, marginTop: 2 },
  syncStrip: { alignItems: "center", backgroundColor: palette.card, borderColor: palette.rule, borderRadius: 6, borderWidth: 1, flexDirection: "row", gap: space.sm, marginTop: space.md, minHeight: 38, paddingHorizontal: space.md },
  syncDot: { borderRadius: 8, height: 8, width: 8 },
  syncDotReady: { backgroundColor: palette.violet },
  syncDotWarn: { backgroundColor: palette.gold },
  syncText: { color: palette.body, flex: 1, fontFamily: font.medium, fontSize: 12 },
  noticeStack: { gap: space.sm, marginTop: space.md },
  notice: { backgroundColor: palette.card, borderColor: palette.cardBorder, borderLeftColor: palette.plumMid, borderLeftWidth: 3, borderRadius: 4, borderWidth: 1, padding: space.md },
  noticeUrgent: { backgroundColor: palette.dangerSoft, borderColor: "#e2b8be", borderLeftColor: palette.danger },
  noticeLabel: { color: palette.violet, fontFamily: font.semibold, fontSize: 10, textTransform: "uppercase" },
  noticeLabelUrgent: { color: palette.danger },
  noticeTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 16, lineHeight: 22, marginTop: 3 },
  noticeBody: { color: palette.body, fontFamily: font.regular, fontSize: 13, lineHeight: 20, marginTop: space.xs },
  intro: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 22, marginTop: space.lg },
  introStrong: { color: palette.plum, fontFamily: font.semibold },
  header: { alignItems: "baseline", borderBottomColor: palette.rule, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: space.xl, paddingBottom: space.md },
  eyebrow: { color: palette.violet, fontFamily: font.semibold, fontSize: 12, textTransform: "uppercase" },
  title: { color: palette.ink, fontFamily: font.semibold, fontSize: 28, lineHeight: 36 },
  updated: { color: palette.muted, fontFamily: font.regular, fontSize: 12 },
  completeBanner: { borderLeftColor: palette.violet, borderLeftWidth: 3, marginTop: space.lg, paddingHorizontal: space.md, paddingVertical: space.xs },
  completeTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 17, lineHeight: 24, marginTop: 4 },
  empty: { backgroundColor: palette.card, borderColor: palette.cardBorder, borderLeftColor: palette.plumMid, borderLeftWidth: 3, borderRadius: 4, borderWidth: 1, marginTop: space.lg, padding: space.lg },
  emptyTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 18 },
  dayRail: { flexDirection: "row", gap: 6, marginTop: space.lg },
  dayTabSlot: { flex: 1, minWidth: 0 },
  dayTab: { alignItems: "center", backgroundColor: "#f7f6f9", borderColor: palette.rule, borderRadius: 10, borderWidth: 1, justifyContent: "center", minHeight: 64, paddingHorizontal: 2, paddingVertical: 10 },
  dayTabActive: { borderColor: palette.plum },
  dayName: { color: "#746985", fontFamily: font.semibold, fontSize: 11, textTransform: "uppercase" },
  dayNameActive: { color: palette.blush },
  dayDate: { color: palette.ink, fontFamily: font.semibold, fontSize: 15, marginTop: 2 },
  dayDateActive: { color: palette.white },
  day: { paddingTop: space.lg },
  dayTitle: { color: palette.plum, fontFamily: font.semibold, fontSize: 16, marginBottom: space.md },
  body: { color: palette.body, fontFamily: font.regular, fontSize: 14, lineHeight: 22, marginTop: 6 },
  footnote: { color: palette.muted, fontFamily: font.regular, fontSize: 12, lineHeight: 18, marginTop: space.sm },
  pressed: { opacity: 0.8 }
});
