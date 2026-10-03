import { AwardsYearPage } from "../../../components/awards-year-page";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { eventPageMetadata } from "../../../lib/site-metadata";
import { publishedAwardsProgram } from "@not-alone/domain";
import { ClassicAwardsPage } from "../../../components/classic-awards-page";
import { siteVariant } from "../../../lib/site-variant";
export const dynamic = "force-dynamic";
export const metadata = eventPageMetadata("/awards/2026");
export default async function Awards2026Page() {
  const snapshot = await getSiteSnapshot();
  if (siteVariant === "classic") return <ClassicAwardsPage year={2026} snapshot={snapshot} />;
  return <AwardsYearPage year={2026} snapshot={snapshot} program={snapshot ? publishedAwardsProgram(snapshot) : null} />;
}
