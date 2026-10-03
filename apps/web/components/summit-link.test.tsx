import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

describe("SummitLink", () => {
  it("renders a relative Next link on the server and for the Summit domain", async () => {
    const { SummitLink } = await import("./summit-link");
    expect(renderToStaticMarkup(<SummitLink href="/" className="x">Summit</SummitLink>)).toBe('<a class="x" href="/">Summit</a>');
  });

  it("renders an absolute link to notalonesummit.org once the browser reports the Awards domain", async () => {
    vi.resetModules();
    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      // Simulate the hydrated client: React hands the component the client snapshot.
      return { ...actual, useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => boolean) => getSnapshot() };
    });
    vi.stubGlobal("window", { location: { hostname: "notaloneawards.org" } });
    const { SummitLink } = await import("./summit-link");
    expect(renderToStaticMarkup(<SummitLink href="/">Summit</SummitLink>)).toBe('<a href="https://notalonesummit.org/">Summit</a>');
    vi.unstubAllGlobals(); vi.doUnmock("react"); vi.resetModules();
  });
});
