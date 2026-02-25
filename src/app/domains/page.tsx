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
                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.domainInfo}>
                        <h3 className={styles.domainName}>example.com</h3>
                        <span className={styles.statusActive}>Active</span>
                    </div>
                    <div className={styles.domainActions}>
                        <Link href="/domains/example.com" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Manage
                        </Link>
                    </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.domainInfo}>
                        <h3 className={styles.domainName}>my-awesome-startup.tech</h3>
                        <span className={styles.statusExpiring}>Expiring Soon</span>
                    </div>
                    <div className={styles.domainActions}>
                        <Link href="/domains/my-awesome-startup.tech" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                            Manage
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
