import { originalProducerCredits } from "@not-alone/config";
import { summit2025Directory, summit2025Leadership } from "../../../lib/content";
import { originalAsset } from "../../../lib/original-assets";
import source from "../../../lib/original-sites.json";

export const archiveSlug = (name: string) => `2025-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

export function archiveProfile(slug: string, context: "summit" | "awards") {
  const entries = source[context].sections.flatMap(section => section.people.map(person => ({
    name: person.name, role: person.role, category: section.title, image: originalAsset(person.image)
  })));

  // Leadership is captured as blocks rather than people in the original Summit source.
  if (context === "summit") {
    const images = source.summit.sections[4]!.images;
    let index = 0;
    for (const group of summit2025Leadership) {
      for (const person of group.people) {
        const image = images[index++];
        entries.push({ ...person, category: group.title, image: image ? originalAsset(image.src) : "" });
      }
    }
  }

  const creditImages = source.summit.sections[13]!.images;
  const sourceCredits = summit2025Directory.filter(group => /Producers/.test(group.title)).flatMap(group => group.people);
  originalProducerCredits.forEach((person, index) => {
    const image = creditImages[index];
    entries.push({ ...person, image: image ? originalAsset(image.src) : "" });
    const sourceCredit = sourceCredits.find(credit => credit.name === person.name);
    if (sourceCredit) entries.push({ ...person, role: sourceCredit.role, image: image ? originalAsset(image.src) : "" });
  });

  const matches = entries.filter(person => archiveSlug(person.name) === slug);
  const first = matches[0];
  if (!first) return undefined;

  return {
    name: first.name,
    slug,
    year: 2025 as const,
    categories: [...new Set(matches.map(person => person.category))],
    role: [...new Set(matches.map(person => person.role).filter(Boolean))].join(" · "),
    image: matches.find(person => person.image)?.image,
    bio: ""
  };
}
