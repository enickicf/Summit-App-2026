import { createHash } from "node:crypto";

const FAQ_CACHE_MS = 5 * 60_000;
const FAQ_TIMEOUT_MS = 10_000;
const FAQ_MAX_BYTES = 60 * 1024;

export type AskAiFaq = { text: string; revision: string };

let cached: (AskAiFaq & { expiresAt: number }) | null = null;

function validFaqUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "docs.google.com"
      && /^\/document\/d\/[^/]+\/export$/.test(url.pathname)
      && url.searchParams.get("format") === "txt";
  } catch {
    return false;
  }
}

function boundedText(buffer: Uint8Array): string {
  if (buffer.byteLength > FAQ_MAX_BYTES) console.warn(`Ask AI FAQ exceeded ${FAQ_MAX_BYTES} bytes and was truncated.`);
  return new TextDecoder().decode(buffer.slice(0, FAQ_MAX_BYTES)).replace(/^\uFEFF/, "").trim();
}

export async function getAskAiFaq(fetchImpl: typeof fetch = fetch, now = Date.now()): Promise<AskAiFaq | null> {
  if (cached && cached.expiresAt > now) return { text: cached.text, revision: cached.revision };
  const url = process.env.ASK_AI_FAQ_URL?.trim() ?? "";
  if (!validFaqUrl(url)) return cached ? { text: cached.text, revision: cached.revision } : null;
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(FAQ_TIMEOUT_MS), headers: { Accept: "text/plain" } });
    if (!response.ok) throw new Error(`FAQ returned ${response.status}`);
    const text = boundedText(new Uint8Array(await response.arrayBuffer()));
    if (!text) throw new Error("FAQ was empty");
    const revision = response.headers.get("etag")?.trim() || createHash("sha256").update(text).digest("hex");
    cached = { text, revision, expiresAt: now + FAQ_CACHE_MS };
    return { text, revision };
  } catch {
    return cached ? { text: cached.text, revision: cached.revision } : null;
  }
}

export function crisisResourcesFromFaq(text: string): string | null {
  const match = /(?:^|\n)Crisis resources\s*\n([\s\S]*?)(?=\n[^\n]+\n(?:[^\n]+\n)?|$)/i.exec(text);
  return match?.[1]?.trim() || null;
}

export function resetAskAiFaqCache() {
  cached = null;
}
