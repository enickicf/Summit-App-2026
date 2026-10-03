import Link from "next/link";
import styles from "./year-tabs.module.css";

export function YearTabs({ section, activeYear, dark = false }: { section: "summit" | "awards"; activeYear: 2025 | 2026; dark?: boolean }) {
  return (
    <nav className={`year-tabs${dark ? " year-tabs-dark" : ""} ${styles.years}${dark ? ` ${styles.dark}` : ""}`} aria-label={`${section === "summit" ? "Summit" : "Awards"} year`}>
      <div className="year-tabs-label">
        <strong>{section === "summit" ? "Summit" : "Awards"}</strong>
      </div>
      <div className="year-tab-list">
        <Link className={activeYear === 2025 ? "active" : ""} href={section === "summit" ? "/2025" : "/awards/2025"} aria-current={activeYear === 2025 ? "page" : undefined}>
          <strong>2025</strong><span>Archive</span>
        </Link>
        <Link className={activeYear === 2026 ? "active" : ""} href={section === "summit" ? "/" : "/awards/2026"} aria-current={activeYear === 2026 ? "page" : undefined}>
          <strong>2026</strong><span>Current</span>
        </Link>
      </div>
    </nav>
  );
}
