import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isStaffSession, staffCookieName } from "../../lib/staff/auth";
import { getSubmissionStore, listAllRsvps } from "../../lib/staff/store";
import { getSiteSnapshot } from "../../lib/snapshot";
import { awardsDisplayPeople } from "../../lib/awards-people";
import { peopleSections } from "../../lib/people-sections";
import { StaffPortal } from "../../components/staff-portal";
import { listFailedSubmissions, unresolvedFailures } from "../../lib/staff/submission-inbox";

export const dynamic = "force-dynamic";

export default async function StaffPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const query = (await searchParams) ?? {};
  const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.slice(0, 300);
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) redirect("/staff/login");
  const store = await getSubmissionStore();
  const [rsvps, nominations, poker, workshops, textPreferences, closingDinner, snapshot] = await Promise.all([listAllRsvps(store), store.list("nomination"), store.list("poker"), store.list("workshop"), store.list("textPreference"), store.list("closingDinner"), getSiteSnapshot().catch(() => null)]);
  // Oct 19: requests the API did not save (submission inbox), minus those the same guest later completed.
  const failed = await listFailedSubmissions().catch(error => { console.error("[staff] submission inbox unavailable", error instanceof Error ? error.message : error); return null; });
  const saved = [...rsvps, ...closingDinner, ...workshops.map(row => ({ ...row, email: row.email ?? "", phone: row.phone ?? "" })), ...nominations.map(row => ({ email: row.nominatorEmail, phone: row.nominatorPhone, submittedAt: row.submittedAt }))];
  const unresolved = failed ? unresolvedFailures(failed, saved) : null;
  // Requests with no name, email or phone (bots, empty probes) have nobody to contact: counted, not listed.
  const needsAttention = unresolved ? unresolved.filter(entry => entry.name || entry.email || entry.phone) : null;
  const anonymousFailures = unresolved ? unresolved.length - (needsAttention?.length ?? 0) : 0;
  const sections = snapshot ? peopleSections(awardsDisplayPeople(snapshot), "awards") : [];
  const lineup = sections.map(section => ({
    title: section.heading === null ? "Lineup" : section.title,
    people: section.people.map(({ person, role }) => ({ name: person.name, role, rank: person.rank ?? null, tier: person.tier ?? null, photo: Boolean(person.image) }))
  }));
  return <StaffPortal addGuest={{ added: one(query.added), to: one(query.to), error: one(query.addGuestError) }} rsvps={rsvps} nominations={nominations} poker={poker} workshops={workshops} textPreferences={textPreferences} closingDinner={closingDinner} needsAttention={needsAttention} anonymousFailures={anonymousFailures} lineup={lineup} generatedAt={new Date().toISOString()} />;
}
