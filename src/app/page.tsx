import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <div className={styles.backgroundGlow}></div>
      <div className="container">
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>
            <span className={styles.revealText}>Find Your</span><br />
            <span className={styles.revealText}>Perfect</span><br />
            <span className={`${styles.revealText} ${styles.highlightText}`}>Domain Name</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Search, register, and manage your domains and DNS easily.
          </p>
          <div className={styles.heroCta}>
            <Link href="/domains/search" className="btn btn-primary">Search Domains</Link>
            <Link href="/domains" className="btn btn-outline">My Portfolio</Link>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className="glass-panel">
            <h3>Name.com Integration</h3>
            <p>Purchase and register domains instantly at the best prices.</p>
          </div>
          <div className="glass-panel">
            <h3>Cloudflare DNS</h3>
            <p>Automated zone creation and advanced DNS record management.</p>
          </div>
          <div className="glass-panel">
            <h3>Secure Dashboard</h3>
            <p>A clean, focused environment for all your domain operations.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
