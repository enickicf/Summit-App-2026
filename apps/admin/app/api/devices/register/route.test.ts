import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { POST, OPTIONS } from "./route";

const backend = vi.fn<typeof fetch>();
let requestNumber = 0;
const deviceId = "11111111-1111-4111-8111-111111111111";
const token = "ExpoPushToken[offline_only_not_a_real_token]";

function registration(audienceGroups: unknown = ["public"]) {
  return {
    id: deviceId,
    eventId: event2026Snapshot.event.id,
    expoPushToken: token,
    audienceGroups,
    platform: "ios",
    appVersion: "offline-test",
    lastSeenAt: "2026-09-16T00:00:00.000Z"
  };
}

function request(body: unknown, clientId = `offline-${++requestNumber}`) {
  return new NextRequest("https://offline.invalid/api/devices/register", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": clientId },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SUPABASE_URL", "https://offline.invalid");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "offline-test-placeholder");
  backend.mockReset().mockRejectedValue(new Error("Unexpected backend access"));
  vi.stubGlobal("fetch", backend);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("anonymous device audience authorization", () => {
  it.each([
    { groups: ["founders"] },
    { groups: ["vip"] },
    { groups: ["staff"] },
    { groups: ["public", "founders"] },
    { groups: ["all_attendees", "vip"] },
    { groups: [" FOUNDERS "] },
    { groups: ["unknown-scope"] },
    { groups: ["public "] }
  ])("rejects unsupported groups $groups before any read or write", async ({ groups }) => {
    const response = await POST(request(registration(groups)));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Anonymous device registration supports public audiences only."
    });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("POST, OPTIONS");
    expect(response.headers.get("RateLimit-Limit")).toBe("10");
    expect(backend).not.toHaveBeenCalled();
  });

  it.each([
    { groups: ["public"] },
    { groups: ["all_attendees"] },
    { groups: ["public", "all_attendees"] },
    { groups: [] }
  ])("preserves public registration $groups through the actual repository", async ({ groups }) => {
    const writes: Array<Record<string, unknown>> = [];
    backend.mockImplementation(async (input, init) => {
      const url = new URL(String(input));
      expect(url.origin).toBe("https://offline.invalid");
      if (init?.method === "POST") {
        expect(url.pathname).toBe("/rest/v1/attendee_device_registrations");
        writes.push(...JSON.parse(String(init.body)));
        return new Response(null, { status: 201 });
      }
      expect(init?.method).toBe("GET");
      const data = url.pathname === "/rest/v1/schedule_revisions"
        ? [{ revision: event2026Snapshot.revision, snapshot: event2026Snapshot, published_at: "2026-09-16T00:00:00.000Z" }]
        : url.pathname === "/rest/v1/attendee_device_registrations" ? [{ id: deviceId }] : [];
      return Response.json(data);
    });

    const response = await POST(request(registration(groups)));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, mode: "supabase", attendeeDevices: 1 });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(writes).toEqual([expect.objectContaining({
      id: deviceId, event_id: event2026Snapshot.event.id,
      expo_push_token: token, audience_groups: groups
    })]);
    expect(backend).toHaveBeenCalledTimes(8);
  });

  it.each([null, { ...registration(), expoPushToken: "invalid" }, registration([3])])(
    "retains schema rejection without writes for %j", async body => {
      expect((await POST(request(body))).status).toBe(422);
      expect(backend).not.toHaveBeenCalled();
    }
  );

  it("does not bypass the existing rate limit for rejected private enrollments", async () => {
    const clientId = `rate-limit-${++requestNumber}`;
    for (let index = 0; index < 10; index++) {
      expect((await POST(request(registration(["founders"]), clientId))).status).toBe(403);
    }
    const response = await POST(request(registration(["founders"]), clientId));
    expect(response.status).toBe(429);
    expect(response.headers.has("Retry-After")).toBe(true);
    expect(backend).not.toHaveBeenCalled();
  });

  it("retains public preflight without backend access", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(backend).not.toHaveBeenCalled();
  });
});
