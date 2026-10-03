import { describe, expect, it, vi } from "vitest";
import MapPage from "./page";

vi.mock("next/navigation", () => ({ redirect: vi.fn((to: string) => { throw new Error(`REDIRECT ${to}`); }) }));

describe("old Summit Map page (owner / Ryan, Sept 29)", () => {
  it("sends visitors to the public Venue page instead of listing rooms", () => {
    expect(() => MapPage()).toThrow("REDIRECT /venue");
  });
});
