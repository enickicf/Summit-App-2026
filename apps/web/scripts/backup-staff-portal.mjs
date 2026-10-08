// Owner (Sept 28, 2026): one-command backup of everything in the staff portal.
//   STAFF_PORTAL_PASSWORD=... node apps/web/scripts/backup-staff-portal.mjs [--base https://notalonesummit.org] [--out <dir>]
// Writes <out>/staff-portal-backup-<UTC stamp>.json (every RSVP incl. removed ones, nominations, poker seat
// requests, the confirmation-email log) plus staff-portal-backup-latest.html, a self-contained page with the
// same data in tables and as copyable JSON (published privately as a Claude artifact for the owner).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const base = opt("--base", "https://notalonesummit.org").replace(/\/+$/, "");
const out = opt("--out", join(process.cwd(), "work", "staff-portal-backups"));
const password = process.env.STAFF_PORTAL_PASSWORD;
if (!password) { console.error("STAFF_PORTAL_PASSWORD is required (never paste it in chat)."); process.exit(2); }

const login = await fetch(`${base}/api/staff/login`, { method: "POST", body: new URLSearchParams({ password }), redirect: "manual" });
const cookie = login.headers.get("set-cookie")?.split(";")[0];
if (!cookie?.startsWith("na_staff=")) { console.error(`Sign-in failed (${login.status}).`); process.exit(1); }
const response = await fetch(`${base}/api/staff/export?kind=all`, { headers: { cookie } });
if (!response.ok) { console.error(`Export failed (${response.status}).`); process.exit(1); }
const data = await response.json();
mkdirSync(out, { recursive: true });
const stamp = data.exportedAt.replace(/[:.]/g, "-");
const jsonPath = join(out, `staff-portal-backup-${stamp}.json`);
writeFileSync(jsonPath, JSON.stringify(data, null, 2));

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const when = iso => iso ? new Date(iso).toLocaleString("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) + " PT" : "";
const table = (rows, cols) => rows.length ? `<div class="wrap"><table><thead><tr>${cols.map(c => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${cols.map(c => `<td>${esc(c.get(r))}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : `<p class="empty">None.</p>`;
const status = { attending: "Plans to attend", needs_follow_up: "Wants more information", declined: "Unable to attend" };
const rsvpCols = [{ label: "Submitted", get: r => when(r.submittedAt) }, { label: "Form", get: r => r.partner === "nami" ? "NAMI" : r.vip ? "VIP" : "Standard" }, { label: "Name", get: r => r.name }, { label: "Email", get: r => r.email }, { label: "Phone", get: r => r.phone }, { label: "Organization", get: r => r.organization }, { label: "Role", get: r => r.professionalRole }, { label: "Invited by", get: r => r.invitedBy ?? "" }, { label: "Heard from", get: r => ({ "inspiring-children": "Inspiring Children", nami: "NAMI", "lake-las-vegas": "Lake Las Vegas", other: "Other" })[r.heardFrom] ?? "" }, { label: "VIP", get: r => r.vip ? "Yes" : "" }, { label: "Partner", get: r => r.partner === "nami" ? "NAMI" : "" }, { label: "Response", get: r => status[r.attendanceStatus] ?? r.attendanceStatus }, { label: "Community Day", get: r => r.communityDay ? "Yes" : "No" }, { label: "Party", get: r => r.guestCount }, { label: "Notes", get: r => r.notes }, { label: "Source", get: r => r.source === "import" ? "Previous portal" : "Form" }, { label: "ID", get: r => r.id }];
const active = data.rsvp.filter(r => !r.removedAt), removed = data.rsvp.filter(r => r.removedAt);
const latest = new Map(); for (const r of [...active].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))) if (!latest.has(r.email.toLowerCase())) latest.set(r.email.toLowerCase(), r);
const tickets = [...latest.values()].filter(r => r.attendanceStatus === "attending").reduce((t, r) => t + r.guestCount, 0);
const html = `<title>Awards Guest List Backup</title>
<style>
:root{--bg:#f5f6fb;--panel:#ffffff;--ink:#1c1a2e;--muted:#5d6079;--line:#d8dcec;--accent:#4a5faa;--accent-ink:#ffffff;--warn:#fff3d6;--warn-ink:#6f4a00;color-scheme:light}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--bg:#15161f;--panel:#1f2130;--ink:#eef0fa;--muted:#a6abc6;--line:#343854;--accent:#8fa4ee;--accent-ink:#11122a;--warn:#3d3110;--warn-ink:#ffd98a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#15161f;--panel:#1f2130;--ink:#eef0fa;--muted:#a6abc6;--line:#343854;--accent:#8fa4ee;--accent-ink:#11122a;--warn:#3d3110;--warn-ink:#ffd98a;color-scheme:dark}
body{background:var(--bg);color:var(--ink);font:15px/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;padding-inline:16px;padding-block:24px 48px;margin:0}
main{max-width:1180px;margin:0 auto;display:grid;gap:24px}
h1{margin:0;font-size:26px;line-height:1.2;text-wrap:balance}h2{margin:0;font-size:19px}
.eyebrow{margin:0 0 4px;color:var(--accent);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.sub{margin:6px 0 0;color:var(--muted)}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.tile{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:grid;gap:2px}
.tile b{font-size:28px;font-variant-numeric:tabular-nums}.tile span{font-size:12px;color:var(--muted);font-weight:600}
.tile.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}.tile.primary span{color:var(--accent-ink);opacity:.85}
section{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px;display:grid;gap:12px}
.wrap{overflow-x:auto;border:1px solid var(--line);border-radius:10px}
table{border-collapse:collapse;min-width:900px;width:100%;font-size:13px}th{position:sticky;top:0;background:var(--bg);color:var(--accent);text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding:8px 10px;border-bottom:1px solid var(--line)}td{padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top;font-variant-numeric:tabular-nums}
.empty{margin:0;color:var(--muted)}.note{background:var(--warn);color:var(--warn-ink);border-radius:10px;padding:10px 12px;font-size:13px}
details{display:grid;gap:10px}summary{cursor:pointer;font-weight:600}pre{margin:0;max-height:420px;overflow:auto;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:12px;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre}
button{font:inherit;font-weight:600;background:var(--accent);color:var(--accent-ink);border:0;border-radius:999px;padding:8px 16px;cursor:pointer}button:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
</style>
<main>
<header><p class="eyebrow">Not Alone Awards 2026 · staff portal backup</p><h1>Awards guest list backup</h1><p class="sub">Exported ${esc(when(data.exportedAt))} from notalonesummit.org/staff. Private page for the owner; contains guest contact details. The JSON block at the bottom is the complete, machine-readable copy.</p></header>
<div class="tiles"><div class="tile primary"><b>${tickets}</b><span>Tickets requested</span></div><div class="tile primary"><b>${active.length}</b><span>Forms submitted</span></div><div class="tile"><b>${removed.length}</b><span>Removed requests (kept)</span></div><div class="tile"><b>${data.nomination.length}</b><span>Nominations</span></div><div class="tile"><b>${data.poker.filter(r => !r.removedAt).length}</b><span>Poker seat requests</span></div><div class="tile"><b>${(data.workshop ?? []).length}</b><span>Workshop sign-ups</span></div><div class="tile"><b>${data.rsvpEmail.length}</b><span>Confirmation emails sent</span></div></div>
<section><h2>VIP RSVPs (${active.filter(r => r.vip).length})</h2>${table(active.filter(r => r.vip), rsvpCols)}</section>
<section><h2>NAMI RSVPs (${active.filter(r => r.partner === "nami").length})</h2>${table(active.filter(r => r.partner === "nami"), rsvpCols)}</section>
<section><h2>Awards ticket requests (${active.length})</h2>${table(active, rsvpCols)}</section>
<section><h2>Removed requests (${removed.length})</h2><p class="note">Taken out of the working lists by staff (test entries, duplicates). Kept here in full so no RSVP is ever lost.</p>${table(removed, [...rsvpCols, { label: "Removed", get: r => `${when(r.removedAt)} · ${r.removedReason ?? ""}` }])}</section>
<section><h2>Award nominations (${data.nomination.length})</h2>${table(data.nomination, [{ label: "Submitted", get: r => when(r.submittedAt) }, { label: "Nominee", get: r => r.nomineeName }, { label: "Organization", get: r => r.nomineeOrganization }, { label: "Category", get: r => r.category }, { label: "Reason", get: r => r.reason }, { label: "Links", get: r => r.links }, { label: "Nominated by", get: r => `${r.nominatorName} · ${r.nominatorEmail}${r.nominatorPhone ? " · " + r.nominatorPhone : ""}` }, { label: "Relationship", get: r => r.relationship }])}</section>
<section><h2>All In poker seat requests (${data.poker.filter(r => !r.removedAt).length} active, ${data.poker.filter(r => r.removedAt).length} removed)</h2>${table(data.poker, [{ label: "Submitted", get: r => when(r.submittedAt) }, { label: "Name", get: r => r.name }, { label: "Email", get: r => r.email }, { label: "Phone", get: r => r.phone }, { label: "Organization", get: r => r.organization }, { label: "Taking part as", get: r => r.interest }, { label: "Sponsorship", get: r => r.sponsorship }, { label: "Seats", get: r => r.seats }, { label: "Experience", get: r => r.experience }, { label: "Notes", get: r => r.notes }, { label: "Removed", get: r => r.removedAt ? `${when(r.removedAt)} · ${r.removedReason ?? ""}` : "" }])}</section>
<section><h2>Summit workshop + Tennis / High Tea sign-ups (${(data.workshop ?? []).length})</h2>${table(data.workshop ?? [], [{ label: "Submitted", get: r => when(r.submittedAt) }, { label: "Name", get: r => r.name }, { label: "Category", get: r => r.category === "siteVisit" ? "Tennis / High Tea" : "Workshop" }, { label: "Session", get: r => r.sessionTitle }, { label: "Day", get: r => r.sessionDay }, { label: "Time", get: r => r.sessionTime }, { label: "Waiver", get: r => r.waiverAccepted && r.signature ? `Signed: ${r.signature}` : "" }, { label: "ID", get: r => r.id }])}</section>
<section><h2>Confirmation emails sent (${data.rsvpEmail.length})</h2>${table(data.rsvpEmail, [{ label: "Sent", get: r => when(r.submittedAt) }, { label: "To", get: r => r.email }, { label: "Subject", get: r => r.subject }, { label: "RSVP ID", get: r => r.rsvpId }])}</section>
<section><details open><summary>Complete JSON export (copy to restore or re-import)</summary><div><button type="button" id="copy-json">Copy JSON</button> <span id="copy-state" class="empty"></span></div><pre id="json">${esc(JSON.stringify(data, null, 2))}</pre></details></section>
</main>
<script>
document.getElementById("copy-json").addEventListener("click", async () => {
  const text = document.getElementById("json").textContent; const state = document.getElementById("copy-state");
  try { await navigator.clipboard.writeText(text); state.textContent = "Copied."; }
  catch { const range = document.createRange(); range.selectNodeContents(document.getElementById("json")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range); state.textContent = "Selected; press Cmd/Ctrl+C to copy."; }
});
</script>
`;
const htmlPath = join(out, "staff-portal-backup-latest.html");
writeFileSync(htmlPath, html);
console.log(JSON.stringify({ jsonPath, htmlPath, exportedAt: data.exportedAt, rsvp: data.rsvp.length, removed: removed.length, nominations: data.nomination.length, poker: data.poker.length, emails: data.rsvpEmail.length, workshops: (data.workshop ?? []).length, ticketsRequested: tickets }));
