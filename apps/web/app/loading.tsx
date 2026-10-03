import styles from "./contact/support.module.css";

// Owner (Sept 21): no visible "Loading page..." flash before the page appears; screen readers still
// hear the loading status.
export default function Loading() {
  return <div className={styles.page} aria-busy="true">
    <p className={styles.visuallyHidden} role="status">Loading page...</p>
  </div>;
}
