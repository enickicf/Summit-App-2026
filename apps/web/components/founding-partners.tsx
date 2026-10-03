import { SiteImage } from "./site-image";
import styles from "./founding-partners.module.css";

// Owner (Sept 23): a Founding Partners block right under the Founders section on both 2026 sites:
// the Steven & Alexandra Cohen Foundation and NAMI (national logo), as clean transparent logos.
// The Summit page is white (dark logos); the Awards page is black (white logos).
const logos = {
  summit: [
    { src: "/images/cohen-foundation-give.png", alt: "Steven & Alexandra Cohen Foundation" },
    { src: "/2026-partners/nami.png", alt: "NAMI, National Alliance on Mental Illness" }
  ],
  awards: [
    { src: "/images/cohen-foundation-give-white.png", alt: "Steven & Alexandra Cohen Foundation" },
    { src: "/2026-partners/nami-white.png", alt: "NAMI, National Alliance on Mental Illness" }
  ]
} as const;

export function FoundingPartners({ variant, headingLevel = "h2" }: { variant: "summit" | "awards"; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return <section className={`${styles.section} ${styles[variant]}`} id="founding-partners" aria-labelledby="founding-partners-title">
    <Heading id="founding-partners-title" className={styles.title}>Founding Partners</Heading>
    <div className={styles.logos}>
      {logos[variant].map(logo => <div key={logo.src} className={styles.logo}>
        <SiteImage src={logo.src} alt={logo.alt} sizes="(max-width: 600px) 70vw, 320px" />
      </div>)}
    </div>
  </section>;
}
