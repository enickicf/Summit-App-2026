import { NextRequest, NextResponse } from "next/server";
import { experienceSignupLookupSchema, experienceSignupRequestSchema } from "@not-alone/validation";
import { ExperienceSignupError } from "../../../lib/experience-signups";
import { listSignupsForInstall, upsertExperienceSignup } from "../../../lib/live-ops-repository";
import { checkRateLimit } from "../../../lib/rate-limit";
import { publicApiCorsHeaders, publicApiOptions } from "../../../lib/public-api-cors";

// Anonymous attendee sign-ups for optional experiences. Responses only ever describe the
// caller's own install; attendee names are never returned.
const allowedMethods = ["GET", "POST"] as const;

export function OPTIONS() {
  return publicApiOptions(allowedMethods);
}

export async function GET(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "experience-signup-lookup", { limit: 60, windowMs: 60_000 });
  if (!rateLimit.allowed) return tooManyRequests(rateLimit);

  const parsed = experienceSignupLookupSchema.safeParse({
    installId: request.nextUrl.searchParams.get("installId") ?? undefined
  });
  if (!parsed.success) {
    return respond({ ok: false, error: "A valid installId is required." }, 422, rateLimit.headers);
  }

  try {
    const signups = await listSignupsForInstall(parsed.data.installId);
    return respond({ ok: true, signups }, 200, rateLimit.headers);
  } catch {
    return respond({ ok: false, error: "Sign-ups are temporarily unavailable." }, 503, rateLimit.headers);
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(request, "experience-signup", { limit: 20, windowMs: 60_000 });
  if (!rateLimit.allowed) return tooManyRequests(rateLimit);

  const body = await request.json().catch(() => ({}));
  const parsed = experienceSignupRequestSchema.safeParse(body);
  if (!parsed.success) {
    return respond(
      {
        ok: false,
        error: "Invalid experience sign-up.",
        issues: parsed.error.issues.map((issue) => issue.message)
      },
      422,
      rateLimit.headers
    );
  }

  try {
    const signup = await upsertExperienceSignup(parsed.data);
    return respond({ ok: true, signup }, 200, rateLimit.headers);
  } catch (error) {
    if (error instanceof ExperienceSignupError) {
      return respond({ ok: false, error: error.message }, error.status, rateLimit.headers);
    }
    return respond({ ok: false, error: "Sign-ups are temporarily unavailable." }, 503, rateLimit.headers);
  }
}

function respond(body: unknown, status: number, rateLimitHeaders: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...publicApiCorsHeaders(allowedMethods),
      ...rateLimitHeaders
    }
  });
}

function tooManyRequests(rateLimit: ReturnType<typeof checkRateLimit>) {
  return NextResponse.json(
    { ok: false, error: "Too many sign-up attempts. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Cache-Control": "no-store",
        ...publicApiCorsHeaders(allowedMethods),
        ...rateLimit.headers,
        "Retry-After": String(rateLimit.retryAfterSeconds)
      }
    }
  );
}
