import { afterEach, describe, expect, it, vi } from "vitest";
import { awardsHostSnapshot, isAwardsHost, summitHref, summitOrigin } from "./summit-links";

describe("Summit-bound links on the Awards domain (owner, Sept 23, 2026)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("recognises the Awards domain and its subdomains only", () => {
    expect(isAwardsHost("notaloneawards.org")).toBe(true);
    expect(isAwardsHost("www.notaloneawards.org")).toBe(true);
    expect(isAwardsHost("NotAloneAwards.org:443")).toBe(true);
    expect(isAwardsHost("notalonesummit.org")).toBe(false);
    expect(isAwardsHost("not-alone-summit.netlify.app")).toBe(false);
    expect(isAwardsHost("localhost:3001")).toBe(false);
    expect(isAwardsHost(null)).toBe(false);
  });

  it("points Summit links at the Summit domain from the Awards domain and leaves them relative elsewhere", () => {
    // "/" on notaloneawards.org is a forced redirect to /awards/2026, so a relative link would loop back.
    expect(summitHref("/", "notaloneawards.org")).toBe(`${summitOrigin}/`);
    expect(summitHref("/2025", "www.notaloneawards.org")).toBe(`${summitOrigin}/2025`);
    expect(summitHref("/", "notalonesummit.org")).toBe("/");
    expect(summitHref("/", undefined)).toBe("/");
  });

  it("reads the browser hostname for the client snapshot and is false without a window", () => {
    expect(awardsHostSnapshot()).toBe(false);
    vi.stubGlobal("window", { location: { hostname: "notaloneawards.org" } });
    expect(awardsHostSnapshot()).toBe(true);
    vi.stubGlobal("window", { location: { hostname: "notalonesummit.org" } });
    expect(awardsHostSnapshot()).toBe(false);
  });
});
