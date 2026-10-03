import { NextResponse } from "next/server";
import { getReadOnlyLiveOpsState } from "../../../lib/live-ops-repository";
import { publicApiCorsHeaders, publicApiOptions } from "../../../lib/public-api-cors";
import { projectPublicSnapshot } from "../../../lib/public-snapshot";

const allowedMethods = ["GET"] as const;

export function OPTIONS() {
  return publicApiOptions(allowedMethods);
}

export async function GET() {
  const state = await getReadOnlyLiveOpsState();
  const snapshot = projectPublicSnapshot({
    ...state.publishedSnapshot,
    serverTimeUtc: new Date().toISOString()
  });

  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "no-store",
      ...publicApiCorsHeaders(allowedMethods),
      ...(state.adapterWarning ? { "x-not-alone-adapter-warning": "Published backend unavailable; serving a local public snapshot." } : {})
    }
  });
}
