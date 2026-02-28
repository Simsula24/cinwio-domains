"use client";

import { useActionState } from "react";
import styles from "./settings.module.css";
import { updateAccountInfo } from "../actions/settings";
import { useI18n } from "../I18nProvider";

export default function AccountForm({ initialName, email }: { initialName: string, email: string }) {
    const [state, formAction, isPending] = useActionState(updateAccountInfo, null);
    const { t } = useI18n();

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
                <label>{t('settings.account', 'emailLabel')}</label>
                <input type="email" className="form-input" value={email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{t('settings.account', 'emailStatus')}</p>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="name">{t('settings.account', 'nameLabel')}</label>
                <input type="text" id="name" name="name" className="form-input" defaultValue={initialName} placeholder="Jane Doe" required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? t('common', 'saving') : t('settings.account', 'save')}
            </button>
        </form>
    );
}
