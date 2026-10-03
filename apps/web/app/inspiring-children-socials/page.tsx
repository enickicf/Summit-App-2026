import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { inspiringChildrenSocials, SocialIcon } from "../../components/social-icons";
import styles from "./socials.module.css";

export const metadata: Metadata = {
  title: "Inspiring Children Socials",
  description: "Follow the Inspiring Children Foundation on social media."
};

export default function InspiringChildrenSocialsPage() {
  return <main id="main-content" tabIndex={-1} className={styles.page}>
    <p className={styles.eyebrow}>Inspiring Children Foundation</p>
    <h1>Inspiring Children Socials</h1>
    <p className={styles.lead}>Follow the Inspiring Children Foundation for stories, programs and updates from Las Vegas and beyond.</p>
    <ul className={styles.list}>
      {inspiringChildrenSocials.map(social => <li key={social.platform}><a href={social.href}>
        <span className={styles.icon}><SocialIcon platform={social.platform} size={22} /></span>
        <span className={styles.text}><strong>{social.label}</strong><span>{social.handle}</span></span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </a></li>)}
    </ul>
  </main>;
}
