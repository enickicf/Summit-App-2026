import { describe, expect, it } from "vitest";
import { hiddenUntilPhoto2026 } from "./portrait-overrides";

describe("owner rule (Sept 21): no photo, no card", () => {
  it("hides people without a photo and Hal Fisher for now, keeps everyone else", () => {
    expect(hiddenUntilPhoto2026("Jen Whalen", undefined)).toBe(false);
    expect(hiddenUntilPhoto2026("Mario Martinez", undefined)).toBe(false);
    expect(hiddenUntilPhoto2026("Hal Fisher", "/2026-headshots/portraits/hal-fisher-2.jpg")).toBe(true);
    expect(hiddenUntilPhoto2026("Sarah Steil", "/2026-headshots/portraits/sarah-steil.jpg")).toBe(false);
  });
});
