import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { chromium, expect } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const base = process.env.RESTORATION_TEST_URL ?? "http://127.0.0.1:3017";
const source = JSON.parse(readFileSync(resolve(root, "apps/web/lib/original-sites.json"), "utf8"));
const output = resolve(root, "work/acceptance/restoration");
mkdirSync(output, { recursive: true });
const server = process.env.RESTORATION_TEST_URL ? null : spawn(process.execPath, [resolve(root, "apps/web/node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3017"], { cwd: resolve(root, "apps/web"), stdio: "ignore" });
const checks = [];
let passed = false;
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (await fetch(base).then(r => r.ok).catch(() => false)) { ready = true; break; }
    await new Promise(r => setTimeout(r, 500));
  }
  assert(ready, "Original-site test server did not become ready");
  browser = await chromium.launch();
  for (const width of [320, 375, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width < 600 ? 800 : 900 } });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["/2025", "/awards/2025", "/", "/awards/2026"]) {
      assert((await page.goto(base + route, { waitUntil: "networkidle" }))?.ok());
      await page.evaluate(() => document.fonts.ready);
      const main = await page.locator("main").innerText();
      if (route.includes("2025")) {
        const kind = route.includes("awards") ? "awards" : "summit";
        for (const person of source[kind].sections.flatMap(s => s.people)) {
          assert(main.includes(person.name), `Missing ${person.name} from ${route}`);
          assert(main.includes(person.role), `Missing historical affiliation for ${person.name} from ${route}`);
        }
        const producers = await page.locator("#producers").innerText();
        for (const block of source.summit.sections[13].blocks.filter(block => block.tag === "h4")) {
          assert(producers.includes(block.text), `Missing historical producer ${block.text} from ${route}`);
        }
        if (kind === "awards") {
          for (const block of source.awards.sections[11].blocks.slice(1)) assert(main.includes(block.text), `Missing award category or description: ${block.text}`);
          await expect(page.getByRole("heading", { name: "Host", exact: true })).toBeVisible();
          await expect(page.getByText("Registration for this past event is closed.", { exact: true })).toBeVisible();
        }
        await expect(page.getByRole("link", { name: "Awards RSVP", exact: true })).toHaveCount(0);
      } else {
        assert(!main.includes("Villa Bibbiani"), "Historical sponsor leaked into 2026");
        assert(!main.includes("Dr. George Rapier III"), "Historical producer leaked into 2026");
        for (const name of ["Steven Cohen", "Alexandra Cohen"]) await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);
        if (route.includes("awards")) {
          await expect(page.locator('#directory input[type="search"]')).toHaveCount(0);
          const separated = await page.evaluate(() => {
            const directory = document.getElementById("directory");
            const producers = document.getElementById("producers");
            if (!producers) return true;
            return Boolean(directory && !directory.contains(producers) && (directory.compareDocumentPosition(producers) & Node.DOCUMENT_POSITION_FOLLOWING));
          });
          assert(separated, "Current Awards producer credits must remain separate and after the guest directory");
        }
      }
      const missingFragments = await page.evaluate(() => [...document.querySelectorAll('a[href]')].flatMap(anchor => {
        const url = new URL(anchor.getAttribute("href"), location.href);
        if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return [];
        const id = decodeURIComponent(url.hash.slice(1));
        return document.getElementById(id) ? [] : [url.hash];
      }));
      assert.deepEqual(missingFragments, [], `Missing same-page fragment targets on ${route}`);
      const filename = route === "/" ? "summit-2026" : route.replaceAll("/", "-");
      await page.screenshot({ path: `${output}/${filename}-${width}-top.png` });
      for (const image of await page.locator("main img").all()) {
        await image.scrollIntoViewIfNeeded();
        const src = await image.getAttribute("src");
        await image.evaluate(img => img.decode()).catch(error => { throw new Error(`Image failed on ${route}: ${src}`, { cause: error }); });
      }
      const geometry = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth, duplicateIds: [...document.querySelectorAll('[id]')].map(el => el.id).filter((id, index, ids) => ids.indexOf(id) !== index) }));
      assert(geometry.scroll <= geometry.width + 1, `${route} overflow at ${width}`);
      assert.deepEqual(geometry.duplicateIds, []);
      if (route.includes("2025")) {
        await page.getByRole("heading", { name: "Founders", exact: true }).scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${output}/${filename}-${width}-portraits.png` });
      }
      assert.deepEqual(errors, []);
      checks.push(`${route}: ${route.includes("2025") ? "historical names, affiliations and credits preserved" : "historical-only names excluded"}; rendered images load, local fragments resolve, no overflow or runtime errors at ${width}px`);
      console.log(`PASS ${checks.at(-1)}`);
    }
    await page.close();
  }
  passed = true;
} finally {
  await browser?.close();
  server?.kill("SIGTERM");
  writeFileSync(`${output}/results.json`, JSON.stringify({ at: new Date().toISOString(), status: passed ? "passed" : "failed", checks }, null, 2));
}
