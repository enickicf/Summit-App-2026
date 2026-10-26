import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { airtableTalent2026 } from "./airtable-talent-2026";

describe("Izzy Houghton Airtable sync", () => {
  it("uses Bianca's corrected identity, title, bio, and cache-busted portrait", () => {
    const izzy = airtableTalent2026.find(person => person.recordId === "reciu05MxS6ye5lXf");

    expect(izzy).toMatchObject({
      name: "Izzy Houghton",
      title: "Music Producer",
      bio: "Israel Houghton II is a songwriter with 7 credits across their career. Best known for their work with The Kid LAROI, Israel Houghton II's songwriting spans 5 tracks. Beyond writing, they have also contributed 1 production credit.",
      hasHeadshot: true,
      headshotBytes: 221900,
      headshotFile: "/2026-headshots/airtable-current/reciu05MxS6ye5lXf-20261026.jpg"
    });
    expect(existsSync(join(process.cwd(), "public", izzy!.headshotFile!))).toBe(true);
  });
});
