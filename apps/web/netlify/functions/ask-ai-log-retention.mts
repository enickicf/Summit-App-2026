import { purgeExpiredAskAiLogs } from "../../lib/ask-ai-log";

export default async () => {
  await purgeExpiredAskAiLogs();
};

export const config = { schedule: "0 * * * *" };
