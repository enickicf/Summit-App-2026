import { LinearGradient } from "expo-linear-gradient";
import { ArrowUpRight, ChevronDown, Play } from "lucide-react-native";
import { useState } from "react";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSummit } from "../../components/summit-context";
import { useResponsiveLayout } from "../../components/responsive-layout";
import { SocialIcon, type SocialPlatform } from "../../components/social-icon";
import { GuestProfileSheet, PeopleGrid, Portrait, ScreenHeader, SectionTitle } from "../../components/summit-ui";
import { HighlightVideo } from "../../components/highlight-video";
import { isOptionalExperience } from "@not-alone/domain/experiences";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import { awardsContent, guestCategories, guestsIn, summitGuests, type SummitGuest } from "../../lib/summit-people";
import { mobileApiBaseUrl } from "../../lib/mobile-api";
import { cardShadow, font, gradients, liftShadow, notAloneSocials, palette, space, summitLinks } from "../../lib/summit-theme";

const icfMark = require("../../assets/icf-mark.png");
// The public 2025 Summit film from ICF's Summit page, bundled so it plays inside the app.
const summitFilm = require("../../assets/videos/summit-2025-film.mp4");
const summitFilmPoster = require("../../assets/summit-hero-poster.jpg");
const socialPlatforms: Record<string, SocialPlatform> = { Instagram: "instagram", YouTube: "youtube", LinkedIn: "linkedin" };

export default function InfoScreen() {
  const layout = useResponsiveLayout();
  const [view, setView] = useState<"summit" | "awards">("summit");
  const [profile, setProfile] = useState<SummitGuest | null>(null);
  const contentWidth = Math.min(layout.width, 720) - layout.gutter * 2;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={layout.contentStyle} contentInsetAdjustmentBehavior="automatic" style={styles.screen}>
        <View style={layout.paddingStyle}>
          <ScreenHeader eyebrow="Not Alone 2026" title="Info" />
          <View accessibilityRole="tablist" style={styles.segment}>
            {([["summit", "Summit"], ["awards", "Awards"]] as const).map(([key, label]) => (
              <Pressable accessibilityRole="tab" accessibilityState={{ selected: view === key }} key={key} onPress={() => setView(key)} style={[styles.segmentItem, view === key && styles.segmentItemActive]}>
                <Text style={[styles.segmentText, view === key && styles.segmentTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {view === "summit"
            ? <SummitInfo contentWidth={contentWidth} onSelect={setProfile} />
            : <AwardsInfo contentWidth={contentWidth} onSelect={setProfile} />}
        </View>
      </ScrollView>
      <GuestProfileSheet onClose={() => setProfile(null)} person={profile} />
    </SafeAreaView>
  );
}

function SummitInfo({ contentWidth, onSelect }: { contentWidth: number; onSelect: (person: SummitGuest) => void }) {
  const { snapshot } = useSummit();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const officialContent = snapshot.contentPages.find((page) => page.slug === "inspiring-children-foundation" && page.published);
  const faqs = snapshot.faqs.filter((faq) => faq.published);
  const sponsors = snapshot.sponsors.filter((sponsor) => sponsor.published);
  const details = [
    ["Dates", snapshot.event.dateLabel],
    ["Venue", snapshot.event.venueName],
    ["City", snapshot.event.city],
    ["Presented by", snapshot.event.presentedBy],
    ["Powered by", snapshot.event.poweredBy]
  ].filter(([, value]) => Boolean(value?.trim()));
  const glance = [
    [String(groupPublishedProgramByDay(snapshot).length), "days"],
    [String(snapshot.scheduleItems.filter(item => item.published && item.visibilityScope.id === "public").length), "scheduled moments"],
    [String(snapshot.scheduleItems.filter(isOptionalExperience).length), "activations"],
    [String(summitGuests.length), "talent & founders"]
  ];

  return (
    <>
      <LinearGradient colors={[...gradients.band]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={styles.quoteCard}>
        <Text style={styles.quote}>“The Davos of Human Development”</Text>
        <Text style={styles.quoteBy}>— Jewel</Text>
        <Text style={styles.quoteCopy}>The Not Alone Summit, powered by the Steven &amp; Alexandra Cohen Foundation, brings together leading CEOs, artists, athletes, philanthropists, clinicians, researchers, and youth ambassadors to advance emotional and mental health.</Text>
      </LinearGradient>

      <View style={styles.section}>
        <SectionTitle eyebrow="From the inaugural gathering" title="2025 Highlights" />
        <HighlightVideo aspectRatio={4 / 5} duration="0:59" eyebrow="2025 Summit film" poster={summitFilmPoster} source={summitFilm} title="The 2025 Not Alone Summit" />
      </View>

      <View style={[styles.detailCard, cardShadow]}>
        {details.map(([label, value], index) => (
          <View key={label} style={[styles.detailRow, index > 0 && styles.divider]}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.glance, cardShadow]}>
        {glance.map(([value, label]) => (
          <View key={label} style={styles.glanceItem}>
            <Text style={styles.glanceValue}>{value}</Text>
            <Text style={styles.glanceLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <SectionTitle eyebrow="2026 Summit" title="Talent & Founders" />
        {guestCategories.map(category => (
          <View key={category} style={styles.peopleGroup}>
            <Text accessibilityRole="header" style={styles.groupTitle}>{category}</Text>
            <PeopleGrid onSelect={onSelect} people={guestsIn(category)} width={contentWidth} />
          </View>
        ))}
      </View>

      <View style={[styles.about, cardShadow]}>
        <Image accessibilityLabel="Inspiring Children Foundation" resizeMode="contain" source={icfMark} style={styles.icfMark} />
        <Text accessibilityRole="header" style={styles.aboutTitle}>{officialContent?.title ?? snapshot.event.organizationName}</Text>
        <Text style={styles.aboutCopy}>
          {officialContent?.body ?? "The Not Alone Program (the Challenge, Summit, and Awards Show) is produced by the Inspiring Children Foundation, a 501(c)(3) nonprofit that has spent 25 years helping at-risk youth heal, grow, and thrive."}
        </Text>
      </View>

      {faqs.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle title="Frequently asked questions" />
          <View style={[styles.listCard, cardShadow]}>
            {faqs.map((faq, index) => {
              const open = openFaq === faq.id;
              return (
                <View key={faq.id} style={index > 0 && styles.divider}>
                  <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenFaq(open ? null : faq.id)} style={styles.faqRow}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <ChevronDown color={palette.violet} size={18} strokeWidth={2.2} style={open ? styles.rotated : undefined} />
                  </Pressable>
                  {open ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      {sponsors.length > 0 ? (
        <View style={styles.section}>
          <SectionTitle title="Partners" />
          <View style={styles.sponsorGrid}>
            {sponsors.map((sponsor) => (
              <Pressable accessibilityLabel={sponsor.name} accessibilityRole={sponsor.websiteUrl ? "link" : undefined} disabled={!sponsor.websiteUrl} key={sponsor.id} onPress={() => sponsor.websiteUrl ? void Linking.openURL(sponsor.websiteUrl) : undefined} style={[styles.sponsor, cardShadow]}>
                {sponsor.logoUrl ? <Image accessibilityLabel={`${sponsor.name} logo`} resizeMode="contain" source={{ uri: sponsor.logoUrl }} style={styles.sponsorLogo} /> : <Text style={styles.sponsorName}>{sponsor.name}</Text>}
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle title="Contact" />
        <View style={[styles.listCard, cardShadow]}>
          {[
            ["Inspiring Children Foundation", summitLinks.icf],
            ["Contact Staff", summitLinks.contactStaff],
            ["Partner with us", summitLinks.partnerWithUs],
            ["Privacy Policy", `${mobileApiBaseUrl}/privacy`]
          ].map(([label, url], index) => (
            <Pressable accessibilityRole="link" key={label} onPress={() => void Linking.openURL(url!)} style={({ pressed }) => [styles.linkRow, index > 0 && styles.divider, pressed && styles.pressed]}>
              <Text style={styles.linkLabel}>{label}</Text>
              <ArrowUpRight color={palette.violetDeep} size={16} strokeWidth={2.2} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.socials}>
        <Text style={styles.socialsTitle}>Not Alone socials</Text>
        <View style={styles.socialRow}>
          {notAloneSocials.map(social => (
            <Pressable accessibilityLabel={`Not Alone on ${social.label}`} accessibilityRole="link" key={social.label} onPress={() => void Linking.openURL(social.url)} style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}>
              <SocialIcon color={palette.white} platform={socialPlatforms[social.label]!} />
            </Pressable>
          ))}
        </View>
        <Text style={styles.footerLine}>Not Alone Summit · An Inspiring Children event</Text>
      </View>
    </>
  );
}

// A condensed version of the website's 2026 Awards page: the evening, the host, how to attend or
// watch, and last year's highlights and winners. Summit people are on the Summit view.
// Confirmed 2026 talent (website talent categories plus other confirmed talent); co-chairs,
// founders and producers stay on the Summit view, and the host has her own card here.
const awardsTalentSections = ["Musicians", "Entertainers & Athletes", "Experts", "Business Leaders & Philanthropists", "Talent"];

function AwardsInfo({ contentWidth, onSelect }: { contentWidth: number; onSelect: (person: SummitGuest) => void }) {
  const host = awardsContent.host;
  const hostPerson: SummitGuest | null = host ? { ...host, category: "Hosts" } : null;
  return (
    <>
      <LinearGradient colors={["#2f2542", "#4c376f"]} end={{ x: 1, y: 1 }} start={{ x: 0, y: 0 }} style={[styles.awardsHero, liftShadow]}>
        <Text style={styles.awardsVenue}>{awardsContent.venue}</Text>
        <Text accessibilityRole="header" style={styles.awardsTitle}>Not Alone Awards <Text style={styles.awardsYear}>2026</Text></Text>
        <Text style={styles.awardsDate}>{awardsContent.date}</Text>
        <View style={styles.times}>
          {awardsContent.times.map(item => (
            <View key={item.label} style={styles.timeItem}>
              <Text style={styles.timeLabel}>{item.label}</Text>
              <Text style={styles.timeValue}>{compactRange(item.time)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.awardsActions}>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(awardsContent.rsvpUrl)} style={({ pressed }) => [styles.rsvp, pressed && styles.pressed]}>
            <Text style={styles.rsvpText}>RSVP for the Awards</Text>
          </Pressable>
          <Pressable accessibilityLabel="Stream live on iHeartRadio" accessibilityRole="link" onPress={() => void Linking.openURL(awardsContent.iHeartUrl)} style={({ pressed }) => [styles.stream, pressed && styles.pressed]}>
            <Play color={palette.white} fill={palette.white} size={12} strokeWidth={2} />
            <Text style={styles.streamText}>Stream live on iHeartRadio</Text>
          </Pressable>
        </View>
        <Text style={styles.awardsPowered}>Powered by {awardsContent.foundation}</Text>
      </LinearGradient>

      <Text style={styles.awardsIntro}>{awardsContent.intro}</Text>

      {hostPerson ? (
        <Pressable accessibilityLabel={`${hostPerson.name}, your 2026 host. Open profile`} accessibilityRole="button" onPress={() => onSelect(hostPerson)} style={({ pressed }) => [styles.hostCard, cardShadow, pressed && styles.pressed]}>
          <Portrait person={hostPerson} size={72} />
          <View style={styles.hostText}>
            <Text style={styles.eyebrow}>Your 2026 host</Text>
            <Text style={styles.hostName}>{hostPerson.name}</Text>
            <Text style={styles.hostRole}>{hostPerson.role}</Text>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.section}>
        <SectionTitle eyebrow="2026 Awards" title="Confirmed talent" />
        {awardsTalentSections.filter(category => guestsIn(category).length > 0).map(category => (
          <View key={category} style={styles.peopleGroup}>
            <Text accessibilityRole="header" style={styles.groupTitle}>{category}</Text>
            <PeopleGrid onSelect={onSelect} people={guestsIn(category)} width={contentWidth} />
          </View>
        ))}
      </View>

      <Pressable accessibilityLabel="Watch the 2025 Awards highlights" accessibilityRole="link" onPress={() => void Linking.openURL(awardsContent.highlights.url)} style={({ pressed }) => [styles.highlight, cardShadow, pressed && styles.pressed]}>
        <View style={styles.playBadge}><Play color={palette.white} fill={palette.white} size={14} strokeWidth={2} /></View>
        <View style={styles.hostText}>
          <Text style={styles.eyebrow}>From the inaugural celebration · {awardsContent.highlights.duration}</Text>
          <Text style={styles.highlightTitle}>Watch the 2025 highlights</Text>
        </View>
        <ArrowUpRight color={palette.violetDeep} size={16} strokeWidth={2.2} />
      </Pressable>

      <View style={styles.section}>
        <SectionTitle eyebrow="2025" title="Award winners" />
        <View style={[styles.listCard, cardShadow]}>
          {awardsContent.winners2025.map((winner, index) => (
            <View key={winner.award} style={[styles.winnerRow, index > 0 && styles.divider]}>
              <Text style={styles.winnerAward}>{winner.award}</Text>
              <Text style={styles.winnerName}>{winner.recipient}</Text>
              {"note" in winner && winner.note ? <Text style={styles.winnerNote}>{winner.note}</Text> : null}
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

// "8:00 PM-10:00 PM" -> "8:00–10:00 PM" so each time fits its column.
function compactRange(time: string) {
  const match = /^(\d{1,2}:\d{2}) (AM|PM)-(\d{1,2}:\d{2}) (AM|PM)$/.exec(time);
  if (!match) return time;
  return match[2] === match[4] ? `${match[1]}–${match[3]} ${match[4]}` : `${match[1]} ${match[2]}–${match[3]} ${match[4]}`;
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: palette.canvas, flex: 1 },
  screen: { backgroundColor: palette.canvas },
  segment: { backgroundColor: "#e4e1ea", borderRadius: 999, flexDirection: "row", marginTop: space.lg, padding: 3 },
  segmentItem: { alignItems: "center", borderRadius: 999, flex: 1, justifyContent: "center", minHeight: 34 },
  segmentItemActive: { backgroundColor: palette.white, shadowColor: palette.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  segmentText: { color: palette.muted, fontFamily: font.medium, fontSize: 13 },
  segmentTextActive: { color: palette.plum, fontFamily: font.semibold },
  eyebrow: { color: palette.violet, fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase" },
  quoteCard: { borderRadius: 12, marginTop: space.lg, padding: space.lg },
  quote: { color: palette.violet, fontFamily: font.script, fontSize: 32, lineHeight: 40 },
  quoteBy: { color: palette.ink, fontFamily: font.medium, fontSize: 13, marginTop: 2 },
  quoteCopy: { color: palette.ink, fontFamily: font.regular, fontSize: 13.5, lineHeight: 22, marginTop: space.sm },
  detailCard: { backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 10, borderWidth: 1, marginTop: space.md, paddingHorizontal: space.lg },
  detailRow: { flexDirection: "row", gap: space.md, paddingVertical: 12 },
  divider: { borderTopColor: palette.hairline, borderTopWidth: 1 },
  detailLabel: { color: palette.muted, fontFamily: font.semibold, fontSize: 10.5, paddingTop: 2, textTransform: "uppercase", width: 92 },
  detailValue: { color: palette.ink, flex: 1, fontFamily: font.medium, fontSize: 13.5, lineHeight: 20 },
  glance: { backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 10, borderWidth: 1, flexDirection: "row", marginTop: space.md, paddingVertical: space.md },
  glanceItem: { alignItems: "center", flex: 1 },
  glanceValue: { color: palette.plum, fontFamily: font.semibold, fontSize: 22, lineHeight: 28 },
  glanceLabel: { color: palette.muted, fontFamily: font.medium, fontSize: 10, textAlign: "center" },
  section: { marginTop: space.xl },
  peopleGroup: { marginTop: space.md },
  groupTitle: { borderBottomColor: palette.rule, borderBottomWidth: 1, color: palette.ink, fontFamily: font.semibold, fontSize: 14, marginBottom: space.md, paddingBottom: 6 },
  about: { alignItems: "center", backgroundColor: palette.card, borderColor: palette.cardBorder, borderRadius: 10, borderWidth: 1, marginTop: space.xl, padding: space.lg },
  icfMark: { height: 56, width: 56 },
  aboutTitle: { color: palette.ink, fontFamily: font.semibold, fontSize: 17, lineHeight: 24, marginTop: space.sm, textAlign: "center" },
  aboutCopy: { color: palette.body, fontFamily: font.regular, fontSize: 13.5, lineHeight: 22, marginTop: space.sm, textAlign: "center" },
  listCard: { backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 10, borderWidth: 1, paddingHorizontal: space.lg },
  faqRow: { alignItems: "center", flexDirection: "row", gap: space.md, minHeight: 52, paddingVertical: space.md },
  faqQuestion: { color: palette.heading, flex: 1, fontFamily: font.semibold, fontSize: 14.5, lineHeight: 21 },
  faqAnswer: { color: palette.body, fontFamily: font.regular, fontSize: 13.5, lineHeight: 21, paddingBottom: space.lg },
  rotated: { transform: [{ rotate: "180deg" }] },
  sponsorGrid: { flexDirection: "row", flexWrap: "wrap", gap: space.md, justifyContent: "center" },
  sponsor: { alignItems: "center", backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 10, borderWidth: 1, height: 84, justifyContent: "center", padding: space.md, width: "47%" },
  sponsorLogo: { height: "100%", width: "100%" },
  sponsorName: { color: palette.ink, fontFamily: font.semibold, fontSize: 13, textAlign: "center" },
  linkRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 50 },
  linkLabel: { color: palette.ink, flex: 1, fontFamily: font.medium, fontSize: 14.5 },
  socials: { alignItems: "center", marginTop: space.xxl },
  socialsTitle: { color: palette.ink, fontFamily: font.semibold, fontSize: 13 },
  socialRow: { flexDirection: "row", gap: space.md, marginTop: space.md },
  socialButton: { alignItems: "center", backgroundColor: palette.plumMid, borderRadius: 999, height: 42, justifyContent: "center", width: 42 },
  footerLine: { color: palette.muted, fontFamily: font.regular, fontSize: 11.5, marginTop: space.lg, textAlign: "center" },
  awardsHero: { borderRadius: 14, marginTop: space.lg, padding: space.lg },
  awardsVenue: { color: "#d9c9ef", fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase" },
  awardsTitle: { color: palette.white, fontFamily: font.semibold, fontSize: 26, lineHeight: 32, marginTop: 6 },
  awardsYear: { color: palette.gold },
  awardsDate: { color: "rgba(255, 255, 255, 0.88)", fontFamily: font.regular, fontSize: 13.5, marginTop: 4 },
  times: { borderColor: "rgba(255, 255, 255, 0.16)", borderRadius: 10, borderWidth: 1, flexDirection: "row", marginTop: space.lg },
  timeItem: { alignItems: "center", flex: 1, paddingVertical: 10 },
  timeLabel: { color: "#d9c9ef", fontFamily: font.medium, fontSize: 10, textTransform: "uppercase" },
  timeValue: { color: palette.white, fontFamily: font.semibold, fontSize: 12.5, marginTop: 2, textAlign: "center" },
  awardsActions: { gap: 10, marginTop: space.lg },
  rsvp: { alignItems: "center", backgroundColor: palette.gold, borderRadius: 999, justifyContent: "center", minHeight: 44 },
  rsvpText: { color: "#2f2542", fontFamily: font.semibold, fontSize: 14 },
  stream: { alignItems: "center", borderColor: "rgba(255, 255, 255, 0.4)", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 44 },
  streamText: { color: palette.white, fontFamily: font.semibold, fontSize: 13.5 },
  awardsPowered: { color: "rgba(255, 255, 255, 0.7)", fontFamily: font.regular, fontSize: 11, marginTop: space.lg, textAlign: "center" },
  awardsIntro: { color: palette.body, fontFamily: font.regular, fontSize: 13.5, lineHeight: 22, marginTop: space.lg },
  hostCard: { alignItems: "center", backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: space.md, marginTop: space.lg, padding: space.md },
  hostText: { flex: 1 },
  hostName: { color: palette.heading, fontFamily: font.semibold, fontSize: 17, marginTop: 2 },
  hostRole: { color: palette.muted, fontFamily: font.regular, fontSize: 12.5 },
  highlight: { alignItems: "center", backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: space.md, marginTop: space.md, padding: space.md },
  playBadge: { alignItems: "center", backgroundColor: palette.plum, borderRadius: 999, height: 40, justifyContent: "center", width: 40 },
  highlightTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 15, marginTop: 2 },
  winnerRow: { paddingVertical: 12 },
  winnerAward: { color: palette.violet, fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 0.4, textTransform: "uppercase" },
  winnerName: { color: palette.heading, fontFamily: font.semibold, fontSize: 14.5, lineHeight: 21, marginTop: 2 },
  winnerNote: { color: palette.muted, fontFamily: font.regular, fontSize: 12, marginTop: 1 },
  pressed: { opacity: 0.82 }
});
