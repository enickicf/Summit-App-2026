import { redirect } from "next/navigation";

// Owner / Ryan (Sept 29, 2026): the old Summit Map page repeated the rooms inside Wynn. Rooms are
// private now (lib/room-privacy.ts), so this address simply goes to the public Venue page.
export default function MapPage() {
  redirect("/venue");
}
