import { Heart } from "lucide-react";
import { SiteImage } from "./site-image";
import styles from "./classic-summit.module.css";

// Footer section of the live ICF Summit page, word for word.
const icf = "https://www.inspiringchildren.org";
const socials = [
  { label: "Facebook", href: "https://www.facebook.com/InspiringChildrenFoundation", path: "M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H7v4h2v7h4v-7h3l1-4h-4V9c0-.6.4-1 1-1z" },
  { label: "Instagram", href: "https://www.instagram.com/notalonechallenge", path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" },
  { label: "X (Twitter)", href: "https://twitter.com/inspiringchldrn", path: "M4 4h4.5l4 5.6L17 4h3l-6.1 7.1L21 20h-4.5l-4.3-6-5.2 6H4l6.7-7.7z" },
  { label: "YouTube", href: "https://www.youtube.com/@InspiringChildrenFoundation", path: "M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15V9l5.2 3z" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/notalonechallenge/", path: "M4.5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3 9h3v12H3zm6 0h3v1.7c.6-1 1.8-2 3.8-2 3.3 0 4.2 2.1 4.2 5.2V21h-3v-6.3c0-1.6-.3-2.9-2-2.9s-3 1.1-3 3V21H9z" }
];

export function ClassicFooter() {
  return <footer className={styles.footer}>
    {/* Owner (Sept 21): a donate link at the bottom of every Summit page. */}
    <div className={styles.footerDonate}><p>Help make the Not Alone Summit possible.</p><a href="https://www.inspiringchildren.org/donate"><Heart fill="currentColor" aria-hidden="true" />Donate</a></div>
    <SiteImage className={styles.footerLogo} src="/classic/icf-one-line.webp" alt="Inspiring Children Foundation" sizes="(max-width: 767px) 90vw, 872px" />
    <h4><a href={`${icf}/partner-with-us`}>Partner with us.</a></h4>
    <h4>We are a non-profit IRS 501(c)(3) charitable organization. Our EIN is 20-1638145.</h4>
    <p>For over 25 years, the Inspiring Children Foundation (ICF) has been transforming the lives of at-risk youth in Las Vegas through a whole human approach to physical, emotional and mental health. ICF serves hundreds of youth in-person and millions online. 95% of students in their Leadership Program have earned college scholarships for academics &amp; athletics (tennis) to some of the best colleges in the US. Parts of the program are now being duplicated in 22 cities by other non profits. <a href={`${icf}/home`}>Click here to learn more.</a></p>
    <p><a href="/contact">Contact Inspiring Children Foundation</a></p>
    <p><strong><em>Our programs, along with the contents of our website, are for informational purposes only. This website is not for emergency or crisis help. If you or someone you know is in crisis right now, please call the Suicide Prevention Lifeline at <a href="tel:988">988</a>. If you require emergency help, please call 911 or go to your local hospital emergency room. <a href={`${icf}/disclaimer`}>Click here for our full disclaimer.</a></em></strong></p>
    <p>We are an equal opportunity employer and all qualified applicants will receive consideration for employment without regard to race, color, religion, sex, sexual orientation, gender identity or expression, pregnancy, age, national origin, disability status, genetic information, protected veteran status, or any other characteristic protected by law.</p>
    <nav className={styles.socials} aria-label="Inspiring Children Foundation social media">
      {socials.map(social => <a key={social.label} href={social.href} aria-label={social.label}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d={social.path} fill="currentColor" /></svg></a>)}
    </nav>
  </footer>;
}
