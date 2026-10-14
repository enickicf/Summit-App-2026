import { createHash } from "node:crypto";

// Live, read-only connection to the Summit's Airtable base (owner direction, Sept 21, 2026): people
// (Website Grouping, Title, Bio, Headshot), the Run of Show and 2026 partners flow to the website
// automatically. Server-only: AIRTABLE_TOKEN is a read-only personal access token (scopes
// data.records:read and schema.bases:read on this base) kept in the host's environment, never in
// source or the browser. Without it every caller gets null and the site keeps its reviewed data.
// Airtable is never written to.
export const airtableBaseId = process.env.AIRTABLE_BASE_ID?.trim() || "app7BHptsc1bjc3DD";
export const airtableRefreshSeconds = 300;

// Field IDs from the "Simplified Talent & ROS" and "Simplified Partners" interface pages. Field IDs
// survive renames; the tables are found by the field they contain.
export const airtableFields = {
  talent: { name: "fldBEcxaNMOMy7QJY", status: "fldjMPPN6wDNN9ChS", occupation: "fld1PDqZX5X0Y4Iqx", grouping: "fldMHx7esA6yXkQPF", organization: "fldERdiRzbEAu5iPH", summitRole: "fldUBydiZaANUL8iF", awardRole: "fldffOpUIMMwVakrr", headshot: "fldBTZ27PVbUhjN8M", title: "fldBRqhKl5xhM90zg", bio: "fldQmLqgSF2Fiy5hL" },
  schedule: { activity: "fldQtT1Md2g4GqBhp", date: "fldxfGqU9abYMKcY7", forum: "flde4HHZHJ3WGkQR9", start: "fldnajgNm1o7FYb3w", end: "fldHGcQHEYJOinoP2", location: "fldrvxnATxfN8YacY", websiteTime: "fldTOoqUKpSsc70RY", synopsis: "fldkjJiyONmq1ZESu", talent: "fldkf0maVaQqlO40I" },
  partners: { name: "fldRJewow3mTJuDT8", item: "fldNKosobgxgOdvod", select: "fldnp2qYq9uAly4tq", status: "fldnA6Ejphs7UvG63" }
} as const;

export type AirtablePerson = {
  recordId: string; name: string; status: string; groups: string[]; occupation: string; organization: string;
  title: string; bio: string; hasHeadshot: boolean; headshotBytes?: number;
};
// Owner (Oct 7): Attire and "Website Public/Private" come along with every Run of Show row (found by column name).
export type AirtableSession = { recordId: string; title: string; date: string; startUtc: string | null; endText: string; location: string; synopsis: string; forum: string; websiteTime: string; attire?: string; websitePublic?: string };
const attireColumn = /^\s*attire\s*$/i;
const websitePublicColumn = /website\s*public/i;
export type AirtablePartner = { recordId: string; name: string; item: string; group: string; status: string };

type AirtableRecord = { id: string; fields: Record<string, unknown> };
type Attachment = { url: string; type?: string; thumbnails?: { large?: { url: string }; full?: { url: string } } };

const token = () => process.env.AIRTABLE_TOKEN?.trim() || null;

async function api<T>(path: string, revalidate = airtableRefreshSeconds): Promise<T | null> {
  const key = token();
  if (!key) return null;
  try {
    const response = await fetch(`https://api.airtable.com/v0/${path}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate, tags: ["airtable"] },
      signal: AbortSignal.timeout(8000)
    } as RequestInit);
    return response.ok ? await response.json() as T : null;
  } catch {
    return null;
  }
}

type TableMeta = { id: string; fields: { id: string; name?: string }[] };
async function tableMetaContaining(fieldId: string): Promise<TableMeta | null> {
  const meta = await api<{ tables: TableMeta[] }>(`meta/bases/${airtableBaseId}/tables`, 3600);
  return meta?.tables.find(table => table.fields.some(field => field.id === fieldId)) ?? null;
}
async function tableContaining(fieldId: string): Promise<string | null> {
  return (await tableMetaContaining(fieldId))?.id ?? null;
}

// Owner (Sept 21): the Name column can carry notes ("TBC", "Jewel's son"); the "Stage Name" column holds
// the clean public name, so the site shows Stage Name whenever it is filled in. Found by its column name.
const stageNameColumn = /^\s*stage\s*name\s*$/i;

async function listRecords(anyFieldId: string, fieldIds: string[]): Promise<AirtableRecord[] | null> {
  const table = await tableContaining(anyFieldId);
  if (!table) return null;
  const records: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const query = new URLSearchParams({ returnFieldsByFieldId: "true", pageSize: "100" });
    for (const field of fieldIds) query.append("fields[]", field);
    if (offset) query.set("offset", offset);
    const page = await api<{ records: AirtableRecord[]; offset?: string }>(`${airtableBaseId}/${table}?${query}`);
    if (!page) return null;
    records.push(...page.records);
    offset = page.offset;
  } while (offset);
  return records;
}

const text = (value: unknown): string => Array.isArray(value) ? value.map(text).filter(Boolean).join(", ")
  : typeof value === "object" && value && "name" in value ? String((value as { name: unknown }).name)
  : value == null ? "" : String(value).trim();
const list = (value: unknown): string[] => Array.isArray(value) ? value.map(text).filter(Boolean) : text(value) ? [text(value)] : [];

export async function getAirtableTalent(): Promise<AirtablePerson[] | null> {
  const f = airtableFields.talent;
  const stageName = (await tableMetaContaining(f.name))?.fields.find(field => field.name && stageNameColumn.test(field.name))?.id;
  // Only the fields approved for the public website cross the Airtable boundary.
  const records = await listRecords(f.name, [f.name, f.status, f.grouping, f.title, f.bio, f.headshot, ...(stageName ? [stageName] : [])]);
  return records?.map(record => ({
    recordId: record.id,
    name: (stageName && text(record.fields[stageName])) || text(record.fields[f.name]),
    status: text(record.fields[f.status]),
    groups: list(record.fields[f.grouping]),
    occupation: "",
    organization: "",
    title: text(record.fields[f.title]),
    bio: text(record.fields[f.bio]),
    hasHeadshot: Array.isArray(record.fields[f.headshot]) && (record.fields[f.headshot] as unknown[]).length > 0,
    ...(Array.isArray(record.fields[f.headshot]) && typeof (record.fields[f.headshot] as { size?: unknown }[])[0]?.size === "number"
      ? { headshotBytes: (record.fields[f.headshot] as { size: number }[])[0]!.size } : {})
  })).filter(person => person.name) ?? null;
}

export async function getAirtableSchedule(): Promise<AirtableSession[] | null> {
  const f = airtableFields.schedule;
  const meta = await tableMetaContaining(f.activity);
  const attireId = meta?.fields.find(field => field.name && attireColumn.test(field.name))?.id;
  const websitePublicId = meta?.fields.find(field => field.name && websitePublicColumn.test(field.name))?.id;
  const records = await listRecords(f.activity, [f.activity, f.date, f.start, f.end, f.location, f.synopsis,
    ...(attireId ? [attireId] : []), ...(websitePublicId ? [websitePublicId] : [])]);
  return records?.map(record => ({
    recordId: record.id,
    title: text(record.fields[f.activity]),
    date: text(record.fields[f.date]),
    startUtc: /^\d{4}-\d{2}-\d{2}T/.test(text(record.fields[f.start])) ? new Date(text(record.fields[f.start])).toISOString() : null,
    endText: text(record.fields[f.end]),
    location: text(record.fields[f.location]),
    synopsis: text(record.fields[f.synopsis]),
    forum: "",
    websiteTime: "",
    attire: attireId ? text(record.fields[attireId]) : "",
    // The checkbox arrives as true/absent; without the column the website falls back to its block list.
    ...(websitePublicId ? { websitePublic: text(record.fields[websitePublicId]) } : {})
  })).filter(session => session.title) ?? null;
}

export async function getAirtablePartners(): Promise<AirtablePartner[] | null> {
  const f = airtableFields.partners;
  const records = await listRecords(f.name, Object.values(f));
  return records?.map(record => ({
    recordId: record.id, name: text(record.fields[f.name]), item: text(record.fields[f.item]),
    group: list(record.fields[f.select])[0] ?? "", status: text(record.fields[f.status])
  })).filter(partner => partner.name) ?? null;
}

// Airtable attachment links expire after a few hours, so pages link to /api/airtable/headshot/<id>,
// which looks up the current link (cached briefly) and serves the image.
export async function getAirtableHeadshot(recordId: string): Promise<Attachment | null> {
  if (!/^rec[A-Za-z0-9]{14}$/.test(recordId)) return null;
  const table = await tableContaining(airtableFields.talent.headshot);
  if (!table) return null;
  const record = await api<AirtableRecord>(`${airtableBaseId}/${table}/${recordId}?returnFieldsByFieldId=true`, 900);
  const attachments = record?.fields[airtableFields.talent.headshot];
  return Array.isArray(attachments) && attachments.length ? attachments[0] as Attachment : null;
}

// Stable UUIDs for records created from Airtable (the published data model requires UUIDs).
export function airtableUuid(seed: string): string {
  const hex = createHash("sha1").update(`not-alone-airtable:${seed}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-${((parseInt(hex[16]!, 16) & 0x3) | 0x8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

// Website Grouping rubric (Airtable multiple-select). Public groups map to website categories; Guest and
// Sponsor are listed as Attendees; Staff, Vendor Representative, Press, Contractor and Talent Support
// Staff are never listed. "A-Talent" marks featured talent and sorts first.
export const airtableGroupCategory: Record<string, string> = {
  "Co-Chair": "Co-Chairs", "Summit Host": "Hosts", "Awards Host": "Hosts", "Founder": "Founders",
  "Musician": "Musicians", "Comedian": "Comedians", "Athlete": "Athletes", "Expert": "Experts",
  "Podcast": "Podcasters", "Executive Producer": "Executive Producers", "Producer": "Producers",
  // Owner (Sept 21): co-producers such as Paige are credited as Producers (no separate Co-Producers section).
  "Co-Producer": "Producers",
  "Associate Producer": "Associate Producers",
  // Owner (Sept 21): Attendees is the event "Facebook", so confirmed guests and sponsors are listed there.
  "Guest": "Attendees", "Sponsor": "Attendees",
  // Sept 22 meeting: the grid now uses talent tiers (A-Talent, B - talent ... F - talent), "X - attendee"
  // for attendees and "Philanthropist" for the Partners page's Philanthropists list.
  "X - attendee": "Attendees", "Philanthropist": "Philanthropists",
  "B - talent": "Talent", "C - talent": "Talent", "D - talent": "Talent", "F - talent": "Talent"
};
export const featuredGroup = "A-Talent";

// Talent tier from the Website Grouping chips: A (A-Talent) to F. Website order: Top 12 first, then A-F.
export type TalentTier = "A" | "B" | "C" | "D" | "F";
export function talentTier(groups: string[]): TalentTier | null {
  if (groups.includes(featuredGroup)) return "A";
  const tier = groups.map(group => /^([B-F]) - talent$/i.exec(group.trim())?.[1]?.toUpperCase()).find(Boolean);
  return tier === "B" || tier === "C" || tier === "D" || tier === "F" ? tier : null;
}

// The numeric chip (1-10) in Website Grouping is the owner's Top 12 ranking; several people can share
// "10" (the grid has no 11/12), so the final rank is assigned in chip order, then Airtable's row order.
export function rankChip(groups: string[]): number | null {
  const chip = groups.map(group => group.trim()).find(group => /^\d{1,2}$/.test(group));
  return chip ? Number(chip) : null;
}
export function assignRanks<T extends { groups: string[] }>(people: T[]): Map<T, number> {
  const ranked = people.map((person, index) => ({ person, chip: rankChip(person.groups), index })).filter(entry => entry.chip !== null)
    .sort((a, b) => a.chip! - b.chip! || a.index - b.index);
  return new Map(ranked.map((entry, position) => [entry.person, position + 1]));
}

export function airtableCategories(groups: string[]): string[] {
  const mapped = [...new Set(groups.map(group => airtableGroupCategory[group]).filter((value): value is string => Boolean(value)))];
  const guestFacing = mapped.filter(category => !["Co-Chairs", "Hosts", "Executive Producers", "Producers", "Co-Producers", "Associate Producers", "Attendees", "Philanthropists"].includes(category));
  // Featured or general talent with no other public group is listed under Talent.
  if (!guestFacing.length && groups.some(group => group === featuredGroup || group === "Talent")) mapped.push("Talent");
  // Someone with a role on the page (talent, expert, founder, producer...) is not also listed as an
  // attendee (a philanthropist can be), and staff, press, contractors, vendors and talent support staff
  // are never listed as attendees even when they are also tagged Guest.
  const roleCategories = mapped.filter(category => category !== "Attendees" && category !== "Philanthropists");
  const neverAttendee = groups.some(group => ["Staff", "Press", "Contractor", "Vendor Representative", "Talent Support Staff"].includes(group));
  return roleCategories.length > 0 || neverAttendee ? mapped.filter(category => category !== "Attendees") : mapped;
}

// Owner (Sept 22): these founders are listed whatever their invitation status in Airtable.
export const foundersListedRegardless = new Set([
  "sheri sobrato", "sheri sabroto", "steven & alexandra cohen", "steven cohen", "alexandra cohen",
  // Paige/owner, Sept 22: these founders are Hold Space in Airtable and are credited regardless.
  "jay mcgraw", "erica mcgraw", "melony lewis", "adam lewis", "winston kelly", "cameron kelly",
  // Owner (Sept 23): Jennifer Donnelly, added by hand until she is in Airtable.
  "jennifer donnelly"
]);
// Owner (Oct 11, 2026): also credited as Founders on the websites although Airtable does not group them "Founder"
// (Bob and Mike Bryan stay Keynotes as well). Remove a name once Airtable carries the Founder grouping.
export const ownerFounders2026 = new Set(["bob bryan", "mike bryan"]);
export function withOwnerGroups<T extends AirtablePerson>(person: T): T {
  return ownerFounders2026.has(person.name.trim().toLowerCase()) && !person.groups.includes("Founder") ? { ...person, groups: [...person.groups, "Founder"] } : person;
}
// Owner (Oct 4, 2026): listed on the websites by the owner's direction while Airtable's status is not yet
// "Confirmed". Remove a name once Airtable confirms it. Aloe Blacc (A-Talent, status "Pending") was the only entry
// until Ryan took him off on Oct 8 ("We gotta take Aloe Blacc out"): with the set empty his Pending status keeps him
// off both lineups; his recorded Airtable row and portrait data stay in place, unused.
export const ownerListedRegardless = new Set<string>([]);
// Owner (Oct 5, 2026): a confirmed status OR any "Hold Space" percentage puts a person on the website (the Bryan
// brothers are "Hold Space - 51%"); "Pending", "Declined" and "Donation - Not Attending" do not.
export const isListableStatus = (status: string) => /confirmed/i.test(status) || /hold space/i.test(status);
// Owner (Oct 11, 2026): never listed on the websites in any section (lineups, founders, producer credits, profiles),
// whatever Airtable says. "Take Seth Porter Winterton off the website. I'm making that executive decision."
// Ryan (Oct 9): "Take Ratcliff out of the Founders" (Airtable groups him Founder; he has no other role on the site).
export const excludedFromSite2026 = new Set(["seth porter winterton", "john ratcliff"]);
export function isPublicAirtablePerson(person: AirtablePerson): boolean {
  if (excludedFromSite2026.has(person.name.trim().toLowerCase())) return false;
  // Sept 22 meeting: every founder is listed whatever the invitation status; everyone else must be confirmed
  // or holding space (owner, Oct 5).
  const founderRegardless = person.groups.includes("Founder");
  const ownerListed = ownerListedRegardless.has(person.name.trim().toLowerCase());
  return (founderRegardless || ownerListed || isListableStatus(person.status)) && airtableCategories(person.groups).length > 0;
}
