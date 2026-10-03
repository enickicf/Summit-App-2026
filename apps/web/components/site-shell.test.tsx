import { existsSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Children, isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePathname, useSearchParams } from "next/navigation";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { archiveProfile } from "../app/directory/[slug]/archive-profile";
import source from "../lib/original-sites.json";
import { OriginalSummitPage } from "./original-event-page";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

vi.mock("next/navigation", () => ({ usePathname: vi.fn(() => "/"), useSearchParams: vi.fn(() => new URLSearchParams()), useRouter: () => ({ refresh: vi.fn() }) }));

function headerAt(pathname: string) {
  vi.mocked(usePathname).mockReturnValue(new URL(pathname, "https://example.test").pathname);
  vi.mocked(useSearchParams).mockReturnValue(new URL(pathname, "https://example.test").searchParams as ReturnType<typeof useSearchParams>);
  return renderToStaticMarkup(<SiteHeader />);
}

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (isValidElement<{ children?: ReactNode }>(node)) return textContent(node.props.children);
  return Children.toArray(node).map(textContent).join("");
}

describe("shared site navigation", () => {
  beforeEach(() => { vi.mocked(usePathname).mockReturnValue("/"); vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>); });

  it.each(["/2025", "/summit/2025", "/directory/2025-jewel", "/directory/2025-sara-alajbegovic"])("preserves the archive context on %s", pathname => {
    const html = headerAt(pathname);
    expect(html).toContain('aria-label="Summit navigation"');
    // The 2025 context links to the untouched 2025 partners page.
    expect(html).toContain('href="/partners/2025"');
    expect(html).toContain('href="/venue"');
    expect(html).toMatch(/href="\/schedule"[^>]*>Schedule<\/a>/);
    expect(html).not.toContain('href="/#');
  });

  it.each(["/", "/directory/person-2025-example", "/directory/2025-jewel/extra"])("uses current context without substring year matching on %s", pathname => {
    const html = headerAt(pathname);
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/partners"');
    expect(html).toContain('href="/venue"');
    expect(html).not.toContain('href="/2025#');
  });

  it.each(["summit", "awards"] as const)("keeps the header aligned with the %s archive profile format", context => {
    const person = archiveProfile("2025-paul-dalio", context)!;
    expect(person.year).toBe(2025);
    const html = headerAt(`/directory/${encodeURIComponent(person.slug)}${context === "awards" ? "?from=awards" : ""}`);
    if (context === "summit") expect(html).toContain('href="/partners/2025"');
    else {
      expect(html.match(/<a[^>]*data-active="true"[^>]*>/)?.[0]).toContain('href="/awards/2025"');
    }
    if (context === "summit") expect(html).not.toContain('href="/awards/2026"');
  });

  it("keeps current Awards profile links in 2026 without duplicating navigation", () => {
    const guest = event2026Snapshot.speakers.find(person => person.name === "Mike Tyson")!;
    const html = headerAt(`/directory/${encodeURIComponent(guest.id)}?from=awards`);
    expect(html.match(/<a[^>]*data-active="true"[^>]*>/)?.[0]).toContain('href="/awards/2026"');
    expect(html).not.toContain('href="/schedule"');
    expect(html).not.toContain('href="/map"');
    expect(html).toContain('href="/awards/2025"');
    expect(html.match(/id="main-navigation"/g)).toHaveLength(1);
    expect(html).not.toContain('aria-current="page"');
  });

  it.each(["/", "/2025", "/schedule", "/awards/2025", "/awards/2026"])("announces exactly one current page on %s", pathname => {
    const html = headerAt(pathname);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toContain(`href="${pathname}"`);
  });

  it("has one centered Summit navigation with the heart logo and an Awards link, without a separate disclosure", () => {
    const html = headerAt("/");
    expect(html).not.toContain('<button');
    expect(html.match(/id="main-navigation"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Summit navigation"');
    // Owner (Sept 23): Summit (2026 / 2025), Schedule, Directory (Who's Coming / Partners / Philanthropists), Venue, Awards; Donate is a sticker at the far right; Ask AI is the floating widget.
    expect([...html.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1])).toEqual(["Summit", "2026", "2025", "Schedule", "Directory", "Who’s Coming", "Partners", "Philanthropists", "Venue", "Awards"]);
    expect(html).toMatch(/<a class="[^"]*donateButton[^"]*" href="https:\/\/www\.inspiringchildren\.org\/donate"><svg[\s\S]*?<\/svg>Donate<\/a>/);
    expect(html).not.toContain('href="/ask-ai"');
    expect(html).toMatch(/href="\/awards\/2026"[^>]*>Awards<\/a>/);
    // Owner (Sept 21): no logo bar; the hero carries the logo.
    expect(html).not.toContain("NotAloneSummit_Logo_Black.png");
    expect(html).not.toContain('role="menu"');
  });

  it.each([2025, 2026])("keeps Awards %s branding and navigation separate from Summit event tools", year => {
    const html = headerAt(`/awards/${year}`);
    const footer = renderToStaticMarkup(<SiteFooter />);
    expect(html).not.toContain("NotAloneAwards_Logo_White.png");
    expect([...html.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1])).toEqual(["Awards", "2026", "2025", "Tickets", "Nominate", "Summit"]); // Owner (Sept 23)
    expect(html.match(/<a[^>]*aria-current="page"[^>]*>/)?.[0]).toContain(`href="/awards/${year}"`);
    for (const href of ["/schedule", "/map", "/ask-ai", "/summit/live"]) expect(html + footer).not.toContain(`href="${href}"`);
    expect(html).not.toContain("NotAloneChallenge");
    expect(footer).toContain("Steven &amp; Alexandra Cohen Foundation");
  });

  it.each([2025, 2026])("uses one four-link Awards %s row below the brand with no separate menu", year => {
    const html = headerAt(`/awards/${year}`);
    const nav = html.match(/<nav[^>]*aria-label="Awards navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    // Owner (Sept 23): Awards (2026 / 2025), Tickets (RSVP form), Nominate (ICF nominations), Summit; Donate is a sticker at the far right.
    expect([...nav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1])).toEqual(["Awards", "2026", "2025", "Tickets", "Nominate", "Summit"]);
    expect([...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1])).toEqual([
      "/awards/2026", "/awards/2026", "/awards/2025", "https://notaloneawards.org/rsvp", "https://notaloneawards.org/rsvp/nominate", year === 2025 ? "/2025" : "/", "https://www.inspiringchildren.org/donate"
    ]);
    expect(nav).toMatch(/<a class="[^"]*donateButton[^"]*" href="https:\/\/www\.inspiringchildren\.org\/donate"><svg[\s\S]*?<\/svg>Donate<\/a>/);
    expect(nav).not.toContain('>RSVP</a>');
    expect(html.match(/<nav\b/g)).toHaveLength(1);
    expect(html.indexOf("</header>")).toBeLessThan(html.indexOf("<nav"));
    expect(html).not.toMatch(/<button|aria-expanded|aria-controls|2025 Winners|>People</);
  });

  it("has unique navigation targets and no dead local route or Summit section links", () => {
    const footer = renderToStaticMarkup(<SiteFooter />);
    for (const year of [2025, 2026] as const) {
      const summit = renderToStaticMarkup(<OriginalSummitPage year={year} />);
      const header = headerAt(year === 2025 ? "/2025" : "/");
      const nav = header.match(/<nav[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
      const navTargets = [...nav.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
      // Owner (Sept 22): the "2026" item and its "2026 Summit" list entry both point home.
      // Owner (Sept 23): "Summit" and its "2026" entry both point home; "Directory" and its "Partners" entry both point to the partners page.
      expect(new Set(navTargets).size).toBe(9);
      expect(navTargets).toHaveLength(11);
      expect(navTargets).toContain(`/awards/${year}`);
      for (const [, href] of `${header}${footer}`.matchAll(/<a\b[^>]*href="(\/[^\"]*)"/g)) {
        const url = new URL(href!, "https://example.test");
        const page = url.pathname === "/" ? "../app/page.tsx" : `../app${url.pathname}/page.tsx`;
        expect(existsSync(new URL(page, import.meta.url)), `Missing page for ${href}`).toBe(true);
        // Sept 22 meeting: Partners lists Brands / Philanthropists as anchors on the Partners page itself.
        const anchorSource = url.pathname === "/" || url.pathname === "/2025" ? summit : readFileSync(new URL(page, import.meta.url), "utf8");
        if (url.hash) expect(anchorSource, `Missing anchor for ${href}`).toContain(`id="${url.hash.slice(1)}"`);
      }
    }
  });

  it("preserves the full source footer with contact, socials and the Inspiring Children socials page", () => {
    const html = renderToStaticMarkup(<SiteFooter />);
    const copy = textContent(SiteFooter());
    for (const index of [0, 1, 2, 4, 5]) expect(copy).toContain(source.summit.footer[index]!);
    expect(html).toContain('href="tel:988"');
    expect(html).toContain('href="https://www.inspiringchildren.org/disclaimer"');
    expect(html).toContain('href="/contact">Contact Inspiring Children Foundation</a>');
    expect(html).toContain('href="/inspiring-children-socials">Inspiring Children Socials</a>');
    for (const label of ["Summit 2026", "Summit 2025", "Awards 2026", "Awards 2025", "2026 event schedule"]) expect(html).not.toContain(`>${label}</a>`);
    expect(html.match(/<svg\b/g)).toHaveLength(6); // five socials + the Donate heart (owner, Sept 21)
    expect(html).toContain('aria-label="Footer navigation"');
    expect(html).toContain('aria-labelledby="not-alone-socials"');
    expect(html).toContain('id="not-alone-socials">Not Alone Socials</h2>');
    expect(html.match(/<footer/g)).toHaveLength(1);
    vi.mocked(usePathname).mockReturnValue("/inspiring-children-socials");
    const onSocialsPage = renderToStaticMarkup(<SiteFooter />);
    expect(onSocialsPage).not.toContain('href="/inspiring-children-socials"');
    expect(onSocialsPage).toContain('href="/contact">Contact Inspiring Children Foundation</a>');
  });

  it.each([
    { index: 2, suffix: "Click here to learn more.", href: "https://www.inspiringchildren.org/home", label: "Click here to learn more about Inspiring Children Foundation", redundant: "About ICF" },
    { index: 4, suffix: "Click here for our full disclaimer.", href: "https://www.inspiringchildren.org/disclaimer", label: "Click here for our full disclaimer from Inspiring Children Foundation", redundant: "Full disclaimer" }
  ])("links the exact original suffix in footer paragraph $index without duplicate instructions", ({ index, suffix, href, label, redundant }) => {
    const html = renderToStaticMarkup(<SiteFooter />);
    expect(source.summit.footer[index]!.endsWith(suffix)).toBe(true);
    expect(html).toContain(`<a href="${href}" aria-label="${label}">${suffix}</a>`);
    expect(html.split(`href="${href}"`)).toHaveLength(2);
    expect(html.split(suffix)).toHaveLength(2);
    expect(html).not.toContain(`>${redundant}</a>`);
    expect(html).toContain('<a href="tel:988">Call 988</a>');
  });
});
