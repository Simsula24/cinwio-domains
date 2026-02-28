"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { getDnsRecords, createDnsRecord, deleteDnsRecord, updateDnsRecord } from '../actions/cloudflare';
import { useI18n } from "../I18nProvider";

export default function DnsManager({ domains }: { domains: any[] }) {
    const { t } = useI18n();
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

    // Edit states
    const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editType, setEditType] = useState('A');
    const [editName, setEditName] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editProxied, setEditProxied] = useState(true);

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

        try {
            const res = await createDnsRecord(selectedDomain, {
                type: newType,
                name: name,
                content: newContent,
                proxied: ['A', 'AAAA', 'CNAME'].includes(newType) ? newProxied : false,
                ttl: 1 // 1 means Automatic in Cloudflare
            });

            if (res?.success) {
                setRecords(prev => [...prev, res.record]);
                setNewName('');
                setNewContent('');
                setShowAddForm(false);
            } else {
                window.alert(res?.error || 'Failed to create record.');
            }
        } catch (error) {
            console.error('Create error:', error);
            window.alert('An error occurred while creating the record.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (recordId: string) => {
        setDeletingId(recordId);

        try {
            const res = await deleteDnsRecord(selectedDomain, recordId);
            if (res?.success) {
                setRecords(prev => prev.filter(r => r.id !== recordId));
            } else {
                window.alert(res?.error || 'Failed to delete record.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            window.alert('An error occurred while deleting the record.');
        } finally {
            setDeletingId(null);
            setConfirmDeleteId(null);
        }
    };

    const handleEditRecord = (record: any) => {
        setEditingRecordId(record.id);
        setEditType(record.type);
        setEditName(record.name);
        setEditContent(record.content);
        setEditProxied(record.proxied);
    };

    const handleUpdateRecord = async (recordId: string) => {
        if (!editName || !editContent) return;

        setIsSubmitting(true);
        const name = editName === '@' ? selectedDomain : (editName.includes(selectedDomain) ? editName : `${editName}.${selectedDomain}`);

        try {
            const res = await updateDnsRecord(selectedDomain, recordId, {
                type: editType,
                name: name,
                content: editContent,
                proxied: ['A', 'AAAA', 'CNAME'].includes(editType) ? editProxied : false,
                ttl: 1
            });

            if (res?.success) {
                setRecords(prev => prev.map(r => r.id === recordId ? res.record : r));
                setEditingRecordId(null);
            } else {
                window.alert(res?.error || 'Failed to update record.');
            }
        } catch (error) {
            console.error('Update error:', error);
            window.alert('An error occurred while updating the record.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={styles.dnsHeader}>
                <div>
                    <h2>{t('dns', 'title')}</h2>
                    <p className={styles.subtitle}>{t('dns', 'subtitle')}</p>
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
                    <h3>{t('dns', 'records')}</h3>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}
                        onClick={() => setShowAddForm(!showAddForm)}
                        disabled={!selectedDomain}
                    >
                        {showAddForm ? t('common', 'cancel') : t('dns', 'addRecord')}
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
                                    {isSubmitting ? t('common', 'saving') : t('common', 'save')}
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
                                        {editingRecordId === record.id ? (
                                            <>
                                                <td>
                                                    <select className="form-input" value={editType} onChange={e => setEditType(e.target.value)} style={{ margin: 0, minWidth: '80px', padding: '0.4rem' }}>
                                                        <option value="A">A</option>
                                                        <option value="AAAA">AAAA</option>
                                                        <option value="CNAME">CNAME</option>
                                                        <option value="TXT">TXT</option>
                                                        <option value="MX">MX</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="text" className="form-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ margin: 0, padding: '0.4rem' }} />
                                                </td>
                                                <td>
                                                    <input type="text" className="form-input" value={editContent} onChange={e => setEditContent(e.target.value)} style={{ margin: 0, padding: '0.4rem' }} />
                                                </td>
                                                <td>Auto</td>
                                                <td>
                                                    <select className="form-input" value={editProxied ? 'true' : 'false'} onChange={e => setEditProxied(e.target.value === 'true')} style={{ margin: 0, padding: '0.4rem' }} disabled={!['A', 'AAAA', 'CNAME'].includes(editType)}>
                                                        <option value="true">Proxied</option>
                                                        <option value="false">DNS Only</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className={styles.actionBtn} onClick={() => handleUpdateRecord(record.id)} disabled={isSubmitting}>{t('common', 'save')}</button>
                                                        <button className={styles.actionBtnDel} style={{ color: 'var(--text-secondary)' }} onClick={() => setEditingRecordId(null)}>{t('common', 'cancel')}</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
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
                                                    {confirmDeleteId === record.id ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>{deletingId === record.id ? 'Deleting...' : 'Are you sure?'}</span>
                                                            <button className={styles.actionBtnDel} onClick={() => handleDelete(record.id)} disabled={deletingId === record.id}>
                                                                {deletingId === record.id ? '...' : 'Yes'}
                                                            </button>
                                                            <button className={styles.actionBtn} style={{ color: 'var(--text-secondary)' }} onClick={() => setConfirmDeleteId(null)} disabled={deletingId === record.id}>
                                                                No
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                                            <button className={styles.actionBtn} onClick={() => handleEditRecord(record)}>{t('common', 'edit')}</button>
                                                            <button className={styles.actionBtnDel} onClick={() => setConfirmDeleteId(record.id)}>{t('common', 'delete')}</button>
                                                        </div>
                                                    )}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                                        {selectedDomain ? t('dns', 'noRecords') : t('dns', 'noDomain')}
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
