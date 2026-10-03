import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { authenticateStaffAccessToken, getStaffContext, hasStaffPageAccess } from "./live-ops-repository";
import { GET as staffMe } from "../app/api/staff/me/route";
import { GET as state } from "../app/api/live-ops/state/route";
import { GET as jobs } from "../app/api/notifications/jobs/route";
import { GET as readiness } from "../app/api/production/readiness/route";
import { POST as stateAi } from "../app/api/ai/state/route";
import { POST as operatorAi } from "../app/api/ai/operator/propose/route";
import { POST as importGuests } from "../app/api/import/airtable-guests/route";
import { POST as importSchedule } from "../app/api/import/schedule/route";
import { POST as draft } from "../app/api/live-ops/draft/route";
import { POST as preview } from "../app/api/live-ops/publish-preview/route";
import { POST as publish } from "../app/api/live-ops/publish/route";
import { POST as rollback } from "../app/api/live-ops/rollback/route";
import { POST as content } from "../app/api/content/publish/route";
import { POST as schedulePublish } from "../app/api/schedule/publish/route";
import { POST as dispatch } from "../app/api/notifications/dispatch/route";
import { POST as receipts } from "../app/api/notifications/receipts/route";

const { localStore, readinessReport } = vi.hoisted(() => ({ localStore: vi.fn(), readinessReport: vi.fn() }));

vi.mock("./live-ops-store", async importOriginal => ({
  ...await importOriginal<typeof import("./live-ops-store")>(),
  readLiveOpsStore: localStore,
  saveDraftSessions: localStore,
  publishDraftSessions: localStore,
  publishContent: localStore,
  recordDocumentImport: localStore,
  rollbackLastPublishedSnapshot: localStore
}));
vi.mock("./production-readiness", () => ({ createProductionReadinessReport: readinessReport }));

const backend = vi.fn<typeof fetch>();
const unavailable = { status: 503, message: "Staff access is temporarily unavailable." };
const draftBody = { sessions: [{
  id: "offline-only", day: "", start: "", end: "", title: "Offline authorization check",
  speaker: "", location: "", audience: "", status: "Draft", reminders: ""
}] };

function request(method = "GET", headers: Record<string, string> = {}) {
  return new NextRequest("https://offline.invalid/api/staff-test", {
    method, headers: { "Content-Type": "application/json", ...headers },
    ...(method === "POST" ? { body: JSON.stringify(draftBody) } : {})
  });
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("SUPABASE_URL", undefined);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", undefined);
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", undefined);
  vi.stubEnv("LOCAL_STAFF_ROLE", "ADMIN");
  backend.mockReset().mockRejectedValue(new Error("Unexpected external access"));
  localStore.mockReset().mockImplementation(() => { throw new Error("Local store access is forbidden"); });
  readinessReport.mockReset().mockImplementation(() => { throw new Error("Readiness file access is forbidden"); });
  vi.stubGlobal("fetch", backend);
});

afterEach(() => {
  expect(backend).not.toHaveBeenCalled();
  expect(localStore).not.toHaveBeenCalled();
  expect(readinessReport).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("production staff configuration boundary", () => {
  it.each([
    { name: "no configuration", url: undefined, publicUrl: undefined, key: undefined },
    { name: "URL only", url: "https://offline.invalid", publicUrl: undefined, key: undefined },
    { name: "public URL only", url: undefined, publicUrl: "https://offline.invalid", key: undefined },
    { name: "key only", url: undefined, publicUrl: undefined, key: "offline-placeholder" }
  ])("denies every auth entry point with $name", async ({ url, publicUrl, key }) => {
    vi.stubEnv("SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", publicUrl);
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", key);
    await expect(getStaffContext(request(), ["ADMIN"])).rejects.toMatchObject(unavailable);
    await expect(authenticateStaffAccessToken("offline-access-token", ["ADMIN"])).rejects.toMatchObject(unavailable);
    expect(await hasStaffPageAccess()).toBe(false);
  });

  it.each([
    { name: "staff identity", method: "GET", handler: staffMe },
    { name: "staff state", method: "GET", handler: state },
    { name: "notification jobs", method: "GET", handler: jobs },
    { name: "readiness", method: "GET", handler: readiness },
    { name: "state AI", method: "POST", handler: stateAi },
    { name: "operator AI", method: "POST", handler: operatorAi },
    { name: "guest import", method: "POST", handler: importGuests },
    { name: "schedule import", method: "POST", handler: importSchedule },
    { name: "draft save", method: "POST", handler: draft },
    { name: "publish preview", method: "POST", handler: preview },
    { name: "publish", method: "POST", handler: publish },
    { name: "rollback", method: "POST", handler: rollback },
    { name: "content publish", method: "POST", handler: content },
    { name: "schedule publish", method: "POST", handler: schedulePublish },
    { name: "push dispatch", method: "POST", handler: dispatch },
    { name: "push receipts", method: "POST", handler: receipts }
  ])("returns generic 503 from the real $name handler before privileged access", async ({ method, handler }) => {
    for (const headers of [{}, { authorization: "Bearer offline-invalid" }, { cookie: "not-alone.staff.access=offline-invalid" }]) {
      const response = await handler(request(method, headers));
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ ok: false, error: unavailable.message });
    }
  });

  it("retains 401 for an anonymous request when backend configuration is complete", async () => {
    vi.stubEnv("SUPABASE_URL", "https://offline.invalid");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "offline-placeholder");
    await expect(getStaffContext(request(), ["ADMIN"])).rejects.toMatchObject({ status: 401 });
  });
});

describe("intentional local staff adapter", () => {
  it.each(["development", "test"])("retains local role authorization in %s", async mode => {
    vi.stubEnv("NODE_ENV", mode);
    vi.stubEnv("LOCAL_STAFF_ROLE", "EDITOR");
    const expected = { role: "EDITOR", mode: "local-adapter" };
    expect(await getStaffContext(request(), ["EDITOR", "ADMIN"])).toEqual(expected);
    expect(await authenticateStaffAccessToken("", ["EDITOR", "ADMIN"])).toEqual(expected);
    expect(await hasStaffPageAccess()).toBe(true);
    await expect(getStaffContext(request(), ["ADMIN"])).rejects.toMatchObject({ status: 403 });
  });

  it.each(["development", "test"])("retains the default local ADMIN workflow in %s", async mode => {
    vi.stubEnv("NODE_ENV", mode);
    vi.stubEnv("LOCAL_STAFF_ROLE", undefined);
    expect(await getStaffContext(request(), ["ADMIN"])).toEqual({ role: "ADMIN", mode: "local-adapter" });
  });
});
