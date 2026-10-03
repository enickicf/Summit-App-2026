import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isStaffSession, staffCookieName } from "../../lib/staff/auth";
import { getSubmissionStore, listAllRsvps } from "../../lib/staff/store";
import { getSiteSnapshot } from "../../lib/snapshot";
import { awardsDisplayPeople } from "../../lib/awards-people";
import { peopleSections } from "../../lib/people-sections";
import { StaffPortal } from "../../components/staff-portal";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) redirect("/staff/login");
  const store = await getSubmissionStore();
  const [rsvps, nominations, poker, workshops, snapshot] = await Promise.all([listAllRsvps(store), store.list("nomination"), store.list("poker"), store.list("workshop"), getSiteSnapshot().catch(() => null)]);
  const sections = snapshot ? peopleSections(awardsDisplayPeople(snapshot), "awards") : [];
  const lineup = sections.map(section => ({
    title: section.heading === null ? "Lineup" : section.title,
    people: section.people.map(({ person, role }) => ({ name: person.name, role, rank: person.rank ?? null, tier: person.tier ?? null, photo: Boolean(person.image) }))
  }));
  return <StaffPortal rsvps={rsvps} nominations={nominations} poker={poker} workshops={workshops} lineup={lineup} generatedAt={new Date().toISOString()} />;
}
