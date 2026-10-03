import { getAirtableHeadshot } from "../../../../../lib/airtable";

// Serves a guest's current Airtable headshot at a stable URL (Airtable's own links expire).
export async function GET(_request: Request, { params }: { params: Promise<{ record: string }> }) {
  const { record } = await params;
  const attachment = await getAirtableHeadshot(record);
  const source = attachment?.thumbnails?.large?.url ?? attachment?.url;
  if (!source) return new Response("Not found", { status: 404 });
  const image = await fetch(source, { signal: AbortSignal.timeout(10000) }).catch(() => null);
  const type = image?.headers.get("content-type") ?? attachment?.type ?? "";
  if (!image?.ok || !type.startsWith("image/")) return new Response("Not found", { status: 404 });
  return new Response(image.body, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=900, s-maxage=900, stale-while-revalidate=3600", "X-Content-Type-Options": "nosniff" }
  });
}
