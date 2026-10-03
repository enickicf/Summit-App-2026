import { Children, isValidElement, type FormEvent, type ReactElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AskAiForm } from "./ask-ai-form";

// Test event wiring with controlled hooks; browser interaction QA is separate.
const hooks = vi.hoisted(() => ({
  state: [] as unknown[],
  refs: [] as { current: unknown }[],
  stateIndex: 0,
  refIndex: 0,
  writes: vi.fn(),
  effects: [] as (() => void | (() => void))[]
}));

vi.mock("react", async importOriginal => ({
  ...await importOriginal<typeof import("react")>(),
  useState: () => {
    const index = hooks.stateIndex++;
    return [hooks.state[index], (value: unknown) => {
      hooks.state[index] = value;
      hooks.writes(index, value);
    }];
  },
  useRef: () => hooks.refs[hooks.refIndex++],
  useEffect: (run: () => void | (() => void)) => { hooks.effects.push(run); }
}));

function findElement(node: ReactNode, type: string): ReactElement<Record<string, unknown>> | undefined {
  if (!isValidElement<Record<string, unknown>>(node)) return undefined;
  if (node.type === type) return node;
  for (const child of Children.toArray(node.props.children as ReactNode)) {
    const found = findElement(child, type);
    if (found) return found;
  }
  return undefined;
}

function render() {
  hooks.stateIndex = 0;
  hooks.refIndex = 0;
  return AskAiForm();
}

function submission(tree: ReactNode) {
  const form = findElement(tree, "form")!;
  return form.props.onSubmit as (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

function submitEvent() {
  return { preventDefault: vi.fn() } as unknown as FormEvent<HTMLFormElement>;
}

describe("Ask AI interaction wiring", () => {
  const focus = vi.fn();

  beforeEach(() => {
    hooks.state = [" Where is the schedule? ", "", null, false];
    hooks.refs = [{ current: null }, { current: { focus } }];
    hooks.effects = [];
    hooks.writes.mockClear();
    focus.mockClear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("validates whitespace locally, prevents submission, and returns focus to the question", async () => {
    hooks.state[0] = "   ";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const event = submitEvent();
    await submission(render())(event);
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(focus).toHaveBeenCalledOnce();
    const field = findElement(render(), "textarea")!;
    expect(field.props["aria-invalid"]).toBe(true);
    expect(field.props["aria-describedby"]).toContain("ask-ai-error");
    expect(field.props.name).toBeUndefined();
  });

  it("blocks a second submission even before the pending render and then unlocks", async () => {
    let resolveResponse!: (response: Response) => void;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(resolve => { resolveResponse = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const submit = submission(render());
    const first = submit(submitEvent());
    await submit(submitEvent());
    expect(fetchMock).toHaveBeenCalledOnce();
    const pendingTree = render();
    expect(findElement(pendingTree, "button")!.props.disabled).toBe(true);
    expect(findElement(pendingTree, "textarea")!.props.readOnly).toBe(true);
    expect(findElement(pendingTree, "form")!.props["aria-busy"]).toBe(true);
    resolveResponse(Response.json({ answer: "Published answer" }));
    await first;
    expect(hooks.state[1]).toBe("Where is the schedule?");
    expect(hooks.state[2]).toEqual({ status: "success", answer: "Published answer" });
    expect(findElement(render(), "button")!.props.disabled).toBe(false);
    expect(hooks.state[0]).toBe(" Where is the schedule? ");
  });

  it("keeps the question on failure and retries only after another submission", async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("Offline"))
      .mockResolvedValueOnce(Response.json({ answer: "Recovered answer" }));
    vi.stubGlobal("fetch", fetchMock);
    await submission(render())(submitEvent());
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(hooks.state[2]).toMatchObject({ status: "error" });
    expect(hooks.state[0]).toBe(" Where is the schedule? ");
    expect(findElement(render(), "button")!.props.disabled).toBe(false);
    await submission(render())(submitEvent());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(hooks.state[2]).toEqual({ status: "success", answer: "Recovered answer" });
  });

  it("aborts on unmount and ignores a late response", async () => {
    let resolveResponse!: (response: Response) => void;
    const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(resolve => { resolveResponse = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    const tree = render();
    const cleanup = hooks.effects[0]!();
    const request = submission(tree)(submitEvent());
    if (cleanup) cleanup();
    const signal = (fetchMock.mock.calls[0]![1] as RequestInit).signal!;
    expect(signal.aborted).toBe(true);
    hooks.writes.mockClear();
    resolveResponse(Response.json({ answer: "Late answer" }));
    await request;
    expect(hooks.writes).not.toHaveBeenCalled();
    expect(hooks.refs[0]!.current).toBeNull();
  });
});
