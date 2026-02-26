import Link from 'next/link';
import { checkAdmin } from '../actions/admin';
import styles from './admin.module.css';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await checkAdmin();

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h3>Master Admin</h3>
                </div>
                <nav className={styles.sidebarNav}>
                    <Link href="/admin" className={styles.navItem}>
                        Dashboard
                    </Link>
                    <Link href="/admin/users" className={styles.navItem}>
                        User Accounts
                    </Link>
                    <Link href="/admin/domains" className={styles.navItem}>
                        Domain Management
                    </Link>
                </nav>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
