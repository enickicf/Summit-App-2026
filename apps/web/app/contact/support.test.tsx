import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Children, isValidElement, type ReactNode } from "react";
import ContactPage, { metadata as contactMetadata } from "./page";
import DonatePage, { metadata as donateMetadata } from "../donate/page";
import NotFound from "../not-found";
import ErrorPage from "../error";
import Loading from "../loading";
import manifest from "../manifest";
import AskAiPage from "../ask-ai/page";

describe("Support and fallback skip-link integration", () => {
  it.each([
    ["contact", <ContactPage />],
    ["donate", <DonatePage />],
    ["ask-ai", <AskAiPage />],
    ["not-found", <NotFound />],
    ["error", <ErrorPage error={new Error("Unavailable")} retry={() => {}} />]
  ])("exposes exactly one focusable main landmark on %s", (_name, page) => {
    const html = renderToStaticMarkup(page);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html.match(/id="main-content"/g)).toHaveLength(1);
    expect(html).toMatch(/<main\b[^>]*id="main-content"[^>]*tabindex="-1"/);
  });
});

describe("Support and donation handoffs", () => {
  it("shows the official ICF contact menu directly with no retired submission form", () => {
    const html = renderToStaticMarkup(<ContactPage />);
    expect(contactMetadata.title).toBe("Contact Us");
    expect(html).toContain('href="https://www.inspiringchildren.org"');
    expect(html).toContain("1801 N Martin L King Blvd #271258, Las Vegas, NV 89127");
    for (const label of ["Contact Staff", "Request a Scholarship", "Subscribe to our Email Newsletter", "Subscribe to Farmers Market Newsletter"]) expect(html).toContain(label);
    for (const label of ["Intake Survey", "Retreat Survey", "Hot Spring Waiver", "Anonymous Feedback"]) expect(html).not.toContain(label);
    expect(html.match(/href="https:\/\/www\.inspiringchildren\.org\/contact-staff"/g)).toHaveLength(2);
    for (const [, href] of html.matchAll(/href="([^"]+)"/g)) expect(href).toMatch(/^https:\/\/www\.inspiringchildren\.org(\/|$)/);
    expect(html).not.toContain("<form");
    expect(html).not.toContain('target="_blank"');
    expect(html).not.toContain("/api/messages");
  });

  it("keeps donations on the official ICF site without security or transaction claims", () => {
    const html = renderToStaticMarkup(<DonatePage />);
    expect(donateMetadata.title).toBe("Donate");
    expect(html).toContain('href="https://www.inspiringchildren.org/donate"');
    expect(html).toContain("Continue to ICF donations");
    expect(html).toContain('aria-describedby="donation-destination"');
    expect(html).toContain('id="donation-destination"');
    expect(html).toContain("No payment is collected on this website.");
    expect(html).not.toContain("Donate securely");
    expect(html).not.toContain('target="_blank"');
    expect(html).not.toMatch(/<(?:form|input|iframe)\b/);
  });
});

describe("Website recovery states", () => {
  it("provides real destinations on the not-found page", () => {
    const html = renderToStaticMarkup(<NotFound />);
    expect(html).toContain("<h1>Page not found</h1>");
    for (const href of ["/summit", "/awards", "/contact"]) expect(html).toContain(`href="${href}"`);
  });

  it("does not expose error details and uses the installed Next version's retry API", () => {
    const retry = vi.fn();
    const props = { error: new Error("Sensitive diagnostic details"), retry };
    const html = renderToStaticMarkup(<ErrorPage {...props} />);
    expect(html).not.toContain("Sensitive diagnostic details");
    expect(html).toContain("Try again");
    expect(html).toContain('href="/contact"');
    const tree = ErrorPage(props);
    function clickRetry(node: ReactNode): void {
      Children.forEach(node, child => {
        if (!isValidElement<{ children?: ReactNode; onClick?: () => void }>(child)) return;
        if (child.type === "button") child.props.onClick?.();
        else clickRetry(child.props.children);
      });
    }
    clickRetry(tree);
    expect(retry).toHaveBeenCalledOnce();
  });

  it("announces loading as a status", () => {
    const html = renderToStaticMarkup(<Loading />);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status">Loading page...</p>');
    expect(html).not.toContain('id="main-content"');
    expect(html).not.toMatch(/<main\b/);
  });
});

describe("Public website manifest", () => {
  it("keeps website identity separate from the native attendee app", () => {
    const data = manifest();
    expect(data.name).toBe("Not Alone Summit");
    expect(data.display).toBe("browser");
    expect(data.description).toContain("public website");
    expect(data.description).not.toContain("attendee experience");
  });

  it("declares the actual dimensions of each existing PNG", () => {
    const publicDirectory = resolve(import.meta.dirname, "../../public");
    for (const icon of manifest().icons ?? []) {
      const data = readFileSync(resolve(publicDirectory, icon.src.slice(1)));
      expect(data.subarray(1, 4).toString()).toBe("PNG");
      expect(icon.sizes).toBe(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`);
    }
  });
});
