import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const root = resolve(import.meta.dirname, "..");
const base = "http://127.0.0.1:3015";
const server = spawn(process.execPath, [resolve(root, "apps/web/node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3015"], {
  cwd: resolve(root, "apps/web"), env: { ...process.env, ENABLE_AI: "false" }, stdio: "ignore"
});
const checks = [];
let passed = false;
let browser;
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (await fetch(base).then(r => r.ok).catch(() => false)) { ready = true; break; }
    await new Promise(r => setTimeout(r, 500));
  }
  assert(ready, "Website test server did not start");
  browser = await chromium.launch({ headless: true });
  const routes = ["/", "/summit", "/2025", "/summit/2025", "/awards", "/awards/2025", "/awards/2026", "/schedule", "/summit/live", "/map", "/ask-ai", "/contact", "/donate"];
  const links = new Map();
  for (const viewport of [{ width: 375, height: 667 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: "domcontentloaded" });
      assert(response?.ok(), `${route} failed`);
      await page.locator("main").first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert(dimensions.scroll <= dimensions.width + 1, `${route} overflows at ${viewport.width}`);
      assert((await page.locator("main").innerText()).trim().length > 20, `${route} empty`);
      for (const href of await page.locator("a[href]").evaluateAll(nodes => nodes.map(n => n.getAttribute("href")))) {
        if (!href) continue;
        const url = new URL(href, page.url());
        if (url.origin !== new URL(base).origin) continue;
        const path = `${url.pathname}${url.search}`;
        if (!links.has(path)) links.set(path, new Set());
        if (url.hash) links.get(path).add(decodeURIComponent(url.hash.slice(1)));
      }
      assert.equal(await page.locator('form[action="/api/messages"], form[action="/api/tickets"]').count(), 0);
      assert.equal(await page.locator('.aiBubble, .messageForm, .ticketSection').count(), 0, `${route} contains a retired collaborator widget`);
      checks.push(`${route} renders without overflow at ${viewport.width}px`);
    }
    await page.goto(base + "/contact", { waitUntil: "domcontentloaded" });
    assert.equal(await page.getByRole("link", { name: "Contact ICF", exact: true }).getAttribute("href"), "https://www.inspiringchildren.org/contact");
    if (viewport.width === 375) {
      const menu = page.locator('button[aria-controls="main-navigation"]');
      await expect(menu).toHaveAccessibleName("Open navigation menu");
      await menu.click();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await expect(menu).toHaveAccessibleName("Close navigation menu");
      await page.keyboard.press("Escape");
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toBeFocused();
      await menu.click();
      await page.screenshot({ path: resolve(root, "work/acceptance/website-menu.png") });
      await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Schedule 2026", exact: true }).click();
      await page.waitForURL("**/schedule", { waitUntil: "domcontentloaded" });
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toHaveAccessibleName("Open navigation menu");
      checks.push("Mobile navigation dismisses with Escape, restores focus, and closes after navigation");
    }
    await page.screenshot({ path: resolve(root, `work/acceptance/website-${viewport.width}.png`) });
    assert.deepEqual(errors, [], "Browser runtime errors");
    await context.close();
  }
  const linkPage = await browser.newPage();
  let fragments = 0;
  for (const [path, ids] of links) {
    const response = await fetch(base + path);
    assert(response.ok, `Broken internal link ${path}: ${response.status}`);
    if (ids.size === 0) continue;
    assert((await linkPage.goto(base + path, { waitUntil: "domcontentloaded" }))?.ok(), `Fragment destination failed: ${path}`);
    await linkPage.locator("main").waitFor();
    const invalid = await linkPage.evaluate(ids => ids.filter(id => {
      const targets = [...document.querySelectorAll("[id]")].filter(element => element.id === id);
      return targets.length !== 1;
    }), [...ids]);
    assert.deepEqual(invalid, [], `Missing or duplicate fragment targets on ${path}`);
    fragments += ids.size;
  }
  await linkPage.close();
  checks.push(`${links.size} internal destinations and ${fragments} exact fragment targets resolve; external destinations not checked`);
  for (const path of ["/api/messages", "/api/tickets"]) {
    const response = await fetch(base + path, { method: "POST", body: "{}" });
    assert.equal(response.status, 410, `${path} must remain retired`);
  }
  checks.push("Retired messaging and ticket endpoints cannot submit data");
  const manifest = await fetch(base + "/manifest.webmanifest").then(r => r.json());
  assert.equal(manifest.name, "Not Alone Summit");
  assert.equal(manifest.display, "browser", "The public website must not masquerade as the native attendee app");
  checks.push("Manifest uses event identity rather than an unconnected domain");
  passed = true;
  console.log(checks.map(check => `PASS ${check}`).join("\n"));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  mkdirSync(resolve(root, "work/acceptance"), { recursive: true });
  writeFileSync(resolve(root, "work/acceptance/website-results.json"), JSON.stringify({ at: new Date().toISOString(), status: passed ? "passed" : "failed", checks }, null, 2));
}
