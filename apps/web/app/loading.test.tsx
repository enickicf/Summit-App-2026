import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("streamed loading placeholder", () => {
  it("announces loading without duplicating the arriving page landmark or skip target", () => {
    const html = renderToStaticMarkup(<><Loading /><main id="main-content"><h1>Schedule</h1></main></>);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html.match(/id="main-content"/g)).toHaveLength(1);
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status">Loading page...</p>');
  });
});
