"use client";

import { useActionState } from "react";
import styles from "../login/page.module.css";
import { confirmEmailChange } from "../actions/email";
import Link from "next/link";

export default function ConfirmEmailForm({ token }: { token: string }) {
    const [state, formAction, isPending] = useActionState(confirmEmailChange, null);

    if (state?.success) {
        return (
            <div style={{ textAlign: 'center' }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.5rem auto'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <h2 style={{ marginBottom: '1rem', color: '#10b981' }}>Email Updated</h2>
                <p className={styles.authSubtitle} style={{ marginBottom: '2rem' }}>
                    Your primary email has been successfully updated.
                </p>
                <Link href="/settings" className="btn btn-primary" style={{ display: 'inline-block' }}>
                    Return to Settings
                </Link>
            </div>
        );
    }

    return (
        <form action={formAction}>
            <input type="hidden" name="token" value={token} />

            {state?.error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {state.error}
                </div>
            )}

            <div className="form-group">
                <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder=" "
                    required
                    autoComplete="current-password"
                />
                <label htmlFor="password">Account Password</label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isPending}>
                {isPending ? 'Confirming...' : 'Confirm Email Change'}
            </button>
        </form>
    );
}
