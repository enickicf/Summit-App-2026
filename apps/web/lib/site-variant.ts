// Two builds of the same site (owner request, Sept 21, 2026):
// - "new" (default): the redesigned Summit site with the NAS web meeting changes.
// - "classic": the Summit home reverted to the live ICF Summit page (inspiringchildren.org/summit)
//   format and content, keeping only this site's Schedule and Ask AI additions.
// Set NEXT_PUBLIC_SITE_VARIANT=classic at build/dev time to produce the classic version.
export type SiteVariant = "new" | "classic";
export const siteVariant: SiteVariant = process.env.NEXT_PUBLIC_SITE_VARIANT === "classic" ? "classic" : "new";
