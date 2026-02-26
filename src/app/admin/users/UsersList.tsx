"use client";

import { useState } from 'react';
import styles from '../admin.module.css';
import { updateUserRole, deleteUser } from '../../actions/admin';

export default function UsersList({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [loading, setLoading] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setLoading(userId);
        const res = await updateUserRole(userId, newRole);
        if (res.success) {
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
            alert(res.error || 'Failed to update role');
        }
        setLoading(null);
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setLoading(userId);
        const res = await deleteUser(userId);
        if (res.success) {
            setUsers(users.filter(u => u.id !== userId));
        } else {
            alert(res.error || 'Failed to delete user');
        }
        setLoading(null);
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <div>
                    <h2>User Accounts</h2>
                    <p className={styles.subtitle}>Manage all registered users and their permissions</p>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ opacity: loading === user.id ? 0.5 : 1 }}>
                                <td style={{ fontWeight: 500 }}>{user.name || 'N/A'}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                <td>
                                    {user.verified ? (
                                        <span style={{ color: '#10b981', fontSize: '0.8rem' }}>Verified</span>
                                    ) : (
                                        <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>Unverified</span>
                                    )}
                                </td>
                                <td>
                                    <select
                                        className={styles.selectInput}
                                        value={user.role || 'user'}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        disabled={loading === user.id || user.role === 'master'}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        {user.role === 'master' && <option value="master">Master Admin</option>}
                                    </select>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {new Date(user.created).toLocaleDateString()}
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderColor: '#ef4444', color: '#ef4444' }}
                                            onClick={() => handleDelete(user.id)}
                                            disabled={loading === user.id || user.role === 'master'}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
