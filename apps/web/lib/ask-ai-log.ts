import { randomUUID, timingSafeEqual } from "node:crypto";
import { appendFile, mkdir, readFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

export type AskAiLogRecord = {
  ts: string;
  question: string;
  answer: string;
  sources: Array<{ title: string; url: string }>;
  latencyMs: number;
  model: string;
  faqRevision: string | null;
};

const memoryLogs: AskAiLogRecord[] = [];
// Retain through December 31 in the event's Las Vegas timezone.
export const askAiLogRetentionEndsAt = Date.parse("2027-01-01T08:00:00.000Z");
const localFile = () => join(process.cwd(), "work", "ask-ai-log.jsonl");
const testMode = () => process.env.VITEST === "true";

async function blobStore() {
  if (process.env.NETLIFY !== "true" && !process.env.NETLIFY_BLOBS_CONTEXT) return null;
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "ask-ai-logs", consistency: "strong" });
}

export async function writeAskAiLog(record: AskAiLogRecord): Promise<void> {
  if (Date.now() >= askAiLogRetentionEndsAt) return;
  // An explicit projection prevents headers or caller metadata ever entering storage.
  const entry: AskAiLogRecord = {
    ts: record.ts, question: record.question, answer: record.answer,
    sources: record.sources.map(({ title, url }) => ({ title, url })),
    latencyMs: record.latencyMs, model: record.model, faqRevision: record.faqRevision
  };
  try {
    const store = await blobStore();
    if (store) await store.setJSON(`${entry.ts}/${randomUUID()}.json`, entry);
    else if (testMode()) memoryLogs.push(entry);
    else {
      const file = localFile();
      await mkdir(dirname(file), { recursive: true, mode: 0o700 });
      await appendFile(file, `${JSON.stringify(entry)}\n`, { mode: 0o600 });
    }
  } catch {
    // Fail independently of the attendee answer; never log a question or SDK credentials.
    console.error("Ask AI question log write failed");
  }
}

export async function listAskAiLogs(from: string, to: string): Promise<AskAiLogRecord[]> {
  if (Date.now() >= askAiLogRetentionEndsAt) return [];
  const lower = Date.parse(`${from}T00:00:00.000Z`);
  const upper = Date.parse(`${to}T23:59:59.999Z`);
  const store = await blobStore();
  let records: AskAiLogRecord[] = [];
  if (store) {
    let selected: string[] = [];
    // Blobs list ordering is not assumed. Keep the oldest 10,000 keys across ALL pages.
    for await (const page of store.list({ paginate: true })) {
      const keys = page.blobs.filter(blob => {
        const ts = Date.parse(blob.key.split("/")[0] ?? "");
        return ts >= lower && ts <= upper;
      }).map(blob => blob.key);
      selected = [...selected, ...keys].sort().slice(0, 10_000);
    }
    for (let index = 0; index < selected.length; index += 20) {
      const batch = await Promise.all(selected.slice(index, index + 20).map(key => store.get(key, { type: "json" }) as Promise<AskAiLogRecord | null>));
      records.push(...batch.filter((record): record is AskAiLogRecord => record !== null));
    }
  } else if (testMode()) records = [...memoryLogs];
  else {
    try { records = (await readFile(localFile(), "utf8")).split("\n").filter(Boolean).map(line => JSON.parse(line) as AskAiLogRecord); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  return records.filter(record => {
    const ts = Date.parse(record.ts);
    return ts >= lower && ts <= upper;
  }).sort((a, b) => a.ts.localeCompare(b.ts)).slice(0, 10_000);
}

// Scheduled independently of traffic. Only this feature's dedicated store is touched.
// A bounded batch fits Netlify's scheduled-function limit and retries next hour.
export async function purgeExpiredAskAiLogs(now = Date.now()): Promise<number> {
  if (now < askAiLogRetentionEndsAt) return 0;
  const store = await blobStore();
  if (!store) {
    memoryLogs.length = 0;
    if (!testMode()) await rm(localFile(), { force: true });
    return 0;
  }
  let deleted = 0;
  const deadline = Date.now() + 20_000;
  for await (const page of store.list({ paginate: true })) {
    for (let index = 0; index < page.blobs.length; index += 20) {
      if (Date.now() >= deadline) return deleted;
      const batch = page.blobs.slice(index, index + 20);
      await Promise.all(batch.map(blob => store.delete(blob.key)));
      deleted += batch.length;
    }
  }
  return deleted;
}

export function validAskAiLogKey(value: string | null): boolean {
  const expected = process.env.ASK_AI_LOG_KEY?.trim();
  if (!expected || !value) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function resetAskAiLogs() { memoryLogs.length = 0; }
