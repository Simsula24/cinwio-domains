"use client";

import Link from "next/link";
import styles from "../login/page.module.css";
import { useActionState } from "react";
import { register } from "../actions/auth";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(register, null);

    return (
        <div className={styles.authContainer}>
            <div className={styles.backgroundGlow}></div>
            <div className={styles.authCard}>
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
            </div>
        </div>
    );
}
