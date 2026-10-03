import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import styles from "../contact/support.module.css";

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Inspiring Children Foundation through its official donation page."
};

export default function DonatePage() {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <p className={styles.eyebrow}>Support young people</p>
    <h1>Donate</h1>
    <div className={styles.section}>
      <h2>Support Inspiring Children Foundation</h2>
      <p>Donations support the Inspiring Children Foundation's work with young people.</p>
      <a className={styles.action} href="https://www.inspiringchildren.org/donate" aria-describedby="donation-destination">
        Continue to ICF donations <ArrowUpRight size={18} aria-hidden="true" />
      </a>
      <p className={styles.note} id="donation-destination">Continues to inspiringchildren.org. No payment is collected on this website.</p>
    </div>
  </main>;
}
