import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { GET, OPTIONS, POST } from "./route";
import { GET as STAFF_GET } from "../staff/signups/route";

const backend = vi.fn<typeof fetch>();
let requestNumber = 0;
const installId = "3b0f1f4e-5c3a-4f0e-9a51-2f8d6a1c7e10";
const saunaId = "20260000-0000-4000-8001-000000000022"; // Late Night Pickleball and Sauna
const awardsId = "20260000-0000-4000-8001-000000000013"; // Awards Show (included, not a sign-up)
const unknownId = "99999999-9999-4999-8999-999999999999";

function body(overrides: Record<string, unknown> = {}) {
  return { installId, name: "Jordan Lee", scheduleItemId: saunaId, action: "join", ...overrides };
}

function post(payload: unknown, clientId = `offline-${++requestNumber}`) {
  return new NextRequest("https://offline.invalid/api/signups", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": clientId },
    body: JSON.stringify(payload)
  });
}

function get(query: string, clientId = `offline-${++requestNumber}`) {
  return new NextRequest(`https://offline.invalid/api/signups${query}`, {
    headers: { "X-Forwarded-For": clientId }
  });
}

function mockBackend(rpcResult: unknown = null) {
  const rpcCalls: Array<Record<string, unknown>> = [];
  backend.mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    expect(url.origin).toBe("https://offline.invalid");
    if (url.pathname === "/rest/v1/rpc/upsert_experience_signup") {
      rpcCalls.push(JSON.parse(String(init?.body)));
      return Response.json(rpcResult);
    }
    expect(init?.method).toBe("GET");
    if (url.pathname === "/rest/v1/schedule_revisions") {
      return Response.json([{ snapshot: event2026Snapshot }]);
    }
    if (url.pathname === "/rest/v1/experience_signups") {
      expect(url.searchParams.get("install_id")).toBe(`eq.${installId}`);
      expect(url.searchParams.get("select")).toBe("schedule_item_id,status");
      return Response.json([{ schedule_item_id: saunaId, status: "waitlisted" }]);
    }
    throw new Error(`Unexpected backend path ${url.pathname}`);
  });
  return rpcCalls;
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

describe("POST /api/signups", () => {
  it("joins a published optional experience through the server-only RPC", async () => {
    const rpcCalls = mockBackend({
      id: "7f34e3c5-f5bc-49cc-acf5-b4335691625b",
      event_id: event2026Snapshot.event.id,
      schedule_item_id: saunaId,
      install_id: installId,
      attendee_name: "Jordan Lee",
      status: "confirmed",
      created_at: "2026-09-18T00:00:00.000Z",
      updated_at: "2026-09-18T00:00:00.000Z"
    });
    const response = await POST(post(body({ name: "  Jordan Lee " })));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ ok: true, signup: { scheduleItemId: saunaId, status: "confirmed" } });
    expect(JSON.stringify(json)).not.toContain("Jordan");
    expect(rpcCalls).toEqual([expect.objectContaining({
      p_schedule_item_id: saunaId,
      p_install_id: installId,
      p_attendee_name: "Jordan Lee",
      p_action: "join"
    })]);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
  });

  it("leaves without re-checking eligibility and reports cancelled when no row existed", async () => {
    const rpcCalls = mockBackend(null);
    const response = await POST(post(body({ action: "leave" })));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, signup: { scheduleItemId: saunaId, status: "cancelled" } });
    expect(rpcCalls).toEqual([expect.objectContaining({ p_action: "leave" })]);
    expect(backend).toHaveBeenCalledTimes(1);
  });

  it("rejects included programming with 422 and no write", async () => {
    const rpcCalls = mockBackend();
    const response = await POST(post(body({ scheduleItemId: awardsId })));
    expect(response.status).toBe(422);
    expect(rpcCalls).toHaveLength(0);
  });

  it("rejects unknown schedule items with 404 and no write", async () => {
    const rpcCalls = mockBackend();
    const response = await POST(post(body({ scheduleItemId: unknownId })));
    expect(response.status).toBe(404);
    expect(rpcCalls).toHaveLength(0);
  });

  it("rejects items hidden from the public projection", async () => {
    const hidden = {
      ...event2026Snapshot,
      scheduleItems: event2026Snapshot.scheduleItems.map((item) =>
        item.id === saunaId ? { ...item, published: false } : item
      )
    };
    backend.mockImplementation(async (input) => {
      const url = new URL(String(input));
      if (url.pathname === "/rest/v1/schedule_revisions") return Response.json([{ snapshot: hidden }]);
      throw new Error(`Unexpected backend path ${url.pathname}`);
    });
    expect((await POST(post(body()))).status).toBe(404);
  });

  it.each([null, body({ name: "J" }), body({ installId: "abc" }), body({ action: "maybe" }), body({ extra: true })])(
    "returns 422 without backend access for %j", async (payload) => {
      const response = await POST(post(payload));
      expect(response.status).toBe(422);
      expect(backend).not.toHaveBeenCalled();
    }
  );

  it("rate limits repeated attempts from one client", async () => {
    const clientId = `rate-limit-${++requestNumber}`;
    for (let index = 0; index < 20; index++) {
      expect((await POST(post(body({ name: "J" }), clientId))).status).toBe(422);
    }
    const response = await POST(post(body(), clientId));
    expect(response.status).toBe(429);
    expect(response.headers.has("Retry-After")).toBe(true);
    expect(backend).not.toHaveBeenCalled();
  });

  it("hides backend failure details", async () => {
    backend.mockRejectedValue(new Error("secret internal detail"));
    const response = await POST(post(body()));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});

describe("GET /api/signups", () => {
  it("returns only the caller's install sign-ups without names", async () => {
    mockBackend();
    const response = await GET(get(`?installId=${installId}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, signups: [{ scheduleItemId: saunaId, status: "waitlisted" }] });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it.each(["", "?installId=abc", "?installId=*"])("rejects %s without backend access", async (query) => {
    expect((await GET(get(query))).status).toBe(422);
    expect(backend).not.toHaveBeenCalled();
  });

  it("keeps public preflight available", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, OPTIONS");
  });
});

describe("GET /api/staff/signups", () => {
  it("requires staff authentication", async () => {
    const response = await STAFF_GET(new NextRequest("https://offline.invalid/api/staff/signups"));
    expect(response.status).toBe(401);
    expect(backend).not.toHaveBeenCalled();
  });
});
