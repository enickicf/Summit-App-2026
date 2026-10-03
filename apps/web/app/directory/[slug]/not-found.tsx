import Link from "next/link";
import styles from "./profile.module.css";

export default function ProfileNotFound() {
  return <main id="main-content" tabIndex={-1} className={`contentPage ${styles.page}`}>
    <h1>Profile not found</h1>
    <p>This profile is not available in the requested edition.</p>
    <nav className={styles.actions} aria-label="Event directories">
      <Link className="backLink" href="/#directory">2026 Summit directory</Link>
      <Link className="backLink" href="/awards/2026#directory">2026 Awards guests</Link>
      <Link className="backLink" href="/2025#directory">2025 Summit archive</Link>
      <Link className="backLink" href="/awards/2025">2025 Awards archive</Link>
    </nav>
  </main>;
}
