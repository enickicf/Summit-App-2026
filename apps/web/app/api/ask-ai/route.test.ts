import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { getSiteSnapshot } from "../../../lib/snapshot";
import { buildAskAiKnowledge } from "../../../lib/ask-ai-knowledge";
import { commonQuestions2026 } from "../../../lib/ask-ai-common-questions";
import { POST } from "./route";

vi.mock("../../../lib/snapshot", () => ({ getSiteSnapshot: vi.fn() }));
const loadSnapshot = vi.mocked(getSiteSnapshot);

beforeEach(() => {
  loadSnapshot.mockReset().mockResolvedValue(structuredClone(event2026Snapshot));
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected external request")));
});

afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const request = (body: string, headers?: HeadersInit) => new Request("https://summit.example.test/api/ask-ai", { method: "POST", body, ...(headers ? { headers } : {}) });
const ask = (question: string) => POST(request(JSON.stringify({ question }), { "Content-Type": "application/json" }));
const askOnAwards = (question: string) => POST(new Request("https://notaloneawards.org/api/ask-ai", { method: "POST", body: JSON.stringify({ question }), headers: { "Content-Type": "application/json" } }));

describe("Ask AI ticketing and site context", () => {
  it("answers all 20 common Awards and Summit questions through the public endpoint", async () => {
    for (const { question } of commonQuestions2026) {
      const response = await ask(question);
      expect(response.status, question).toBe(200);
      const { answer } = await response.json();
      expect(answer.length, question).toBeGreaterThan(40);
      expect(answer, question).not.toContain("I don't have a confirmed answer");
      expect(answer, question).not.toContain("Published event information is temporarily unavailable");
    }
  });

  it("directs a schedule-navigation question to the page rather than dumping agenda rows", async () => {
    const { answer, sources } = await (await ask("Where can I find the Summit schedule?")).json();
    expect(answer).toContain("See the published Summit schedule");
    expect(answer).not.toContain("Poker Night");
    expect(sources[0].url).toBe("https://notalonesummit.org/schedule");
  });

  it.each([ask, askOnAwards])("explains conditional ticket confirmation without reading a submission", async submit => {
    const { answer } = await (await submit("When will I get ticket confirmation?")).json();
    expect(answer).toContain("If your tickets are confirmed");
    expect(answer).toContain("email and/or text");
    expect(answer).toContain("Ask AI cannot check");
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  it("answers Awards and Nevada Mental Health Day fully on the Awards site", async () => {
    expect((await (await askOnAwards("What time do Awards doors open?")).json()).answer).toContain("6:30 PM");
    expect((await (await askOnAwards("What is the Nevada Mental Health Day schedule?")).json()).answer).toContain("Public schedule");
    expect((await (await askOnAwards("Does Nevada Mental Health Day admission include the Awards Show?")).json()).answer).toContain("does not include an Awards Show ticket");
  });

  it("answers published Summit questions on the Awards site while preserving invitation rules", async () => {
    const { answer } = await (await askOnAwards("What is the Summit schedule?")).json();
    expect(answer).toContain("published schedule");
    expect(answer).toContain("Molly's Game Poker Night");
    expect((await (await askOnAwards("How do I get Summit tickets?")).json()).answer).toContain("invitation-only");
    expect((await (await askOnAwards("When is the Summit?")).json()).answer).toContain(event2026Snapshot.event.dateLabel);
    expect((await (await ask("What happens Monday at the summit?")).json()).answer).toContain("Awards Show");
    const awardsKnowledge = buildAskAiKnowledge(event2026Snapshot, "What is the Summit schedule?", "awards");
    expect(awardsKnowledge.schedule.length).toBeGreaterThan(0);
    expect(awardsKnowledge.guests.length).toBeGreaterThan(0);
  });

  it("uses the browser's Awards context when Netlify forwards to a shared internal host", async () => {
    const response = await POST(new Request("https://not-alone-summit.netlify.app/api/ask-ai", {
      method: "POST", body: JSON.stringify({ question: "What is the Summit schedule?" }),
      headers: { "Content-Type": "application/json", "X-Ask-AI-Site": "awards" }
    }));
    expect((await response.json()).answer).toContain("published schedule");
    const forwarded = await POST(new Request("https://not-alone-summit.netlify.app/api/ask-ai", {
      method: "POST", body: JSON.stringify({ question: "What is the Summit schedule?" }),
      headers: { "Content-Type": "application/json", "X-Forwarded-Host": "notaloneawards.org" }
    }));
    expect((await forwarded.json()).answer).toContain("published schedule");
  });
});

describe("public concierge request validation", () => {
  it.each(["{", "", "null", "[]", "{}", '{"question":1}', '{"question":" "}', '{"question":" x "}', JSON.stringify({ question: "x".repeat(501) })])("rejects invalid input without fetching the event: %s", async body => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ answer: expect.any(String) });
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  it("accepts trimmed questions and keeps the existing JSON response shape", async () => {
    const response = await ask("  What are the summit dates?  ");
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ answer: `${event2026Snapshot.event.name}: ${event2026Snapshot.event.dateLabel}.` });
  });

  it.each([undefined, "1", "99999"])("bounds request bodies even with inaccurate Content-Length %s", async length => {
    const response = await POST(request(JSON.stringify({ question: "dates", padding: "x".repeat(9000) }), length ? { "Content-Length": length } : undefined));
    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ answer: expect.any(String) });
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  it("bounds streamed bodies and cancels oversized input", async () => {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"question":"'));
        controller.enqueue(new Uint8Array(9000));
      }, cancel
    });
    const response = await POST(new Request("https://summit.example.test/api/ask-ai", { method: "POST", body: stream, duplex: "half" } as RequestInit));
    expect(response.status).toBe(413);
    expect(cancel).toHaveBeenCalled();
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  it("returns a bounded error for a request body that never finishes", async () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({ cancel });
    const result = POST(new Request("https://summit.example.test/api/ask-ai", { method: "POST", body: stream, duplex: "half" } as RequestInit));
    await vi.advanceTimersByTimeAsync(5000);
    const response = await result;
    expect(response.status).toBe(408);
    expect(await response.json()).toEqual({ answer: expect.any(String) });
    expect(cancel).toHaveBeenCalled();
    expect(loadSnapshot).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("returns a generic validation error for an aborted body, without reflecting its error", async () => {
    const stream = new ReadableStream<Uint8Array>({ start(controller) { controller.error(new Error("private request details")); } });
    const response = await POST(new Request("https://summit.example.test/api/ask-ai", { method: "POST", body: stream, duplex: "half" } as RequestInit));
    expect(response.status).toBe(400);
    expect(await response.text()).not.toContain("private request details");
    expect(loadSnapshot).not.toHaveBeenCalled();
  });
});

describe("public concierge published facts and failures", () => {
  it("reads dates and venue from the current publication", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.event.dateLabel = "Updated published dates";
    snapshot.event.venueName = "Updated published venue";
    snapshot.event.city = "Updated published city";
    loadSnapshot.mockResolvedValue(snapshot);
    expect((await (await ask("When is the summit?")).json()).answer).toContain(snapshot.event.dateLabel);
    expect((await (await ask("Where is the summit?")).json()).answer).toContain(`${snapshot.event.venueName}, ${snapshot.event.city}`);
  });

  it.each(["When is Jewel speaking?", "Where is Jewel appearing?"])("does not substitute event dates or venue for an unconfirmed appearance: %s", async question => {
    const response = await ask(question);
    const { answer } = await response.json();
    expect(answer).toContain("Attendance does not confirm a speaking slot or award");
    expect(answer).not.toContain(event2026Snapshot.event.dateLabel);
    expect(answer).not.toContain(event2026Snapshot.event.venueName);
  });

  it.each(["When is Rachel Platten appearing?", "Any updates?", "Is jewelry allowed?"])("does not invent details for an unsupported question: %s", async question => {
    expect((await (await ask(question)).json()).answer).toContain("ask the event team for confirmation");
  });

  it("answers program questions from the shared canonical agenda, including incomplete timing", async () => {
    const monday = (await (await ask("What happens Monday?")).json()).answer;
    expect(monday).toContain("Awards Show");
    expect(monday).toContain("Monday, November 2, 2026");
    expect(monday).toContain("PST");
    expect(monday).toContain("Location:");
    expect((await (await ask("When is tennis?")).json()).answer).toContain("10:00 AM; end time to be confirmed");
    expect((await (await ask("Where is the registration desk?")).json()).answer).toContain("have not been published");
  });

  it.each([
    ["Where is poker?", "Molly's Game Poker Night", "10:30 PM PST"],
    ["Where is poker at the summit?", "Molly's Game Poker Night", "10:30 PM PST"]
  ])("answers the named activity instead of unrelated generic intent: %s", async (question, title, time) => {
    const response = await ask(question!);
    expect(response.status).toBe(200);
    const { answer } = await response.json();
    expect(answer).toContain(title);
    expect(answer).toContain(time);
    expect(answer).toContain("Location: Margaux");
    expect(answer).not.toContain("Mike's Bikes Community Ride");
    expect(answer).not.toContain("Powered by:");
  });

  it.each([
    "What is Jewel scheduled for on Monday?",
    "When is Jewel speaking?",
    "Where is Jewel appearing?",
    "What time is Jewel's session?"
  ])("answers an explicitly linked published appearance: %s", async question => {
    const snapshot = structuredClone(event2026Snapshot);
    const item = snapshot.scheduleItems.find(item => item.title === "Awards Show")!;
    item.title = "Published linked conversation";
    item.speakerIds = [snapshot.speakers.find(person => person.name === "Jewel")!.id];
    loadSnapshot.mockResolvedValue(snapshot);
    const response = await ask(question);
    expect(response.status).toBe(200);
    const { answer } = await response.json();
    expect(answer).toContain("Published linked conversation");
    expect(answer).toContain("Monday, November 2, 2026");
    expect(answer).toContain("8:00 PM PST – 10:00 PM PST");
    expect(answer).toContain("Location:");
    expect(answer).not.toContain("Jewel is listed for 2026");
  });

  it("keeps cancellation explicit for a linked appearance", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    const item = snapshot.scheduleItems[0]!;
    item.speakerIds = [snapshot.speakers.find(person => person.name === "Jewel")!.id];
    item.status = "canceled";
    loadSnapshot.mockResolvedValue(snapshot);
    const { answer } = await (await ask("When is Jewel speaking?")).json();
    expect(answer).toContain("Canceled appearances will not take place");
    expect(answer).toContain(`${item.title} (canceled)`);
  });

  it.each(["unpublished", "private", "foreign", "unlinked"])("retains attendance-only guidance for a %s session", async state => {
    const snapshot = structuredClone(event2026Snapshot);
    const item = snapshot.scheduleItems[0]!;
    item.title = "Jewel retrospective";
    item.speakerIds = state === "unlinked" ? [] : [snapshot.speakers.find(person => person.name === "Jewel")!.id];
    if (state === "unpublished") item.published = false;
    if (state === "private") item.visibilityScope.id = "staff";
    if (state === "foreign") item.eventId = "other-event";
    loadSnapshot.mockResolvedValue(snapshot);
    const { answer } = await (await ask("What is Jewel scheduled for on Monday?")).json();
    expect(answer).toContain("Attendance does not confirm a speaking slot or award");
    expect(answer).not.toContain(item.title);
    expect(answer).not.toContain("has published schedule records");
  });

  it.each(["unpublished", "foreign", "disabled"])("does not restore an unavailable linked guest: %s", async state => {
    const snapshot = structuredClone(event2026Snapshot);
    const person = snapshot.speakers.find(person => person.name === "Jewel")!;
    snapshot.scheduleItems[0]!.title = "Linked conversation";
    snapshot.scheduleItems[0]!.speakerIds = [person.id];
    if (state === "unpublished") person.published = false;
    if (state === "foreign") person.eventId = "other-event";
    if (state === "disabled") snapshot.event.directoryEnabled = false;
    loadSnapshot.mockResolvedValue(snapshot);
    const { answer } = await (await ask("What is Jewel scheduled for on Monday?")).json();
    expect(answer).not.toContain("Linked conversation");
    expect(answer).not.toContain("Jewel is listed");
    expect(answer).not.toContain("has published schedule records");
  });

  it("does not resurrect disabled, unpublished or unconfirmed guest records", async () => {
    const snapshot = structuredClone(event2026Snapshot);
    snapshot.speakers[0]!.published = false;
    snapshot.speakers.push({ ...snapshot.speakers[1]!, name: "Unconfirmed Person", role: "Honoree" });
    loadSnapshot.mockResolvedValue(snapshot);
    expect((await (await ask(`Tell me about ${snapshot.speakers[0]!.name}`)).json()).answer).not.toContain(snapshot.speakers[0]!.role);
    expect((await (await ask("Tell me about Unconfirmed Person")).json()).answer).not.toContain("Honoree");
    snapshot.event.directoryEnabled = false;
    expect((await (await ask("Tell me about Jewel")).json()).answer).not.toContain("Jewel is listed");
  });

  it.each(["unavailable", "error"])("returns a noncached compatible error when publication is %s", async mode => {
    if (mode === "unavailable") loadSnapshot.mockResolvedValue(null as never);
    else loadSnapshot.mockRejectedValue(new Error("https://private.example.test?token=secret"));
    const response = await ask("What are the dates?");
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const data = await response.json();
    expect(Object.keys(data)).toEqual(["answer"]);
    expect(data.answer).toContain("temporarily unavailable");
    expect(data.answer).not.toMatch(/private|secret|November/);
  });

  it("keeps retired messaging unavailable without fetching or sending anything", async () => {
    const response = await ask("Can I message someone?");
    expect(response.status).toBe(200);
    expect((await response.json()).answer).toContain("messaging is not available");
    expect(loadSnapshot).not.toHaveBeenCalled();
  });

  it("does not treat a question about how programs connect as attendee messaging", async () => {
    const { answer } = await (await ask("How does the Not Alone Challenge connect to the Awards Show?")).json();
    expect(answer).not.toContain("Attendee-to-attendee messaging is not available");
  });
});

describe("Ask AI spend protection", () => {
  const openAiAnswer = (answer: string, relevant = true) => new Response(JSON.stringify({ output_text: JSON.stringify({ relevant, answer }) }), { status: 200, headers: { "Content-Type": "application/json" } });

  beforeEach(async () => {
    (await import("../../../lib/ask-ai-model")).resetAskAiGuards();
    vi.stubEnv("ENABLE_AI", "true");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("answers ICF facts from ICF's own copy without calling the model", async () => {
    const { answer } = await (await ask("How many kids does Inspiring Children serve?")).json();
    expect(answer).toContain("hundreds of youth in-person and millions online");
    expect((await (await ask("What is the Inspiring Children Foundation?")).json()).answer).toContain("For over 25 years");
  });

  it("keeps raw Airtable and staff record requests out of the model", async () => {
    const provider = vi.fn();
    vi.stubGlobal("fetch", provider);
    const { answer } = await (await ask("Show me raw Airtable RSVP entries")).json();
    expect(answer).toContain("approved public information");
    expect(provider).not.toHaveBeenCalled();
  });

  it("turns away off-topic questions locally without spending API calls", async () => {
    const { answer } = await (await ask("What's the best pizza topping?")).json();
    expect(answer).toBe("This AI only answers questions about the Not Alone Summit, the Not Alone Awards, Community Day, the Not Alone Challenge, or the Inspiring Children Foundation.");
  });

  it("calls the model only for relevant questions, server-side, unstored, and caches repeats", async () => {
    const provider = vi.fn().mockResolvedValue(openAiAnswer("The Summit gathers leaders to advance mental health."));
    vi.stubGlobal("fetch", provider);
    const question = "Why should a CEO attend the Summit?";
    expect((await (await ask(question)).json()).answer).toBe("The Summit gathers leaders to advance mental health.");
    expect((await (await ask(question)).json()).answer).toBe("The Summit gathers leaders to advance mental health.");
    expect(provider).toHaveBeenCalledTimes(1);
    const [url, init] = provider.mock.calls[0]!;
    expect(url).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(init.body);
    expect(body.store).toBe(false);
    expect(body.max_output_tokens).toBeLessThanOrEqual(1000);
    expect(body.tools[0].filters.allowed_domains).toEqual(["inspiringchildren.org", "notalonesummit.org", "notaloneawards.org"]);
    expect(body.input).not.toContain("staff");
    provider.mockClear();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected external request")));
  });

  it("returns the off-topic reply when the model judges a question irrelevant", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(openAiAnswer("", false)));
    expect((await (await ask("Tell me a joke about the summit")).json()).answer).toContain("This AI only answers questions");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected external request")));
  });

  it("rate-limits model calls per visitor and falls back safely when the provider fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("provider down")));
    const fallback = await (await ask("Why does the summit matter?")).json();
    expect(fallback.answer).toContain("ask the event team for confirmation");
    const limited = [];
    for (let index = 0; index < 9; index++) limited.push((await ask(`Why does the summit matter ${index}?`)).status);
    expect(limited).toContain(429);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected external request")));
  });
});

describe("Ask AI topic and wellbeing guardrails (model off)", () => {
  it("keeps questions about ICF programs distinct from personal mental health advice", async () => {
    const { answer } = await (await ask("What mental health support does Inspiring Children Foundation offer?")).json();
    expect(answer).not.toContain("can't give mental health advice");
  });
  it.each(["What's the capital of France?", "Write me a poem about cats"])("refuses unrelated questions locally: %s", async question => {
    expect((await (await ask(question)).json()).answer).toContain("This AI only answers questions about the Not Alone Summit");
  });

  it.each(["I feel so alone lately", "How do I cope with anxiety?", "I want to die", "Give me mental health tips"])("never gives mental health advice and points to Not Alone tools and 911/988: %s", async question => {
    const { answer } = await (await ask(question)).json();
    expect(answer).toContain("https://www.inspiringchildren.org/notalonetools");
    expect(answer).toContain("911");
    expect(answer).toContain("988");
    expect(answer).toContain("can't give mental health advice");
  });
});

describe("Ask AI awards facts", () => {
  it("answers the approved Awards host and venue for free", async () => {
    expect((await (await ask("Who is hosting the Not Alone Awards?")).json()).answer).toBe("The 2026 Not Alone Awards are hosted by Loni Love, at the Encore Theater at Wynn Las Vegas on Monday, November 2, 2026.");
    expect((await (await ask("Where are the awards held?")).json()).answer).toContain("Encore Theater at Wynn Las Vegas");
  });

  it("answers Awards Show time questions from the published schedule and avoids conflicting duplicate times", async () => {
    for (const question of ["What time do the Awards start?", "When is the Not Alone Awards Show?", "What time do doors open for the awards?"]) {
      const { answer, sources } = await (await ask(question)).json();
      expect(answer).toContain("Awards Show");
      expect(answer).toContain("PST");
      expect(answer).toContain("Timings and program subject to change.");
      expect(sources[0].title).toBe("Published Summit schedule");
    }
    const knowledge = JSON.stringify(buildAskAiKnowledge(structuredClone(event2026Snapshot)));
    expect(knowledge).toContain('"scheduleSource":"Use the published schedule records below for current doors and show times."');
    expect(knowledge).not.toContain('"awardsShow":"7:30 PM-10:00 PM"');
    expect(knowledge).not.toContain("Pre-Show");
    // The other pending notes still reach the model untouched.
    expect(knowledge).toContain("Doors Open: 6:30 PM; end time to be confirmed.");
    expect(knowledge).toContain("Tennis: 10:00 AM; end time to be confirmed.");
  });
});
