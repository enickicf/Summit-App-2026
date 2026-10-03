import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { STAFF_ACCESS_COOKIE, STAFF_REFRESH_COOKIE } from "../../../../lib/staff-session";
import { POST, PATCH } from "./route";

const backend = vi.fn<typeof fetch>();
const unavailable = "Staff access is temporarily unavailable.";

function request(method: "POST" | "PATCH") {
  return new NextRequest("https://offline.invalid/api/staff/session", {
    method,
    headers: {
      "Content-Type": "application/json",
      Cookie: `${STAFF_ACCESS_COOKIE}=offline-access; ${STAFF_REFRESH_COOKIE}=offline-refresh`
    },
    ...(method === "POST" ? {
      body: JSON.stringify({ accessToken: "offline-access", refreshToken: "offline-refresh", expiresIn: 3600 })
    } : {})
  });
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SUPABASE_URL", undefined);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", undefined);
  vi.stubEnv("LOCAL_STAFF_ROLE", "ADMIN");
  backend.mockReset().mockRejectedValue(new Error("Unexpected external access"));
  vi.stubGlobal("fetch", backend);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("staff session configuration failures", () => {
  it.each([
    { name: "no backend", url: undefined, key: undefined },
    { name: "URL only", url: "https://offline.invalid", key: undefined },
    { name: "key only", url: undefined, key: "offline-placeholder" }
  ])("denies production session exchange and refresh with $name", async ({ url, key }) => {
    vi.stubEnv("SUPABASE_URL", url);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", key);
    const exchange = await POST(request("POST"));
    expect(exchange.status).toBe(503);
    expect(await exchange.json()).toEqual({ ok: false, error: unavailable });
    expect(exchange.cookies.getAll()).toEqual([]);

    const refresh = await PATCH(request("PATCH"));
    expect(refresh.status).toBe(503);
    expect(await refresh.json()).toEqual({ ok: false, message: unavailable });
    for (const name of [STAFF_ACCESS_COOKIE, STAFF_REFRESH_COOKIE]) {
      expect(refresh.cookies.get(name)).toMatchObject({ value: "", maxAge: 0, httpOnly: true, secure: true });
    }
    expect(backend).not.toHaveBeenCalled();
  });

  it.each(["development", "test"])("preserves intentional local exchange and refresh in %s", async mode => {
    vi.stubEnv("NODE_ENV", mode);
    vi.stubEnv("LOCAL_STAFF_ROLE", "EDITOR");
    expect(await (await POST(request("POST"))).json()).toEqual({ ok: true, mode: "local-adapter", role: "EDITOR" });
    expect(await (await PATCH(request("PATCH"))).json()).toEqual({ ok: true, mode: "local-adapter", role: "EDITOR" });
    expect(backend).not.toHaveBeenCalled();
  });
});

describe("configured staff session policy", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_URL", "https://offline.invalid");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "offline-server-placeholder");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "offline-public-placeholder");
  });

  it("keeps invited staff ADMIN activation and secure session cookies", async () => {
    backend.mockResolvedValueOnce(Response.json({
      id: "11111111-1111-4111-8111-111111111111", invited_at: "2026-09-16T00:00:00.000Z"
    })).mockResolvedValueOnce(Response.json([]))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    const response = await POST(request("POST"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, mode: "supabase", role: "ADMIN" });
    expect(backend).toHaveBeenLastCalledWith(
      "https://offline.invalid/rest/v1/staff_profiles?on_conflict=user_id",
      expect.objectContaining({ method: "POST", body: expect.stringContaining('"role":"ADMIN"') })
    );
    expect(response.cookies.get(STAFF_ACCESS_COOKIE)).toMatchObject({
      value: "offline-access", httpOnly: true, secure: true, sameSite: "strict", maxAge: 3600
    });
  });

  it("keeps configured refresh behind token and staff verification", async () => {
    backend.mockResolvedValueOnce(Response.json({ access_token: "offline-renewed", refresh_token: "offline-renewed-refresh", expires_in: 600 }))
      .mockResolvedValueOnce(Response.json({ id: "existing-staff" }))
      .mockResolvedValueOnce(Response.json([{ user_id: "existing-staff", role: "ADMIN" }]));
    const response = await PATCH(request("PATCH"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, mode: "supabase", role: "ADMIN" });
    expect(backend).toHaveBeenNthCalledWith(1, "https://offline.invalid/auth/v1/token?grant_type=refresh_token", expect.objectContaining({
      method: "POST", body: JSON.stringify({ refresh_token: "offline-refresh" })
    }));
    expect(response.cookies.get(STAFF_ACCESS_COOKIE)).toMatchObject({ value: "offline-renewed", maxAge: 600, secure: true });
    expect(backend).toHaveBeenCalledTimes(3);
  });

  it("rejects invalid access tokens without setting a session", async () => {
    backend.mockResolvedValueOnce(new Response(null, { status: 401 }));
    const response = await POST(request("POST"));
    expect(response.status).toBe(401);
    expect(response.cookies.getAll()).toEqual([]);
    expect(backend).toHaveBeenCalledTimes(1);
  });
});
