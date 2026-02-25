"use client";

import Link from "next/link";
import styles from "../login/page.module.css";
import { useActionState, useState, useEffect } from "react";
import { register, resendVerificationEmail } from "../actions/auth";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null);

    // Resend Logic
    const [countdown, setCountdown] = useState(0);
    const [resendMultiplier, setResendMultiplier] = useState(1);
    const [resendStatus, setResendStatus] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0 || isResending || !state?.email) return;

        setIsResending(true);
        setResendStatus("Sending...");

        try {
            const res = await resendVerificationEmail(state.email);
            if (res.error) {
                setResendStatus(res.error);
            } else {
                setResendStatus("Email resent!");

                let nextTimeoutMinutes = 1;
                if (resendMultiplier === 1) nextTimeoutMinutes = 1;
                else if (resendMultiplier === 2) nextTimeoutMinutes = 2;
                else nextTimeoutMinutes = 5;

                setCountdown(nextTimeoutMinutes * 60);
                setResendMultiplier(m => m + 1);
            }
        } catch {
            setResendStatus("Something went wrong");
        } finally {
            setIsResending(false);
        }
    };

    const formatCountdown = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className={styles.authContainer}>
            <div className={styles.backgroundGlow}></div>
            <div className={styles.authCard}>
                {state?.success ? (
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Registration Successful!</h2>
                        <p className={styles.authSubtitle} style={{ marginBottom: '1.5rem' }}>
                            {state.message}
                        </p>

                        <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Didn't receive the email?
                            </p>

                            <button
                                onClick={handleResend}
                                disabled={countdown > 0 || isResending}
                                className={countdown > 0 ? "btn btn-outline" : "btn btn-primary"}
                                style={{ width: '100%', fontSize: '0.8rem', padding: '0.6rem 1rem' }}
                            >
                                {countdown > 0
                                    ? `Wait ${formatCountdown(countdown)} to resend`
                                    : isResending ? 'Sending...' : 'Resend Verification Email'}
                            </button>

                            {resendStatus && (
                                <p style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: resendStatus.includes('error') || resendStatus.includes('already') || resendStatus.includes('Too many') ? '#ef4444' : '#10b981' }}>
                                    {resendStatus}
                                </p>
                            )}
                        </div>

                        <Link href="/login" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', padding: '0.8rem' }}>
                            Go to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <h2>Create Account</h2>
                        <p className={styles.authSubtitle}>Start managing your domains</p>

                        <form className={styles.authForm} action={formAction}>
                            {state?.error && <div className={styles.errorMessage}>{state.error}</div>}

                            <div className="form-group">
                                <input type="text" name="name" id="name" required placeholder=" " />
                                <label htmlFor="name">Full Name</label>
                            </div>

                            <div className="form-group">
                                <input type="email" name="email" id="email" required placeholder=" " />
                                <label htmlFor="email">Email address</label>
                            </div>

                            <div className="form-group">
                                <input type="password" name="password" id="password" required placeholder=" " />
                                <label htmlFor="password">Password</label>
                            </div>

                            <div className="form-group">
                                <input type="password" name="passwordConfirm" id="passwordConfirm" required placeholder=" " />
                                <label htmlFor="passwordConfirm">Confirm Password</label>
                            </div>

                            <div className={styles.authActions}>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', opacity: isPending ? 0.7 : 1 }}
                                    disabled={isPending}
                                >
                                    {isPending ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </form>

                        <p className={styles.authFooter}>
                            Already have an account? <Link href="/login" className={styles.authLink}>Log In</Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
