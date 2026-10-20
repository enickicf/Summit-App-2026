"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { askAi, questionSchema, type AskAiResult } from "./request";
import { useTypewriterPlaceholder } from "./typewriter";
import styles from "./ask-ai.module.css";

export function AskAiFeedback({ pending, result, submittedQuestion }: {
  pending: boolean;
  result: AskAiResult | null;
  submittedQuestion: string;
}) {
  return <>
    <div className={styles.response} role="status" aria-atomic="true">
      {pending ? <p>Checking event information...</p> : result?.status === "success" ? <>
        <h2>Answer</h2>
        <p className={styles.question}>{submittedQuestion}</p>
        <p>{result.answer}</p>
        {Boolean(result.sources?.length) && <div className={styles.sources}><strong>Sources</strong><ul>{result.sources?.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul></div>}
      </> : null}
    </div>
    <p className={styles.error} id="ask-ai-error" role="alert">{result?.status === "error" ? result.message : ""}</p>
  </>;
}

export function AskAiForm({ suggestions = ["When will I get ticket confirmation?", "What time do Awards doors open?", "What is Nevada Mental Health Day?"] }: { suggestions?: string[] } = {}) {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [result, setResult] = useState<AskAiResult | null>(null);
  const [pending, setPending] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => () => {
    activeRequest.current?.abort();
    activeRequest.current = null;
  }, []);
  const placeholder = useTypewriterPlaceholder(question.length === 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeRequest.current) return;
    const parsed = questionSchema.safeParse(question);
    if (!parsed.success) {
      setResult({ status: "error", message: "Please enter a question between 2 and 500 characters." });
      input.current?.focus();
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(true);
    setResult(null);
    setSubmittedQuestion(parsed.data);
    const nextResult = await askAi(parsed.data, controller.signal);
    // Ignore a response after the visitor leaves this page.
    if (activeRequest.current !== controller) return;
    activeRequest.current = null;
    setPending(false);
    setResult(nextResult);
  }

  const invalid = result?.status === "error" && !questionSchema.safeParse(question).success;

  return <div className={styles.card}>
    <form className={styles.form} onSubmit={submit} noValidate aria-busy={pending}>
      <label htmlFor="ask-ai-question">Your question</label>
      <textarea
        ref={input}
        id="ask-ai-question"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        rows={3}
        placeholder={placeholder}
        minLength={2}
        maxLength={500}
        required
        readOnly={pending}
        aria-invalid={invalid}
        aria-describedby={`ask-ai-scope${result?.status === "error" ? " ask-ai-error" : ""}`}
      />
      <button className={styles.submit} type="submit" disabled={pending}>
        <Send size={18} aria-hidden="true" /> {pending ? "Asking..." : "Ask"}
      </button>
    </form>
    <div className={styles.suggestions} aria-label="Example questions">{suggestions.map(suggestion => <button key={suggestion} type="button" onClick={() => { setQuestion(suggestion); input.current?.focus(); }}>{suggestion}</button>)}</div>
    <AskAiFeedback pending={pending} result={result} submittedQuestion={submittedQuestion} />
  </div>;
}
