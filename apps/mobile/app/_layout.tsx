import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { font, palette } from "../lib/summit-theme";
import { SummitProvider } from "../components/summit-context";
import { SignupsProvider } from "../components/signups-context";
import { NotificationNavigation } from "../components/notification-navigation";

void SplashScreen.preventAutoHideAsync();

const Montserrat_400Regular = require("@expo-google-fonts/montserrat/400Regular/Montserrat_400Regular.ttf");
const Montserrat_500Medium = require("@expo-google-fonts/montserrat/500Medium/Montserrat_500Medium.ttf");
const Montserrat_600SemiBold = require("@expo-google-fonts/montserrat/600SemiBold/Montserrat_600SemiBold.ttf");
const Montserrat_700Bold = require("@expo-google-fonts/montserrat/700Bold/Montserrat_700Bold.ttf");
const Montserrat_900Black = require("@expo-google-fonts/montserrat/900Black/Montserrat_900Black.ttf");
const PlayfairDisplay_400Regular = require("@expo-google-fonts/playfair-display/400Regular/PlayfairDisplay_400Regular.ttf");
const PlayfairDisplay_700Bold = require("@expo-google-fonts/playfair-display/700Bold/PlayfairDisplay_700Bold.ttf");
const Poppins_400Regular = require("@expo-google-fonts/poppins/400Regular/Poppins_400Regular.ttf");
const Poppins_500Medium = require("@expo-google-fonts/poppins/500Medium/Poppins_500Medium.ttf");
const Poppins_600SemiBold = require("@expo-google-fonts/poppins/600SemiBold/Poppins_600SemiBold.ttf");
const Poppins_700Bold = require("@expo-google-fonts/poppins/700Bold/Poppins_700Bold.ttf");
const GreatVibes_400Regular = require("@expo-google-fonts/great-vibes/400Regular/GreatVibes_400Regular.ttf");

export default function RootLayout() {
  const queryClient = useMemo(() => new QueryClient(), []);
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_900Black,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    GreatVibes_400Regular
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SummitProvider>
        <SignupsProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerBackTitle: "Back",
            headerLargeTitle: false,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: palette.canvas },
            headerTintColor: palette.violetDeep,
            headerTitleStyle: { color: palette.ink, fontFamily: font.semibold },
            headerBackTitleStyle: { fontFamily: font.medium },
            contentStyle: { backgroundColor: palette.canvas }
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="session/[id]" options={{ title: "Session" }} />
        </Stack>
        <NotificationNavigation />
        </SignupsProvider>
      </SummitProvider>
    </QueryClientProvider>
  );
}
