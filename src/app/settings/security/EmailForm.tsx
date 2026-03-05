"use client";
import { useActionState } from "react";
import styles from "../settings.module.css";
import { updateEmails } from "../../actions/settings";
import { useI18n } from "../../I18nProvider";

export default function EmailForm({
    initialEmail,
    initialSecondaryEmail,
    initialSecondaryEmailVerified
}: {
    initialEmail: string,
    initialSecondaryEmail: string,
    initialSecondaryEmailVerified: boolean
}) {
    const [state, formAction, isPending] = useActionState(updateEmails, null);
    const { t } = useI18n();

    return (
        <form action={formAction} style={{ marginBottom: '2rem' }}>
            <div className={styles.contentHeader} style={{ marginBottom: '1rem', borderBottom: 'none' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('settings.security', 'updateEmail')}</h3>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="email" style={{ position: 'static' }}>{t('settings.security', 'emailTitle')}</label>
                </div>
                <input type="email" id="email" name="email" className="form-input" defaultValue={initialEmail} required />
            </div>

            <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="secondaryEmail" style={{ position: 'static' }}>{t('settings.security', 'secondaryEmailTitle')}</label>
                    {initialSecondaryEmail && (
                        <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: initialSecondaryEmailVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: initialSecondaryEmailVerified ? '#10b981' : '#ef4444' }}>
                            {initialSecondaryEmailVerified ? 'Verified' : 'Not verified'}
                        </span>
                    )}
                </div>
                <input type="email" id="secondaryEmail" name="secondaryEmail" className="form-input" defaultValue={initialSecondaryEmail} placeholder="backup@example.com" />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? t('common', 'saving') : t('settings.security', 'updateEmail')}
            </button>
        </form>
    );
}
