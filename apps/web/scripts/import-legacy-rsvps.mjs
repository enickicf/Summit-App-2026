#!/usr/bin/env node
// One-time import of the RSVP rows collected by the previous backend into the staff portal.
//
//   STAFF_PORTAL_PASSWORD=... node apps/web/scripts/import-legacy-rsvps.mjs <export.json> [--base https://notalonesummit.org] [--include-tests]
//
// The export is the previous portal's JSON (id, name, email, phone, organization, attendanceStatus,
// guestCount, notes, submittedAt). Internal test rows (ids 2, 3, 6, 11, 15 in the Sept 22 export) are
// skipped unless --include-tests is passed. Rows already imported are skipped by the server.
import { readFileSync } from "node:fs";

const [, , file, ...rest] = process.argv;
const base = (rest[rest.indexOf("--base") + 1] && rest.includes("--base") ? rest[rest.indexOf("--base") + 1] : "https://notalonesummit.org").replace(/\/$/, "");
const includeTests = rest.includes("--include-tests");
const password = process.env.STAFF_PORTAL_PASSWORD;
if (!file || !password) { console.error("Usage: STAFF_PORTAL_PASSWORD=... node import-legacy-rsvps.mjs <export.json> [--base URL] [--include-tests]"); process.exit(2); }

const testIds = new Set(["2", "3", "6", "11", "15"]);
const rows = JSON.parse(readFileSync(file, "utf8")).filter(row => includeTests || !testIds.has(String(row.id))).map(row => ({
  id: String(row.id), submittedAt: row.submittedAt, name: row.name, email: row.email, phone: row.phone ?? "", organization: row.organization ?? "",
  professionalRole: row.professionalRole ?? "", attendanceStatus: row.attendanceStatus, guestCount: Number(row.guestCount ?? 1), notes: row.notes ?? ""
}));

const login = await fetch(`${base}/api/staff/login`, { method: "POST", body: new URLSearchParams({ password }), redirect: "manual" });
const cookie = login.headers.get("set-cookie")?.split(";")[0];
if (!cookie || !cookie.startsWith("na_staff=")) { console.error(`Sign-in failed (${login.status}); check STAFF_PORTAL_PASSWORD.`); process.exit(1); }
const response = await fetch(`${base}/api/staff/import`, { method: "POST", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify(rows) });
console.log(response.status, await response.text(), `(${rows.length} rows sent)`);
