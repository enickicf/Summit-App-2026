import { OriginalSummitPage } from "../components/original-event-page";
import { ClassicSummitPage } from "../components/classic-summit-page";
import { siteVariant } from "../lib/site-variant";
import { getSiteSnapshot } from "../lib/snapshot";
import { eventPageMetadata } from "../lib/site-metadata";

export const dynamic = "force-dynamic";
export const metadata = eventPageMetadata("/");

export default async function HomePage() {
  if (siteVariant === "classic") return <ClassicSummitPage year={2026} snapshot={await getSiteSnapshot()} />;
  return <OriginalSummitPage year={2026} snapshot={await getSiteSnapshot()} />;
}
