import { AwardsYearPage } from "../../../components/awards-year-page";
import { ClassicAwardsPage } from "../../../components/classic-awards-page";
import { siteVariant } from "../../../lib/site-variant";
import { eventPageMetadata } from "../../../lib/site-metadata";
export const metadata = eventPageMetadata("/awards/2025");
export default function Awards2025Page() {
  // CLASSIC: ICF's Awards page, word for word (owner, Sept 21).
  if (siteVariant === "classic") return <ClassicAwardsPage year={2025} />;
  return <AwardsYearPage year={2025} />;
}
