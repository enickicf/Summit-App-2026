// Attendee-app theme matching the public Summit website (plum / lavender / pearl, Poppins).
// Mobile-only on purpose: @not-alone/design-tokens is shared with the staff portal.
import { Platform } from "react-native";

export const palette = {
  canvas: "#ebe9f0",
  pearl: "#f2f1f5",
  card: "#f8f7fa",
  white: "#ffffff",
  ink: "#3b2f52",
  heading: "#2f2542",
  body: "#5d526b",
  muted: "#8a7f9b",
  rule: "#dcd8e4",
  hairline: "#eeebf2",
  cardBorder: "#c9bedb",
  plum: "#4c376f",
  plumMid: "#6f5c9c",
  violet: "#7464b9",
  violetDeep: "#6954a7",
  lilac: "#e7def4",
  blush: "#f2cfe0",
  gold: "#f0c477",
  danger: "#942235",
  dangerSoft: "#f6e4e7"
} as const;

export const gradients = {
  hero: ["rgba(141, 156, 223, 0.86)", "rgba(189, 159, 223, 0.55)", "rgba(239, 194, 212, 0.18)"] as const,
  heroFloor: ["transparent", "rgba(76, 55, 111, 0.78)"] as const,
  header: ["#7f8ed6", "#a58bd8", "#caa7df"] as const,
  band: ["#d9caee", "#f4d4e2"] as const,
  plum: ["#6f5c9c", "#4c376f"] as const
};

export const font = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
  script: "GreatVibes_400Regular"
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 20, xl: 28, xxl: 44 } as const;

export const cardShadow = Platform.select({
  web: { boxShadow: "0 1px 2px rgba(59, 47, 82, 0.05), 0 16px 36px -28px rgba(59, 47, 82, 0.25)" },
  default: { shadowColor: palette.ink, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 }
});

export const liftShadow = Platform.select({
  web: { boxShadow: "0 10px 24px rgba(76, 55, 111, 0.2)" },
  default: { shadowColor: palette.plum, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 }
});

export const summitLinks = {
  website: "https://not-alone-summit.netlify.app",
  askAi: "https://not-alone-summit.netlify.app/api/ask-ai",
  icf: "https://www.inspiringchildren.org",
  contactStaff: "https://www.inspiringchildren.org/contact-staff",
  partnerWithUs: "https://www.inspiringchildren.org/partner-with-us",
  summitFilm: "https://static1.squarespace.com/static/628691b65c3a24383d0eac0a/t/6903b537a55efd60f08cd4b5/1761850692502/THE+GRAND+FINALE+2.mp4",
  awardsHighlights: "https://www.youtube.com/watch?v=z2NdP-X7_Mc"
} as const;

export const notAloneSocials = [
  { label: "Instagram", url: "https://www.instagram.com/notalonechallenge" },
  { label: "YouTube", url: "https://www.youtube.com/@notalonechallenge" },
  { label: "LinkedIn", url: "https://www.linkedin.com/company/notalonechallenge/" }
] as const;
