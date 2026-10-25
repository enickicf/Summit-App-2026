// Protect the shared staff and podcast portal sign-in from automated password guessing.
// Netlify applies this at the edge before the request reaches the Next.js login handler.
export default async function staffLoginLimit(_request, context) {
  return context.next();
}

export const config = {
  path: "/api/staff/login",
  rateLimit: {
    windowLimit: 10,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
