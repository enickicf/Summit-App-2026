import { z } from "zod";

const schema = z.object({ question: z.string().trim().min(2).max(500) });
const maxBodyBytes = 8192;
const bodyTimeoutMs = 5000;

export class QuestionRequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

export async function readQuestion(request: Request): Promise<string> {
  if (Number(request.headers.get("content-length")) > maxBodyBytes) {
    void request.body?.cancel().catch(() => {});
    throw new QuestionRequestError(413, "Please keep your question to 500 characters.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new QuestionRequestError(400, "Please ask a complete question.");
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    // Bound streamed bodies too: Content-Length may be absent or inaccurate.
    const readBody = async () => {
      const decoder = new TextDecoder();
      let bytes = 0;
      let body = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) return body + decoder.decode();
        bytes += value.byteLength;
        if (bytes > maxBodyBytes) throw new QuestionRequestError(413, "Please keep your question to 500 characters.");
        body += decoder.decode(value, { stream: true });
      }
    };
    const body = await Promise.race([
      readBody(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new QuestionRequestError(408, "Your question took too long to send. Please try again.")), bodyTimeoutMs);
      })
    ]);
    const parsed = schema.safeParse(JSON.parse(body));
    if (!parsed.success) throw new QuestionRequestError(400, "Please ask a question between 2 and 500 characters.");
    return parsed.data.question;
  } catch (error) {
    if (error instanceof QuestionRequestError) throw error;
    throw new QuestionRequestError(400, "Please send a valid question.");
  } finally {
    clearTimeout(timeout);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
