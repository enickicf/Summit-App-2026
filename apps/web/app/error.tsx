"use client";

import Link from "next/link";
import { RotateCw } from "lucide-react";
import styles from "./contact/support.module.css";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <h1>This page could not load</h1>
    <p>Please try again, or return to the Summit website.</p>
    <button className={styles.action} type="button" onClick={() => retry()}>
      <RotateCw size={18} aria-hidden="true" /> Try again
    </button>
    <nav className={styles.links} aria-label="Page recovery">
      <Link href="/">Summit home</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  </main>;
}
