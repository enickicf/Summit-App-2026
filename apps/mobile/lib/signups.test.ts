import { describe, expect, it } from "vitest";
import { applySignupResponse, createInstallId, emptySignupState, pendingOperations } from "./signups";

describe("experience sign-up state", () => {
  it("creates v4-shaped install ids", () => {
    expect(createInstallId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("queues joins and leaves until the server answers", () => {
    const state = { ...emptySignupState("id"), name: "Sam", items: { a: { status: "confirmed" as const, pending: "join" as const }, b: { status: "cancelled" as const, pending: "leave" as const }, c: { status: "confirmed" as const } } };
    expect(pendingOperations(state)).toEqual([{ scheduleItemId: "a", action: "join" }, { scheduleItemId: "b", action: "leave" }]);
    const joined = applySignupResponse(state, "a", "waitlisted");
    expect(joined.items.a).toEqual({ status: "waitlisted" });
    expect(applySignupResponse(joined, "b", "cancelled").items.b).toBeUndefined();
  });
});
