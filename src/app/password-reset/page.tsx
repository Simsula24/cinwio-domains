"use client";

import Link from "next/link";
import styles from "../login/page.module.css";
import { useActionState, Suspense } from "react";
import { confirmPasswordReset } from "../actions/auth";
import { useSearchParams } from "next/navigation";

function PasswordResetForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [state, formAction, isPending] = useActionState(confirmPasswordReset, null);

    return (
        <div className={styles.authCard}>
            <h2>Reset Password</h2>
            <p className={styles.authSubtitle}>Enter and confirm your new password below</p>

            {state?.success ? (
                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
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
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{state.message}</p>
                    <Link href="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                        Proceed to Login
                    </Link>
                </div>
            ) : (
                <form className={styles.authForm} action={formAction}>
                    {state?.error && <div className={styles.errorMessage}>{state.error}</div>}

                    {/* Hidden input to pass the token automatically from query string */}
                    <input type="hidden" name="token" value={token} />

                    <div className="form-group">
                        <input type="password" name="password" id="password" required minLength={8} placeholder=" " />
                        <label htmlFor="password">New Password</label>
                    </div>

                    <div className="form-group">
                        <input type="password" name="passwordConfirm" id="passwordConfirm" required minLength={8} placeholder=" " />
                        <label htmlFor="passwordConfirm">Confirm New Password</label>
                    </div>

                    <div className={styles.authActions} style={{ marginTop: '1.5rem' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', opacity: isPending ? 0.7 : 1 }}
                            disabled={isPending || !token}
                        >
                            {isPending ? 'Resetting...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            )}

            {!token && !state?.success && (
                <div style={{ marginTop: '1rem', color: '#ef4444', textAlign: 'center', fontSize: '0.85rem' }}>
                    Missing reset token in URL parameters. Please use the link mailed to you.
                </div>
            )}
        </div>
    );
}

export default function PasswordResetPage() {
    return (
        <div className={styles.authContainer}>
            <div className={styles.backgroundGlow}></div>
            <Suspense fallback={
                <div className={styles.authCard} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading reset form...
                </div>
            }>
                <PasswordResetForm />
            </Suspense>
        </div>
    );
}
