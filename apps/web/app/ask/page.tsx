import type { Metadata } from "next";
import { AskAiForm } from "../ask-ai/ask-ai-form";
import styles from "../ask-ai/ask-ai.module.css";

export const metadata: Metadata = {
  title: "Ask the Summit assistant",
  description: "Ask about the Not Alone Summit, Nevada Mental Health Day, and the Not Alone Awards.",
  robots: { index: false, follow: false }
};

export default function AskPage() {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <header className={styles.intro}>
      <p className={styles.eyebrow}>Not Alone Summit &amp; Awards 2026</p>
      <h1>Ask the Summit assistant</h1>
      <p className={styles.lead} id="ask-ai-scope">Ask about the published schedule, attire, event logistics, Nevada Mental Health Day, the Not Alone Awards, or the Inspiring Children Foundation.</p>
    </header>
    <AskAiForm />
  </main>;
}
