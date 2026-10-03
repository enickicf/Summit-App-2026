"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { AskAiForm } from "../app/ask-ai/ask-ai-form";
import styles from "./ask-ai-widget.module.css";

// Owner (Sept 23): Ask AI leaves the Summit menu and becomes a floating button in the bottom-right
// corner that opens the same Ask AI form in a small panel. The /ask-ai page itself stays reachable.
// The Awards pages keep their own approved layout (no widget there).
export function AskAiWidget() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (pathname === "/ask-ai" || pathname.startsWith("/awards") || pathname.startsWith("/staff")) return null;

  return <div className={styles.widget}>
    {open && <section className={styles.panel} id={panelId} role="dialog" aria-label="Ask AI">
      <div className={styles.panelHeader}>
        <p className={styles.panelTitle}><Sparkles size={18} aria-hidden="true" /> Ask AI</p>
        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close Ask AI"><X size={18} aria-hidden="true" /></button>
      </div>
      <p className={styles.scope} id="ask-ai-scope">Ask about the Not Alone Summit, the Not Alone Awards, or the Inspiring Children Foundation.</p>
      <AskAiForm />
    </section>}
    <button type="button" className={styles.launcher} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={panelId} data-analytics-id="ask-ai-launcher">
      <Sparkles size={20} aria-hidden="true" /><span>Ask AI</span>
    </button>
  </div>;
}
