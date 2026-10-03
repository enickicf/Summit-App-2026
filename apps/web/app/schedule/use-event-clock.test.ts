import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEventClock } from "./use-event-clock";

const hooks = vi.hoisted(() => ({
  setNow: vi.fn(),
  value: undefined as string | undefined,
  effects: [] as { run: () => void | (() => void); dependencies: unknown[] }[]
}));
vi.mock("react", () => ({
  useState: (initial: () => string) => {
    hooks.value ??= initial();
    return [hooks.value, (value: string) => { hooks.value = value; hooks.setNow(value); }];
  },
  useEffect: (run: () => void | (() => void), dependencies: unknown[]) => { hooks.effects.push({ run, dependencies }); }
}));

const serverNow = "2026-11-05T18:00:00.000Z";
let monotonicMillis: number;
let documentEvents: EventTarget;
let mountedEffects: { dependencies: unknown[]; cleanup: (() => void) | undefined }[];

function render(initialNowUtc = serverNow) {
  hooks.effects = [];
  const result = useEventClock(initialNowUtc);
  hooks.effects.forEach((effect, index) => {
    const previous = mountedEffects[index];
    if (previous && effect.dependencies.length === previous.dependencies.length
      && effect.dependencies.every((value, dependency) => Object.is(value, previous.dependencies[dependency]))) return;
    previous?.cleanup?.();
    mountedEffects[index] = { dependencies: effect.dependencies, cleanup: effect.run() || undefined };
  });
  return result;
}

function advance(milliseconds: number) {
  monotonicMillis += milliseconds;
  vi.advanceTimersByTime(milliseconds);
}

function unmount() {
  mountedEffects.forEach(effect => effect.cleanup?.());
  mountedEffects = [];
  hooks.value = undefined;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(serverNow);
  hooks.setNow.mockClear();
  hooks.value = undefined;
  mountedEffects = [];
  monotonicMillis = 5000;
  documentEvents = new EventTarget();
  vi.spyOn(performance, "now").mockImplementation(() => monotonicMillis);
  vi.stubGlobal("window", { setInterval, clearInterval });
  vi.stubGlobal("document", documentEvents);
});
afterEach(() => {
  unmount();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("event clock lifecycle", () => {
  it.each([-4, 4])("ignores a client wall clock skewed by %i hours while preserving server hydration", hours => {
    vi.setSystemTime(Date.parse(serverNow) + hours * 3_600_000);
    expect(render()).toBe(serverNow);
    expect(hooks.setNow).toHaveBeenLastCalledWith(serverNow);
    advance(29_999);
    expect(hooks.setNow).toHaveBeenCalledTimes(1);
    advance(1);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:00:30.000Z");
  });

  it("uses elapsed monotonic time on resume rather than tick count or device clock changes", () => {
    render();
    advance(30_000);
    vi.setSystemTime("2026-11-06T08:00:00Z");
    // Model a suspended tab whose interval callbacks have not run.
    monotonicMillis += 95_500;
    documentEvents.dispatchEvent(new Event("visibilitychange"));
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:02:05.500Z");
    vi.setSystemTime("2026-11-04T08:00:00Z");
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:02:35.500Z");
  });

  it("re-anchors to a new validated server prop and advances from the replacement anchor", () => {
    render();
    advance(30_000);
    render("2026-11-05T18:05:00.000Z");
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:05:00.000Z");
    expect(vi.getTimerCount()).toBe(1);
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:05:30.000Z");
  });

  it.each([-4, 4])("keeps elapsed server time across a cached-route remount with %i hours of device skew", hours => {
    vi.setSystemTime(Date.parse(serverNow) + hours * 3_600_000);
    render();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    advance(600_000);

    expect(render()).toBe("2026-11-05T18:10:00.000Z");
    expect(Date.parse(hooks.value!)).toBeGreaterThan(Date.parse("2026-11-05T18:05:00.000Z"));
    expect(vi.getTimerCount()).toBe(1);
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:10:30.000Z");
  });

  it("does not let older cached props replace a newer server anchor after navigating back", () => {
    render();
    render("2026-11-05T18:05:00.000Z");
    unmount();
    advance(600_000);
    expect(render(serverNow)).toBe("2026-11-05T18:15:00.000Z");
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:15:00.000Z");

    render("2026-11-05T18:16:00.000Z");
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:16:00.000Z");
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:16:30.000Z");
  });

  it.each(["remount", "prop update"])("rejects unseen cached props newer than the original anchor on %s", mode => {
    render();
    if (mode === "remount") unmount();
    advance(600_000);

    // This timestamp is newer than the original anchor, but five minutes stale.
    expect(render("2026-11-05T18:05:00.000Z")).toBe("2026-11-05T18:10:00.000Z");
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:10:00.000Z");
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:10:30.000Z");
    render("2026-11-05T18:06:00.000Z");
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:10:30.000Z");
    expect(vi.getTimerCount()).toBe(1);
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:11:00.000Z");

    const emitted = hooks.setNow.mock.calls.map(([value]) => Date.parse(value));
    expect(emitted.every((value, index) => index === 0 || value >= emitted[index - 1]!)).toBe(true);
  });

  it("keeps a new document's initial clock independent of another document's anchor", () => {
    render("2026-11-05T18:05:00.000Z");
    unmount();
    vi.stubGlobal("document", new EventTarget());
    expect(render(serverNow)).toBe(serverNow);
    expect(hooks.setNow).toHaveBeenLastCalledWith(serverNow);
  });

  it.each([serverNow, "2026-11-05T18:00:00Z"])("matches server rendering and first hydration for %s", initialNowUtc => {
    render("2026-11-05T18:20:00.000Z");
    unmount();
    vi.stubGlobal("document", undefined);
    // Server rendering does not run effects or consult another document's clock.
    const serverOutput = useEventClock(initialNowUtc);
    expect(serverOutput).toBe(initialNowUtc);
    expect(vi.getTimerCount()).toBe(0);

    hooks.value = undefined;
    vi.stubGlobal("document", new EventTarget());
    expect(render(initialNowUtc)).toBe(serverOutput);
    expect(hooks.setNow).toHaveBeenLastCalledWith(serverNow);
  });

  it("does not reset elapsed time for rerenders, equivalent instants, or invalid replacement props", () => {
    render();
    advance(30_000);
    render();
    render("2026-11-05T18:00:00Z");
    for (const invalid of ["not-a-date", "2026-11-05T20:00:00", "2026-02-30T18:00:00Z"]) render(invalid);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:00:30.000Z");
    expect(vi.getTimerCount()).toBe(1);
    advance(30_000);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:01:00.000Z");
    render(serverNow);
    expect(hooks.setNow).toHaveBeenLastCalledWith("2026-11-05T18:01:00.000Z");
  });

  it("cleans up on unmount and ignores already queued visibility callbacks", () => {
    const added = vi.spyOn(documentEvents, "addEventListener");
    const removed = vi.spyOn(documentEvents, "removeEventListener");
    render();
    const [event, listener] = added.mock.calls[0]!;
    expect(event).toBe("visibilitychange");
    unmount();
    expect(removed).toHaveBeenCalledWith("visibilitychange", listener);
    expect(vi.getTimerCount()).toBe(0);
    hooks.setNow.mockClear();
    advance(90_000);
    documentEvents.dispatchEvent(new Event("visibilitychange"));
    (listener as () => void)();
    expect(hooks.setNow).not.toHaveBeenCalled();
  });

  it("rejects an invalid bootstrap timestamp instead of guessing from the device clock", () => {
    expect(() => render("invalid-server-time")).toThrow("valid server UTC timestamp");
    expect(vi.getTimerCount()).toBe(0);
  });
});
