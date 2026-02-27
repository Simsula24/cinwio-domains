"use client";

import { useActionState } from "react";
import styles from "./settings.module.css";
import { updateAccountInfo } from "../actions/settings";

export default function AccountForm({ initialName, email }: { initialName: string, email: string }) {
    const [state, formAction, isPending] = useActionState(updateAccountInfo, null);

    return (
        <form action={formAction}>
            {state?.success && (
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    {state.message}
                </div>
            )}

            {state?.error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {state.error}
                </div>
            )}

            <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" className="form-input" value={email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Your email address cannot be changed from this dashboard. Please contact support.</p>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" name="name" className="form-input" defaultValue={initialName} placeholder="Jane Doe" required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}
