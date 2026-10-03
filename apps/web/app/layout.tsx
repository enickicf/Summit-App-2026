import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { GoogleTagManager } from "@next/third-parties/google";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";
import { AnalyticsProvider } from "../components/analytics-provider";
import { AskAiWidget } from "../components/ask-ai-widget";
import { supabaseAnalyticsStore } from "../lib/analytics/ingest";
import { robotsForPage, siteMetadataPolicy } from "../lib/site-metadata";
import "./styles.css";
import "./enhancements.css";
import "./restored-shell.css";

export const metadata: Metadata = {
  metadataBase: siteMetadataPolicy().origin,
  applicationName: "Not Alone Summit",
  title: { default: "Not Alone Summit", template: "%s | Not Alone Summit" },
  description: "The Not Alone Summit and Awards, produced by Inspiring Children Foundation.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/challenge-48.png", sizes: "48x48", type: "image/png" }],
    apple: [{ url: "/icons/challenge-180.png", sizes: "180x180", type: "image/png" }]
  },
  robots: robotsForPage()
};
export const viewport: Viewport = { themeColor: "#8177c9" };

// Owner (Sept 22, 2026, tracking/SEO setup): Google Tag Manager loads only where the public container ID is
// configured (production hosting env); GA4 is wired inside that container, not as a second tag here.
export default function RootLayout({ children }: { children: ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  // Website event tracking (and its consent bar) exists only where the server can store events.
  const analytics = supabaseAnalyticsStore() !== null;
  return <html lang="en" data-scroll-behavior="smooth">{gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}<body><a href="#main-content" className="skipLink">Skip to main content</a><Suspense fallback={<div className="siteHeader" aria-hidden="true" />}><SiteHeader /></Suspense>{children}<Suspense fallback={null}><SiteFooter /></Suspense><Suspense fallback={null}><AskAiWidget /></Suspense>{analytics ? <Suspense fallback={null}><AnalyticsProvider /></Suspense> : null}</body></html>;
}
