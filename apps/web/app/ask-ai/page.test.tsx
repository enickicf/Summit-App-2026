import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AskAiPage, { metadata } from "./page";
import { AskAiFeedback } from "./ask-ai-form";

describe("Ask AI page", () => {
  it("labels the bounded question field and keeps the page free of extra links", () => {
    const html = renderToStaticMarkup(<AskAiPage />);
    expect(metadata.title).toBe("Ask AI");
    expect(html).toContain('<label for="ask-ai-question">Your question</label>');
    expect(html).toMatch(/<textarea[^>]+id="ask-ai-question"[^>]+minLength="2"[^>]+maxLength="500"/);
    expect(html).toContain('aria-describedby="ask-ai-scope"');
    expect(html).toContain('id="ask-ai-scope"');
    expect(html).toContain('type="submit"');
    expect(html).toContain('role="status"');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("<nav");
    expect(html).not.toContain("Not medical advice or emergency support");
    expect(html).toContain("Inspiring Children Foundation");
    expect(html).toMatch(/<textarea[^>]+placeholder="What is the Inspiring Children Foundation\?"/);
    expect(html).not.toContain("Ask me anything");
    expect(html).not.toContain("<h2>Answer</h2>");
  });

  it("announces the pending state without presenting a previous answer as current", () => {
    const html = renderToStaticMarkup(<AskAiFeedback pending result={{ status: "success", answer: "Earlier answer" }} submittedQuestion="Earlier question" />);
    expect(html).toContain('role="status" aria-atomic="true"');
    expect(html).toContain("Checking event information...");
    expect(html).not.toContain("Earlier answer");
  });

  it("renders successful answers as text with the submitted question", () => {
    const html = renderToStaticMarkup(<AskAiFeedback pending={false} result={{ status: "success", answer: '<script>alert("test")</script>' }} submittedQuestion="The submitted question?" />);
    expect(html).toContain("<h2>Answer</h2>");
    expect(html).toContain("The submitted question?");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("announces recoverable errors without showing them as answers", () => {
    const html = renderToStaticMarkup(<AskAiFeedback pending={false} result={{ status: "error", message: "Please try again." }} submittedQuestion="Where?" />);
    expect(html).toContain('id="ask-ai-error" role="alert">Please try again.</p>');
    expect(html).not.toContain("<h2>Answer</h2>");
  });
});
