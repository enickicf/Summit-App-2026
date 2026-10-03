import { OriginalSummitPage } from "../../components/original-event-page";
import { ClassicSummitPage } from "../../components/classic-summit-page";
import { siteVariant } from "../../lib/site-variant";
import { eventPageMetadata } from "../../lib/site-metadata";

export const metadata = eventPageMetadata("/2025");

export default function ArchivePage() {
  // CLASSIC: the 2025 Summit is a copy-paste identical copy of ICF's Summit page (owner, Sept 21).
  if (siteVariant === "classic") return <ClassicSummitPage year={2025} />;
  return <OriginalSummitPage year={2025} />;
}
