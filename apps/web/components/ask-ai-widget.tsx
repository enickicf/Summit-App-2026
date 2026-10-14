"use client";

import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { AskAiForm } from "../app/ask-ai/ask-ai-form";
import styles from "./ask-ai-widget.module.css";

// Owner (Sept 23): Ask AI leaves the Summit menu and becomes a floating button in the bottom-right
// corner that opens the same Ask AI form in a small panel. The /ask-ai page itself stays reachable.
// The same public-data assistant is available on Summit, Awards, and Community Day.
export function AskAiWidget() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [actionsVisibleOnPhone, setActionsVisibleOnPhone] = useState(false);
  const panelId = useId();
  const suggestions = pathname.startsWith("/awards")
    ? ["When do the Awards start?", "Who is hosting the Awards?", "What is the Not Alone program?"]
    : pathname === "/community-day"
      ? ["What happens on Community Day?", "When do Awards doors open?", "What does Inspiring Children Foundation do?"]
      : ["What is the schedule for November 3?", "Who are the Bryan Brothers?", "What does Inspiring Children Foundation do?"];

  useEffect(() => {
    if (pathname !== "/community-day") return;
    const actions = document.getElementById("community-day-actions");
    if (!actions) return;
    const phone = window.matchMedia("(max-width: 760px)");
    const observer = new IntersectionObserver(([entry]) => {
      setActionsVisibleOnPhone(Boolean(entry?.isIntersecting && phone.matches));
    });
    const onResize = () => setActionsVisibleOnPhone(phone.matches && actions.getBoundingClientRect().bottom > 0 && actions.getBoundingClientRect().top < window.innerHeight);
    observer.observe(actions);
    phone.addEventListener("change", onResize);
    return () => {
      observer.disconnect();
      phone.removeEventListener("change", onResize);
      setActionsVisibleOnPhone(false);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (pathname === "/ask-ai" || pathname.startsWith("/staff")) return null;

  return <div className={`${styles.widget}${actionsVisibleOnPhone && !open ? ` ${styles.hiddenByActions}` : ""}`}>
    {open && <section className={styles.panel} id={panelId} role="dialog" aria-label="Ask AI">
      <div className={styles.panelHeader}>
        <p className={styles.panelTitle}><Sparkles size={18} aria-hidden="true" /> Ask AI</p>
        <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="Close Ask AI"><X size={18} aria-hidden="true" /></button>
      </div>
      <p className={styles.scope} id="ask-ai-scope">Ask about the Not Alone Summit, the Not Alone Awards, or the Inspiring Children Foundation.</p>
      <AskAiForm suggestions={suggestions} />
    </section>}
    <button type="button" className={styles.launcher} onClick={() => setOpen(value => !value)} aria-expanded={open} aria-controls={panelId} data-analytics-id="ask-ai-launcher">
      <Sparkles size={20} aria-hidden="true" /><span>Ask AI</span>
    </button>
  </div>;
}
