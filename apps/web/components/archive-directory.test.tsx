import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { awards2025Directory, summit2025Directory, summit2025Leadership } from "../lib/content";
import { PeopleDirectory } from "./people-directory";
import { YearTabs } from "./year-tabs";

const escaped = (value: string) => value.replaceAll("&", "&amp;").replaceAll("'", "&#x27;").replaceAll('"', "&quot;");

describe("archive directory presentation", () => {
  it("preserves every supplied archive name, affiliation, and section", () => {
    for (const groups of [summit2025Directory, awards2025Directory, summit2025Leadership]) {
      const html = renderToStaticMarkup(<PeopleDirectory groups={groups} />);
      for (const group of groups) {
        expect(html).toContain(escaped(group.title));
        for (const person of group.people) {
          expect(html).toContain(`<h3>${escaped(person.name)}</h3>`);
          expect(html).toContain(`<p>${escaped(person.role)}</p>`);
        }
      }
      expect(html).not.toContain("2026");
      expect(html).not.toContain("href=");
    }
  });

  it("keeps empty archive sections explicit and connects every section to its heading", () => {
    const html = renderToStaticMarkup(<PeopleDirectory groups={[{ title: "Experts", people: [] }, { title: "Experts", people: [] }]} tone="dark" />);
    expect(html.match(/No entries in this archived section\./g)).toHaveLength(2);
    const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(labels).size).toBe(2);
    for (const label of labels) expect(html).toContain(`id="${label}"`);
    expect(html).toContain("archive-directory-dark");
  });
});

describe("edition navigation", () => {
  it("uses canonical URLs and marks exactly one active edition for both events", () => {
    for (const section of ["summit", "awards"] as const) {
      for (const activeYear of [2025, 2026] as const) {
        const html = renderToStaticMarkup(<YearTabs section={section} activeYear={activeYear} />);
        const archive = section === "summit" ? "/2025" : "/awards/2025";
        const current = section === "summit" ? "/" : "/awards/2026";
        expect(html).toContain(`href="${archive}"`);
        expect(html).toContain(`href="${current}"`);
        expect(html.match(/aria-current="page"/g)).toHaveLength(1);
        const activeLink = html.match(/<a\b[^>]*aria-current="page"[^>]*>/)?.[0];
        expect(activeLink).toContain(`href="${activeYear === 2025 ? archive : current}"`);
        expect(html).not.toContain('href="/summit');
      }
    }
  });
});
