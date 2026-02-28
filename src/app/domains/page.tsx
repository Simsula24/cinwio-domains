import Link from "next/link";
import styles from "./page.module.css";
import { getUserDomains } from "../actions/domains";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { getTranslation } from "../i18n";

export default async function DomainsDashboard() {
    const { domains, error } = await getUserDomains();
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth || '', null);
    await pb.collection('users').authRefresh().catch(() => { });
    const lang = pb.authStore.model?.language || 'en';
    const t = (section: string, key: string) => getTranslation(lang, section, key);

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.dashboardHeader}>
                <div>
                    <h2>{t('domains', 'title')}</h2>
                    <p className={styles.subtitle}>{t('domains', 'subtitle')}</p>
                </div>
                <Link href="/domains/search" className="btn btn-primary">
                    {t('domains', 'buyNew')}
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
                                    <span className={styles.statusActive}>{t('common', 'active')}</span>
                                ) : (
                                    <span className={styles.statusExpiring}>{domain.status || t('common', 'pending')}</span>
                                )}
                            </div>
                            <div className={styles.domainActions}>
                                <Link href="/dns" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>{t('domains', 'manageDns')}</Link>
                                <Link href={`/domains/${domain.domainName}/settings`} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>{t('domains', 'settings')}</Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{t('domains', 'noDomainsTitle')}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{t('domains', 'noDomainsDesc')}</p>
                        <Link href="/domains/search" className="btn btn-primary">
                            {t('domains', 'searchDomains')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
