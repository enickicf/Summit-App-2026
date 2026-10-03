import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { describe, expect, it } from "vitest";

type Declaration = { prop: string; value: string; important?: boolean };
type Rule = { selector: string; selectors: string[]; parent: { type: string }; walkDecls: (visit: (declaration: Declaration) => void) => void };
type Container = { walkRules: (visit: (rule: Rule) => void) => void; walkDecls: (visit: (declaration: Declaration) => void) => void };
type AtRule = Container & { name: string; params: string };
type Stylesheet = Container & { walkAtRules: (visit: (rule: AtRule) => void) => void };

// Exercise the same CSS parser already installed with Next; no extra dependency.
const require = createRequire(import.meta.url);
const { parse } = createRequire(require.resolve("next/package.json"))("postcss") as { parse: (source: string) => Stylesheet };
const app = fileURLToPath(new URL("./", import.meta.url));
const read = (file: string) => readFileSync(join(app, file), "utf8");
const files = ["styles.css", "enhancements.css", "restored-shell.css"];
const sheets = files.map(file => parse(read(file)));
const rules: Rule[] = [];
for (const sheet of sheets) sheet.walkRules(rule => { rules.push(rule); });
const declarations = (container: Pick<Container, "walkDecls">) => {
  const values: Record<string, string> = {};
  container.walkDecls(({ prop, value }) => { values[prop] = value; });
  return values;
};
const baseRule = (selector: string) => rules.find(rule => rule.selector === selector && rule.parent.type === "root")!;

const retiredClasses = [
  "aiBubble", "aiLauncher", "aiPanel", "aiPanelHeader", "announcementPanel", "appIcon", "archiveDropdown", "archiveMenu",
  "archiveNotice", "askPagePanel", "awardGrid", "awardInitials", "awardPeopleGrid", "awardsBrandLogo", "awardsClosing",
  "awardsContent", "awardsHero", "awardsMission", "awardsPage", "awardsSection", "cardArrow", "categoryAwardGrid", "checkoutNote",
  "companion-actions", "companion-intro", "companion-theme", "connectPanel", "consent", "day-tabs", "disclaimer",
  "donationHeading", "donationSlider", "empty-state", "event-facts", "featureStrip", "fieldRow", "footerBrand", "formStatus",
  "hero", "heroActions", "heroArt", "heroContent", "heroCopy", "hostFeature", "installCard", "installSection", "jewelQuote", "lead",
  "live-board", "live-dot", "mapPlaceholder", "messageForm", "narrow", "next-item", "next-panel", "noSolicitation", "notice",
  "notice-stack", "notice-urgent", "noticeCard", "now-panel", "pageIntro", "panel-label", "phase-after", "phase-badge", "phase-live",
  "quoteCredit", "recapIntro", "recapSection", "schedule-browser", "schedule-pending", "schedulePage", "secondaryButton",
  "section-shell", "session-location", "session-row", "session-row-topline", "session-stack", "sliderLabels", "status-canceled",
  "status-completed", "status-delayed", "status-moved", "ticketCard", "ticketPitch", "ticketSection", "time-group", "time-groups",
  "videoFrame", "yearTabs"
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? sourceFiles(path) : path.endsWith(".tsx") && !path.endsWith(".test.tsx") ? [path] : [];
  });
}

function literalClasses(path: string) {
  const source = ts.createSourceFile(path, readFileSync(path, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const classes = new Set<string>();
  const collect = (node: ts.Node) => {
    if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      node.text.split(/\s+/).filter(Boolean).forEach(value => classes.add(value));
    }
    ts.forEachChild(node, collect);
  };
  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && node.name.getText(source) === "className" && node.initializer) collect(node.initializer);
    else ts.forEachChild(node, visit);
  };
  visit(source);
  return classes;
}

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(value => Number.parseInt(value, 16) / 255)
    .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
}

describe("global CSS audit", () => {
  it("retains the existing theme tokens in one root declaration", () => {
    expect(rules.filter(rule => rule.selector === ":root")).toHaveLength(1);
    expect(declarations(baseRule(":root"))).toEqual({
      "--navy": "#8177c9", "--navy2": "#aa8fd8", "--cream": "#fff9f1", "--paper": "#fffdfb", "--gold": "#f3bf8a",
      "--coral": "#e99aba", "--sage": "#c9b7ea", "--ink": "#3b2f52", "--muted": "#746985", "--line": "rgba(93,70,130,.16)"
    });
  });

  it("preserves the complete historical archive stylesheet byte-for-byte apart from surrounding whitespace", () => {
    const archive = read("enhancements.css").split("/* Complete historical archive */")[1]!.trim();
    expect(createHash("sha256").update(archive).digest("hex")).toBe("ecae6fe025cb5f69f592411050605bc2000187e15e408bf0d1d0cacd1ffe2b1a");
  });

  it("has no remaining global retired-widget rules or JSX consumers of their class names", () => {
    const cssClasses = new Set(rules.flatMap(rule => [...rule.selector.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(match => match[1])));
    const used = new Set([...sourceFiles(app), ...sourceFiles(join(app, "../components"))].flatMap(path => [...literalClasses(path)]));
    for (const name of retiredClasses) {
      expect(cssClasses.has(name), `${name} still has a global rule`).toBe(false);
      expect(used.has(name), `${name} still has a JSX consumer`).toBe(false);
    }
  });

  it("keeps typography independent of viewport units on active global surfaces", () => {
    for (const file of ["styles.css", "restored-shell.css"]) {
      parse(read(file)).walkDecls(({ prop, value }) => {
        if (prop === "font-size") expect(value).not.toMatch(/[0-9.](?:s|l|d)?v(?:w|h|min|max)\b/i);
        if (prop === "letter-spacing") expect(value).toBe("0");
      });
    }
  });

  it("gives primary-button text at least 4.5:1 contrast in normal and hover states", () => {
    for (const selector of [".primaryButton", ".primaryButton:hover"]) {
      const values = declarations(baseRule(selector));
      const foreground = luminance(values.color!);
      const background = luminance(values.background!);
      expect((Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
    expect(declarations(baseRule(".primaryButton:focus-visible")).outline).toBeTruthy();
  });

  it("keeps small eyebrow text above 4.5:1 on profile and shared light backgrounds", () => {
    const foreground = luminance(declarations(baseRule(".eyebrow")).color!);
    for (const background of ["#ffffff", "#fffdfb", "#fff9f1"]) {
      expect((luminance(background) + 0.05) / (foreground + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("disables smooth scrolling and nonessential CSS motion regardless of module specificity", () => {
    const reduced: AtRule[] = [];
    for (const sheet of sheets) sheet.walkAtRules(rule => {
      if (rule.name === "media" && rule.params === "(prefers-reduced-motion: reduce)") reduced.push(rule);
    });
    expect(reduced).toHaveLength(1);
    expect(declarations(reduced[0]!)).toMatchObject({
      "scroll-behavior": "auto", "animation-duration": ".01ms", "animation-iteration-count": "1",
      "transition-duration": ".01ms", "animation-delay": "0ms", "transition-delay": "0ms"
    });
    reduced[0]!.walkDecls(declaration => { expect(declaration.important).toBe(true); });
    reduced[0]!.walkRules(rule => { expect(rule.selectors).toEqual(["*", "*::before", "*::after"]); });
  });

  it("exposes the root skip link on focus without adding layout height", () => {
    expect(read("layout.tsx")).toContain('href="#main-content" className="skipLink"');
    expect(declarations(baseRule(".skipLink"))).toMatchObject({ position: "fixed", transform: "translateY(-200%)", "min-height": "44px", "z-index": "1000" });
    expect(declarations(baseRule(".skipLink:focus"))).toMatchObject({ transform: "translateY(0)", outline: "3px solid #34264c" });
  });

  it("consolidates shell geometry without overriding component modules or restoring generic footer rules", () => {
    expect(declarations(baseRule(".siteHeader"))).toMatchObject({ "min-height": "98px", padding: "10px 28px", display: "flex", position: "relative", background: "#34264c" });
    expect(declarations(baseRule(".wordmark"))).toMatchObject({ width: "100px", height: "78px", padding: "8px 0" });
    expect(declarations(baseRule(".mainNav"))).toMatchObject({ display: "flex", gap: "18px", "font-size": "14px" });
    for (const file of ["styles.css", "enhancements.css"]) {
      parse(read(file)).walkRules(rule => { expect(rule.selector).not.toMatch(/\.(?:siteHeader|wordmark|mainNav|navCta|menuButton|challengeBar)\b/); });
    }
    expect(rules.some(rule => rule.selectors.some(selector => /^footer(?:\b|\s)/.test(selector)))).toBe(false);
    expect(read("../components/site-shell.module.css")).toContain(".footer {");
  });
});
