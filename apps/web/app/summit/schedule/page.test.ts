import { describe, expect, it, vi } from "vitest";
import { redirect } from "next/navigation";
import SummitScheduleCompatibilityPage from "./page";

vi.mock("next/navigation", () => ({ redirect: vi.fn(() => { throw new Error("redirect"); }) }));

describe("legacy summit schedule route", () => {
  it("redirects to the canonical schedule instead of duplicating the page or main landmark", () => {
    expect(() => SummitScheduleCompatibilityPage()).toThrow("redirect");
    expect(redirect).toHaveBeenCalledWith("/schedule");
  });
});
