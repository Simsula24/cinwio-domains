"use client";
import { useActionState } from "react";
import styles from "../settings.module.css";
import { updatePassword } from "../../actions/settings";
import { useI18n } from "../../I18nProvider";

export default function PasswordForm() {
    const [state, formAction, isPending] = useActionState(updatePassword, null);
    const { t } = useI18n();

    return (
        <form action={formAction}>
            <div className={styles.contentHeader} style={{ marginBottom: '1rem', borderBottom: 'none' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('settings.security', 'update')}</h3>
            </div>

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
                <label htmlFor="oldPassword">{t('settings.security', 'oldPassword')}</label>
                <input type="password" id="oldPassword" name="oldPassword" className="form-input" required />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password">{t('settings.security', 'newPassword')}</label>
                <input type="password" id="password" name="password" className="form-input" required minLength={8} />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="passwordConfirm">{t('settings.security', 'confirmPassword')}</label>
                <input type="password" id="passwordConfirm" name="passwordConfirm" className="form-input" required minLength={8} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? t('common', 'saving') : t('settings.security', 'update')}
            </button>
        </form>
    );
}
