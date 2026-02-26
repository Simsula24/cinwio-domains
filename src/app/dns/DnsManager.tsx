"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getDnsRecords, createDnsRecord, deleteDnsRecord } from '../actions/cloudflare';

export default function DnsManager({ domains }: { domains: any[] }) {
    const [selectedDomain, setSelectedDomain] = useState(domains.length > 0 ? domains[0]?.domainName : '');
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [showAddForm, setShowAddForm] = useState(false);
    const [newType, setNewType] = useState('A');
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newProxied, setNewProxied] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!selectedDomain) return;

        async function fetchRecords() {
            setLoading(true);
            setError(null);
            const res = await getDnsRecords(selectedDomain);
            if (res.error) {
                setError(res.error);
                setRecords([]);
            } else {
                setRecords(res.records || []);
            }
            setLoading(false);
        }

        fetchRecords();
    }, [selectedDomain]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newContent) return;

        setIsSubmitting(true);
        const name = newName === '@' ? selectedDomain : (newName.includes(selectedDomain) ? newName : `${newName}.${selectedDomain}`);

        const res = await createDnsRecord(selectedDomain, {
            type: newType,
            name: name,
            content: newContent,
            proxied: ['A', 'AAAA', 'CNAME'].includes(newType) ? newProxied : false,
            ttl: 1 // 1 means Automatic in Cloudflare
        });

        if (res.success) {
            setRecords([...records, res.record]);
            setNewName('');
            setNewContent('');
            setShowAddForm(false);
        } else {
            alert(res.error);
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (recordId: string) => {
        if (!confirm('Are you sure you want to delete this DNS record?')) return;

        const res = await deleteDnsRecord(selectedDomain, recordId);
        if (res.success) {
            setRecords(records.filter(r => r.id !== recordId));
        } else {
            alert(res.error);
        }
    };

    return (
        <>
            <div className={styles.dnsHeader}>
                <div>
                    <h2>DNS Management</h2>
                    <p className={styles.subtitle}>Powered by Cloudflare</p>
                </div>
                {domains.length > 0 && (
                    <div className={styles.selectorWrapper}>
                        <select
                            className={styles.domainSelector}
                            value={selectedDomain}
                            onChange={(e) => setSelectedDomain(e.target.value)}
                        >
                            {domains.map(d => (
                                <option key={d.id} value={d.domainName}>{d.domainName}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                    {error}
                </div>
            )}

            <div className={styles.recordsSection}>
                <div className={styles.recordsHeader}>
                    <h3>DNS Records</h3>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}
                        onClick={() => setShowAddForm(!showAddForm)}
                        disabled={!selectedDomain}
                    >
                        {showAddForm ? 'Cancel' : 'Add Record'}
                    </button>
                </div>

                {showAddForm && (
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--glass-border)' }}>
                        <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Type</label>
                                <select className="form-input" value={newType} onChange={e => setNewType(e.target.value)} style={{ margin: 0 }}>
                                    <option value="A">A</option>
                                    <option value="AAAA">AAAA</option>
                                    <option value="CNAME">CNAME</option>
                                    <option value="TXT">TXT</option>
                                    <option value="MX">MX</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Name</label>
                                <input type="text" className="form-input" placeholder="@ or subdomain" value={newName} onChange={e => setNewName(e.target.value)} required style={{ margin: 0 }} />
                            </div>
                            <div style={{ flex: 2 }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Content</label>
                                <input type="text" className="form-input" placeholder="IP address or target" value={newContent} onChange={e => setNewContent(e.target.value)} required style={{ margin: 0 }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Proxy status</label>
                                <select className="form-input" value={newProxied ? 'true' : 'false'} onChange={e => setNewProxied(e.target.value === 'true')} style={{ margin: 0 }} disabled={!['A', 'AAAA', 'CNAME'].includes(newType)}>
                                    <option value="true">Proxied</option>
                                    <option value="false">DNS Only</option>
                                </select>
                            </div>
                            <div>
                                <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 1.5rem' }} disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                        Loading Cloudflare records...
                                    </td>
                                </tr>
                            ) : records.length > 0 ? (
                                records.map(record => (
                                    <tr key={record.id}>
                                        <td><span className={styles.recordType}>{record.type}</span></td>
                                        <td style={{ fontWeight: 500 }}>{record.name}</td>
                                        <td style={{ color: 'var(--text-secondary)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={record.content}>
                                            {record.content}
                                        </td>
                                        <td>{record.ttl === 1 ? 'Auto' : record.ttl}</td>
                                        <td>
                                            {record.proxied ? (
                                                <span className={styles.proxyActive}>Proxied</span>
                                            ) : (
                                                <span className={styles.proxyOff}>DNS Only</span>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button className={styles.actionBtnDel} onClick={() => handleDelete(record.id)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                        {selectedDomain ? 'No records found for this domain.' : 'No domain selected.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
