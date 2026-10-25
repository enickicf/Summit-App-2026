import { SiteImage } from "../../../components/site-image";
import { podcastStaffPassword, staffPassword } from "../../../lib/staff/auth";
import styles from "../staff.module.css";

export const dynamic = "force-dynamic";

export default async function StaffLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = staffPassword() !== null || podcastStaffPassword() !== null;
  return <main id="main-content" tabIndex={-1} className={styles.loginPage}>
    <form className={styles.loginCard} method="post" action="/api/staff/login">
      <SiteImage src="/images/na-summit-logo-black-2.png" alt="Not Alone Summit" sizes="120px" className={styles.loginLogo} />
      <h1>Staff Portal</h1>
      <p className={styles.loginLead}>Enter your staff password. Podcast partners receive access only to interview bookings.</p>
      <label className={styles.field}><span>Password</span><input type="password" name="password" autoComplete="current-password" required autoFocus disabled={!configured} /></label>
      {error === "password" && <p className={styles.error} role="alert">That password is not right.</p>}
      {(error === "unavailable" || !configured) && <p className={styles.error} role="alert">The portal password is not configured yet.</p>}
      <button type="submit" className={styles.button} disabled={!configured}>Sign in</button>
    </form>
  </main>;
}
