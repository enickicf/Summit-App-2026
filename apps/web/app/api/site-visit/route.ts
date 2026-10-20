import { withSubmissionInbox } from "../../../lib/staff/submission-inbox";
import { NextResponse } from "next/server";
import { getSubmissionStore, newSubmission, siteVisitFormSchema, siteVisitWaiverProblem, type SubmissionStore } from "../../../lib/staff/store";
import { signupOpenByCategory } from "../../../lib/morning-workshops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Oct 9: the Tennis & High Tea form at /tennis-high-tea (the ICF designer's page; owner: "use this one"). Same
// origin only. Each chosen activity is stored as one site-visit sign-up (the same records the schedule pop-up
// writes), with email, phone, transport and the signed waiver, so the staff portal's Tennis & High Tea view lists it.
const activities = {
  tennis: { sessionId: "site-visit-tennis", sessionTitle: "Tennis (ICF Site Visit)", sessionTime: "10:00 AM" },
  tea: { sessionId: "site-visit-high-tea", sessionTitle: "High Tea (ICF Site Visit)", sessionTime: "12:00 PM" }
} as const;

export async function handleSiteVisitPost(request: Request, store?: SubmissionStore): Promise<Response> {
  const headers = { "Cache-Control": "no-store" };
  if (Number(request.headers.get("content-length") ?? 0) > 10_000) return NextResponse.json({ error: "Request is too large." }, { status: 413, headers });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400, headers }); }
  const parsed = siteVisitFormSchema.safeParse(body);
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    const messages: Record<string, string> = {
      name: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a phone number.",
      transport: "Please choose how you will get there."
    };
    return NextResponse.json({ field, error: messages[field] ?? "Please check the form and try again." }, { status: 400, headers });
  }
  const { website, tennis, tea, waiverAccepted, signature, waiverVersion, ...guest } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 201, headers }); // honeypot: pretend success, store nothing
  if (!tennis && !tea) return NextResponse.json({ field: "tennis", error: "Please choose tennis, high tea, or both." }, { status: 400, headers });
  if (!signupOpenByCategory.siteVisit) return NextResponse.json({ error: "Sign-ups are not open at the moment." }, { status: 410, headers });
  const problem = siteVisitWaiverProblem({ name: guest.name, waiverAccepted, signature, waiverVersion });
  if (problem) return NextResponse.json(problem, { status: 400, headers });
  const now = new Date();
  const waiver = { waiverAccepted: true, signature: (signature ?? "").trim(), waiverVersion: (waiverVersion ?? "").trim(), waiverAcceptedAt: now.toISOString() };
  const chosen = [tennis && activities.tennis, tea && activities.tea].filter(value => value !== false);
  try {
    const target = store ?? await getSubmissionStore();
    for (const activity of chosen) {
      await target.add("workshop", newSubmission({ ...activity, sessionDay: "Thursday, November 5", ...guest, category: "siteVisit" as const, ...waiver }, now));
    }
  } catch (error) {
    console.error("site visit store failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn’t save your RSVP. Please try again; your details are still here." }, { status: 500, headers });
  }
  return NextResponse.json({ ok: true }, { status: 201, headers });
}

async function postWithoutInbox(request: Request) {
  return handleSiteVisitPost(request);
}

// Oct 19: every request is stored in the submission inbox before validation (lib/staff/submission-inbox.ts).
export const POST = withSubmissionInbox("site-visit", postWithoutInbox);
