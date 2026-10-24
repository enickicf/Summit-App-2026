import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("podcast booking review", () => {
  it("routes the old review address into the private podcast directory", () => {
    const source = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
    expect(source).toContain('redirect("/awards/podcasts")');
  });
});
