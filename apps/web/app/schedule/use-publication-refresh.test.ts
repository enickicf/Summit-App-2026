import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePublicationRefresh } from "./use-publication-refresh";

const hooks = vi.hoisted(() => ({
  router: { refresh: vi.fn() },
  effect: undefined as undefined | (() => () => void),
  dependencies: [] as unknown[]
}));
vi.mock("next/navigation", () => ({ useRouter: () => hooks.router }));
vi.mock("react", () => ({
  useEffect: (effect: () => () => void, dependencies: unknown[]) => {
    hooks.effect = effect;
    hooks.dependencies = dependencies;
  }
}));

describe("publication refresh lifecycle", () => {
  let documentEvents: EventTarget & { visibilityState: string };
  let windowEvents: EventTarget;
  let cleanup: (() => void) | undefined;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date", "performance", "setTimeout", "clearTimeout"] });
    vi.setSystemTime("2026-11-05T18:00:00.000Z");
    hooks.router.refresh.mockClear();
    documentEvents = Object.assign(new EventTarget(), { visibilityState: "visible" });
    windowEvents = Object.assign(new EventTarget(), { setTimeout, clearTimeout });
    vi.stubGlobal("document", documentEvents);
    vi.stubGlobal("window", windowEvents);
  });

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function mount() {
    usePublicationRefresh();
    cleanup = hooks.effect!();
  }

  function visibility(state: "hidden" | "visible") {
    documentEvents.visibilityState = state;
    documentEvents.dispatchEvent(new Event("visibilitychange"));
  }

  it("refreshes the current route every 60 visible seconds without an extra mount request", () => {
    mount();
    expect(hooks.router.refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(59_999);
    expect(hooks.router.refresh).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(2);
    expect(hooks.dependencies).toEqual([hooks.router]);
    expect(vi.getTimerCount()).toBe(1);
  });

  it("cancels hidden-page timers and refreshes immediately after a long absence", () => {
    mount();
    vi.advanceTimersByTime(30_000);
    visibility("hidden");
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(180_000);
    expect(hooks.router.refresh).not.toHaveBeenCalled();
    visibility("visible");
    vi.advanceTimersByTime(0);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(2);
  });

  it("throttles rapid visibility and focus events to one request per 15 seconds", () => {
    mount();
    vi.advanceTimersByTime(60_000);
    visibility("hidden");
    vi.advanceTimersByTime(1000);
    visibility("visible");
    windowEvents.dispatchEvent(new Event("focus"));
    visibility("hidden");
    visibility("visible");
    vi.advanceTimersByTime(13_999);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(1);
  });

  it.each([-4, 4])("keeps the resume throttle bounded when the device clock moves %i hours", hours => {
    mount();
    vi.advanceTimersByTime(60_000);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(1);
    visibility("hidden");
    vi.advanceTimersByTime(1000);
    const elapsed = performance.now();
    vi.setSystemTime(Date.now() + hours * 3_600_000);
    expect(performance.now()).toBe(elapsed);
    visibility("visible");
    windowEvents.dispatchEvent(new Event("focus"));
    vi.advanceTimersByTime(13_999);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(2);
    visibility("hidden");
    vi.advanceTimersByTime(180_000);
    visibility("visible");
    vi.advanceTimersByTime(0);
    expect(hooks.router.refresh).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(1);
  });

  it("does not poll a route mounted in a hidden tab", () => {
    documentEvents.visibilityState = "hidden";
    mount();
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(180_000);
    windowEvents.dispatchEvent(new Event("focus"));
    expect(hooks.router.refresh).not.toHaveBeenCalled();
    visibility("visible");
    vi.advanceTimersByTime(0);
    expect(hooks.router.refresh).toHaveBeenCalledOnce();
  });

  it("does not refresh if visibility changes before a queued resume callback runs", () => {
    mount();
    vi.advanceTimersByTime(20_000);
    windowEvents.dispatchEvent(new Event("focus"));
    documentEvents.visibilityState = "hidden";
    vi.advanceTimersByTime(0);
    expect(hooks.router.refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("removes timers and listeners on leave so the old route never refreshes a new page", () => {
    mount();
    cleanup!();
    vi.advanceTimersByTime(180_000);
    visibility("hidden");
    visibility("visible");
    windowEvents.dispatchEvent(new Event("focus"));
    vi.advanceTimersByTime(180_000);
    expect(hooks.router.refresh).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
