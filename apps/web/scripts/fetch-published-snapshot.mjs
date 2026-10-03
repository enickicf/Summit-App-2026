// Build step (Sept 24, 2026, owner): copy the current published snapshot from the staff API into the
// site (lib/published-snapshot.json) so pages read it from the bundle and never call Vercel at request
// time. Any failure keeps the previous file and exits 0: a build can never break because of the API.
//   node scripts/fetch-published-snapshot.mjs            (run automatically by `pnpm --filter @not-alone/web build`)
//   PUBLIC_API_BASE_URL=... overrides the staff API origin; SKIP_SNAPSHOT_FETCH=1 keeps the file as is.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "published-snapshot.json");
const eventId = process.env.EVENT_ID ?? "not-alone-summit-2026-prototype";
const baseUrl = (process.env.PUBLIC_API_BASE_URL ?? "https://summit-app-2026-admin.vercel.app").replace(/\/+$/, "");
const current = (() => { try { return JSON.parse(readFileSync(file, "utf8")); } catch { return null; } })();
const keep = reason => { console.warn(`[published-snapshot] ${reason}; keeping the bundled copy${current ? ` (revision ${current.revision})` : ""}.`); process.exit(0); };

if (process.env.SKIP_SNAPSHOT_FETCH) keep("SKIP_SNAPSHOT_FETCH set");
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 20000);
try {
  const response = await fetch(`${baseUrl}/api/snapshot`, { signal: controller.signal, headers: { accept: "application/json" } });
  if (!response.ok) keep(`staff API answered ${response.status}`);
  if (response.headers.has("x-not-alone-adapter-warning")) keep("staff API is running on its local adapter, not a verified publication");
  const snapshot = await response.json();
  if (!snapshot || typeof snapshot.revision !== "number" || snapshot.event?.id !== eventId || snapshot.event?.demo) keep("response is not the published event snapshot");
  for (const key of ["scheduleItems", "speakers", "locations", "notices", "faqs", "sponsors", "media", "contentPages"]) if (!Array.isArray(snapshot[key])) keep(`response lacks ${key}`);
  if (current && current.revision > snapshot.revision) keep(`API revision ${snapshot.revision} is older than the bundled revision ${current.revision}`);
  writeFileSync(file, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(`[published-snapshot] bundled revision ${snapshot.revision} (${snapshot.speakers.length} people, ${snapshot.scheduleItems.length} sessions) from ${baseUrl}`);
} catch (error) {
  keep(`fetch failed (${error?.name ?? "error"})`);
} finally {
  clearTimeout(timer);
}
