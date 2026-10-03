"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import source from "../lib/original-sites.json";
import { Heart } from "lucide-react";
import { SiteImage } from "./site-image";
import { notAloneSocials, SocialIcon } from "./social-icons";
import styles from "./site-shell.module.css";
import { ClassicFooter } from "./classic-footer";
import { siteVariant } from "../lib/site-variant";

function linkedFooterSuffix(text: string, suffix: string, href: string, label: string) {
  if (!text.endsWith(suffix)) return text;
  return <>{text.slice(0, -suffix.length)}<a href={href} aria-label={label}>{suffix}</a></>;
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/staff")) return null; // Owner (Sept 23): the staff portal has its own chrome.
  const fromAwards = useSearchParams().get("from") === "awards";
  const awards = pathname.startsWith("/awards") || (pathname.startsWith("/directory/") && fromAwards);
  if (siteVariant === "classic") return <ClassicFooter />;
  if (awards) return <footer className={`${styles.footer} ${styles.awardsFooter}`}>
    <p><strong>Not Alone Awards</strong><br />An Inspiring Children Foundation event.<br />Powered by the Steven &amp; Alexandra Cohen Foundation.</p>
    <nav aria-label="Footer navigation"><Link href="/contact">Contact</Link><a href="https://www.inspiringchildren.org">Inspiring Children Foundation</a></nav>
    {pathname === "/awards/2025" && <details><summary>About Inspiring Children Foundation</summary><p>{source.summit.footer[1]}</p><p>{linkedFooterSuffix(source.summit.footer[2]!, "Click here to learn more.", "https://www.inspiringchildren.org/home", "Learn more about Inspiring Children Foundation")}</p><p>{linkedFooterSuffix(source.summit.footer[4]!, "Click here for our full disclaimer.", "https://www.inspiringchildren.org/disclaimer", "Read our disclaimer")} <a href="tel:988">Call 988</a></p><p>{source.summit.footer[5]}</p></details>}
  </footer>;
  return <footer className={`${styles.footer} ${styles.summitFooter}`}>
    {/* Owner (Sept 21): a donate link at the bottom of every Summit page. */}
    <div className={styles.footerDonate}><p>Help make the Not Alone Summit possible.</p><a href="https://www.inspiringchildren.org/donate"><Heart fill="currentColor" aria-hidden="true" />Donate</a></div>
    <SiteImage className={styles.footerLogo} src="/images/icf-logo.webp" alt="Inspiring Children Foundation" sizes="100px" loading="eager" />
    <h2><a href="https://www.inspiringchildren.org/partner-with-us">Partner with us.</a></h2>
    <p>{source.summit.footer[1]}</p><p>{linkedFooterSuffix(source.summit.footer[2]!, "Click here to learn more.", "https://www.inspiringchildren.org/home", "Click here to learn more about Inspiring Children Foundation")}</p>
    <p>{linkedFooterSuffix(source.summit.footer[4]!, "Click here for our full disclaimer.", "https://www.inspiringchildren.org/disclaimer", "Click here for our full disclaimer from Inspiring Children Foundation")} <a href="tel:988">Call 988</a></p><p>{source.summit.footer[5]}</p>
    <div className={styles.footerConnect}>
      <h2 className={styles.socialsTitle} id="not-alone-socials">Not Alone Socials</h2>
      <nav aria-labelledby="not-alone-socials" className={styles.socials}>{notAloneSocials.map(social => <a key={social.platform} href={social.href} aria-label={`${social.label}: ${social.handle}`}><SocialIcon platform={social.platform} /><span>{social.label}</span></a>)}</nav>
      <nav aria-label="Footer navigation" className={styles.footerLinks}><Link href="/contact">Contact Inspiring Children Foundation</Link>{pathname !== "/inspiring-children-socials" && <Link href="/inspiring-children-socials">Inspiring Children Socials</Link>}</nav>
    </div>
  </footer>;
}
