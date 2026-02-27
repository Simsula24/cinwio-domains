"use client";

import { useState } from 'react';
import styles from './page.module.css';
import { toggleDomainAutorenew, updateDomainNameservers, updateDomainContacts } from '../../../actions/domains';

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
    const [isSubmittingNs, setIsSubmittingNs] = useState(false);
    const [isSubmittingContact, setIsSubmittingContact] = useState(false);

    // Edit modes
    const [isEditingNs, setIsEditingNs] = useState(false);
    const [isEditingContact, setIsEditingContact] = useState(false);

    // Form states
    const [nsList, setNsList] = useState<string[]>(nameComData?.nameservers || ['ns1.cloudflare.com', 'ns2.cloudflare.com']);

    // We try to grab contact data from Name.com, else initialize with placeholders.
    const initialContacts = nameComData?.contacts || {
        registrant: { firstName: 'Simon', lastName: 'Hora', email: 'simon.hora.cz@gmail.com', country: 'CZ' }
    };
    const [contactData, setContactData] = useState(initialContacts);

    // Fallbacks if Name.com fails to return or we don't have Dev API access
    const expirationDate = nameComData?.expireDate ? new Date(nameComData.expireDate).toLocaleDateString() : 'N/A';
    const createDate = nameComData?.createDate ? new Date(nameComData.createDate).toLocaleDateString() : new Date(dbDomain.created).toLocaleDateString();

    const handleToggleAutorenew = async () => {
        setIsSubmitting(true);
        const res = await toggleDomainAutorenew(dbDomain.id, autorenew); // passing current state will flip it
        if (res.success) {
            setAutorenew(!autorenew);
            alert(`Auto-renewal ${!autorenew ? 'enabled' : 'disabled'}. Note: Dev API might delay propagation.`);
        } else {
            alert(res.error || 'Failed to toggle autorenew');
        }
        setIsSubmitting(false);
    };

    const handleUpdateNameservers = async () => {
        setIsSubmittingNs(true);
        // Filter out completely empty rows 
        const validNs = nsList.filter(ns => ns.trim() !== '');

        const res = await updateDomainNameservers(domainName, validNs);
        if (res.success) {
            setIsEditingNs(false);
            setNsList(validNs);
        } else {
            alert(res.error || 'Failed to update nameservers');
        }
        setIsSubmittingNs(false);
    };

    const handleUpdateContact = async () => {
        setIsSubmittingContact(true);
        const res = await updateDomainContacts(domainName, contactData);
        if (res.success) {
            setIsEditingContact(false);
        } else {
            alert(res.error || 'Failed to update contact info');
        }
        setIsSubmittingContact(false);
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

                {isEditingNs ? (
                    <div style={{ marginTop: '1rem' }}>
                        {nsList.map((ns, idx) => (
                            <input
                                key={idx}
                                type="text"
                                className="form-input"
                                value={ns}
                                onChange={(e) => {
                                    const newList = [...nsList];
                                    newList[idx] = e.target.value;
                                    setNsList(newList);
                                }}
                                placeholder="ns1.cloudflare.com"
                                style={{ marginBottom: '0.5rem' }}
                            />
                        ))}
                        <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', marginBottom: '1rem' }} onClick={() => setNsList([...nsList, ''])}>+ Add Nameserver</button>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdateNameservers} disabled={isSubmittingNs}>
                                {isSubmittingNs ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditingNs(false)}>Cancel</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.dnsList}>
                            {nsList.map((ns: string, idx: number) => (
                                <div key={idx}>{ns}</div>
                            ))}
                        </div>
                        <button className="btn btn-outline" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setIsEditingNs(true)}>Edit Nameservers</button>
                    </>
                )}
            </div>

            {/* Contact Information Card */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h3>Contact Information</h3>
                </div>
                <ul className={styles.contactList}>
                    {Object.entries(contactData).slice(0, 1).map(([type, info]: [string, any], idx) => (
                        <li key={idx}>
                            <div className={styles.contactTitle}>{type}</div>
                            {isEditingContact ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input type="text" className="form-input" value={info.firstName} onChange={(e) => setContactData({ ...contactData, [type]: { ...info, firstName: e.target.value } })} placeholder="First Name" style={{ margin: 0 }} />
                                    <input type="text" className="form-input" value={info.lastName} onChange={(e) => setContactData({ ...contactData, [type]: { ...info, lastName: e.target.value } })} placeholder="Last Name" style={{ margin: 0 }} />
                                    <input type="email" className="form-input" value={info.email} onChange={(e) => setContactData({ ...contactData, [type]: { ...info, email: e.target.value } })} placeholder="Email Address" style={{ margin: 0 }} />
                                    <input type="text" className="form-input" value={info.country} onChange={(e) => setContactData({ ...contactData, [type]: { ...info, country: e.target.value } })} placeholder="Country (e.g. US)" style={{ margin: 0 }} />
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </li>
                    ))}
                </ul>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem', textAlign: 'center' }}>
                    Note: Domain contact info changes may require email verification.
                </p>
                {isEditingContact ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdateContact} disabled={isSubmittingContact}>
                            {isSubmittingContact ? 'Saving...' : 'Save Contacts'}
                        </button>
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditingContact(false)}>Cancel</button>
                    </div>
                ) : (
                    <button className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setIsEditingContact(true)}>Update Contacts</button>
                )}
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
