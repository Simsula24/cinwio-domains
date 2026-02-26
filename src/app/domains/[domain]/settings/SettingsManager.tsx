"use client";

import { useState } from 'react';
import styles from './page.module.css';
import { toggleDomainAutorenew } from '../../../actions/domains';

export default function SettingsManager({
    domainName,
    dbDomain,
    nameComData
}: {
    domainName: string,
    dbDomain: any,
    nameComData: any
}) {
    const [autorenew, setAutorenew] = useState(!!dbDomain.autorenew);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fallbacks if Name.com fails to return or we don't have Dev API access
    const expirationDate = nameComData?.expireDate ? new Date(nameComData.expireDate).toLocaleDateString() : 'N/A';
    const createDate = nameComData?.createDate ? new Date(nameComData.createDate).toLocaleDateString() : new Date(dbDomain.created).toLocaleDateString();

    // We try to pull nameservers from name.com response, else show defaults
    const nameservers = nameComData?.nameservers || ['ns1.cloudflare.com', 'ns2.cloudflare.com'];

    const contacts = nameComData?.contacts || {
        registrant: { firstName: 'Simon', lastName: 'Hora', email: 'simon.hora.cz@gmail.com', country: 'CZ' }
    };

    const handleToggleAutorenew = async () => {
        setIsSubmitting(true);
        const res = await toggleDomainAutorenew(dbDomain.id, autorenew);
        if (res.success) {
            setAutorenew(!autorenew);
        } else {
            alert(res.error || 'Failed to toggle autorenew');
        }
        setIsSubmitting(false);
    };

    return (
        <div className={styles.grid}>
            {/* Payment & Auto-Renew Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Subscription & Dates</h3>
                </div>

                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Registered On</span>
                    <span className={styles.detailValue}>{createDate}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Expires On</span>
                    <span className={styles.detailValue}>{expirationDate}</span>
                </div>
                <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Status</span>
                    <span className={styles.detailValue} style={{ color: dbDomain.status === 'active' ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>
                        {dbDomain.status || 'Pending'}
                    </span>
                </div>

                <div className={styles.toggleWrapper}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={autorenew}
                            onChange={handleToggleAutorenew}
                            disabled={isSubmitting}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <div>
                        <span style={{ display: 'block', fontWeight: 500 }}>Auto-Renewal</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automatically renew before expiration.</span>
                    </div>
                </div>
            </div>

            {/* Nameservers Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Nameservers</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>DNS queries for this domain are currently routed through:</p>
                <div className={styles.dnsList}>
                    {nameservers.map((ns: string, idx: number) => (
                        <div key={idx}>{ns}</div>
                    ))}
                </div>
                <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }}>Edit Nameservers</button>
            </div>

            {/* Contact Information Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Contact Information</h3>
                </div>
                <ul className={styles.contactList}>
                    {Object.entries(contacts).slice(0, 2).map(([type, info]: [string, any], idx) => (
                        <li key={idx}>
                            <div className={styles.contactTitle}>{type}</div>
                            <div className={styles.detailRow} style={{ marginBottom: '0.2rem' }}>
                                <span className={styles.detailLabel}>Name</span>
                                <span className={styles.detailValue}>{info.firstName} {info.lastName}</span>
                            </div>
                            <div className={styles.detailRow} style={{ marginBottom: '0.2rem' }}>
                                <span className={styles.detailLabel}>Email</span>
                                <span className={styles.detailValue}>{info.email}</span>
                            </div>
                            <div className={styles.detailRow} style={{ marginBottom: 0 }}>
                                <span className={styles.detailLabel}>Country</span>
                                <span className={styles.detailValue}>{info.country}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                    Note: Domain contact info changes may require email verification.
                </p>
                <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }}>Update Contacts</button>
            </div>

            {/* Lock Status Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Domain Lock</h3>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Registrar lock prevents unauthorized transfers of your domain.
                </p>
                <div className={styles.toggleWrapper} style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                    <label className={styles.switch}>
                        <input type="checkbox" checked={!!nameComData?.locked} readOnly />
                        <span className={styles.slider}></span>
                    </label>
                    <span style={{ fontWeight: 500 }}>{nameComData?.locked ? 'Locked' : 'Unlocked'}</span>
                </div>
            </div>
        </div>
    );
}
