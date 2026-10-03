import { NextRequest, NextResponse } from "next/server";
import { experienceSignupStaffUpdateSchema } from "@not-alone/validation";
import { ExperienceSignupError } from "../../../../lib/experience-signups";
import {
  getStaffContext,
  listExperienceSignupsForStaff,
  setExperienceSignupStatus,
  StaffAuthError
} from "../../../../lib/live-ops-repository";

export async function GET(request: NextRequest) {
  try {
    const staff = await getStaffContext(request, ["VIEWER", "EDITOR", "PUBLISHER", "ADMIN"]);
    const result = await listExperienceSignupsForStaff(staff);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof StaffAuthError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: "Unable to load experience sign-ups." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const staff = await getStaffContext(request, ["PUBLISHER", "ADMIN"]);
    const parsed = experienceSignupStaffUpdateSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid sign-up status change.", issues: parsed.error.issues.map((issue) => issue.message) },
        { status: 422, headers: { "Cache-Control": "no-store" } }
      );
    }
    const signup = await setExperienceSignupStatus(parsed.data, staff);
    return NextResponse.json({ ok: true, signup }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof StaffAuthError || error instanceof ExperienceSignupError) {
      return NextResponse.json({ ok: false, error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ok: false, error: "Unable to update the sign-up." }, { status: 500 });
  }
}
