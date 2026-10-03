import { Check, Clock3, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { scheduleParticipation } from "@not-alone/domain/experiences";
import type { ScheduleItem } from "@not-alone/validation";
import { useSignups } from "./signups-context";
import { font, palette, space } from "../lib/summit-theme";

export const waitlistNote = "*Limited space: if an activation fills up, we'll let you know if you're on the waitlist.";

/** Only activations take a sign-up; panels, performances, the Awards and core programming don't. */
export function ParticipationControl({ item }: { item: ScheduleItem }) {
  if (item.status === "canceled" || scheduleParticipation(item) !== "experience") return null;
  return (
    <View style={styles.signupRow}>
      <SignupButton item={item} />
      <Text style={styles.limited}>*Limited space</Text>
    </View>
  );
}

export function SignupButton({ item }: { item: ScheduleItem }) {
  const { name, statusFor, join, leave, ready } = useSignups();
  const [askName, setAskName] = useState(false);
  const status = statusFor(item.id);

  function press() {
    if (!ready) return;
    if (status) {
      if (Platform.OS === "web") {
        if (globalThis.confirm?.(`Remove your sign-up for ${item.title}?`)) leave(item.id);
        return;
      }
      Alert.alert("Remove your sign-up?", item.title, [
        { text: "Keep it", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => leave(item.id) }
      ]);
      return;
    }
    if (!name) setAskName(true);
    else join(item.id);
  }

  return (
    <>
      <Pressable
        accessibilityLabel={status === "waitlisted" ? `On the waitlist for ${item.title}` : status ? `Confirmed for ${item.title}. Tap to remove` : `Sign up for ${item.title}`}
        accessibilityRole="button"
        hitSlop={6}
        onPress={press}
        style={({ pressed }) => [styles.button, status === "confirmed" && styles.buttonDone, status === "waitlisted" && styles.buttonWait, pressed && styles.pressed]}
      >
        {status === "confirmed" ? <Check color={palette.plum} size={14} strokeWidth={2.8} />
          : status === "waitlisted" ? <Clock3 color={palette.plum} size={14} strokeWidth={2.4} />
          : <Plus color={palette.white} size={14} strokeWidth={2.8} />}
        <Text style={[styles.buttonText, status && styles.buttonTextDone]}>{status === "confirmed" ? "Confirmed" : status === "waitlisted" ? "Waitlisted" : "Sign up"}</Text>
      </Pressable>
      <NamePrompt onDone={() => { setAskName(false); join(item.id); }} onCancel={() => setAskName(false)} visible={askName} />
    </>
  );
}

export function NamePrompt({ visible, onDone, onCancel }: { visible: boolean; onDone: () => void; onCancel: () => void }) {
  const { name, setName } = useSignups();
  const [value, setValue] = useState(name ?? "");
  useEffect(() => { if (visible) setValue(name ?? ""); }, [name, visible]);
  const valid = value.trim().length >= 2 && value.trim().length <= 80;
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.sheetEyebrow}>Activation sign-up</Text>
          <Text accessibilityRole="header" style={styles.sheetTitle}>What name should we put down?</Text>
          <Text style={styles.sheetBody}>Your name is shared only with the event team so they can plan numbers. It's never shown publicly.</Text>
          <TextInput
            accessibilityLabel="Your name"
            autoCapitalize="words"
            autoComplete="name"
            autoFocus
            maxLength={80}
            onChangeText={setValue}
            onSubmitEditing={() => { if (valid) { setName(value); onDone(); } }}
            placeholder="First and last name"
            placeholderTextColor={palette.muted}
            returnKeyType="done"
            style={styles.input}
            textContentType="name"
            value={value}
          />
          <View style={styles.sheetActions}>
            <Pressable accessibilityRole="button" onPress={onCancel} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: !valid }} disabled={!valid} onPress={() => { setName(value); onDone(); }} style={({ pressed }) => [styles.primary, !valid && styles.disabled, pressed && styles.pressed]}>
              <Text style={styles.primaryText}>Sign me up</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  signupRow: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 10 },
  limited: { color: palette.muted, fontFamily: font.medium, fontSize: 12 },
  button: { alignItems: "center", alignSelf: "flex-start", backgroundColor: palette.plum, borderColor: palette.plum, borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 6, minHeight: 36, paddingHorizontal: 14 },
  buttonDone: { backgroundColor: palette.lilac, borderColor: palette.cardBorder },
  buttonWait: { backgroundColor: "#fbf1dc", borderColor: "#ead3a1" },
  buttonText: { color: palette.white, fontFamily: font.semibold, fontSize: 13 },
  buttonTextDone: { color: palette.plum },
  backdrop: { backgroundColor: "rgba(47, 37, 66, 0.45)", flex: 1, justifyContent: "center", padding: space.lg },
  sheet: { alignSelf: "center", backgroundColor: palette.pearl, borderRadius: 12, maxWidth: 440, padding: space.lg, width: "100%" },
  sheetEyebrow: { color: palette.violet, fontFamily: font.semibold, fontSize: 11, textTransform: "uppercase" },
  sheetTitle: { color: palette.heading, fontFamily: font.semibold, fontSize: 20, lineHeight: 27, marginTop: 4 },
  sheetBody: { color: palette.body, fontFamily: font.regular, fontSize: 13, lineHeight: 20, marginTop: space.sm },
  input: { backgroundColor: palette.white, borderColor: palette.rule, borderRadius: 8, borderWidth: 1, color: palette.ink, fontFamily: font.regular, fontSize: 16, marginTop: space.md, minHeight: 48, paddingHorizontal: space.md },
  sheetActions: { flexDirection: "row", gap: space.sm, justifyContent: "flex-end", marginTop: space.lg },
  secondary: { borderRadius: 999, justifyContent: "center", minHeight: 44, paddingHorizontal: 18 },
  secondaryText: { color: palette.violetDeep, fontFamily: font.semibold, fontSize: 14 },
  primary: { backgroundColor: palette.plum, borderRadius: 999, justifyContent: "center", minHeight: 44, paddingHorizontal: 20 },
  primaryText: { color: palette.white, fontFamily: font.semibold, fontSize: 14 },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.82 }
});
