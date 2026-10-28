import { createHash } from "node:crypto";

const FAQ_CACHE_MS = 5 * 60_000;
const FAQ_TIMEOUT_MS = 10_000;
const FAQ_MAX_BYTES = 60 * 1024;

export type AskAiFaq = { text: string; revision: string };

let cached: (AskAiFaq & { url: string; expiresAt: number }) | null = null;
let pending: { url: string; result: Promise<AskAiFaq | null> } | null = null;

function validFaqUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "docs.google.com" && !url.username && !url.password && !url.port
      && /^\/document\/d\/[^/]+\/export$/.test(url.pathname)
      && url.searchParams.get("format") === "txt";
  } catch {
    return false;
  }
}

async function boundedText(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("FAQ was empty");
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return (text + decoder.decode()).replace(/^\uFEFF/, "").trim();
      const remaining = FAQ_MAX_BYTES - bytes;
      text += decoder.decode(value.subarray(0, remaining), { stream: true });
      bytes += value.byteLength;
      if (bytes > FAQ_MAX_BYTES) {
        console.warn(`Ask AI FAQ exceeded ${FAQ_MAX_BYTES} bytes and was truncated.`);
        // Do not flush an incomplete UTF-8 character at the truncation boundary.
        return text.replace(/^\uFEFF/, "").trim();
      }
    }
  } finally {
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function getAskAiFaq(fetchImpl: typeof fetch = fetch, now = Date.now()): Promise<AskAiFaq | null> {
  const url = process.env.ASK_AI_FAQ_URL?.trim() ?? "";
  if (!validFaqUrl(url)) return null;
  if (cached?.url !== url) cached = null;
  if (cached && cached.expiresAt > now) return { text: cached.text, revision: cached.revision };
  if (pending?.url === url) return pending.result;
  const result = (async () => { try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(FAQ_TIMEOUT_MS), cache: "no-store", headers: { Accept: "text/plain" } });
    if (!response.ok) throw new Error(`FAQ returned ${response.status}`);
    if (response.headers.get("content-type")?.includes("text/html")) throw new Error("FAQ export requires public plain text");
    const text = await boundedText(response);
    if (!text) throw new Error("FAQ was empty");
    const revision = response.headers.get("etag")?.trim() || createHash("sha256").update(text).digest("hex");
    cached = { text, revision, url, expiresAt: now + FAQ_CACHE_MS };
    return { text, revision };
  } catch {
    return cached?.url === url ? { text: cached.text, revision: cached.revision } : null;
  } })();
  pending = { url, result };
  try { return await result; } finally { if (pending?.result === result) pending = null; }
}

export function crisisResourcesFromFaq(text: string): string | null {
  const lines = text.split(/\r?\n/);
  const heading = lines.findIndex(line => /^\s*(?:#{1,6}\s*)?(?:\*\*)?Crisis resources(?:\*\*)?:?\s*$/i.test(line));
  if (heading < 0) return null;
  const body = lines.slice(heading + 1);
  const end = body.findIndex(line => /^\s*#{1,6}\s+\S/.test(line) || /^(?:Contact and support|Before you arrive|Conduct and community|Wellness and accessibility|Hotel, arrival, and parking|Daily overview and attire|The event)\s*$/i.test(line));
  return (end < 0 ? body : body.slice(0, end)).join(text.includes("\r\n") ? "\r\n" : "\n").trim() || null;
}

export function resetAskAiFaqCache() {
  cached = null;
  pending = null;
}
