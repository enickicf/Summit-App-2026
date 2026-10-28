import { NextResponse } from "next/server";
import { listAskAiLogs, validAskAiLogKey } from "../../../../lib/ask-ai-log";

const date = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (value: string) => date.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
  && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
// Quoting alone does not prevent a spreadsheet from executing a guest's formula.
const csv = (value: unknown) => {
  const text = String(value ?? "");
  return `"${(/^[\s\uFEFF]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`;
};

export async function GET(request: Request) {
  if (!validAskAiLogKey(request.headers.get("x-ask-ai-key"))) return new NextResponse("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "2026-01-01";
  const to = url.searchParams.get("to") ?? "2026-12-31";
  if (!validDate(from) || !validDate(to) || from > to) return new NextResponse("Invalid date range", { status: 400 });
  let records;
  try { records = await listAskAiLogs(from, to); }
  catch { return new NextResponse("Question logs are temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } }); }
  const rows = [
    ["ts", "question", "answer", "sources", "latencyMs", "model", "faqRevision"].map(csv).join(","),
    ...records.map(record => [record.ts, record.question, record.answer, JSON.stringify(record.sources), record.latencyMs, record.model, record.faqRevision].map(csv).join(","))
  ];
  return new NextResponse(rows.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="ask-ai-${from}-to-${to}.csv"`, "Cache-Control": "no-store" } });
}
