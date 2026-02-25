import Link from "next/link";
import styles from "./page.module.css";

export default function DomainsDashboard() {
    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
                <div>
                    <h2>My Domains</h2>
                    <p className={styles.subtitle}>Manage your registered domains</p>
                </div>
                <Link href="/domains/search" className="btn btn-primary">
                    Buy New Domain
                </Link>
            </div>

            <div className={styles.domainList}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>You don't have any domains yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start your journey by searching for a new domain name.</p>
                    <Link href="/domains/search" className="btn btn-primary">
                        Search Domains
                    </Link>
                </div>
            </div>
        </div>
    );
}
