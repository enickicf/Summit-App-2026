import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { event2026Snapshot } from "../packages/test-fixtures/src/event-2026.ts";
import { eventSnapshotSchema } from "../packages/validation/src/index.ts";

// An anonymous public projection is not a complete staff snapshot or backup.
if (process.argv.includes("--apply")) {
  throw new Error("--apply is disabled: anonymous published data cannot replace the complete local staff store. This command supports read-only preview only.");
}

const root = resolve(import.meta.dirname, "..");
const path = resolve(root, "work/live-ops-store.json");
const before = await readFile(path, "utf8");
const store = JSON.parse(before);
const response = await fetch("https://summit-app-2026-admin.vercel.app/api/snapshot", { cache: "no-store" });
if (!response.ok) throw new Error(`Published snapshot returned HTTP ${response.status}.`);
if (response.headers.has("x-not-alone-adapter-warning")) throw new Error("Published backend is unavailable; refusing to preview a degraded adapter as current data.");
const snapshot = eventSnapshotSchema.parse(await response.json());
if (store.eventId !== snapshot.event.id || snapshot.event.id !== event2026Snapshot.event.id || snapshot.revision < event2026Snapshot.revision) {
  throw new Error("Event identity or reviewed 2026 revision did not match.");
}
const expectedRevision = Number(process.argv.find(value => value.startsWith("--expected-local-revision="))?.split("=")[1]);
if (store.revision !== expectedRevision) throw new Error(`Expected local revision must match ${store.revision}. Review local edits first.`);
console.log(JSON.stringify({ localRevision: store.revision, publishedRevision: snapshot.revision, previousSessions: store.publishedSnapshot.scheduleItems.length, publishedSessions: snapshot.scheduleItems.length, publicGuests: snapshot.speakers.length, localWrites: 0, cloudWrites: 0 }));
console.log("Read-only preview of anonymous public data. This subset cannot replace local staff drafts, history, notifications, or the complete published store; --apply is disabled.");
