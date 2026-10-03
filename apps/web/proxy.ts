import { NextResponse, type NextRequest } from "next/server";
import { publicSecurityHeaders } from "./lib/security-headers";

const compatibilityRoutes: Record<string, string> = {
  "/summit": "/",
  "/summit/2025": "/2025",
  "/summit/schedule": "/schedule",
  "/awards": "/awards/2026"
};

function withSecurityHeaders(response: NextResponse) {
  for (const { key, value } of publicSecurityHeaders) response.headers.set(key, value);
  return response;
}

export function proxy(request: NextRequest) {
  try {
    decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return withSecurityHeaders(new NextResponse("This profile address is not valid. Return to the event directory.", {
      status: 400,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" }
    }));
  }
  const destination = compatibilityRoutes[request.nextUrl.pathname];
  if (destination) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return withSecurityHeaders(NextResponse.redirect(url, 308));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/directory/:path*", "/summit", "/summit/2025", "/summit/schedule", "/awards"] };
