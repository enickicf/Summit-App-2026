import { describe, expect, it } from "vitest";
import { minGapMs, refreshEveryMs, shouldRefresh } from "./portal-auto-refresh";
describe("staff portal auto-refresh (owner, Sept 29)", () => {
  it("refreshes a visible tab about every minute and never a hidden one", () => {
    expect(refreshEveryMs).toBe(60_000);
    expect(shouldRefresh(true, refreshEveryMs)).toBe(true);
    expect(shouldRefresh(false, refreshEveryMs)).toBe(false);
    expect(shouldRefresh(true, minGapMs - 1)).toBe(false);
    expect(shouldRefresh(true, minGapMs)).toBe(true);
  });
});
