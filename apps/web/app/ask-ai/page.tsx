import type { Metadata } from "next";
import { AskAiForm } from "./ask-ai-form";
import styles from "./ask-ai.module.css";

export const metadata: Metadata = {
  title: "Ask AI",
  description: "Questions about the Not Alone Summit, the Not Alone Awards, and the Inspiring Children Foundation."
};

export default function AskAiPage() {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>Not Alone Summit 2026</p>
      <h1>Ask AI</h1>
      <p className={styles.lead} id="ask-ai-scope">Ask about the Not Alone Summit, the Not Alone Awards, or the Inspiring Children Foundation.</p>
    </header>
    <AskAiForm />
  </main>;
}
