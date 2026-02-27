"use client";

import Link from "next/link";
import styles from "../login/page.module.css";
import { useActionState } from "react";
import { requestPasswordReset } from "../actions/auth";

export default function ForgotPasswordPage() {
    const [state, formAction, isPending] = useActionState(requestPasswordReset, null);

    return (
        <div className={styles.authContainer}>
            <div className={styles.backgroundGlow}></div>
            <div className={styles.authCard}>
                <h2>Forgot Password</h2>
                <p className={styles.authSubtitle}>Enter your email to receive a password reset link</p>

                {state?.success ? (
                    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{state.message}</p>
                        <Link href="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <form className={styles.authForm} action={formAction}>
                        {state?.error && <div className={styles.errorMessage}>{state.error}</div>}

                        <div className="form-group">
                            <input type="email" name="email" id="email" required placeholder=" " />
                            <label htmlFor="email">Email</label>
                        </div>

                        <div className={styles.authActions}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: '100%', opacity: isPending ? 0.7 : 1 }}
                                disabled={isPending}
                            >
                                {isPending ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                    </form>
                )}

                {!state?.success && (
                    <p className={styles.authFooter}>
                        Remember your password? <Link href="/login" className={styles.authLink}>Log In</Link>
                    </p>
                )}
            </div>
        </div>
    );
}
