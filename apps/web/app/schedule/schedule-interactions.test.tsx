import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { groupPublishedProgramByDay } from "@not-alone/domain";
import { event2026Snapshot } from "@not-alone/test-fixtures/event-2026";
import { ScheduleBrowser } from "../../components/schedule-browser";
import type { ScheduleDay } from "./schedule-presentation";
import { usePublicationRefresh } from "./use-publication-refresh";

const hooks = vi.hoisted(() => ({
  states: [] as unknown[], stateIndex: 0,
  refs: [] as { current: unknown }[], refIndex: 0,
  effects: [] as (() => void)[],
  now: "2026-11-03T20:00:00.000Z"
}));
vi.mock("./use-publication-refresh", () => ({ usePublicationRefresh: vi.fn() }));
vi.mock("./use-event-clock", () => ({ useEventClock: () => hooks.now }));
vi.mock("react", async importOriginal => ({
  ...await importOriginal<typeof import("react")>(),
  useId: () => "schedule-test",
  useState: (initial: unknown) => {
    const index = hooks.stateIndex++;
    if (!(index in hooks.states)) hooks.states[index] = typeof initial === "function" ? initial() : initial;
    return [hooks.states[index], (value: unknown) => { hooks.states[index] = typeof value === "function" ? value(hooks.states[index]) : value; }];
  },
  useRef: (initial: unknown) => {
    const index = hooks.refIndex++;
    return hooks.refs[index] ??= { current: initial };
  },
  useEffect: (run: () => void) => { hooks.effects.push(run); }
}));

function findElement(node: ReactNode, predicate: (element: ReactElement<Record<string, unknown>>) => boolean): ReactElement<Record<string, unknown>> | undefined {
  if (!isValidElement<Record<string, unknown>>(node)) return undefined;
  if (predicate(node)) return node;
  for (const child of Children.toArray(node.props.children as ReactNode)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return undefined;
}

const days = groupPublishedProgramByDay(event2026Snapshot);
function render(updatedDays: ScheduleDay[] = days) {
  hooks.stateIndex = 0;
  hooks.refIndex = 0;
  hooks.effects = [];
  return ScheduleBrowser({ days: updatedDays, eventTimeZone: event2026Snapshot.event.timeZone, initialNowUtc: "2026-11-01T20:00:00Z" });
}

beforeEach(() => {
  hooks.states = [];
  hooks.refs = [];
  hooks.now = "2026-11-03T20:00:00.000Z";
  vi.mocked(usePublicationRefresh).mockClear();
});

describe("schedule day selection", () => {
  it("keeps the user-selected day when a refresh supplies new published data", () => {
    const first = render();
    const monday = findElement(first, element => element.props.id === "schedule-test-tab-2026-11-02")!;
    (monday.props.onClick as () => void)();
    const refreshedDays = days.map(day => ({ ...day, items: day.items.map(item => ({ ...item, title: `Updated: ${item.title}` })) }));
    const refreshed = render(refreshedDays);
    const selected = findElement(refreshed, element => element.props["aria-selected"] === true)!;
    expect(selected.props.id).toBe("schedule-test-tab-2026-11-02");
    expect(usePublicationRefresh).toHaveBeenCalledTimes(2);
    expect(findElement(refreshed, element => element.type === "h3" && String(element.props.children).startsWith("Updated: "))).toBeDefined();
  });

  it("offers no jump action", () => {
    expect(findElement(render(), element => String(element.props["aria-label"]).startsWith("Jump to"))).toBeUndefined();
  });
});
