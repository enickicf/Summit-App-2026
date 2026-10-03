import { Link } from "expo-router";
import { ArrowUp, Sparkles } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createAttendeeConciergeAnswer } from "@not-alone/domain/concierge";
import { toEventTimeRange } from "@not-alone/domain";
import type { ScheduleItem } from "@not-alone/validation";
import { useSummit } from "../../components/summit-context";
import { useResponsiveLayout } from "../../components/responsive-layout";
import { ScreenHeader } from "../../components/summit-ui";
import { sessionHref } from "../../lib/session-link";
import { displayLocation } from "../../lib/schedule-presentation";
import { cardShadow, font, palette, space, summitLinks } from "../../lib/summit-theme";

// The same examples the website's Ask AI types into its empty field.
const exampleQuestions = [
  "What is the Inspiring Children Foundation?",
  "When is the Not Alone Summit?",
  "Where is the Summit being held?",
  "Who is hosting the Not Alone Awards?",
  "What happens on Monday, November 2?",
  "What are ICF's 10 pillars?",
  "How can I donate to Inspiring Children?"
] as const;

type Answer = { question: string; body: string; items: ScheduleItem[]; offline: boolean };

export default function HelpScreen() {
  const layout = useResponsiveLayout();
  const { snapshot, nowUtc } = useSummit();
  const [question, setQuestion] = useState("");
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const active = useRef<AbortController | null>(null);
  const placeholder = useTypewriterPlaceholder(question.length === 0);
  const canSend = question.trim().length >= 2 && !pending;

  useEffect(() => () => active.current?.abort(), []);

  function localAnswer(asked: string): Answer {
    const response = createAttendeeConciergeAnswer({ question: asked, snapshot, nowUtc });
    const itemById = new Map(snapshot.scheduleItems.map(item => [item.id, item]));
    return { question: asked, body: `${response.title}. ${response.body}`, items: response.items.flatMap(item => itemById.get(item.id) ?? []), offline: true };
  }

  async function ask(text: string) {
    const asked = text.trim().slice(0, 500);
    if (asked.length < 2 || active.current) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    active.current = controller;
    setPending(true);
    setAnswer(null);
    let next: Answer;
    try {
      // The public website's guarded endpoint: relevant questions only, grounded in published data.
      const response = await fetch(summitLinks.askAi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: asked }),
        signal: controller.signal
      });
      const result = (await response.json()) as { answer?: unknown };
      if (typeof result.answer !== "string" || !result.answer.trim()) throw new Error("No answer");
      next = { question: asked, body: result.answer, items: [], offline: false };
    } catch {
      next = localAnswer(asked);
    } finally {
      clearTimeout(timeout);
    }
    if (active.current !== controller) return;
    active.current = null;
    setPending(false);
    setAnswer(next);
    setQuestion("");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={layout.contentStyle} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" style={styles.screen}>
          <ScreenHeader eyebrow="Not Alone Summit 2026" style={layout.marginStyle} subtitle="Ask about the Not Alone Summit, the Not Alone Awards, or the Inspiring Children Foundation." title="Ask AI" />

          <View style={[styles.card, cardShadow, layout.marginStyle]}>
            <Text style={styles.label}>Your question</Text>
            <TextInput
              accessibilityLabel="Ask the summit concierge"
              editable={!pending}
              maxLength={500}
              multiline
              onChangeText={setQuestion}
              placeholder={placeholder}
              placeholderTextColor={palette.muted}
              style={styles.input}
              value={question}
            />
            <View style={styles.formFooter}>
              <Text style={styles.count}>{question.length}/500</Text>
              <Pressable
                accessibilityLabel="Send question"
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSend }}
                disabled={!canSend}
                onPress={() => void ask(question)}
                style={({ pressed }) => [styles.send, !canSend && styles.sendDisabled, pressed && styles.pressed]}
              >
                <Text style={styles.sendText}>Ask</Text>
                <ArrowUp color={palette.white} size={16} strokeWidth={2.6} />
              </Pressable>
            </View>
          </View>

          <View accessibilityLiveRegion="polite" style={layout.marginStyle}>
            {pending ? (
              <View style={styles.pending}>
                <ActivityIndicator color={palette.violet} />
                <Text style={styles.pendingText}>Checking event information...</Text>
              </View>
            ) : answer ? (
              <View style={[styles.answer, cardShadow]}>
                <View style={styles.answerTop}>
                  <Sparkles color={palette.violet} size={15} strokeWidth={2.2} />
                  <Text style={styles.answerKicker}>{answer.offline ? "Answer from the saved schedule" : "Answer"}</Text>
                </View>
                <Text style={styles.answerQuestion}>{answer.question}</Text>
                <Text style={styles.answerBody}>{answer.body}</Text>
                {answer.items.map((item, index) => (
                  <Link asChild href={sessionHref(item)} key={`${item.id}-${index}`}>
                    <Pressable accessibilityLabel={`${item.title}. ${toEventTimeRange(item, snapshot.event.timeZone)}. ${displayLocation(item.locationName)}`} accessibilityRole="button" style={styles.answerItem}>
                      <Text style={styles.answerItemTime}>{toEventTimeRange(item, snapshot.event.timeZone)}</Text>
                      <Text style={styles.answerItemTitle}>{item.title}</Text>
                      <Text style={styles.answerItemMeta}>{displayLocation(item.locationName)}</Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            ) : null}
          </View>

          <View style={[styles.examples, layout.marginStyle]}>
            <Text style={styles.examplesTitle}>Try asking</Text>
            <View style={styles.chips}>
              {exampleQuestions.slice(0, 5).map(example => (
                <Pressable accessibilityRole="button" disabled={pending} key={example} onPress={() => void ask(example)} style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
                  <Text style={styles.chipText}>{example}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Types example questions into the empty field's placeholder; static under Reduce Motion. */
function useTypewriterPlaceholder(activeField: boolean) {
  const [text, setText] = useState<string>(exampleQuestions[0]);
  useEffect(() => {
    if (!activeField) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    void AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (cancelled || reduce) return;
      let question = 0;
      let length = 0;
      let deleting = false;
      const tick = () => {
        const target = exampleQuestions[question]!;
        length += deleting ? -1 : 1;
        setText(target.slice(0, length));
        let delay = deleting ? 28 : 55;
        if (!deleting && length === target.length) { deleting = true; delay = 1800; }
        else if (deleting && length === 0) { deleting = false; question = (question + 1) % exampleQuestions.length; delay = 400; }
        timer = setTimeout(tick, delay);
      };
      setText("");
      timer = setTimeout(tick, 500);
    });
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [activeField]);
  return text;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { backgroundColor: palette.canvas, flex: 1 },
  screen: { backgroundColor: palette.canvas },
  card: { backgroundColor: palette.white, borderColor: palette.cardBorder, borderRadius: 6, borderWidth: 1, marginTop: space.lg, padding: space.lg },
  label: { color: palette.ink, fontFamily: font.semibold, fontSize: 13 },
  input: { borderColor: palette.rule, borderRadius: 6, borderWidth: 1, color: palette.ink, fontFamily: font.regular, fontSize: 15, lineHeight: 22, marginTop: space.sm, minHeight: 96, paddingHorizontal: space.md, paddingTop: space.md, textAlignVertical: "top" },
  formFooter: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: space.md },
  count: { color: palette.muted, fontFamily: font.regular, fontSize: 12 },
  send: { alignItems: "center", backgroundColor: palette.plum, borderRadius: 999, flexDirection: "row", gap: 6, minHeight: 42, paddingHorizontal: 20 },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: palette.white, fontFamily: font.semibold, fontSize: 14 },
  pending: { alignItems: "center", flexDirection: "row", gap: space.sm, marginTop: space.lg, padding: space.md },
  pendingText: { color: palette.body, fontFamily: font.regular, fontSize: 14 },
  answer: { backgroundColor: palette.card, borderColor: palette.cardBorder, borderLeftColor: palette.plumMid, borderLeftWidth: 3, borderRadius: 4, borderWidth: 1, marginTop: space.lg, padding: space.lg },
  answerTop: { alignItems: "center", flexDirection: "row", gap: 6 },
  answerKicker: { color: palette.violet, fontFamily: font.semibold, fontSize: 11, textTransform: "uppercase" },
  answerQuestion: { color: palette.muted, fontFamily: font.medium, fontSize: 13, lineHeight: 19, marginTop: space.sm },
  answerBody: { color: palette.ink, fontFamily: font.regular, fontSize: 15, lineHeight: 24, marginTop: space.sm },
  answerItem: { backgroundColor: palette.white, borderColor: palette.rule, borderRadius: 4, borderWidth: 1, marginTop: space.sm, padding: space.md },
  answerItemTime: { color: palette.violetDeep, fontFamily: font.semibold, fontSize: 12 },
  answerItemTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 15, lineHeight: 21, marginTop: 2 },
  answerItemMeta: { color: palette.muted, fontFamily: font.regular, fontSize: 12, marginTop: 2 },
  examples: { marginTop: space.xl },
  examplesTitle: { color: palette.ink, fontFamily: font.semibold, fontSize: 14 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm, marginTop: space.md },
  chip: { backgroundColor: palette.lilac, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  chipText: { color: palette.plum, fontFamily: font.medium, fontSize: 13 },
  pressed: { opacity: 0.82 }
});
