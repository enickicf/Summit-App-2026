import styles from "./invitation-badge.module.css";
export function InvitationBadge({tier}:{tier:"VIP"|"Uber VIP"}) {
  return <span className={styles.badge} data-invitation-tier={tier}>{tier}</span>;
}
