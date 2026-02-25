"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { useActionState } from "react";
import { login } from "../actions/auth";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className={styles.authContainer}>
            <div className={styles.backgroundGlow}></div>
            <div className={styles.authCard}>
                <h2>Welcome Back</h2>
                <p className={styles.authSubtitle}>Log in to manage your domains</p>

                <form className={styles.authForm} action={formAction}>
                    {state?.error && <div className={styles.errorMessage}>{state.error}</div>}

                    <div className="form-group">
                        <input type="email" name="email" id="email" required placeholder=" " />
                        <label htmlFor="email">Email</label>
                    </div>

                    <div className="form-group">
                        <input type="password" name="password" id="password" required placeholder=" " />
                        <label htmlFor="password">Password</label>
                    </div>

                    <div className={styles.authActions}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', opacity: isPending ? 0.7 : 1 }}
                            disabled={isPending}
                        >
                            {isPending ? 'Logging in...' : 'Log In'}
                        </button>
                    </div>
                </form>

                <p className={styles.authFooter}>
                    Don't have an account? <Link href="/register" className={styles.authLink}>Register</Link>
                </p>
            </div>
        </div>
    );
}
