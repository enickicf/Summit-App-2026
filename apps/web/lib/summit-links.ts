// Owner (Sept 23, 2026): on notaloneawards.org the site root is a forced redirect to /awards/2026
// (apps/web/netlify.toml), so a link to "/" from an Awards page loops straight back to the Awards
// page. Summit-bound links rendered on the Awards domain therefore point at the Summit domain itself.
export const summitOrigin = "https://notalonesummit.org";

export function isAwardsHost(host: string | null | undefined): boolean {
  const name = ((host ?? "").split(",")[0] ?? "").trim().split(":")[0]?.toLowerCase() ?? "";
  return name === "notaloneawards.org" || name.endsWith(".notaloneawards.org");
}

export function summitHref(path: string, host: string | null | undefined): string {
  return isAwardsHost(host) ? `${summitOrigin}${path}` : path;
}

// Client snapshot for the SummitLink component (kept here so it can be unit-tested with a stubbed window).
export function awardsHostSnapshot(): boolean {
  return typeof window !== "undefined" && isAwardsHost(window.location.hostname);
}
