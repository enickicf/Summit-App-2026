import { randomUUID, timingSafeEqual } from "node:crypto";

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
const retentionEndsAt = Date.parse("2027-01-01T00:00:00.000Z");

async function blobStore() {
  if (process.env.NETLIFY !== "true" && !process.env.NETLIFY_BLOBS_CONTEXT) return null;
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "ask-ai-logs", consistency: "strong" });
}

export async function writeAskAiLog(record: AskAiLogRecord): Promise<void> {
  try {
    const store = await blobStore();
    if (Date.parse(record.ts) >= retentionEndsAt) {
      if (store) {
        for await (const page of store.list({ paginate: true })) await Promise.all(page.blobs.map(blob => store.delete(blob.key)));
      } else memoryLogs.length = 0;
      return;
    }
    if (store) await store.setJSON(`${record.ts}/${randomUUID()}.json`, record);
    else memoryLogs.push(record);
  } catch (error) {
    console.error("Ask AI question log write failed", error instanceof Error ? error.message : error);
  }
}

export async function listAskAiLogs(from: string, to: string): Promise<AskAiLogRecord[]> {
  const lower = Date.parse(`${from}T00:00:00.000Z`);
  const upper = Date.parse(`${to}T23:59:59.999Z`);
  const store = await blobStore();
  let records: AskAiLogRecord[];
  if (store) {
    const selected: Array<{ key: string }> = [];
    for await (const page of store.list({ paginate: true })) {
      for (const blob of page.blobs) {
        const ts = Date.parse(blob.key.split("/")[0] ?? "");
        if (ts >= lower && ts <= upper) selected.push(blob);
        if (selected.length >= 10_000) break;
      }
      if (selected.length >= 10_000) break;
    }
    records = (await Promise.all(selected.map(blob => store.get(blob.key, { type: "json" })))).filter((record): record is AskAiLogRecord => Boolean(record));
  } else records = [...memoryLogs];
  return records.filter(record => {
    const ts = Date.parse(record.ts);
    return ts >= lower && ts <= upper;
  }).sort((a, b) => a.ts.localeCompare(b.ts)).slice(0, 10_000);
}

export function validAskAiLogKey(value: string | null): boolean {
  const expected = process.env.ASK_AI_LOG_KEY?.trim();
  if (!expected || !value) return false;
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function resetAskAiLogs() {
  memoryLogs.length = 0;
}
