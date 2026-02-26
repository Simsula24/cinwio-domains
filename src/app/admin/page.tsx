import { getUsers, getDomains } from '../actions/admin';
import styles from './admin.module.css';

export default async function AdminDashboard() {
    const { users } = await getUsers();
    const { domains } = await getDomains();

    const totalUsers = users?.length || 0;
    const totalDomains = domains?.length || 0;
    const adminCount = users?.filter((u: any) => u.role === 'admin' || u.role === 'master').length || 0;

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h2>Master Admin Dashboard</h2>
                    <p className={styles.subtitle}>Overview of system statistics and data</p>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totalUsers}</div>
                    <div className={styles.statLabel}>Total Users</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totalDomains}</div>
                    <div className={styles.statLabel}>Registered Domains</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{adminCount}</div>
                    <div className={styles.statLabel}>Admins</div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Welcome to the Admin Interface</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    Use the sidebar navigation to manage user accounts and domains.
                    You can grant users admin privileges, assign manually purchased domains to their accounts, and oversee the entire system.
                </p>
            </div>
        </div>
    );
}
