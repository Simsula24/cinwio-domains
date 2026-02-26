import Link from 'next/link';
import styles from './page.module.css';
import { getDomainDetails } from '../../../actions/domains';
import SettingsManager from './SettingsManager';

export default async function DomainSettings({ params }: { params: { domain: string } }) {
    // Await params if using Next.js 15+ to grab url params
    const resolvedParams = await params;
    const { domain } = resolvedParams;

    const { dbDomain, nameComData, error } = await getDomainDetails(domain);

    if (error || !dbDomain) {
        return (
            <div className={styles.container}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px' }}>
                    {error || 'Domain not found or unauthorized access.'}
                    <br />
                    <Link href="/domains" style={{ textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>Back to Domains Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>{domain}</h2>
                    <p className={styles.subtitle}>Manage your domain settings, billing, and technical contacts.</p>
                </div>
                <Link href="/domains" className="btn btn-outline">
                    Back to Dashboard
                </Link>
            </div>

            <SettingsManager
                domainName={domain}
                dbDomain={dbDomain}
                nameComData={nameComData}
            />
        </div>
    );
}
