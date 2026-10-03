import Link from "next/link";
import styles from "./contact/support.module.css";

export default function NotFound() {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <p className={styles.eyebrow}>404</p>
    <h1>Page not found</h1>
    <p>The page may have moved, or the address may be incorrect.</p>
    <nav className={styles.links} aria-label="Available destinations">
      <Link href="/summit">Summit</Link>
      <Link href="/awards">Awards</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  </main>;
}
