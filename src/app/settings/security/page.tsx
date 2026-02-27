"use client";
import { useActionState } from "react";
import styles from "../settings.module.css";
import { updatePassword } from "../../actions/settings";

export default function SecurityPage() {
    const [state, formAction, isPending] = useActionState(updatePassword, null);

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>Security Settings</h2>
                <p className={styles.contentSubtitle}>Update your password and secure your account.</p>
            </div>

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
                    <label htmlFor="oldPassword">Current Password</label>
                    <input type="password" id="oldPassword" name="oldPassword" className="form-input" required />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">New Password</label>
                    <input type="password" id="password" name="password" className="form-input" required minLength={8} />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="passwordConfirm">Confirm New Password</label>
                    <input type="password" id="passwordConfirm" name="passwordConfirm" className="form-input" required minLength={8} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isPending}>
                    {isPending ? 'Updating...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
}
