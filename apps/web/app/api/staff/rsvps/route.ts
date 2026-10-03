import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { isStaffSession, staffCookieName } from "../../../../lib/staff/auth";
import { getSubmissionStore, type PokerSubmission, type RsvpSubmission, type SubmissionStore } from "../../../../lib/staff/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Owner (Sept 28): staff can remove a ticket request from the working lists (e.g. a test entry) or restore it.
// Nothing is deleted: the record keeps every field and moves to the portal's "Removed guests" section.
export type RemovableKind = "rsvp" | "poker";
export async function removeOrRestoreSubmission(store: SubmissionStore, kind: RemovableKind, id: string, action: "remove" | "restore", reason: string, now = new Date()): Promise<RsvpSubmission | PokerSubmission | null> {
  const record = kind === "poker" ? (await store.list("poker")).find(item => item.id === id) : (await store.list("rsvp")).find(item => item.id === id);
  if (!record) return null;
  const { removedAt: _at, removedReason: _reason, ...rest } = record;
  const updated = action === "remove" ? { ...rest, removedAt: now.toISOString(), removedReason: reason.trim() || "Removed by staff" } : rest;
  if (kind === "poker") await store.add("poker", updated as PokerSubmission); else await store.add("rsvp", updated as RsvpSubmission);
  return updated as RsvpSubmission | PokerSubmission;
}
// Permanent deletion (owner, Sept 28: test entries were confusing). Only a record already marked removed can be deleted.
export async function deleteRemovedSubmission(store: SubmissionStore, kind: RemovableKind, id: string): Promise<"deleted" | "not-found" | "not-removed"> {
  const record = kind === "poker" ? (await store.list("poker")).find(item => item.id === id) : (await store.list("rsvp")).find(item => item.id === id);
  if (!record) return "not-found";
  if (!record.removedAt) return "not-removed";
  await store.delete(kind, record);
  return "deleted";
}
export const removeOrRestoreRsvp = (store: SubmissionStore, id: string, action: "remove" | "restore", reason: string, now = new Date()) => removeOrRestoreSubmission(store, "rsvp", id, action, reason, now) as Promise<RsvpSubmission | null>;

export async function POST(request: Request) {
  const jar = await cookies();
  if (!isStaffSession(jar.get(staffCookieName)?.value)) return NextResponse.json({ ok: false, error: "Sign in required." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const type = request.headers.get("content-type") ?? "";
  let id = "", action = "", reason = "", kind = "rsvp", fromForm = false;
  if (type.includes("application/json")) {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    id = String(body.id ?? ""); action = String(body.action ?? ""); reason = String(body.reason ?? ""); kind = String(body.kind ?? "rsvp");
  } else {
    const form = await request.formData().catch(() => null);
    id = String(form?.get("id") ?? ""); action = String(form?.get("action") ?? ""); reason = String(form?.get("reason") ?? ""); kind = String(form?.get("kind") ?? "rsvp"); fromForm = true;
  }
  if (kind !== "rsvp" && kind !== "poker") return NextResponse.json({ ok: false, error: "kind must be \"rsvp\" or \"poker\"." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  if (!id || (action !== "remove" && action !== "restore" && action !== "delete")) return NextResponse.json({ ok: false, error: "id and action (remove | restore | delete) are required." }, { status: 400, headers: { "Cache-Control": "no-store" } });
  if (action === "delete") {
    const result = await deleteRemovedSubmission(await getSubmissionStore(), kind, id);
    if (result === "not-found") return NextResponse.json({ ok: false, error: "No request with that id." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    if (result === "not-removed") return NextResponse.json({ ok: false, error: "Remove the request first; only removed requests can be deleted." }, { status: 409, headers: { "Cache-Control": "no-store" } });
    if (fromForm) return new NextResponse(null, { status: 303, headers: { Location: kind === "poker" ? "/staff#poker-removed" : "/staff#removed", "Cache-Control": "no-store" } });
    return NextResponse.json({ ok: true, deleted: id }, { headers: { "Cache-Control": "no-store" } });
  }
  const updated = await removeOrRestoreSubmission(await getSubmissionStore(), kind, id, action, reason);
  if (!updated) return NextResponse.json({ ok: false, error: "No ticket request with that id." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  if (fromForm) return new NextResponse(null, { status: 303, headers: { Location: kind === "poker" ? "/staff#poker" : action === "remove" ? "/staff#removed" : "/staff#tickets", "Cache-Control": "no-store" } });
  return NextResponse.json({ ok: true, record: updated }, { headers: { "Cache-Control": "no-store" } });
}
