import { Tabs } from "expo-router";
import { House, Info, Map, Sparkles, type LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View, type ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { font, palette } from "../../lib/summit-theme";
import { useResponsiveLayout } from "../../components/responsive-layout";

const tabScreens = [
  { name: "index", title: "Home", icon: House },
  { name: "help", title: "Ask AI", icon: Sparkles },
  { name: "map", title: "Map", icon: Map },
  { name: "info", title: "Info", icon: Info }
] as const;

export default function TabsLayout() {
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const compact = layout.compact || layout.short;
  const bottomInset = Math.max(insets.bottom, compact ? 5 : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.plum,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: compact ? 10 : 11, letterSpacing: 0 },
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: palette.rule,
          height: (compact ? 54 : 62) + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: compact ? 6 : 9
        }
      }}
    >
      {tabScreens.map((screen) => (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            // "Event Schedule" is the longest label; shrink-to-fit keeps all five labels whole.
            tabBarLabel: ({ color }) => <Text adjustsFontSizeToFit maxFontSizeMultiplier={1.2} minimumFontScale={0.75} numberOfLines={1} style={[styles.label, { color, fontSize: compact ? 10 : 10.5 }]}>{screen.title}</Text>,
            tabBarIcon: ({ color, focused }) => <TabIcon color={color} focused={focused} icon={screen.icon} />
          }}
        />
      ))}
    </Tabs>
  );
}

function TabIcon({ color, focused, icon: Icon }: { color: ColorValue; focused: boolean; icon: LucideIcon }) {
  return (
    <View style={[styles.iconWell, focused && styles.iconWellActive]}>
      <Icon color={color} size={20} strokeWidth={focused ? 2.3 : 1.9} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: font.medium, letterSpacing: -0.1, marginTop: 2, textAlign: "center" },
  iconWell: { alignItems: "center", borderRadius: 999, height: 28, justifyContent: "center", width: 44 },
  iconWellActive: { backgroundColor: palette.lilac },
  tabBarBackground: {
    backgroundColor: "rgba(248, 247, 250, 0.98)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  }
});
