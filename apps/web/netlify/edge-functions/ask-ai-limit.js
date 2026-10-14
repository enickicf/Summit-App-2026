// Shared Netlify edge limit for the public AI endpoint. The application also
// applies a smaller per-instance model-call guard and serves free fact answers.
export default async function askAiLimit(_request, context) {
  return context.next();
}

export const config = {
  path: "/api/ask-ai",
  rateLimit: {
    windowLimit: 10,
    windowSize: 180,
    aggregateBy: ["ip", "domain"]
  }
};
