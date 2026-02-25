import Link from "next/link";
import styles from "./page.module.css";

export default function DnsManagement() {
    return (
        <div className={styles.dnsContainer}>
            <div className={styles.dnsHeader}>
                <div>
                    <h2>DNS Management</h2>
                    <p className={styles.subtitle}>Powered by Cloudflare</p>
                </div>
            </div>

            <div className={styles.recordsSection}>
                <div className={styles.recordsHeader}>
                    <h3>DNS Records</h3>
                    <button className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }} disabled>Add Record</button>
                </div>

                <div className={styles.recordsTableWrapper}>
                    <table className={styles.recordsTable}>
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Content</th>
                                <th>TTL</th>
                                <th>Proxy Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                    No domain selected or no records found.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
