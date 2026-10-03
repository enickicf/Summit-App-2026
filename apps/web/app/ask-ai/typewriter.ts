"use client";

import { useEffect, useState } from "react";

export const exampleQuestions = [
  "What is the Inspiring Children Foundation?",
  "How many kids does Inspiring Children serve?",
  "When is the Not Alone Summit?",
  "Where is the Summit being held?",
  "Who is hosting the Not Alone Awards?",
  "What happens on Monday, November 2?",
  "What are ICF's 10 pillars?",
  "How can I donate to Inspiring Children?"
] as const;

/** Types example questions into the empty field's placeholder; static under reduced motion. */
export function useTypewriterPlaceholder(active: boolean) {
  const [text, setText] = useState<string>(exampleQuestions[0]);
  useEffect(() => {
    if (!active || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let question = 0;
    let length = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const target = exampleQuestions[question]!;
      length += deleting ? -1 : 1;
      setText(target.slice(0, length));
      let delay = deleting ? 28 : 55;
      if (!deleting && length === target.length) { deleting = true; delay = 1800; }
      else if (deleting && length === 0) { deleting = false; question = (question + 1) % exampleQuestions.length; delay = 400; }
      timer = setTimeout(tick, delay);
    };
    setText("");
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [active]);
  return text;
}
