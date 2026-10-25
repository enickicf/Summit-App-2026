import { NextResponse } from "next/server";
import { listAskAiLogs, validAskAiLogKey } from "../../../../lib/ask-ai-log";

const date = /^\d{4}-\d{2}-\d{2}$/;
const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  if (!validAskAiLogKey(request.headers.get("x-ask-ai-key"))) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "2026-01-01";
  const to = url.searchParams.get("to") ?? "2026-12-31";
  if (!date.test(from) || !date.test(to) || from > to) return new NextResponse("Invalid date range", { status: 400 });
  const records = await listAskAiLogs(from, to);
  const rows = [
    ["ts", "question", "answer", "sources", "latencyMs", "model", "faqRevision"].map(csv).join(","),
    ...records.map(record => [record.ts, record.question, record.answer, JSON.stringify(record.sources), record.latencyMs, record.model, record.faqRevision].map(csv).join(","))
  ];
  return new NextResponse(rows.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ask-ai-${from}-to-${to}.csv"`, "Cache-Control": "no-store" } });
}
