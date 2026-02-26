import Link from "next/link";
import styles from "./page.module.css";
import { getUserDomains } from "../actions/domains";

export default async function DomainsDashboard() {
    const { domains, error } = await getUserDomains();

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

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            <div className={styles.domainList}>
                {domains && domains.length > 0 ? (
                    domains.map((domain: any) => (
                        <div key={domain.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
                            <div className={styles.domainInfo}>
                                <h3 className={styles.domainName}>{domain.domainName}</h3>
                                {domain.status === 'active' ? (
                                    <span className={styles.statusActive}>Active</span>
                                ) : (
                                    <span className={styles.statusExpiring}>{domain.status || 'Pending'}</span>
                                )}
                            </div>
                            <div className={styles.domainActions}>
                                <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Manage DNS</button>
                                <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>Settings</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>You don't have any domains yet</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Start your journey by searching for a new domain name.</p>
                        <Link href="/domains/search" className="btn btn-primary">
                            Search Domains
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
