import styles from "./page.module.css";
import { getUserDomains } from "../actions/domains";
import DnsManager from "./DnsManager";

export default async function DnsManagement() {
    const { domains, error } = await getUserDomains();

    return (
        <div className={styles.dnsContainer}>
            {error ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            ) : (
                <DnsManager domains={domains || []} />
            )}
        </div>
    );
}
