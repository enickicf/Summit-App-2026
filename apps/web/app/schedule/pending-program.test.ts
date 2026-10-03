import { describe, expect, it } from "vitest";
import { pendingProgramBlocks, publicPendingProgramBlocks } from "./pending-program";

describe("start-only program blocks", () => {
  it("keeps supplied Thursday start times and uncertainty without inventing durations", () => {
    const body = "Tennis: 10:00 AM; end time to be confirmed.\n\nHigh Tea: 12:00 PM; end time to be confirmed.\n\nLocations and access details to be confirmed.";
    const blocks = pendingProgramBlocks(body);
    expect(blocks.map(block => [block.title, block.start])).toEqual([["Tennis", "10:00 AM"], ["High Tea", "12:00 PM"], ["", ""]]);
    expect(blocks.map(block => block.original).join("\n\n")).toBe(body);
    expect(blocks[0]!.detail).toBe("end time to be confirmed.");
  });
  it("does not turn undetermined timing into an actual clock time", () => {
    expect(pendingProgramBlocks("Panel: timing to be confirmed.")[0]).toMatchObject({ start: "", title: "", detail: "Panel: timing to be confirmed." });
  });
  it("omits unconfirmed end times and the generic access caveat from the public view only", () => {
    const body = "AI panel: timing to be confirmed.\n\nTennis: 10:00 AM; end time to be confirmed.\n\nDinner: 7:00 PM; ends 9:00 PM.\n\nLocations and access details to be confirmed.";
    expect(publicPendingProgramBlocks(body).map(block => [block.title, block.start, block.detail])).toEqual([
      ["", "", "AI panel: timing to be confirmed."], ["Tennis", "10:00 AM", ""], ["Dinner", "7:00 PM", "ends 9:00 PM."]
    ]);
  });
});
