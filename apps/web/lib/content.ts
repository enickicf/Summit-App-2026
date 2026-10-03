import original from "./original-sites.json";

export type DirectoryPerson = { name: string; role: string };
export type DirectoryGroup = { title: string; people: DirectoryPerson[] };

export const summit2025Highlights = ["Panels", "Pitches", "Awards", "Debates", "Concerts", "Seminars", "Meditation", "Workshops", "VIP Dinners", "Philanthropy", "Fitness & Yoga", "Product Launches", "Group Discussions", "Exclusive VIP Experiences"] as const;

// NAS web meeting, Sept 21: cut "Featuring" to about five items (from ICF's published list).
export const summit2026Features = ["Panels", "Workshops", "Concerts", "Awards", "VIP Dinners"] as const;

// Verified on ICF's official YouTube channel and through YouTube oEmbed.
export const awards2025Highlights = {
  title: "Inside the 2025 Not Alone Awards: A Night of Music, Mental Health and Human Development",
  watchUrl: "https://www.youtube.com/watch?v=z2NdP-X7_Mc",
  embedUrl: "https://www.youtube-nocookie.com/embed/z2NdP-X7_Mc?rel=0",
  duration: "1:38"
} as const;

// NAS web meeting, Sept 21: "make it the recap from last year". The 2025 Summit recap published on
// the Not Alone Challenge YouTube channel (verified in the channel's video list, Sept 21, 2026).
export const summit2025Recap = {
  id: "bMAASyMiFHM",
  title: "The 2025 Not Alone Summit: A National Convening for Mental Health and Connection",
  watchUrl: "https://www.youtube.com/watch?v=bMAASyMiFHM",
  embedUrl: "https://www.youtube-nocookie.com/embed/bMAASyMiFHM?rel=0",
  // YouTube's own full-frame still (Inspiring Children performance); the custom thumbnail shows Villa Bibbiani.
  posterUrl: "https://i.ytimg.com/vi/bMAASyMiFHM/maxres3.jpg",
  duration: "3:25"
} as const;

export const summitPartners = {
  2025: { presentedBy: ["Villa Bibbiani"], poweredBy: ["Steven & Alexandra Cohen Foundation"] },
  2026: { presentedBy: [], poweredBy: ["Steven & Alexandra Cohen Foundation"] }
} as const;

function leadershipGroups(section: (typeof original.summit.sections)[number]): DirectoryGroup[] {
  const groups: DirectoryGroup[] = [];
  section.blocks.forEach((block, index) => {
    if (block.tag === "h2") groups.push({ title: block.text, people: [] });
    if (block.tag === "h4") {
      const role = section.blocks[index + 1];
      const group = groups.at(-1);
      if (!group || role?.tag !== "p") throw new Error("Original leadership source needs review");
      group.people.push({ name: block.text, role: role.text });
    }
  });
  return groups;
}

export const summit2025Leadership = leadershipGroups(original.summit.sections[4]!);
// Explicit owner confirmation, September 17, 2026; not an attendance import.
export const ownerApprovedCoChairs2026 = ["Cherrial Odell"] as const;
export const summit2025Directory: DirectoryGroup[] = [
  ...original.summit.sections.slice(7, 13).map(section => ({ title: section.title, people: section.people.map(({ name, role }) => ({ name, role })) })),
  ...leadershipGroups(original.summit.sections[13]!)
];
export const awards2025Directory: DirectoryGroup[] = original.awards.sections.slice(5, 10)
  .map(section => ({ title: section.title, people: section.people.map(({ name, role }) => ({ name, role })) }));

// No archived roster is permitted to seed the approved 2026 directory.
export const confirmed2026People: DirectoryGroup[] = [];
