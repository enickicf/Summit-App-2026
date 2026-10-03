import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import styles from "./support.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Inspiring Children Foundation about the Not Alone Summit and Awards."
};

const icfWebsite = "https://www.inspiringchildren.org";
const contactStaff = "https://www.inspiringchildren.org/contact-staff";

// Mirrors the official ICF contact menu; every destination is an ICF-owned page or form.
const contactLinks = [
  { label: "Contact Staff", href: contactStaff },
  { label: "Request a Scholarship", href: "https://www.inspiringchildren.org/scholarships" },
  { label: "Subscribe to our Email Newsletter", href: "https://www.inspiringchildren.org/updates" },
  { label: "Subscribe to Farmers Market Newsletter", href: "https://www.inspiringchildren.org/farm" }
] as const;

export default function ContactPage() {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <p className={styles.eyebrow}>Get in touch</p>
    <h1>Contact Us</h1>
    <p className={styles.website}>ICF website: <a href={icfWebsite}>inspiringchildren.org</a></p>
    <div className={`${styles.section} ${styles.contactInfo}`}>
      <p>Please see below for ways to contact us and submit your info. If you believe something is missing from this menu, you can <a href={contactStaff}>click here</a> to let us know.</p>
      <p>If you would like to send us mail, the address is <span className={styles.address}>1801 N Martin L King Blvd #271258, Las Vegas, NV 89127</span>.</p>
      <ul className={styles.contactList}>
        {contactLinks.map(link => <li key={link.label}><a href={link.href}>{link.label}<ArrowUpRight size={18} aria-hidden="true" /></a></li>)}
      </ul>
    </div>
  </main>;
}
