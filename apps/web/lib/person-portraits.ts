import source from "./original-sites.json";
import { originalAsset } from "./original-assets";
import { portrait2026 } from "./portrait-overrides";

export function personNameKey(name: string): string {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\b(dr|md|phd|mft|lmft|faed|ceds|jr|iii|dmc)\b\.?/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
}

const portraits = new Map<string, string>();
for (const site of [source.summit, source.awards]) {
  for (const section of site.sections) {
    for (const person of section.people) {
      const key = personNameKey(person.name);
      if (!portraits.has(key)) portraits.set(key, originalAsset(person.image));
    }
  }
}

// Leadership photos are parallel to the named h4 blocks in the captured source.
for (const index of [4, 13]) {
  const section = source.summit.sections[index]!;
  section.blocks.filter(block => block.tag === "h4").forEach((block, position) => {
    const image = section.images[position];
    if (image) portraits.set(personNameKey(block.text), originalAsset(image.src));
  });
}

const portraitAliases: Record<string, string> = {
  "alexandra cohen": "alex cohen",
  "steven cohen": "steven and alexandra cohen",
  "daniel gillison": "daniel h gillison",
  "jen smorgen": "jennifer smorgon",
  "jennifer smorgon": "jennifer smorgon",
  "jewel murray": "jewel",
  // Sept 22: Airtable lists these founders individually; ICF's 2025 site has their couple photos.
  "melony lewis": "melony and adam lewis",
  "adam lewis": "melony and adam lewis",
};

// Read-only 2026 Airtable attachments, reviewed September 16. Local copies do
// not expire with Airtable's signed attachment URLs; published URLs still win.
const currentPortraits = new Map([
  ["wendy oliver pyatt", "/2026-headshots/wendy-oliver-pyatt.jpg"],
  ["jon hershfield", "/2026-headshots/jon-hershfield.jpg"],
  ["steve wozniak", "/2026-headshots/steve-wozniak.jpg"],
  ["blaise aguirre", "/2026-headshots/blaise-aguirre.jpg"],
  // Sept 19-21 additions for newly confirmed talent (sources: apps/mobile/assets/people/SOURCES.md).
  ["ray lewis", "/2026-headshots/ray-lewis.jpg"],
  ["sarah steil", "/2026-headshots/sarah-steil.jpg"],
  ["michael townsend", "/2026-headshots/michael-townsend.jpg"],
  ["leah smith", "/2026-headshots/leah-smith.jpg"],
  ["margaret hines", "/2026-headshots/margaret-hines.jpg"],
  ["jessica edwards", "/2026-headshots/jessica-edwards.jpg"],
  ["jeff levin", "/2026-headshots/jeff-levin.jpg"],
  ["sanem sam alkan", "/2026-headshots/sanem-alkan.jpg"],
  ["rahil briggs", "/2026-headshots/rahil-briggs.jpg"]
]);

// Owner (Sept 21, 2026): newer portraits that replace ICF's older photo on every page, including the
// 2025 archive. Rachel Platten: Gage Skidmore, April 2024, CC BY-SA 2.0,
// https://commons.wikimedia.org/wiki/File:Rachel_Platten_(53695417073)_cropped.jpg
// Cherrial Odell: owner-supplied photo (Sept 21, 2026), background removed to match the other cut-outs.
// Both are now reviewed portraits in lib/portrait-overrides.ts (2026 pages only; the 2025 archive keeps ICF's photos).
export function updatedPortrait(name: string): string | undefined {
  return portrait2026(name) ?? undefined;
}

// ICF spellings (e.g. "Daniel H. Gillison, Jr.") resolve to the reviewed 2026 portrait key too.
const reviewedAliases = new Map(Object.entries(portraitAliases).map(([key, icfKey]) => [icfKey, key]));

export function personPortrait(name: string): string | undefined {
  const key = personNameKey(name);
  const alias = reviewedAliases.get(key);
  const reviewed = portrait2026(name) ?? (alias ? portrait2026(alias) : undefined);
  if (reviewed === null) return undefined; // no photo passed review: name only
  return reviewed ?? currentPortraits.get(key) ?? portraits.get(portraitAliases[key] ?? key);
}

export function personInitials(name: string): string {
  const parts = name.replace(/\([^)]*\)/g, "").replace(/^Dr\.\s*/i, "").trim().split(/\s+/);
  return [parts[0]?.[0], parts.length > 1 ? parts.at(-1)?.[0] : ""].join("").toUpperCase();
}

export function portraitImageStyle(name: string, src?: string) {
  // Reviewed portraits are already framed like ICF's cards; a photo straight from Airtable is framed
  // toward the top so the face stays in the box.
  if (src?.startsWith("/2026-headshots/portraits/")) return { objectFit: "cover" as const, objectPosition: "center" };
  if (src?.startsWith("/api/airtable/headshot/")) return { objectFit: "cover" as const, objectPosition: "50% 22%" };
  if (name === "Caroline Silby") return { objectFit: "cover" as const, objectPosition: "center top", transform: "scale(2.2)", transformOrigin: "center top" };
  if (["Bob Bryan", "Mike Bryan"].includes(name)) return { objectFit: "cover" as const, objectPosition: "center top", transform: "scale(1.35)", transformOrigin: "center top" };
  return undefined;
}
