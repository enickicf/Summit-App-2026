import { z } from "zod";

export const questionSchema = z.string().trim().min(2).max(500);
const responseSchema = z.object({ answer: z.string().trim().min(1) });
export const ASK_AI_TIMEOUT_MS = 15_000;

export type AskAiResult = { status: "success"; answer: string } | { status: "error"; message: string };

export async function askAi(question: string, signal: AbortSignal): Promise<AskAiResult> {
  const parsed = questionSchema.safeParse(question);
  if (!parsed.success) return { status: "error", message: "Please enter a question between 2 and 500 characters." };
  if (signal.aborted) return { status: "error", message: "The request was canceled." };

  const controller = new AbortController();
  const cancel = () => controller.abort();
  signal.addEventListener("abort", cancel, { once: true });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, ASK_AI_TIMEOUT_MS);

  try {
    const response = await fetch("/api/ask-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: parsed.data }),
      signal: controller.signal
    });
    if (!response.ok) {
      if (response.status === 400) return { status: "error", message: "Please enter a question between 2 and 500 characters." };
      if (response.status === 408) return { status: "error", message: "Your question took too long to send. Please try again." };
      if (response.status === 413) return { status: "error", message: "Please keep your question to 500 characters." };
      if (response.status === 429) return { status: "error", message: "Too many questions at once. Please wait a moment before trying again." };
      return { status: "error", message: "Answers are temporarily unavailable. Please try again, or use the Schedule or Contact pages." };
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      if (controller.signal.aborted) throw error;
      return { status: "error", message: "An answer could not be read. Please try again, or contact the event team." };
    }
    const data = responseSchema.safeParse(payload);
    if (!data.success) return { status: "error", message: "An answer could not be read. Please try again, or contact the event team." };
    return { status: "success", answer: data.data.answer };
  } catch {
    if (timedOut) return { status: "error", message: "The answer took too long. Please try again, or use the Schedule or Contact pages." };
    if (signal.aborted) return { status: "error", message: "The request was canceled." };
    return { status: "error", message: "An answer could not be loaded. Please check your connection and try again." };
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", cancel);
  }
}
