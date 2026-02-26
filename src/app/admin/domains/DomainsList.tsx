"use client";

import { useState } from 'react';
import styles from '../admin.module.css';
import { assignDomainToUser, createDomainRecord } from '../../actions/admin';

export default function DomainsList({ initialDomains, users }: { initialDomains: any[], users: any[] }) {
    const [domains, setDomains] = useState(initialDomains);
    const [loading, setLoading] = useState<string | null>(null);
    const [newDomainName, setNewDomainName] = useState('');
    const [newDomainUserId, setNewDomainUserId] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleAssign = async (domainId: string, userId: string) => {
        setLoading(domainId);
        const res = await assignDomainToUser(domainId, userId);
        if (res.success) {
            setDomains(domains.map(d => d.id === domainId ? { ...d, user: userId } : d));
            alert('Domain reassigned successfully.');
        } else {
            alert(res.error || 'Failed to assign domain.');
        }
        setLoading(null);
    };

    const handleCreateDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomainName || !newDomainUserId) {
            alert('Please fill out all fields.');
            return;
        }

        setIsCreating(true);
        const res = await createDomainRecord(newDomainName, newDomainUserId);

        if (res.success) {
            alert('Domain allocated successfully. Refresh the page to see the updated list.');
            setNewDomainName('');
            setNewDomainUserId('');
        } else {
            alert(res.error || 'Failed to allocate domain.');
        }
        setIsCreating(false);
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h2>Domain Management</h2>
                    <p className={styles.subtitle}>Assign and overview registered domains.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Manually Allocate Domain</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Use this tool to manually assign a domain to a user if the automated system encountered an issue or if the transaction was done externally.
                </p>

                <form onSubmit={handleCreateDomain} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Domain Name</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. example.com"
                            value={newDomainName}
                            onChange={(e) => setNewDomainName(e.target.value)}
                            disabled={isCreating}
                            style={{ margin: 0 }}
                        />
                    </div>
                    <div style={{ flex: '1', minWidth: '200px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign User</label>
                        <select
                            className={styles.selectInput}
                            style={{ width: '100%', height: '48px' }}
                            value={newDomainUserId}
                            onChange={(e) => setNewDomainUserId(e.target.value)}
                            disabled={isCreating}
                        >
                            <option value="">Select a user...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.email}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem', height: '48px' }} disabled={isCreating}>
                            {isCreating ? 'Allocating...' : 'Allocate Domain'}
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Domain Name</th>
                            <th>Status</th>
                            <th>Assigned User</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {domains.map(domain => {
                            const currentOwnerId = domain.expand?.user?.id || domain.user;
                            return (
                                <tr key={domain.id} style={{ opacity: loading === domain.id ? 0.5 : 1 }}>
                                    <td style={{ fontWeight: 500, fontSize: '1.1rem' }}>{domain.domainName}</td>
                                    <td>
                                        {domain.status === 'active' ? (
                                            <span style={{ color: '#10b981', fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>Active</span>
                                        ) : (
                                            <span style={{ color: '#f59e0b', fontSize: '0.8rem', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{domain.status || 'Pending'}</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <select
                                                className={styles.selectInput}
                                                value={currentOwnerId || ''}
                                                onChange={(e) => {
                                                    if (e.target.value !== currentOwnerId) {
                                                        handleAssign(domain.id, e.target.value);
                                                    }
                                                }}
                                                disabled={loading === domain.id}
                                                style={{ width: '220px' }}
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.email}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Created: {new Date(domain.created).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {domains.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    No domains found in the system.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
