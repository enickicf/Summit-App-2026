import type { Metadata } from "next";
import type { ReactNode } from "react";
import styles from "./staff.module.css";

// The staff portal has its own chrome (the public site header, footer and widgets hide themselves on
// /staff) and is never indexed.
export const metadata: Metadata = {
  title: { absolute: "Not Alone Staff Portal" },
  robots: { index: false, follow: false }
};

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <div className={styles.portal}>{children}</div>;
}
