import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StaffPortal } from "../../components/staff-portal";
import { SubmissionReviewPortal } from "../../components/submission-review-portal";
import type { InboxEntry } from "./submission-inbox";

const failed: InboxEntry = {
  id: "failed-1",
  endpoint: "rsvp",
  receivedAt: "2026-10-24T00:17:50.312Z",
  origin: "https://notaloneawards.org",
  userAgent: "test",
  body: "{}",
  name: "Example Guest",
  email: "example@example.com",
  phone: "7025550100",
  status: 400,
  error: "Please complete every required field."
};

describe("staff submission review", () => {
  it("keeps the queue off the dashboard and links to its protected page", () => {
    const html = renderToStaticMarkup(<StaffPortal rsvps={[]} nominations={[]} poker={[]} lineup={[]} needsAttention={[failed]} generatedAt="2026-10-24T00:00:00Z" />);
    expect(html).toContain('href="/staff/submissions"');
    expect(html).toContain("Submission review (1)");
    expect(html).not.toContain("What the guest saw");
    expect(html).not.toContain("example@example.com");
  });

  it("shows the full queue only on the submission review page", () => {
    const html = renderToStaticMarkup(<SubmissionReviewPortal needsAttention={[failed]} anonymousFailures={2} generatedAt="2026-10-24T00:00:00Z" />);
    expect(html).toContain("1 submission to review");
    expect(html).toContain("What the guest saw");
    expect(html).toContain("example@example.com");
    expect(html).toContain("2 other refused requests");
    expect(html).toContain('href="/staff"');
  });
});
